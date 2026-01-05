package com.smartlpd.repository;

import com.smartlpd.model.Fine;
import com.smartlpd.model.FineStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FineRepository extends JpaRepository<Fine, Long> {
    List<Fine> findByLicensePlateNumberOrderByViolationDateDesc(String licensePlateNumber);
    List<Fine> findByLicensePlateNumberAndStatusOrderByViolationDateDesc(String licensePlateNumber, FineStatus status);
    List<Fine> findByStatusOrderByViolationDateDesc(FineStatus status);
    Optional<Fine> findByIdAndLicensePlateNumber(Long id, String licensePlateNumber);

    // Search fines by license plate (partial match)
    @Query("SELECT f FROM Fine f WHERE LOWER(f.licensePlateNumber) LIKE LOWER(CONCAT('%', :searchTerm, '%')) ORDER BY f.violationDate DESC")
    List<Fine> findByLicensePlateNumberContainingIgnoreCaseOrderByViolationDateDesc(@Param("searchTerm") String searchTerm);

    // Count fines by status
    long countByStatus(FineStatus status);
}