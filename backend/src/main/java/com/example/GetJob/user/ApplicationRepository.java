package com.example.GetJob.user;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

public interface ApplicationRepository extends JpaRepository<User, Long> {


}

