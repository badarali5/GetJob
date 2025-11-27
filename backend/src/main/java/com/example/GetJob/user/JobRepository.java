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

    @Query("SELECT j FROM Job j WHERE lower(coalesce(j.title,'')) = lower(coalesce(:title,'')) AND lower(coalesce(j.companyName,'')) = lower(coalesce(:company,'')) AND lower(coalesce(j.location,'')) = lower(coalesce(:location,''))")
    Optional<Job> findExisting(@Param("title") String title, @Param("company") String company, @Param("location") String location);
}
