import React from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Briefcase } from "lucide-react";

const Employers: React.FC = () => {

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
