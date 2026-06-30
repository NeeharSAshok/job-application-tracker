package com.jobtracker.service;

import com.jobtracker.dto.JobApplicationDto;
import com.jobtracker.entity.ApplicationStatus;
import com.jobtracker.entity.JobApplication;
import com.jobtracker.entity.User;
import com.jobtracker.exception.ResourceNotFoundException;
import com.jobtracker.repository.JobApplicationRepository;
import com.jobtracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobApplicationService {

    private final JobApplicationRepository applicationRepository;
    private final UserRepository userRepository;

    public List<JobApplicationDto.Response> getAllForUser(String username) {
        User user = getUser(username);
        return applicationRepository.findByUserOrderByAppliedDateDesc(user)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public JobApplicationDto.Response create(String username, JobApplicationDto.Request request) {
        User user = getUser(username);

        JobApplication application = JobApplication.builder()
                .companyName(request.getCompanyName())
                .roleTitle(request.getRoleTitle())
                .jobLink(request.getJobLink())
                .location(request.getLocation())
                .status(request.getStatus())
                .appliedDate(request.getAppliedDate())
                .followUpDate(request.getFollowUpDate())
                .notes(request.getNotes())
                .user(user)
                .build();

        return toResponse(applicationRepository.save(application));
    }

    public JobApplicationDto.Response update(String username, Long id, JobApplicationDto.Request request) {
        JobApplication application = getOwnedApplication(username, id);

        application.setCompanyName(request.getCompanyName());
        application.setRoleTitle(request.getRoleTitle());
        application.setJobLink(request.getJobLink());
        application.setLocation(request.getLocation());
        application.setStatus(request.getStatus());
        application.setAppliedDate(request.getAppliedDate());
        application.setFollowUpDate(request.getFollowUpDate());
        application.setNotes(request.getNotes());

        return toResponse(applicationRepository.save(application));
    }

    public JobApplicationDto.Response updateStatus(String username, Long id, ApplicationStatus status) {
        JobApplication application = getOwnedApplication(username, id);
        application.setStatus(status);
        return toResponse(applicationRepository.save(application));
    }

    public void delete(String username, Long id) {
        JobApplication application = getOwnedApplication(username, id);
        applicationRepository.delete(application);
    }

    private JobApplication getOwnedApplication(String username, Long id) {
        User user = getUser(username);
        JobApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + id));

        if (!application.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Application not found with id: " + id);
        }
        return application;
    }

    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }

    private JobApplicationDto.Response toResponse(JobApplication a) {
        return JobApplicationDto.Response.builder()
                .id(a.getId())
                .companyName(a.getCompanyName())
                .roleTitle(a.getRoleTitle())
                .jobLink(a.getJobLink())
                .location(a.getLocation())
                .status(a.getStatus())
                .appliedDate(a.getAppliedDate())
                .followUpDate(a.getFollowUpDate())
                .notes(a.getNotes())
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt())
                .build();
    }
}
