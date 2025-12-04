package com.example.GetJob.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @GetMapping("/cors")
    public String testGetCors() {
        return "GET CORS is working!";
    }

    @PostMapping("/cors")
    public String testPostCors(@RequestBody(required = false) String test) {
        return "POST CORS is working! Received: " + (test != null ? test : "no body");
    }

    @RequestMapping(value = "/cors", method = RequestMethod.OPTIONS)
    public String testOptionsCors() {
        return "OPTIONS CORS preflight is working!";
    }

    @GetMapping("/health")
    public String health() {
        return "Backend is healthy and running!";
    }
}
