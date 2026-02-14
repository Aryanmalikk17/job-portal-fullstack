package com.jobportal.repository;

import com.jobportal.entity.IRecruiterJobs;
import com.jobportal.entity.JobPostActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface JobPostActivityRepository extends JpaRepository<JobPostActivity, Integer> {

    @Query(value = " SELECT COUNT(s.user_id) as totalCandidates,j.jobPostId as job_post_id,j.jobTitle as job_title,l.id as locationId,l.city,l.state,l.country,c.id as companyId,c.name FROM JobPostActivity j " +
            " inner join j.jobLocationId l " +
            " INNER join j.jobCompanyId c  " +
            " left join j.jobSeekerApplyList s " +
            " where j.postedById.userId = :recruiter " +
            " GROUP By j.jobPostId" )
    List<IRecruiterJobs> getRecruiterJobs(@Param("recruiter") int recruiter);

    @Query(value = "SELECT j FROM JobPostActivity j INNER JOIN j.jobLocationId l  WHERE j" +
            ".jobTitle LIKE %:job%"
            + " AND (l.city LIKE %:location%"
            + " OR l.country LIKE %:location%"
            + " OR l.state LIKE %:location%) " +
            " AND (j.jobType IN(:type)) " +
            " AND (j.remote IN(:remote)) ")
    List<JobPostActivity> searchWithoutDate(@Param("job") String job,
                                            @Param("location") String location,
                                            @Param("remote") List<String> remote,
                                            @Param("type") List<String> type);

    @Query(value = "SELECT j FROM JobPostActivity j INNER JOIN j.jobLocationId l  WHERE j" +
            ".jobTitle LIKE %:job%"
            + " AND (l.city LIKE %:location%"
            + " OR l.country LIKE %:location%"
            + " OR l.state LIKE %:location%) " +
            " AND (j.jobType IN(:type)) " +
            " AND (j.remote IN(:remote)) " +
            " AND (j.postedDate >= :date)")
    List<JobPostActivity> search(@Param("job") String job,
                                 @Param("location") String location,
                                 @Param("remote") List<String> remote,
                                 @Param("type") List<String> type,
                                 @Param("date") LocalDate searchDate);
}