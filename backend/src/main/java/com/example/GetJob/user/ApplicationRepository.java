package com.example.GetJob.user;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByUserId(Long userId);
    Optional<Application> findByUserIdAndJobId(Long userId, Long jobId);
}

