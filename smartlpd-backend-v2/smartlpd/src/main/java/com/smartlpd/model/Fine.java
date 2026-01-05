package com.smartlpd.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "fines")
public class Fine {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "license_plate_number", nullable = false, length = 20)
    private String licensePlateNumber;

    @Column(nullable = false)
    private Double amount;

    @Column(name = "violation_type", nullable = false, length = 100)
    private String violationType;

    @Column(length = 500)
    private String description;

    @Column(name = "violation_date", nullable = false)
    private LocalDateTime violationDate;

    @Column(name = "due_date")
    private LocalDateTime dueDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private FineStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "issued_by")
    @JsonIgnore
    private User issuedBy;

    @Column(name = "issued_by_username", length = 100)
    private String issuedByUsername;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Constructors
    public Fine() {}

    public Fine(String licensePlateNumber, Double amount, String violationType,
                String description, LocalDateTime violationDate, User issuedBy) {
        this.licensePlateNumber = licensePlateNumber;
        this.amount = amount;
        this.violationType = violationType;
        this.description = description;
        this.violationDate = violationDate;
        this.issuedBy = issuedBy;
        this.issuedByUsername = issuedBy != null ? issuedBy.getUsername() : "System";
        this.status = FineStatus.UNPAID;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.dueDate = violationDate.plusDays(30); // 30 days to pay
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getLicensePlateNumber() { return licensePlateNumber; }
    public void setLicensePlateNumber(String licensePlateNumber) { this.licensePlateNumber = licensePlateNumber; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public String getViolationType() { return violationType; }
    public void setViolationType(String violationType) { this.violationType = violationType; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getViolationDate() { return violationDate; }
    public void setViolationDate(LocalDateTime violationDate) { this.violationDate = violationDate; }

    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }

    public FineStatus getStatus() { return status; }
    public void setStatus(FineStatus status) { this.status = status; }

    public User getIssuedBy() { return issuedBy; }
    public void setIssuedBy(User issuedBy) {
        this.issuedBy = issuedBy;
        if (issuedBy != null) {
            this.issuedByUsername = issuedBy.getUsername();
        }
    }

    public String getIssuedByUsername() { return issuedByUsername; }
    public void setIssuedByUsername(String issuedByUsername) { this.issuedByUsername = issuedByUsername; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}