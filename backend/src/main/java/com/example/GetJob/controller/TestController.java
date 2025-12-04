package com.example.GetJob.controller;

import org.springframework.web.bind.annotation.*;

/**
 * Test controller for debugging CORS configuration
 * Can be removed in production
 */
@RestController
@RequestMapping("/api/test")
public class TestController {
    
    /**
     * Test GET endpoint for CORS verification
     */
    @GetMapping("/cors")
    public String testGetCors() {
        return "GET CORS is working!";
    }
    
    /**
     * Test POST endpoint for CORS verification
     */
    @PostMapping("/cors")
    public String testPostCors(@RequestBody(required = false) String test) {
        return "POST CORS is working! Received: " + (test != null ? test : "no body");
    }
    
    /**
     * Test OPTIONS endpoint for preflight requests
     */
    @RequestMapping(value = "/cors", method = RequestMethod.OPTIONS)
    public String testOptionsCors() {
        return "OPTIONS CORS preflight is working!";
    }
    
    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public String health() {
        return "Backend is healthy and running!";
    }
}
