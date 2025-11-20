package com.example.GetJob.user;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;


@Entity
@Table(name = "job")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String companyName;
    private String location;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String salaryRange;
    private String jobType;

    @Column(columnDefinition = "TEXT")
    private String applyUrl;

    private String source;
    private Timestamp postedAt;
    private Timestamp createdAt;
}
