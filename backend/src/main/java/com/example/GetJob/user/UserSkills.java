package com.example.GetJob.user;

public class UserSkills {
    private String skill;
    private String skillName;
    public UserSkills(String skill, String skillName) {
        this.skill = skill;
        this.skillName = skillName;

    }
    public String getSkill() {
        return skill;
    }
    public String getSkillName() {
        return skillName;
    }
    public void setSkill(String skill) {
        this.skill = skill;
    }
    public void setSkillName(String skillName) {
        this.skillName = skillName;
    }

}
