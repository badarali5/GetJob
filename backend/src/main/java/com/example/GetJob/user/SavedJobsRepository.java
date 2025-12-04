package com.example.GetJob.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedJobsRepository extends JpaRepository<SavedJobs, Long> {

    List<SavedJobs> findByUser_Id(Long userId);

    Optional<SavedJobs> findByUser_IdAndJob_Id(Long userId, Long jobId);

    boolean existsByUser_IdAndJob_Id(Long userId, Long jobId);
}
