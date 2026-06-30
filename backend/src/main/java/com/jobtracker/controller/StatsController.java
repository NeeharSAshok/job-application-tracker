package com.jobtracker.controller;

import com.jobtracker.dto.StatsDto;
import com.jobtracker.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;

    @GetMapping("/api/stats/dashboard")
    public ResponseEntity<StatsDto.DashboardStats> getDashboardStats(Authentication auth) {
        return ResponseEntity.ok(statsService.getDashboardStats(auth.getName()));
    }

    @GetMapping("/api/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "Job Application Tracker API"));
    }
}
