package com.pm.patientservice; // <-- This matches your package!

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// This interface gives us all our database methods for free
@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
}