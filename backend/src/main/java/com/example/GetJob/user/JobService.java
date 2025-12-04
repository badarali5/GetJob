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
    private final ApplicationRepository applicationRepository;
    private final SavedJobsRepository savedJobsRepository;
    private final com.example.GetJob.auth.repository.AuthUserRepository authUserRepository;

    @Autowired
    public JobService(JobRepository jobRepository, ApplicationRepository applicationRepository, SavedJobsRepository savedJobsRepository, com.example.GetJob.auth.repository.AuthUserRepository authUserRepository) {
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
        this.savedJobsRepository = savedJobsRepository;
        this.authUserRepository = authUserRepository;
    }

    @Value("${jsearch.api.key}")
    private String apiKey;

    @Value("${jsearch.api.host}")
    private String apiHost;

    @Value("${jsearch.api.url:}")
    private String apiUrl;

    private final RestTemplate rest = new RestTemplate();

    public void fetchJobs() {
        String defaultQuery = java.net.URLEncoder.encode("software developer", java.nio.charset.StandardCharsets.UTF_8);
        String url;
        if (apiUrl != null && !apiUrl.isBlank()) {
            if (apiUrl.contains("{query}")) {
                url = apiUrl.replace("{query}", defaultQuery);
            } else if (apiUrl.toLowerCase().contains("search")) {
                url = apiUrl + (apiUrl.contains("?") ? "&" : "?") + "query=" + defaultQuery + "&num_pages=1";
            } else {
                url = apiUrl;
            }
        } else {
            url = "https://jsearch.p.rapidapi.com/search?query=software%20developer&num_pages=1";
        }

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        String key = (apiKey != null && !apiKey.isBlank()) ? apiKey : System.getenv("RAPID_API_KEY");
        String host = (apiHost != null && !apiHost.isBlank()) ? apiHost : System.getenv("RAPID_API_HOST");
        if (key != null && !key.isBlank()) headers.set("X-RapidAPI-Key", key);
        if (host != null && !host.isBlank()) headers.set("X-RapidAPI-Host", host);

        org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(headers);
        String safeUrl = java.util.Objects.requireNonNull(url, "API URL must not be null");
        org.springframework.http.HttpMethod method = org.springframework.http.HttpMethod.GET;
        org.springframework.http.HttpMethod safeMethod = java.util.Objects.requireNonNull(method, "HttpMethod must not be null");

        ResponseEntity<String> res = rest.exchange(safeUrl, safeMethod, entity, String.class);

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
                    if (j.hasNonNull("job_posted_at")) {
                        try {
                            String posted = j.path("job_posted_at").asText(null);
                            if (posted != null && !posted.isEmpty()) {
                                java.time.OffsetDateTime odt = java.time.OffsetDateTime.parse(posted);
                                job.setPostedAt(odt.toLocalDateTime());
                            }
                        } catch (Exception ex) {
                        }
                    }
                    try {
                        Optional<Job> existing = jobRepository.findExisting(title == null ? "" : title, employer == null ? "" : employer, city == null ? "" : city);
                        if (existing.isPresent()) {
                            continue; // skip saving duplicate
                        }
                    } catch (Exception ex) {
                    }
                        java.util.Objects.requireNonNull(job, "job must not be null");
                        jobRepository.save(job);
                }
            }
        } catch (Exception ex) {
    System.out.println("JOB SYNC FAILED: " + ex.getMessage());
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
        java.util.Objects.requireNonNull(job, "job must not be null");
        return jobRepository.save(job);
    }

    public List<Job> searchJobs(String title) {
        List<Job> results = jobRepository.findByTitleContainingIgnoreCase(title);
        if (results != null && !results.isEmpty()) {
            return results;
        }
        try {
            return fetchJobsForQuery(title);
        } catch (Exception ex) {
            ex.printStackTrace();
            return Collections.emptyList();
        }
    }

    public List<Job> fetchJobsForQuery(String query) throws Exception {
        if (query == null || query.trim().isEmpty()) return Collections.emptyList();

        String encoded = java.net.URLEncoder.encode(query, java.nio.charset.StandardCharsets.UTF_8);
        String url;
        if (apiUrl != null && !apiUrl.isBlank() && apiUrl.contains("{query}")) {
            url = apiUrl.replace("{query}", encoded);
        } else if (apiUrl != null && !apiUrl.isBlank() && apiUrl.toLowerCase().contains("search")) {
            url = apiUrl + (apiUrl.contains("?") ? "&" : "?") + "query=" + encoded + "&num_pages=1";
        } else if (apiUrl != null && !apiUrl.isBlank()) {
            url = apiUrl + (apiUrl.contains("?") ? "&" : "?") + "query=" + encoded;
        } else {
            url = String.format("https://jsearch.p.rapidapi.com/search?query=%s&num_pages=1", encoded);
        }

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        String key = (apiKey != null && !apiKey.isBlank()) ? apiKey : System.getenv("RAPID_API_KEY");
        String host = (apiHost != null && !apiHost.isBlank()) ? apiHost : System.getenv("RAPID_API_HOST");
        if (key != null && !key.isBlank()) headers.set("X-RapidAPI-Key", key);
        if (host != null && !host.isBlank()) headers.set("X-RapidAPI-Host", host);

        org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(headers);

        String safeUrl2 = java.util.Objects.requireNonNull(url, "API URL must not be null");
        org.springframework.http.HttpMethod method2 = org.springframework.http.HttpMethod.GET;
        org.springframework.http.HttpMethod safeMethod2 = java.util.Objects.requireNonNull(method2, "HttpMethod must not be null");

        ResponseEntity<String> res = rest.exchange(safeUrl2, safeMethod2, entity, String.class);

        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(res.getBody());
        JsonNode results = root.path("data");
        List<Job> saved = new ArrayList<>();
        if (results.isArray()) {
            for (JsonNode j : results) {
                String title = j.path("job_title").asText(null);
                String employer = j.path("employer_name").asText(null);
                String city = j.path("job_city").asText(null);
                try {
                    Optional<Job> existing = jobRepository.findExisting(title == null ? "" : title, employer == null ? "" : employer, city == null ? "" : city);
                    if (existing.isPresent()) {
                        saved.add(existing.get());
                        continue;
                    }
                } catch (Exception ex) {
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
                    }
                }

                java.util.Objects.requireNonNull(job, "job must not be null");
                Job persisted = jobRepository.save(job);
                saved.add(persisted);
            }
        }
        return saved;
    }

    public Application applyForJob(Long userId, String jobId) {

    com.example.GetJob.auth.model.User user = authUserRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

    Long jobIdLong;
    try {
        jobIdLong = Long.parseLong(jobId);
    } catch (NumberFormatException e) {
        throw new RuntimeException("Invalid job ID format");
    }

    Job job = jobRepository.findById(jobIdLong)
            .orElseThrow(() -> new RuntimeException("Job not found"));

    Application application = new Application();
    application.setUser(user);
    application.setJob(job);
    application.setAppliedAt(java.time.LocalDateTime.now());

    return applicationRepository.save(application);
}

    public SavedJobs saveJobForLater(Long userId, String jobId) {

    com.example.GetJob.auth.model.User user = authUserRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

    Long jobIdLong;
    try {
        jobIdLong = Long.parseLong(jobId);
    } catch (NumberFormatException e) {
        throw new RuntimeException("Invalid job ID format");
    }

    Job job = jobRepository.findById(jobIdLong)
            .orElseThrow(() -> new RuntimeException("Job not found"));
    if (savedJobsRepository.existsByUser_IdAndJob_Id(userId, jobIdLong)) {
        throw new RuntimeException("Job already saved by user");
    }

    SavedJobs saved = new SavedJobs();
    saved.setUser(user);
    saved.setJob(job);
    saved.setSavedAt(java.time.LocalDateTime.now());

    return savedJobsRepository.save(saved);
}

}

