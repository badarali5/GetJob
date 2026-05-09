package com.example.GetJob.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface SavedJobsRepository extends JpaRepository<SavedJobs, Long> {

    List<SavedJobs> findByUser_Id(Long userId);

    Optional<SavedJobs> findByUser_IdAndJob_Id(Long userId, Long jobId);

    boolean existsByUser_IdAndJob_Id(Long userId, Long jobId);

    @Modifying
    @Transactional
    @Query(value = "CALL public.archive_old_saved_jobs(:days)", nativeQuery = true)
    void archiveOldSavedJobs(@Param("days") int days);
}
