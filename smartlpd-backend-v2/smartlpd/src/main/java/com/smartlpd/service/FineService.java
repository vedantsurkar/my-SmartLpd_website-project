package com.smartlpd.service;

import com.smartlpd.model.Fine;
import com.smartlpd.model.FineStatus;
import com.smartlpd.model.User;
import com.smartlpd.repository.FineRepository;
import com.smartlpd.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class FineService {

    @Autowired
    private FineRepository fineRepository;

    @Autowired
    private UserRepository userRepository;

    public Fine createFine(String licensePlateNumber, Double amount, String violationType,
                           String description, LocalDateTime violationDate, String issuedByUsername) {
        User issuer = null;
        if (issuedByUsername != null && !issuedByUsername.equals("system")) {
            Optional<User> issuerOptional = userRepository.findByUsername(issuedByUsername);
            issuer = issuerOptional.orElse(null);
        }

        Fine fine = new Fine(licensePlateNumber, amount, violationType, description, violationDate, issuer);
        return fineRepository.save(fine);
    }

    public List<Fine> getFinesByLicensePlate(String licensePlateNumber) {
        return fineRepository.findByLicensePlateNumberOrderByViolationDateDesc(licensePlateNumber);
    }

    public List<Fine> getUnpaidFinesByLicensePlate(String licensePlateNumber) {
        return fineRepository.findByLicensePlateNumberAndStatusOrderByViolationDateDesc(licensePlateNumber, FineStatus.UNPAID);
    }

    public List<Fine> getAllFines() {
        return fineRepository.findAll();
    }

    public Fine updateFineStatus(Long fineId, FineStatus status, String updatedByUsername) {
        Optional<Fine> fineOptional = fineRepository.findById(fineId);
        if (fineOptional.isPresent()) {
            Fine fine = fineOptional.get();
            fine.setStatus(status);
            return fineRepository.save(fine);
        }
        throw new RuntimeException("Fine not found");
    }

    public boolean payFine(Long fineId, String licensePlateNumber) {
        Optional<Fine> fineOptional = fineRepository.findByIdAndLicensePlateNumber(fineId, licensePlateNumber);
        if (fineOptional.isPresent()) {
            Fine fine = fineOptional.get();
            fine.setStatus(FineStatus.PAID);
            fineRepository.save(fine);
            return true;
        }
        return false;
    }

    public List<Fine> searchFines(String searchTerm) {
        return fineRepository.findByLicensePlateNumberContainingIgnoreCaseOrderByViolationDateDesc(searchTerm);
    }
}