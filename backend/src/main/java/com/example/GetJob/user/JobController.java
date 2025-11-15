package com.example.GetJob.user;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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
