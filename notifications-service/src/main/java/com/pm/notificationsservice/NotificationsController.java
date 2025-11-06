package com.pm.notificationsservice; // <-- Your correct package name

import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// This DTO can be singular
@Data
class NotificationRequest {
    private String to;
    private String subject;
    private String body;
}

@RestController
@RequestMapping("/api/notifications")
public class NotificationsController { // <-- Corrected spelling

    @PostMapping
    public ResponseEntity<String> sendNotification(@RequestBody NotificationRequest request) {
        System.out.println("=========================================");
        System.out.println("SENDING NOTIFICATION:");
        System.out.println("TO: " + request.getTo());
        System.out.println("SUBJECT: " + request.getSubject());
        System.out.println("BODY: " + request.getBody());
        System.out.println("=========================================");

        return ResponseEntity.ok("Notification sent successfully (check container logs)");
    }
}
