import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Briefcase, Clock, Building2, DollarSign, ArrowLeft, Bookmark, Share2 } from "lucide-react";
import { applyForJob, saveJobForLater, getUser } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// Sample job detail data
const jobDetails = {
  id: "1",
  title: "Frontend Developer Intern",
  company: "TechCorp",
  location: "San Francisco, CA",
  type: "Internship",
  postedDate: "2 days ago",
  salary: "$20-25/hour",
  tags: ["React", "TypeScript", "UI/UX"],
  description: `We're looking for a talented Frontend Developer Intern to join our growing team. This is an excellent opportunity to work on real-world projects and learn from experienced developers.

You'll be working with modern technologies including React, TypeScript, and Tailwind CSS to build beautiful, responsive user interfaces. This position offers hands-on experience in a fast-paced startup environment.`,
  requirements: [
    "Currently pursuing a degree in Computer Science or related field",
    "Strong understanding of HTML, CSS, and JavaScript",
    "Experience with React and modern frontend frameworks",
    "Knowledge of responsive design principles",
    "Good communication and teamwork skills",
    "Passion for learning and growing as a developer",
  ],
  benefits: [
    "Competitive hourly compensation",
    "Flexible working hours",
    "Remote work options",
    "Mentorship from senior developers",
    "Professional development opportunities",
    "Fun and collaborative team environment",
  ],
  about: `TechCorp is a leading technology company focused on building innovative solutions for modern businesses. We're a team of passionate developers, designers, and product managers who love what we do.

Our mission is to create software that makes people's lives easier. We value creativity, collaboration, and continuous learning. Join us and be part of something amazing!`,
};

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isApplying, setIsApplying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);

  const handleApply = async () => {
    const user = getUser();
    if (!user || !user.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to apply for jobs.",
        variant: "destructive",
      });
      navigate("/signin");
      return;
    }

    if (!id) {
      toast({
        title: "Error",
        description: "Job ID is missing.",
        variant: "destructive",
      });
      return;
    }

    setIsApplying(true);
    try {
      await applyForJob(user.id, id);
      setHasApplied(true);
      toast({
        title: "Success!",
        description: "Your application has been submitted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to apply for job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsApplying(false);
    }
  };

  const handleSaveForLater = async () => {
    const user = getUser();
    if (!user || !user.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save jobs.",
        variant: "destructive",
      });
      navigate("/signin");
      return;
    }

    if (!id) {
      toast({
        title: "Error",
        description: "Job ID is missing.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await saveJobForLater(user.id, id);
      setHasSaved(true);
      toast({
        title: "Success!",
        description: "Job saved for later.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to save job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/jobs')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{jobDetails.title}</h1>
                    <div className="flex items-center gap-2 text-lg text-muted-foreground mb-4">
                      <Building2 className="h-5 w-5" />
                      {jobDetails.company}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon">
                      <Bookmark className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {jobDetails.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {jobDetails.type}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Posted {jobDetails.postedDate}
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {jobDetails.salary}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {jobDetails.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h2 className="text-2xl font-semibold mb-4">Description</h2>
                <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                  {jobDetails.description}
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-4">Requirements</h2>
                <ul className="space-y-2">
                  {jobDetails.requirements.map((req, index) => (
                    <li key={index} className="flex gap-3 text-muted-foreground">
                      <span className="text-primary mt-1.5">•</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-4">Benefits</h2>
                <ul className="space-y-2">
                  {jobDetails.benefits.map((benefit, index) => (
                    <li key={index} className="flex gap-3 text-muted-foreground">
                      <span className="text-secondary mt-1.5">•</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-4">About {jobDetails.company}</h2>
                <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                  {jobDetails.about}
                </p>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                <div className="gradient-card rounded-xl p-6 shadow-lg border space-y-4">
                  <Button 
                    variant="hero" 
                    size="lg" 
                    className="w-full"
                    onClick={handleApply}
                    disabled={isApplying || hasApplied}
                  >
                    {isApplying ? "Applying..." : hasApplied ? "Applied ✓" : "Apply Now"}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full"
                    onClick={handleSaveForLater}
                    disabled={isSaving || hasSaved}
                  >
                    {isSaving ? "Saving..." : hasSaved ? "Saved ✓" : "Save for Later"}
                  </Button>
                </div>

                <div className="bg-card rounded-xl p-6 shadow border space-y-4">
                  <h3 className="font-semibold text-lg">Job Overview</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-medium">{jobDetails.location}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Briefcase className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Job Type</p>
                        <p className="font-medium">{jobDetails.type}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <DollarSign className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Salary</p>
                        <p className="font-medium">{jobDetails.salary}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Posted</p>
                        <p className="font-medium">{jobDetails.postedDate}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default JobDetail;
