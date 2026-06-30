package com.jobtracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

public class StatsDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardStats {
        private long totalApplications;
        private Map<String, Long> statusBreakdown;
        private double interviewRate;
        private double offerRate;
        private long applicationsThisWeek;
        private long applicationsThisMonth;
        private List<TimelinePoint> timeline;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimelinePoint {
        private String date;
        private long count;
    }
}
