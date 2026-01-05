package com.smartlpd.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
public class MLService {

    private final WebClient webClient;

    public MLService(@Value("${ml.service.url:http://localhost:5000}") String mlServiceUrl) {
        this.webClient = WebClient.builder()
                .baseUrl(mlServiceUrl)
                .build();
    }

    public Map<String, Object> detectLicensePlate(String imageData) {
        try {
            return webClient.post()
                    .uri("/detect")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(Map.of("imageData", imageData))
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block(); // Use block() for simplicity instead of Mono
        } catch (Exception e) {
            return Map.of(
                    "success", false,
                    "license_plate", "SERVICE_UNAVAILABLE",
                    "confidence", 0.0
            );
        }
    }

    public boolean isServiceHealthy() {
        try {
            String response = webClient.get()
                    .uri("/health")
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            return response != null;
        } catch (Exception e) {
            return false;
        }
    }
}