package com.pm.patientservice; // <-- This matches your package!

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/patients") // All URLs will start with /api/patients
public class PatientController {

    @Autowired // Spring automatically gives us an instance of the repository
    private PatientRepository patientRepository;

    // GET /api/patients (Get all patients)
    @GetMapping
    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    // GET /api/patients/1 (Get one patient by ID)
    @GetMapping("/{id}")
    public ResponseEntity<Patient> getPatientById(@PathVariable Long id) {
        Optional<Patient> patient = patientRepository.findById(id);
        return patient.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST /api/patients (Create a new patient)
    @PostMapping
    public ResponseEntity<Patient> createPatient(@RequestBody Patient patient) {
        Patient savedPatient = patientRepository.save(patient);
        return ResponseEntity.created(URI.create("/api/patients/" + savedPatient.getId()))
                .body(savedPatient);
    }

    // PUT /api/patients/1 (Update an existing patient)
    @PutMapping("/{id}")
    public ResponseEntity<Patient> updatePatient(@PathVariable Long id, @RequestBody Patient patientDetails) {
        if (!patientRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        patientDetails.setId(id); // Ensure we are updating the correct patient
        Patient updatedPatient = patientRepository.save(patientDetails);
        return ResponseEntity.ok(updatedPatient);
    }

    // DELETE /api/patients/1 (Delete a patient)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePatient(@PathVariable Long id) {
        if (!patientRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        patientRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}