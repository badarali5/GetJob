package com.example.GetJob.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long> {
    List<Resume> findByUser_IdOrderByUploadedAtDesc(Long userId);

    Optional<Resume> findByUser_IdAndIsActiveTrue(Long userId);
}