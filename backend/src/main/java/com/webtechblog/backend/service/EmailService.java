package com.webtechblog.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Sends transactional email via Brevo's HTTPS REST API
 * (https://api.brevo.com/v3/smtp/email) instead of raw SMTP.
 *
 * Why: Railway (and most PaaS free/hobby tiers) block outbound SMTP on
 * every port (587, 2525 were both confirmed blocked here — every attempt
 * failed with SocketTimeoutException). Outbound HTTPS (443) is not
 * blocked, so routing transactional email through Brevo's API instead
 * of JavaMailSender sidesteps the restriction entirely.
 */
@Slf4j
@Service
public class EmailService {

    private static final String BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${brevo.api.key}")
    private String brevoApiKey;

    @Value("${spring.mail.username}")
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

        Map<String, Object> sender = new HashMap<>();
        sender.put("name", "WebTechBlog");
        sender.put("email", fromEmail);

        Map<String, Object> recipient = new HashMap<>();
        recipient.put("email", to);
        recipient.put("name", username);

        Map<String, Object> body = new HashMap<>();
        body.put("sender", sender);
        body.put("to", List.of(recipient));
        body.put("subject", "Verify your WebTechBlog account");
        body.put("htmlContent", html);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("api-key", brevoApiKey);
        headers.set("Accept", "application/json");

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {

            restTemplate.postForEntity(BREVO_API_URL, request, String.class);

            log.info("Verification email sent to {} via Brevo API (from={})", to, fromEmail);

        } catch (HttpStatusCodeException e) {
            // Brevo rejected the request (bad API key, unverified sender,
            // invalid payload, etc). Response body has the exact reason.
            HttpStatusCode status = e.getStatusCode();
            log.error(
                    "Brevo API rejected verification email to {} (status={}): {}",
                    to, status, e.getResponseBodyAsString()
            );
        } catch (RestClientException e) {
            // Network-level failure calling Brevo's API itself.
            log.error("Failed to reach Brevo API while sending verification email to {}: {}", to, e.getMessage(), e);
        }
    }
}