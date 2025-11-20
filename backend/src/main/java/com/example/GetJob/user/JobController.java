package com.example.GetJob.user;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/jobs")
public class JobController {

    private final JobService jobService;
    @Autowired
    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @Autowired
    private JobRepository repo;

    @GetMapping
    public List<Job> getAll() {
        return repo.findAll();
    }

    @GetMapping("/sync")
    public String syncJobs() {
        jobService.fetchJobs();
        return "Jobs fetched from JSearch!";
    }

    @PostMapping("/post")
    public ResponseEntity<Job> postJob(@RequestBody Job job) {
        return ResponseEntity.ok(jobService.postJob(job));
    }

    @GetMapping
    public ResponseEntity<List<Job>> getJobs() {
        return ResponseEntity.ok(jobService.getJobs());
    }

    @GetMapping("/search")
    public ResponseEntity<List<Job>> search(@RequestParam("title") String title) {
        return ResponseEntity.ok(jobService.searchJobs(title));
    }
}
