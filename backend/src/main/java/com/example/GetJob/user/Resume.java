package com.example.GetJob.user;

import com.example.GetJob.auth.model.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "resume")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Resume {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@Column(name = "file_url", nullable = false, columnDefinition = "TEXT")
	private String fileUrl;

	@Column(name = "file_name", length = 255)
	private String fileName;

	@Column(nullable = false)
	private Integer version = 1;

	@Column(name = "is_active", nullable = false)
	private boolean isActive = false;

	@Column(name = "uploaded_at", nullable = false)
	private LocalDateTime uploadedAt = LocalDateTime.now();
}