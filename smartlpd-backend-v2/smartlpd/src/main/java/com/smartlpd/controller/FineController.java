package com.smartlpd.controller;

import com.smartlpd.model.Fine;
import com.smartlpd.model.FineStatus;
import com.smartlpd.service.FineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/fines")
@CrossOrigin(origins = "*")
public class FineController {

    @Autowired
    private FineService fineService;

    // For authorities to create fines
    @PostMapping
    public ResponseEntity<?> createFine(@RequestBody Map<String, Object> request) {
        try {
            System.out.println("📝 Creating fine with data: " + request);

            String licensePlateNumber = (String) request.get("licensePlateNumber");
            Double amount = Double.valueOf(request.get("amount").toString());
            String violationType = (String) request.get("violationType");
            String description = (String) request.get("description");

            // Use a default issuer for now
            String issuerUsername = "system";

            Fine fine = fineService.createFine(licensePlateNumber, amount, violationType,
                    description, LocalDateTime.now(), issuerUsername);

            return ResponseEntity.ok(Map.of("success", true, "fine", fine));
        } catch (Exception e) {
            System.out.println("❌ Error creating fine: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Error creating fine: " + e.getMessage()
            ));
        }
    }

    // For citizens to check their fines
    @GetMapping("/check")
    public ResponseEntity<?> checkFines(@RequestParam String licensePlateNumber) {
        try {
            System.out.println("🔍 Checking fines for: " + licensePlateNumber);

            if (licensePlateNumber == null || licensePlateNumber.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "License plate number is required"
                ));
            }

            List<Fine> fines = fineService.getFinesByLicensePlate(licensePlateNumber);
            System.out.println("✅ Found " + fines.size() + " fines for " + licensePlateNumber);

            return ResponseEntity.ok(Map.of("success", true, "fines", fines));
        } catch (Exception e) {
            System.out.println("❌ Error checking fines: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Error checking fines: " + e.getMessage()
            ));
        }
    }

    // For authorities to get all fines
    @GetMapping
    public ResponseEntity<?> getAllFines() {
        try {
            List<Fine> fines = fineService.getAllFines();
            return ResponseEntity.ok(Map.of("success", true, "fines", fines));
        } catch (Exception e) {
            System.out.println("❌ Error getting all fines: " + e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Error getting fines: " + e.getMessage()
            ));
        }
    }

    // For citizens to pay fines
    @PostMapping("/pay/{fineId}")
    public ResponseEntity<?> payFine(@PathVariable Long fineId, @RequestBody Map<String, String> request) {
        try {
            String licensePlateNumber = request.get("licensePlateNumber");
            System.out.println("💳 Paying fine " + fineId + " for " + licensePlateNumber);

            boolean success = fineService.payFine(fineId, licensePlateNumber);

            if (success) {
                return ResponseEntity.ok(Map.of("success", true, "message", "Fine paid successfully"));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Fine not found or already paid"
                ));
            }
        } catch (Exception e) {
            System.out.println("❌ Error paying fine: " + e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Error paying fine: " + e.getMessage()
            ));
        }
    }

    // Update fine status
    @PutMapping("/{fineId}/status")
    public ResponseEntity<?> updateFineStatus(@PathVariable Long fineId,
                                              @RequestBody Map<String, String> request) {
        try {
            FineStatus status = FineStatus.valueOf(request.get("status"));
            String updatedByUsername = "system"; // Default for now

            Fine updatedFine = fineService.updateFineStatus(fineId, status, updatedByUsername);

            return ResponseEntity.ok(Map.of("success", true, "fine", updatedFine));
        } catch (Exception e) {
            System.out.println("❌ Error updating fine status: " + e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Error updating fine status: " + e.getMessage()
            ));
        }
    }

    // Get fine statistics
    @GetMapping("/stats")
    public ResponseEntity<?> getFineStats() {
        try {
            List<Fine> allFines = fineService.getAllFines();
            long totalFines = allFines.size();
            long unpaidFines = allFines.stream().filter(fine -> fine.getStatus() == FineStatus.UNPAID).count();
            long paidFines = allFines.stream().filter(fine -> fine.getStatus() == FineStatus.PAID).count();

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalFines", totalFines);
            stats.put("unpaidFines", unpaidFines);
            stats.put("paidFines", paidFines);

            return ResponseEntity.ok(Map.of("success", true, "stats", stats));
        } catch (Exception e) {
            System.out.println("❌ Error getting fine stats: " + e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Error getting statistics: " + e.getMessage()
            ));
        }
    }
}