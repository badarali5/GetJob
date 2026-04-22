package com.example.GetJob.user;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.List;
@RestController
@RequestMapping("/jobs")
public class JobController {

    private static final Logger logger = LoggerFactory.getLogger(JobController.class);

    private final JobService jobService;

    @Autowired
    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @GetMapping("/sync")
    public ResponseEntity<?> syncJobs() {
        try {
            jobService.fetchJobs();
            return ResponseEntity.ok("Jobs fetched from JSearch!");
        } catch (Exception ex) {
            logger.error("Failed to sync jobs from JSearch", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body("Failed to fetch jobs: " + ex.getMessage());
        }
    }

    @PostMapping("/post")
    public ResponseEntity<Job> postJob(@RequestBody Job job) {
        return ResponseEntity.ok(jobService.postJob(job));
    }

    @GetMapping
    public ResponseEntity<List<Job>> getJobs() {
        return ResponseEntity.ok(jobService.getJobs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Job> getJobById(@PathVariable Long id) {
        return jobService.getJobById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public ResponseEntity<List<Job>> search(@RequestParam("title") String title) {
        return ResponseEntity.ok(jobService.searchJobs(title));
    }

    @PostMapping("/apply")
    public ResponseEntity<Application> applyForJob(@RequestParam("userId") Long userId, @RequestParam("jobId") String jobId) {
        try {
            Application application = jobService.applyForJob(userId, jobId);
            return ResponseEntity.ok(application);
        } catch (Exception ex) {
            logger.error("Failed to apply for job", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body(null);
        }
    }

    @PostMapping("/save")
    public ResponseEntity<SavedJobs> saveJobForLater(@RequestParam("userId") Long userId, @RequestParam("jobId") String jobId) {
        try {
            SavedJobs savedJob = jobService.saveJobForLater(userId, jobId);
            return ResponseEntity.ok(savedJob);
        } catch (Exception ex) {
            logger.error("Failed to save job for later", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body(null);
        }
    }
}
