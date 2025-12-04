package com.example.GetJob.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SavedJobsRepository extends JpaRepository<SavedJobs, Long> {
    List<SavedJobs> findByUserId(Long userId);
    Optional<SavedJobs> findByUserIdAndJobId(Long userId, String jobId);
    boolean existsByUserIdAndJobId(Long userId, String jobId);
}
