package com.jobtracker.controller;

import com.jobtracker.dto.JobApplicationDto;
import com.jobtracker.service.JobApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class JobApplicationController {

    private final JobApplicationService applicationService;

    @GetMapping
    public ResponseEntity<List<JobApplicationDto.Response>> getAll(Authentication auth) {
        return ResponseEntity.ok(applicationService.getAllForUser(auth.getName()));
    }

    @PostMapping
    public ResponseEntity<JobApplicationDto.Response> create(Authentication auth,
                                                               @Valid @RequestBody JobApplicationDto.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(applicationService.create(auth.getName(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobApplicationDto.Response> update(Authentication auth,
                                                               @PathVariable Long id,
                                                               @Valid @RequestBody JobApplicationDto.Request request) {
        return ResponseEntity.ok(applicationService.update(auth.getName(), id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<JobApplicationDto.Response> updateStatus(Authentication auth,
                                                                     @PathVariable Long id,
                                                                     @Valid @RequestBody JobApplicationDto.StatusUpdateRequest request) {
        return ResponseEntity.ok(applicationService.updateStatus(auth.getName(), id, request.getStatus()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(Authentication auth, @PathVariable Long id) {
        applicationService.delete(auth.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
