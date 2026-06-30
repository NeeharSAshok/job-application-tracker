package com.jobtracker.service;

import com.jobtracker.dto.StatsDto;
import com.jobtracker.entity.ApplicationStatus;
import com.jobtracker.entity.JobApplication;
import com.jobtracker.entity.User;
import com.jobtracker.exception.ResourceNotFoundException;
import com.jobtracker.repository.JobApplicationRepository;
import com.jobtracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final JobApplicationRepository applicationRepository;
    private final UserRepository userRepository;

    public StatsDto.DashboardStats getDashboardStats(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        List<JobApplication> all = applicationRepository.findByUserOrderByAppliedDateDesc(user);

        Map<String, Long> statusBreakdown = new LinkedHashMap<>();
        for (ApplicationStatus status : ApplicationStatus.values()) {
            statusBreakdown.put(status.name(), 0L);
        }
        all.forEach(a -> statusBreakdown.merge(a.getStatus().name(), 1L, Long::sum));

        long total = all.size();
        long interviewedOrBeyond = all.stream()
                .filter(a -> a.getStatus() == ApplicationStatus.INTERVIEW
                        || a.getStatus() == ApplicationStatus.OFFER)
                .count();
        long offers = statusBreakdown.getOrDefault(ApplicationStatus.OFFER.name(), 0L);

        double interviewRate = total == 0 ? 0 : (interviewedOrBeyond * 100.0) / total;
        double offerRate = total == 0 ? 0 : (offers * 100.0) / total;

        LocalDate now = LocalDate.now();
        long thisWeek = all.stream()
                .filter(a -> ChronoUnit.DAYS.between(a.getAppliedDate(), now) <= 7
                        && ChronoUnit.DAYS.between(a.getAppliedDate(), now) >= 0)
                .count();
        long thisMonth = all.stream()
                .filter(a -> a.getAppliedDate().getMonth() == now.getMonth()
                        && a.getAppliedDate().getYear() == now.getYear())
                .count();

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        Map<String, Long> grouped = all.stream()
                .collect(Collectors.groupingBy(a -> a.getAppliedDate().format(fmt), LinkedHashMap::new, Collectors.counting()));

        List<StatsDto.TimelinePoint> timeline = grouped.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> StatsDto.TimelinePoint.builder().date(e.getKey()).count(e.getValue()).build())
                .collect(Collectors.toList());

        return StatsDto.DashboardStats.builder()
                .totalApplications(total)
                .statusBreakdown(statusBreakdown)
                .interviewRate(Math.round(interviewRate * 10.0) / 10.0)
                .offerRate(Math.round(offerRate * 10.0) / 10.0)
                .applicationsThisWeek(thisWeek)
                .applicationsThisMonth(thisMonth)
                .timeline(timeline)
                .build();
    }
}
