package com.example.GetJob.user;

import java.util.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;



@Service
public class JobService {

    private final JobRepository jobRepository;

    @Autowired
    public JobService(JobRepository jobRepository) {
        this.jobRepository = jobRepository;
    }

    @Value("${jsearch.api.key}")
    private String apiKey;

    @Value("${jsearch.api.host}")
    private String apiHost;

    private final RestTemplate rest = new RestTemplate();


    public void fetchJobs() {

        String url = "https://jsearch.p.rapidapi.com/search?query=software%20developer&num_pages=1";

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.set("X-RapidAPI-Key", apiKey);
        headers.set("X-RapidAPI-Host", apiHost);

        org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(headers);

        ResponseEntity<String> res = rest.exchange(url, org.springframework.http.HttpMethod.GET, entity, String.class);

        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(res.getBody());
            JsonNode results = root.path("data");

            if (results.isArray()) {
                for (JsonNode j : results) {
                    Job job = new Job();

                    job.setTitle(j.path("job_title").asText(null));
                    job.setCompanyName(j.path("employer_name").asText(null));
                    job.setLocation(j.path("job_city").asText(null));
                    job.setDescription(j.path("job_description").asText(null));
                    job.setSalaryRange(j.path("job_salary_currency").asText("") 
                                       + " " + j.path("job_salary").asText(""));

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

    public List<Job> getJobs() {
        return jobRepository.findAll();
    }

    public Job postJob(Job job) {
        return jobRepository.save(job);
    }

    public List<Job> searchJobs(String title) {
        // First try database search
        List<Job> results = jobRepository.findByTitleContainingIgnoreCase(title);
        if (results != null && !results.isEmpty()) {
            return results;
        }

        // If DB has no results, query JSearch dynamically for the given title
        try {
            return fetchJobsForQuery(title);
        } catch (Exception ex) {
            ex.printStackTrace();
            return Collections.emptyList();
        }
    }

    /**
     * Fetch jobs from JSearch for an arbitrary query and persist them.
     */
    public List<Job> fetchJobsForQuery(String query) throws Exception {
        if (query == null || query.trim().isEmpty()) return Collections.emptyList();

        String encoded = java.net.URLEncoder.encode(query, java.nio.charset.StandardCharsets.UTF_8);
        String url = String.format("https://jsearch.p.rapidapi.com/search?query=%s&num_pages=1", encoded);

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.set("X-RapidAPI-Key", apiKey);
        headers.set("X-RapidAPI-Host", apiHost);

        org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(headers);

        ResponseEntity<String> res = rest.exchange(url, org.springframework.http.HttpMethod.GET, entity, String.class);

        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(res.getBody());
        JsonNode results = root.path("data");
        List<Job> saved = new ArrayList<>();
        if (results.isArray()) {
            for (JsonNode j : results) {
                Job job = new Job();
                job.setTitle(j.path("job_title").asText(null));
                job.setCompanyName(j.path("employer_name").asText(null));
                job.setLocation(j.path("job_city").asText(null));
                job.setDescription(j.path("job_description").asText(null));
                job.setSalaryRange(j.path("job_salary_currency").asText("") + " " + j.path("job_salary").asText(""));
                job.setSource("jsearch");
                Job persisted = jobRepository.save(job);
                saved.add(persisted);
            }
        }
        return saved;
    }

}

