package com.example.GetJob.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByTitleContainingIgnoreCase(String search);
    List<Job> findByJobType(String type);

    @Query(value = """
            SELECT a.id AS application_id,
                   u.name AS applicant_name,
                   u.email AS applicant_email,
                   j.title AS job_title,
                   COALESCE(c.name, j.company_name, '') AS company_name,
                   a.applied_at AS applied_at
            FROM applications a
            JOIN users u ON u.id = a.user_id
            JOIN job j ON j.id = a.job_id
            LEFT JOIN company c ON c.id = j.company_id
            ORDER BY a.applied_at DESC, a.id DESC
            """, nativeQuery = true)
    List<Object[]> fetchApplicationJoinRows();

    @Query(value = """
            SELECT j.id AS job_id,
                   j.title AS job_title,
                   j.location AS job_location,
                   COALESCE(c.name, j.company_name, '') AS company_name,
                   (
                       SELECT COUNT(*)
                       FROM applications a
                       WHERE a.job_id = j.id
                   ) AS application_count
            FROM job j
            LEFT JOIN company c ON c.id = j.company_id
            WHERE EXISTS (
                SELECT 1
                FROM applications a
                WHERE a.job_id = j.id
            )
            ORDER BY application_count DESC, j.created_at DESC, j.id DESC
            """, nativeQuery = true)
    List<Object[]> findPopularJobsWithApplications();

    @Query("SELECT j FROM Job j WHERE lower(coalesce(j.title,'')) = lower(coalesce(:title,'')) AND lower(coalesce(j.companyName,'')) = lower(coalesce(:company,'')) AND lower(coalesce(j.location,'')) = lower(coalesce(:location,''))")
    Optional<Job> findExisting(@Param("title") String title, @Param("company") String company, @Param("location") String location);
}
