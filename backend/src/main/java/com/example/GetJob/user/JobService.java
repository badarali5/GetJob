package com.example.GetJob.user;

import java.util.*;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service
public class JobService {

    private final JobRepository jobRepository;
    @Autowired
    public JobService(JobRepository jobRepository) {
        this.jobRepository = jobRepository;
    }

    public Job postJob(Job job) {
        return jobRepository.save(job);
    }

    public List<Job> getJobs() {
        return jobRepository.findAll();
    }



    public List<Job> searchJobs(String title) {
        return jobRepository.findByTitleContainingIgnoreCase(title);
    }
    @Transactional
    void deleteJob(Job job) {
        jobRepository.delete(job);
    }
}
