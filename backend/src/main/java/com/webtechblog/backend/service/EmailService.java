package com.webtechblog.backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    public void sendVerificationEmail(
            String to,
            String username,
            String token
    ) {

        try {

            String verificationLink =
                    frontendUrl + "/verify-email?token=" + token;

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

            MimeMessage message = mailSender.createMimeMessage();

            MimeMessageHelper helper =
                    new MimeMessageHelper(message, true);

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("Verify your WebTechBlog account");
            helper.setText(html, true);

            mailSender.send(message);

        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send verification email.", e);
        }
    }
}