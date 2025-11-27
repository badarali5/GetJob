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

                    String title = j.path("job_title").asText(null);
                    String employer = j.path("employer_name").asText(null);
                    String city = j.path("job_city").asText(null);

                    job.setTitle(title);
                    job.setCompanyName(employer);
                    job.setLocation(city);
                    job.setDescription(j.path("job_description").asText(null));
                    job.setSalaryRange(j.path("job_salary_currency").asText("") + " " + j.path("job_salary").asText(""));
                    job.setSource("jsearch");

                    // try to parse posted_at if present
                    if (j.hasNonNull("job_posted_at")) {
                        try {
                            String posted = j.path("job_posted_at").asText(null);
                            if (posted != null && !posted.isEmpty()) {
                                // Many APIs return ISO-8601-like strings; try parsing
                                java.time.OffsetDateTime odt = java.time.OffsetDateTime.parse(posted);
                                job.setPostedAt(odt.toLocalDateTime());
                            }
                        } catch (Exception ex) {
                            // ignore parse errors
                        }
                    }

                    // avoid duplicates (title + company + location)
                    try {
                        Optional<Job> existing = jobRepository.findExisting(title == null ? "" : title, employer == null ? "" : employer, city == null ? "" : city);
                        if (existing.isPresent()) {
                            continue; // skip saving duplicate
                        }
                    } catch (Exception ex) {
                        // if the query fails for any reason, fall back to saving
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
                String title = j.path("job_title").asText(null);
                String employer = j.path("employer_name").asText(null);
                String city = j.path("job_city").asText(null);

                // avoid duplicates
                try {
                    Optional<Job> existing = jobRepository.findExisting(title == null ? "" : title, employer == null ? "" : employer, city == null ? "" : city);
                    if (existing.isPresent()) {
                        saved.add(existing.get());
                        continue;
                    }
                } catch (Exception ex) {
                    // ignore and continue
                }

                Job job = new Job();
                job.setTitle(title);
                job.setCompanyName(employer);
                job.setLocation(city);
                job.setDescription(j.path("job_description").asText(null));
                job.setSalaryRange(j.path("job_salary_currency").asText("") + " " + j.path("job_salary").asText(""));
                job.setSource("jsearch");

                if (j.hasNonNull("job_posted_at")) {
                    try {
                        String posted = j.path("job_posted_at").asText(null);
                        if (posted != null && !posted.isEmpty()) {
                            java.time.OffsetDateTime odt = java.time.OffsetDateTime.parse(posted);
                            job.setPostedAt(odt.toLocalDateTime());
                        }
                    } catch (Exception ex) {
                        // ignore parse errors
                    }
                }

                Job persisted = jobRepository.save(job);
                saved.add(persisted);
            }
        }
        return saved;
    }

}

