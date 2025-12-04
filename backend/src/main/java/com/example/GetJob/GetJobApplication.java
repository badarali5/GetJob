package com.example.GetJob;

import org.springframework.boot.SpringApplication;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
@RestController
@EnableScheduling
@SpringBootApplication
public class GetJobApplication {

	public static void main(String[] args) {
		{
			SpringApplication.run(GetJobApplication.class, args);
		}
	}
}