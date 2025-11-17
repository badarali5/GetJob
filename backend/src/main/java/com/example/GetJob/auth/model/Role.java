package com.example.GetJob.auth.model;

public enum Role {
    SOFTWARE_ENG("Software Engineer"),
    AI_ENG("AI Engineer"),
    DEVOPS("DevOps Engineer"),
    ML("ML Engineer"),
    CYBERSECURITY("Cybersecurity Specialist"),
    OTHER("Other");

    private final String displayName;

    Role(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
