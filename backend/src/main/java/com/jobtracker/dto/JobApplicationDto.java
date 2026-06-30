package com.jobtracker.dto;

import com.jobtracker.entity.ApplicationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class JobApplicationDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        @NotBlank
        private String companyName;

        @NotBlank
        private String roleTitle;

        private String jobLink;
        private String location;

        @NotNull
        private ApplicationStatus status;

        @NotNull
        private LocalDate appliedDate;

        private LocalDate followUpDate;
        private String notes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String companyName;
        private String roleTitle;
        private String jobLink;
        private String location;
        private ApplicationStatus status;
        private LocalDate appliedDate;
        private LocalDate followUpDate;
        private String notes;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusUpdateRequest {
        @NotNull
        private ApplicationStatus status;
    }
}
