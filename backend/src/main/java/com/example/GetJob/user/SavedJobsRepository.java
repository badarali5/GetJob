package com.example.GetJob.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedJobsRepository extends JpaRepository<SavedJobs, Long> {

    // Get all saved jobs for a user
    List<SavedJobs> findByUser_Id(Long userId);

    // Check if a specific job is saved by a user
    Optional<SavedJobs> findByUser_IdAndJob_Id(Long userId, Long jobId);

    // Fast exists check for duplicates
    boolean existsByUser_IdAndJob_Id(Long userId, Long jobId);
}
