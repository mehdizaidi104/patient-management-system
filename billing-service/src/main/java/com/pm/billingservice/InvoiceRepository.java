package com.pm.billingservice;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    // A custom method to find all invoices for a specific patient
    List<Invoice> findByPatientId(Long patientId);
}