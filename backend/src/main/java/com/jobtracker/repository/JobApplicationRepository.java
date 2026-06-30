package com.jobtracker.repository;

import com.jobtracker.entity.ApplicationStatus;
import com.jobtracker.entity.JobApplication;
import com.jobtracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    List<JobApplication> findByUserOrderByAppliedDateDesc(User user);

    List<JobApplication> findByUserAndStatus(User user, ApplicationStatus status);

    long countByUserAndStatus(User user, ApplicationStatus status);

    @Query("SELECT a.status as status, COUNT(a) as count FROM JobApplication a WHERE a.user = :user GROUP BY a.status")
    List<StatusCount> countGroupedByStatus(@Param("user") User user);

    @Query("SELECT a FROM JobApplication a WHERE a.user = :user AND a.appliedDate >= :since ORDER BY a.appliedDate")
    List<JobApplication> findRecentApplications(@Param("user") User user, @Param("since") LocalDate since);

    interface StatusCount {
        ApplicationStatus getStatus();
        Long getCount();
    }
}
