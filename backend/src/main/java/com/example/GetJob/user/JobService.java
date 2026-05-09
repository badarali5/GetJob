package com.example.GetJob.user;

import java.util.*;
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

        // Build URL for scheduled fetch. Use the configured `apiUrl` when present,
        // but if it's a search endpoint we'll append a default query so scheduled
        // sync fetches meaningful results. If no `apiUrl` is configured, fall
        // back to the JSearch default search URL for "software developer".
        String defaultQuery = java.net.URLEncoder.encode("software developer", java.nio.charset.StandardCharsets.UTF_8);
        String url;
        if (apiUrl != null && !apiUrl.isBlank()) {
            if (apiUrl.contains("{query}")) {
                url = apiUrl.replace("{query}", defaultQuery);
            } else if (apiUrl.toLowerCase().contains("search")) {
                url = apiUrl + (apiUrl.contains("?") ? "&" : "?") + "query=" + defaultQuery + "&num_pages=1";
            } else {
                // non-search endpoint (e.g. internships list) — call as-is
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

        // Null-safety checks to satisfy static analyzers and avoid passing nulls to RestTemplate
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

                        // ensure job is non-null for callers and static analysis
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

    public List<SavedJobs> getSavedJobsForUser(Long userId) {
        return savedJobsRepository.findByUser_IdOrderBySavedAtDesc(userId);
    }

    public Map<String, Object> getSqlConceptExamples() {
        List<Object[]> joinRows = jobRepository.fetchApplicationJoinRows();
        List<Object[]> subqueryRows = jobRepository.findPopularJobsWithApplications();

        List<Map<String, Object>> joinResults = new ArrayList<>();
        for (Object[] row : joinRows) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("applicationId", row[0]);
            item.put("applicantName", row[1]);
            item.put("applicantEmail", row[2]);
            item.put("jobTitle", row[3]);
            item.put("companyName", row[4]);
            item.put("appliedAt", row[5]);
            joinResults.add(item);
        }

        List<Map<String, Object>> subqueryResults = new ArrayList<>();
        for (Object[] row : subqueryRows) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("jobId", row[0]);
            item.put("jobTitle", row[1]);
            item.put("jobLocation", row[2]);
            item.put("companyName", row[3]);
            item.put("applicationCount", row[4]);
            subqueryResults.add(item);
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("joinExample", joinResults);
        response.put("subqueryExample", subqueryResults);
        response.put("counts", Map.of(
                "joinRows", joinResults.size(),
                "subqueryRows", subqueryResults.size()
        ));
        return response;
    }

    @Transactional
    public void archiveOldSavedJobs(int days) {
        savedJobsRepository.archiveOldSavedJobs(days);
    }

    public Optional<Job> getJobById(Long id) {
        if (id == null) {
            return Optional.empty();
        }
        return jobRepository.findById(id);
    }

    public Job postJob(Job job) {
        java.util.Objects.requireNonNull(job, "job must not be null");
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
        // Build URL for query. Support three cases:
        // 1) `jsearch.api.url` contains the literal token "{query}" -> replace it
        // 2) `jsearch.api.url` points to a /search endpoint -> append query params
        // 3) fallback to the JSearch search URL
        String url;
        if (apiUrl != null && !apiUrl.isBlank() && apiUrl.contains("{query}")) {
            url = apiUrl.replace("{query}", encoded);
        } else if (apiUrl != null && !apiUrl.isBlank() && apiUrl.toLowerCase().contains("search")) {
            url = apiUrl + (apiUrl.contains("?") ? "&" : "?") + "query=" + encoded + "&num_pages=1";
        } else if (apiUrl != null && !apiUrl.isBlank()) {
            // apiUrl provided but not a search endpoint; try appending query
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

    // Require user to have uploaded resume before applying
    if (user.getResumeUrl() == null || user.getResumeUrl().isBlank()) {
        throw new RuntimeException("Please upload your resume before applying for jobs.");
    }

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
    application.setResumeUrl(user.getResumeUrl());

    return applicationRepository.save(application);
}


    public SavedJobs saveJobForLater(Long userId, String jobId) {
        // Validate userId
        if (userId == null || userId <= 0) {
            throw new RuntimeException("Invalid user ID: " + userId);
        }

        com.example.GetJob.auth.model.User user = authUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        Long jobIdLong;
        try {
            jobIdLong = Long.parseLong(jobId);
        } catch (NumberFormatException e) {
            throw new RuntimeException("Invalid job ID format: " + jobId);
        }

        Job job = jobRepository.findById(jobIdLong)
                .orElseThrow(() -> new RuntimeException("Job not found with ID: " + jobIdLong));

        // Prevent duplicate saves
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



