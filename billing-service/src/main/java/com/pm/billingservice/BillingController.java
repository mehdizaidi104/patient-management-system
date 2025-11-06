package com.pm.billingservice;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/billing")
public class BillingController {

    @Autowired
    private InvoiceRepository invoiceRepository;

    // Endpoint to create a new invoice
    @PostMapping
    public Invoice createInvoice(@RequestBody Invoice invoice) {
        invoice.setStatus("UNPAID"); // Set default status
        return invoiceRepository.save(invoice);
    }

    // Endpoint to get all invoices for a specific patient
    @GetMapping("/patient/{patientId}")
    public List<Invoice> getInvoicesForPatient(@PathVariable Long patientId) {
        return invoiceRepository.findByPatientId(patientId);
    }

    // Endpoint to get a single invoice
    @GetMapping("/{invoiceId}")
    public ResponseEntity<Invoice> getInvoice(@PathVariable Long invoiceId) {
        return invoiceRepository.findById(invoiceId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Endpoint to mark an invoice as paid
    @PutMapping("/{invoiceId}/pay")
    public ResponseEntity<Invoice> payInvoice(@PathVariable Long invoiceId) {
        return invoiceRepository.findById(invoiceId)
                .map(invoice -> {
                    invoice.setStatus("PAID");
                    return ResponseEntity.ok(invoiceRepository.save(invoice));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}