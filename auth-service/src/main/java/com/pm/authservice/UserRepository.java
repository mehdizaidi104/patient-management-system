package com.pm.authservice;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    // This method lets Spring Security find a user by their username
    Optional<User> findByUsername(String username);
}