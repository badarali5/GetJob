package com.example.GetJob.user;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;


@Entity
@Table(name = "job")
public class Job {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        private String title;
        private String type;
        private String description;
        private String skillsRequired;
        private String location;
        private String salaryRange;

        private LocalDate deadline;
        private LocalDateTime createdAt = LocalDateTime.now();

        @ManyToOne
        @JoinColumn(name = "company_id")
        private Company company;
}
