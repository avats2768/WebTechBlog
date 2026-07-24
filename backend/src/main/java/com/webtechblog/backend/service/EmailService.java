package com.webtechblog.backend.service;

import jakarta.mail.Message;
import jakarta.mail.Session;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.io.ByteArrayOutputStream;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

/**
 * Sends transactional email via the Gmail API (HTTPS) authenticated with
 * OAuth2, instead of raw SMTP.
 *
 * Why: Railway blocks outbound SMTP on every port (587, 2525 both
 * confirmed blocked — every attempt failed with SocketTimeoutException).
 * The Gmail API is plain HTTPS (443), which is never blocked. Sending
 * through Google's own API — as the real, OAuth-authorized Gmail account
 * — also avoids the DKIM/DMARC "freemail sender" rejection that a
 * third-party relay (e.g. Brevo) hits when the From address is a Gmail
 * address it doesn't control: here Google itself is the one sending it,
 * so there's nothing to spoof-detect.
 *
 * Setup: a one-time OAuth consent flow produces a long-lived refresh
 * token (see project setup notes). That refresh token is exchanged here
 * for a short-lived access token on every send, which is then used to
 * call the Gmail API.
 */
@Slf4j
@Service
public class EmailService {

    private static final String TOKEN_URL = "https://oauth2.googleapis.com/token";
    private static final String SEND_URL = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${google.oauth.client-id}")
    private String clientId;

    @Value("${google.oauth.client-secret}")
    private String clientSecret;

    @Value("${google.oauth.refresh-token}")
    private String refreshToken;

    @Value("${gmail.sender.address}")
    private String fromEmail;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    /**
     * Deliberately never throws. A provider/network hiccup here must never
     * fail registration or block the calling request — the account is
     * still created, and the user can always request a fresh link via
     * POST /auth/resend-verification-email. Failures are logged loudly
     * instead so they're visible in monitoring.
     *
     * @Async: runs on a background thread so /auth/register and
     * /auth/resend-verification-email return immediately and never wait
     * on this network call. Requires @EnableAsync (see AsyncConfig).
     */
    @Async
    public void sendVerificationEmail(
            String to,
            String username,
            String token
    ) {

        try {

            String accessToken = fetchAccessToken();
            String rawMessage = buildRawMimeMessage(to, username, token);

            Map<String, Object> body = new HashMap<>();
            body.put("raw", rawMessage);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(accessToken);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            restTemplate.postForEntity(SEND_URL, request, String.class);

            log.info("Verification email sent to {} via Gmail API (from={})", to, fromEmail);

        } catch (HttpStatusCodeException e) {
            HttpStatusCode status = e.getStatusCode();
            log.error(
                    "Gmail API rejected verification email to {} (status={}): {}",
                    to, status, e.getResponseBodyAsString()
            );
        } catch (RestClientException e) {
            log.error("Failed to reach Gmail API while sending verification email to {}: {}", to, e.getMessage(), e);
        } catch (Exception e) {
            // Catches MessagingException from MIME message construction,
            // encoding errors, etc. — still never propagates.
            log.error("Unexpected error building/sending verification email to {}: {}", to, e.getMessage(), e);
        }
    }

    /**
     * Exchanges the long-lived refresh token for a short-lived access
     * token. Done on every send for simplicity (low volume — verification
     * emails only); could be cached for ~50 minutes if send volume grows.
     */
    private String fetchAccessToken() {

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("client_id", clientId);
        form.add("client_secret", clientSecret);
        form.add("refresh_token", refreshToken);
        form.add("grant_type", "refresh_token");

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(form, headers);

        Map<?, ?> response = restTemplate.postForObject(TOKEN_URL, request, Map.class);

        if (response == null || response.get("access_token") == null) {
            throw new IllegalStateException("Google did not return an access_token");
        }

        return response.get("access_token").toString();
    }

    /**
     * Builds an RFC 2822 email (via jakarta.mail's MimeMessage, used here
     * purely as a local message builder — no SMTP transport involved),
     * then base64url-encodes it the way the Gmail API requires.
     */
    private String buildRawMimeMessage(String to, String username, String token) throws Exception {

        String verificationLink = frontendUrl + "/verify-email?token=" + token;

        String html = """
                <!DOCTYPE html>
                <html>
                <body style="font-family:Arial,sans-serif;background:#f5f5f5;padding:20px;">

                <div style="max-width:600px;margin:auto;background:white;border-radius:10px;padding:30px;">

                    <h2 style="color:#2563eb;">
                        Welcome to WebTechBlog
                    </h2>

                    <p>Hello <b>%s</b>,</p>

                    <p>
                        Thank you for registering.
                        Please verify your email by clicking the button below.
                    </p>

                    <div style="margin:30px 0;">
                        <a href="%s"
                           style="
                               background:#2563eb;
                               color:white;
                               padding:12px 24px;
                               text-decoration:none;
                               border-radius:6px;
                               display:inline-block;
                           ">
                           Verify Email
                        </a>
                    </div>

                    <p>
                        This verification link will expire in
                        <b>24 hours</b>.
                    </p>

                    <hr>

                    <p style="font-size:12px;color:gray;">
                        If you didn't create this account,
                        simply ignore this email.
                    </p>

                </div>

                </body>
                </html>
                """.formatted(username, verificationLink);

        Session session = Session.getDefaultInstance(new Properties(), null);
        MimeMessage mimeMessage = new MimeMessage(session);

        mimeMessage.setFrom(new InternetAddress(fromEmail, "WebTechBlog"));
        mimeMessage.addRecipient(Message.RecipientType.TO, new InternetAddress(to));
        mimeMessage.setSubject("Verify your WebTechBlog account", "UTF-8");
        mimeMessage.setContent(html, "text/html; charset=UTF-8");

        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        mimeMessage.writeTo(buffer);

        return Base64.getUrlEncoder().withoutPadding().encodeToString(buffer.toByteArray());
    }
}