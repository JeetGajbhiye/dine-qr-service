package com.restaurant.qrmenu.service;

import com.restaurant.qrmenu.entity.Order;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final JavaMailSender mailSender;

    @Value("${twilio.account.sid}") private String twilioSid;
    @Value("${twilio.auth.token}") private String twilioToken;
    @Value("${twilio.from.number}") private String twilioFrom;
    @Value("${spring.mail.username}") private String fromEmail;
    @Value("${notifications.enabled:false}") private boolean enabled;

    @PostConstruct
    public void init() {
        if (!enabled) {
            log.info("Notifications DISABLED (set notifications.enabled=true to activate).");
            return;
        }
        try {
            if (twilioSid != null && !twilioSid.isBlank() && !twilioSid.startsWith("ACxxxx")) {
                Twilio.init(twilioSid, twilioToken);
                log.info("Twilio initialized.");
            }
        } catch (Exception e) {
            log.warn("Twilio init failed: {}", e.getMessage());
        }
    }

    private String message(Order o) {
        return switch (o.getStatus()) {
            case "PREPARING" -> "Your order #" + o.getId() + " is being prepared!";
            case "READY" -> "Your order #" + o.getId() + " is ready. Please collect it.";
            case "SERVED" -> "Your order #" + o.getId() + " has been served. Enjoy!";
            case "CANCELLED" -> "Your order #" + o.getId() + " was cancelled.";
            case "PAID" -> "Payment received for order #" + o.getId() + ". Total INR " + o.getGrandTotal();
            default -> "Order #" + o.getId() + " placed. Total INR " + o.getGrandTotal();
        };
    }

    @Async
    public void notifyStatus(Order order) {
        if (!enabled) return;
        String msg = message(order);
        sendEmail(order.getCustomerEmail(), "Order Update #" + order.getId(), msg);
        sendSms(order.getCustomerPhone(), msg);
    }

    private void sendEmail(String to, String subject, String body) {
        if (to == null || to.isBlank()) return;
        try {
            SimpleMailMessage m = new SimpleMailMessage();
            m.setFrom(fromEmail);
            m.setTo(to);
            m.setSubject(subject);
            m.setText(body);
            mailSender.send(m);
            log.info("Email sent to {}", to);
        } catch (Exception e) {
            log.warn("Email failed: {}", e.getMessage());
        }
    }

    private void sendSms(String to, String body) {
        if (to == null || to.isBlank()) return;
        try {
            String formatted = to.startsWith("+") ? to : "+91" + to;
            Message.creator(new PhoneNumber(formatted), new PhoneNumber(twilioFrom), body).create();
            log.info("SMS sent to {}", formatted);
        } catch (Exception e) {
            log.warn("SMS failed: {}", e.getMessage());
        }
    }
}
