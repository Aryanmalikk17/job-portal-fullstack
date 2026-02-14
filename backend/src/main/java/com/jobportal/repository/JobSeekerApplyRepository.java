package com.jobportal.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.jobportal.entity.JobPostActivity;
import com.jobportal.entity.JobSeekerApply;
import com.jobportal.entity.JobSeekerProfile;

@Repository
public interface JobSeekerApplyRepository extends JpaRepository<JobSeekerApply, Integer> {

    List<JobSeekerApply> findByUserId(JobSeekerProfile userId);

    List<JobSeekerApply> findByJob(JobPostActivity job);

    // Check if user has already applied for a job
    Optional<JobSeekerApply> findByUserIdAndJob(JobSeekerProfile userId, JobPostActivity job);

    // Find applications by status
    List<JobSeekerApply> findByStatus(JobSeekerApply.ApplicationStatus status);

    // Find applications for a specific job with status filter
    List<JobSeekerApply> findByJobAndStatus(JobPostActivity job, JobSeekerApply.ApplicationStatus status);

    // Get applications for jobs posted by a specific recruiter
    @Query("SELECT jsa FROM JobSeekerApply jsa WHERE jsa.job.postedById.userId = :recruiterId ORDER BY jsa.applyDate DESC")
    List<JobSeekerApply> findApplicationsByRecruiterId(@Param("recruiterId") Integer recruiterId);

    // Get applications for jobs posted by a specific recruiter with status filter
    @Query("SELECT jsa FROM JobSeekerApply jsa WHERE jsa.job.postedById.userId = :recruiterId AND jsa.status = :status ORDER BY jsa.applyDate DESC")
    List<JobSeekerApply> findApplicationsByRecruiterIdAndStatus(@Param("recruiterId") Integer recruiterId, @Param("status") JobSeekerApply.ApplicationStatus status);

    // Count applications by job
    @Query("SELECT COUNT(jsa) FROM JobSeekerApply jsa WHERE jsa.job = :job")
    Long countApplicationsByJob(@Param("job") JobPostActivity job);

    // Count applications by recruiter
    @Query("SELECT COUNT(jsa) FROM JobSeekerApply jsa WHERE jsa.job.postedById.userId = :recruiterId")
    Long countApplicationsByRecruiterId(@Param("recruiterId") Integer recruiterId);

    // Find recent applications (last 30 days) for a recruiter
    @Query("SELECT jsa FROM JobSeekerApply jsa " +
           "JOIN jsa.job j " +
           "WHERE j.postedById.userId = :recruiterId " +
           "AND jsa.applyDate >= :date " +
           "ORDER BY jsa.applyDate DESC")
    List<JobSeekerApply> findRecentApplicationsByRecruiterId(@Param("recruiterId") Integer recruiterId, @Param("date") java.util.Date date);

    // Get applications grouped by status for a recruiter
    @Query("SELECT jsa.status, COUNT(jsa) FROM JobSeekerApply jsa WHERE jsa.job.postedById.userId = :recruiterId GROUP BY jsa.status")
    List<Object[]> getApplicationStatusCountsByRecruiterId(@Param("recruiterId") Integer recruiterId);
}
