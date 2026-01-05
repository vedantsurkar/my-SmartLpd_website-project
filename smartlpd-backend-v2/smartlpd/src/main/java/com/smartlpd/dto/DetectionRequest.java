package com.smartlpd.dto;

public class DetectionRequest {
    private String imageData; // Base64 encoded image

    public String getImageData() { return imageData; }
    public void setImageData(String imageData) { this.imageData = imageData; }
}