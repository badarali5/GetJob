import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ApplicantPriorityQueue, Applicant } from "@/components/ApplicantPriorityQueue";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Users, TrendingUp, Award } from "lucide-react";

const Employers: React.FC = () => {
  // Mock applicant data for demo
  const [applicants] = useState<Applicant[]>([
    {
      id: "1",
      name: "Alice Johnson",
      email: "alice@example.com",
      jobId: "job-1",
      skillMatch: 95,
      experience: 5,
      resumeScore: 88,
      appliedAt: "2025-11-25",
    },
    {
      id: "2",
      name: "Bob Smith",
      email: "bob@example.com",
      jobId: "job-1",
      skillMatch: 78,
      experience: 3,
      resumeScore: 92,
      appliedAt: "2025-11-26",
    },
    {
      id: "3",
      name: "Carol Davis",
      email: "carol@example.com",
      jobId: "job-1",
      skillMatch: 85,
      experience: 7,
      resumeScore: 81,
      appliedAt: "2025-11-24",
    },
    {
      id: "4",
      name: "David Chen",
      email: "david@example.com",
      jobId: "job-1",
      skillMatch: 72,
      experience: 4,
      resumeScore: 75,
      appliedAt: "2025-11-23",
    },
    {
      id: "5",
      name: "Eva Martinez",
      email: "eva@example.com",
      jobId: "job-1",
      skillMatch: 90,
      experience: 6,
      resumeScore: 87,
      appliedAt: "2025-11-22",
    },
    {
      id: "6",
      name: "Frank Wilson",
      email: "frank@example.com",
      jobId: "job-1",
      skillMatch: 65,
      experience: 2,
      resumeScore: 70,
      appliedAt: "2025-11-21",
    },
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary/10 to-primary-glow/10 py-20 border-b">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Briefcase className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-4xl font-bold mb-4">Employer Dashboard</h1>
              <p className="text-lg text-muted-foreground mb-6">
                Post jobs, manage applicants, and find top talent using AI-powered ranking
              </p>
              <div className="flex items-center justify-center gap-4">
                <Link to="/signup">
                  <Button variant="hero" size="lg">
                    Post a Job
                  </Button>
                </Link>
                <Link to="/signin">
                  <Button variant="outline" size="lg">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">Why Choose GetJob?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-2">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Smart Applicant Ranking</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Our priority queue algorithm ranks applicants by skill match, resume quality, and experience.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Top Talent Discovery</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Find the best candidates instantly using our advanced sorting and filtering algorithms.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Analytics & Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Track job performance, trending opportunities, and make data-driven hiring decisions.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Applicant Priority Queue Demo */}
        <section className="py-12 bg-accent/20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">Applicant Management Example</h2>
            <p className="text-muted-foreground mb-6">
              Below is an example of how our priority queue system ranks applicants for your job postings:
            </p>
            <ApplicantPriorityQueue
              applicants={applicants}
              jobTitle="Senior Full Stack Engineer"
              limit={6}
            />
          </div>
        </section>

        {/* How it Works */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">How Our Ranking Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">40%</span>
                </div>
                <h3 className="font-semibold mb-2">Skill Match</h3>
                <p className="text-sm text-muted-foreground">
                  How well applicant skills align with job requirements
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">35%</span>
                </div>
                <h3 className="font-semibold mb-2">Resume Score</h3>
                <p className="text-sm text-muted-foreground">
                  Quality and relevance of resume and background
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">25%</span>
                </div>
                <h3 className="font-semibold mb-2">Experience</h3>
                <p className="text-sm text-muted-foreground">
                  Years of relevant professional experience
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Employers;
