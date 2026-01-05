package com.smartlpd.controller;

import com.smartlpd.dto.DetectionRequest;
import com.smartlpd.dto.DetectionResponse;
import com.smartlpd.service.LicensePlateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Allow frontend to connect
public class DetectionController {

    @Autowired
    private LicensePlateService licensePlateService;

    @PostMapping("/detect")
    public DetectionResponse detectLicensePlate(@RequestBody DetectionRequest request) {
        return licensePlateService.detectLicensePlate(request);
    }

    @GetMapping("/test")
    public String test() {
        return "SmartLPD Backend is running!";
    }

    @GetMapping("/hello")
    public String hello() {
        return "Hello from SmartLPD Backend!";
    }
}