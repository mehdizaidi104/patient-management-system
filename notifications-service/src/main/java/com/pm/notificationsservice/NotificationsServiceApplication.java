package com.pm.notificationsservice; // <-- Your correct package name

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient; // <-- ADD THIS

@SpringBootApplication
@EnableDiscoveryClient // <-- ADD THIS
public class NotificationsServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(NotificationsServiceApplication.class, args);
    }

}