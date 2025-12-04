import { Link } from "react-router-dom";
import { Briefcase, Github, Twitter, Linkedin } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const Footer = () => {
  return (
    <footer className="bg-muted/30 border-t mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                GetJob
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Connecting young professionals with their dream opportunities.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">For Job Seekers</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to="/jobs" className="hover:text-foreground transition-colors">Browse Jobs</Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Explore thousands of job opportunities across multiple industries. Filter roles by category, experience level, and location to quickly find positions that match your skills.</p>
                  </TooltipContent>
                </Tooltip>
              </li>
              <li>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to="/" className="hover:text-foreground transition-colors">Career Advice</Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Get expert tips on career growth, workplace communication, and developing a strong professional presence to help you move confidently toward your goals.</p>
                  </TooltipContent>
                </Tooltip>
              </li>
              <li>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to="/" className="hover:text-foreground transition-colors">Resume Tips</Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Learn how to create a polished and effective resume that highlights your strengths. Includes formatting guidance, keyword optimization, and examples.</p>
                  </TooltipContent>
                </Tooltip>
              </li>
              <li>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to="/" className="hover:text-foreground transition-colors">Interview Prep</Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Prepare for your next interview with common questions, best-practice answers, and confidence-building strategies to help you stand out from other candidates.</p>
                  </TooltipContent>
                </Tooltip>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">For Employers</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to="/" className="hover:text-foreground transition-colors">Post a Job</Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Easily post job openings and reach qualified candidates. Our platform helps employers connect with the right talent faster.</p>
                  </TooltipContent>
                </Tooltip>
              </li>
              <li>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to="/" className="hover:text-foreground transition-colors">Pricing</Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Choose from flexible pricing plans designed for both startups and established companies. Pay only for the features your hiring team needs.</p>
                  </TooltipContent>
                </Tooltip>
              </li>
              <li>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to="/" className="hover:text-foreground transition-colors">Resources</Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Access hiring guides, templates, and best practices to streamline your recruitment process and make better decisions.</p>
                  </TooltipContent>
                </Tooltip>
              </li>
              <li>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to="/" className="hover:text-foreground transition-colors">Contact Sales</Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Need assistance with bulk hiring or custom solutions? Connect with our sales team for tailored support and enterprise-level services.</p>
                  </TooltipContent>
                </Tooltip>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to="/" className="hover:text-foreground transition-colors">About Us</Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>We are a student-built job platform designed to connect job seekers with employers in a simple and efficient way. Created by Badar Ali and Shayan Haider as part of a FAST NUCES project.</p>
                  </TooltipContent>
                </Tooltip>
              </li>
              <li>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to="/" className="hover:text-foreground transition-colors">Blog</Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Stay updated with articles on industry trends, job market insights, career growth tips, and updates about our platform.</p>
                  </TooltipContent>
                </Tooltip>
              </li>
              <li>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to="/" className="hover:text-foreground transition-colors">Contact</Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Have questions or suggestions? Reach out to us — we value feedback and are committed to improving our platform.</p>
                  </TooltipContent>
                </Tooltip>
              </li>
              <li>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to="/" className="hover:text-foreground transition-colors">Privacy Policy</Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Learn how we store, protect, and use your data. Our privacy guidelines ensure a safe and transparent experience for every user.</p>
                  </TooltipContent>
                </Tooltip>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 GetJob. All rights reserved.
          </p>

          <div className="flex gap-4">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Linkedin className="h-5 w-5" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
