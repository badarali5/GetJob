package com.example.GetJob.user;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.http.ResponseEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;
import org.springframework.web.client.RestTemplate;

@Service
public class JobService {

    private static final Logger logger = LoggerFactory.getLogger(JobService.class);

    private final JobRepository jobRepository;

    public JobService(JobRepository jobRepository) {
        this.jobRepository = jobRepository;
    }

    @Value("${jsearch.api.key:}")
    private String apiKey;

    @Value("${jsearch.api.host:}")
    private String apiHost;

    private final RestTemplate rest = new RestTemplate();

    /**
     * Fetch jobs from JSearch and persist them.
     * Throws on fatal errors so callers (controllers) can surface the failure.
     */
    public void fetchJobs() throws Exception {
        if (apiKey == null || apiKey.isBlank() || apiHost == null || apiHost.isBlank()) {
            throw new IllegalStateException("Missing JSearch API key/host configuration (jsearch.api.key / jsearch.api.host).");
        }

        String url = "https://jsearch.p.rapidapi.com/search?query=software%20developer&num_pages=1";

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.set("X-RapidAPI-Key", apiKey);
        headers.set("X-RapidAPI-Host", apiHost);

        org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(headers);

        ResponseEntity<String> res = rest.exchange(url, org.springframework.http.HttpMethod.GET, entity, String.class);
        int status = res.getStatusCodeValue();
        logger.info("JSearch request returned status {}", status);

        if (!res.getStatusCode().is2xxSuccessful()) {
            String body = res.getBody();
            logger.error("JSearch returned non-success: {} body: {}", status, body);
            throw new RuntimeException("JSearch request failed with status " + status + " body: " + (body == null ? "" : body));
        }

        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(res.getBody());
        JsonNode results = root.path("data");

        if (results.isArray()) {
            int saved = 0;
            for (JsonNode j : results) {
                Job job = new Job();
                job.setTitle(j.path("job_title").asText(null));
                job.setCompanyName(j.path("employer_name").asText(null));
                job.setLocation(j.path("job_city").asText(null));
                job.setDescription(j.path("job_description").asText(null));
                job.setSalaryRange(j.path("job_salary_currency").asText("") + " " + j.path("job_salary").asText(""));
                job.setSource("jsearch");
                jobRepository.save(job);
                saved++;
            }
            logger.info("Saved {} jobs from JSearch", saved);
        } else {
            logger.warn("JSearch returned no 'data' array or it is not an array");
        }
    }

    @Scheduled(fixedRate = 43200000)
    public void syncJobs() {
        try {
            fetchJobs();
        } catch (Exception ex) {
            logger.error("Scheduled syncJobs failed", ex);
        }
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
            logger.error("Dynamic search via JSearch failed for '{}'", title, ex);
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

        if (!res.getStatusCode().is2xxSuccessful()) {
            logger.error("JSearch dynamic search failed with status {} body {}", res.getStatusCodeValue(), res.getBody());
            throw new RuntimeException("JSearch dynamic search failed with status " + res.getStatusCodeValue());
        }

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
            logger.info("Saved {} jobs from dynamic JSearch for query '{}'", saved.size(), query);
        } else {
            logger.warn("JSearch dynamic search returned no 'data' array for query '{}'", query);
        }
        return saved;
    }
}
