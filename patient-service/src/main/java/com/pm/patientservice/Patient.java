package com.pm.patientservice; // <-- This matches your package!

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;
import java.time.LocalDate;

@Entity // Tells Spring this is a database table
@Data   // Lombok: automatically creates getters, setters, etc.
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String firstName;
    private String lastName;
    private LocalDate dob; // Date of Birth
    private String phone;
    private String email;
    private String insuranceProvider;
    private String insurancePolicyNumber;
}