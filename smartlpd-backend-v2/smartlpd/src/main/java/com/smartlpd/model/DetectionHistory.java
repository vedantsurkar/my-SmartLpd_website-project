package com.smartlpd.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "detection_history")
public class DetectionHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "license_plate_number", length = 20)
    private String licensePlateNumber;

    @Column(name = "image_path", length = 500)
    private String imagePath;

    @Column(name = "detection_time")
    private LocalDateTime detectionTime;

    private double confidence;

    // Link to User
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;

    @Column(name = "user_username", length = 50)
    private String userUsername;

    public DetectionHistory() {}

    public DetectionHistory(String licensePlateNumber, String imagePath, double confidence, User user) {
        this.licensePlateNumber = licensePlateNumber;
        this.imagePath = imagePath;
        this.confidence = confidence;
        this.user = user;
        this.userUsername = user != null ? user.getUsername() : "System";
        this.detectionTime = LocalDateTime.now();
    }

    // Getters and setters
    public User getUser() { return user; }
    public void setUser(User user) {
        this.user = user;
        if (user != null) {
            this.userUsername = user.getUsername();
        }
    }

    public String getUserUsername() { return userUsername; }
    public void setUserUsername(String userUsername) { this.userUsername = userUsername; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getLicensePlateNumber() { return licensePlateNumber; }
    public void setLicensePlateNumber(String licensePlateNumber) { this.licensePlateNumber = licensePlateNumber; }

    public String getImagePath() { return imagePath; }
    public void setImagePath(String imagePath) { this.imagePath = imagePath; }

    public LocalDateTime getDetectionTime() { return detectionTime; }
    public void setDetectionTime(LocalDateTime detectionTime) { this.detectionTime = detectionTime; }

    public double getConfidence() { return confidence; }
    public void setConfidence(double confidence) { this.confidence = confidence; }
}