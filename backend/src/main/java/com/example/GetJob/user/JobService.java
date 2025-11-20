package com.example.GetJob.user;

import java.util.*;
import java.util.stream.Collectors;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;



@Service
public class JobService {

    private final JobRepository jobRepository;
    @Autowired
    public JobService(JobRepository jobRepository) {
        this.jobRepository = jobRepository;
    }

    @Value("${jobs.api.key}")
    private String apiKey;

    private final RestTemplate rest = new RestTemplate();
    public void fetchJobs() {
        String url = "https://api.adzuna.com/v1/api/jobs/pk/search/1?" +
                     "app_id=YOUR_ID&app_key=" + apiKey + "&results_per_page=50";

        ResponseEntity<String> res = rest.getForEntity(url, String.class);
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(res.getBody());
            JsonNode results = root.path("results");
            if (results.isArray()) {
                for (JsonNode j : results) {
                    Job job = new Job();
                    job.setTitle(j.path("title").asText(null));
                    // company is a nested object in the API; we skip creating Company entity here
                    job.setLocation(j.path("location").path("display_name").asText(null));
                    job.setDescription(j.path("description").asText(null));
                    String salaryMin = j.path("salary_min").asText("");
                    String salaryMax = j.path("salary_max").asText("");
                    if (!salaryMin.isEmpty() || !salaryMax.isEmpty()) {
                        job.setSalaryRange((salaryMin + " - " + salaryMax).trim());
                    }
                    jobRepository.save(job);
                }
            }
        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }

    @Scheduled(fixedRate = 43200000)  
    public void syncJobs() {
        fetchJobs();
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
