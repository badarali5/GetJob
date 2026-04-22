import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Briefcase, Clock, Building2, DollarSign, ArrowLeft, Bookmark, Share2 } from "lucide-react";
import { applyForJob, saveJobForLater, getUser, getJson } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type JobDetailData = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  postedDate: string;
  salary: string;
  tags: string[];
  description: string;
  requirements: string[];
  benefits: string[];
  about: string;
};

type BackendJob = {
  id: string | number;
  title?: string;
  companyName?: string;
  location?: string;
  jobType?: string;
  postedAt?: string | null;
  createdAt?: string | null;
  description?: string;
  salaryRange?: string;
  skills?: string[];
};

const fallbackRequirements = [
  "Strong communication and teamwork skills",
  "Ability to learn quickly and adapt to new tools",
  "Experience building or contributing to web applications",
  "Attention to detail and a problem-solving mindset",
];

const fallbackBenefits = [
  "Hands-on experience with real projects",
  "Opportunity to grow technical skills",
  "Collaborative team environment",
  "Potential for long-term career growth",
];

function timeAgo(dateLike?: string | null) {
  if (!dateLike) return "";
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return "";
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 52) return `${weeks}w ago`;
  const years = Math.floor(days / 365);
  return `${years}y ago`;
}

function normalizeJobType(jobType?: string) {
  if (!jobType) return "Unknown";
  return jobType
    .toLowerCase()
    .replace(/_/g, "-")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function toJobDetail(job: BackendJob): JobDetailData {
  const tags = Array.isArray(job.skills) && job.skills.length > 0 ? job.skills : [];
  const description = job.description?.trim() || `${job.title || "This role"} is available now. More details will appear here once the backend provides them.`;
  const company = job.companyName || "Unknown Company";

  return {
    id: String(job.id),
    title: job.title || "Untitled Job",
    company,
    location: job.location || "Remote",
    type: normalizeJobType(job.jobType),
    postedDate: job.postedAt ? timeAgo(job.postedAt) : (job.createdAt ? timeAgo(job.createdAt) : "Recently"),
    salary: job.salaryRange || "Not specified",
    tags,
    description,
    requirements: [
      `Experience or interest aligned with ${job.title || "this role"}`,
      ...fallbackRequirements,
    ],
    benefits: fallbackBenefits,
    about: `${company} is currently hiring for ${job.title || "this position"}. Review the job details and apply if it matches your background.`,
  };
}

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isApplying, setIsApplying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [jobDetails, setJobDetails] = useState<JobDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadJob = async () => {
      if (!id) {
        setError("Job ID is missing.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const job = await getJson<BackendJob>(`/jobs/${id}`);
        setJobDetails(toJobDetail(job));
      } catch (fetchError: any) {
        setError(fetchError?.status === 404 ? "Job not found." : "Failed to load job details.");
        setJobDetails(null);
      } finally {
        setLoading(false);
      }
    };

    void loadJob();
  }, [id]);

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

          {loading && (
            <div className="rounded-xl border bg-card p-6 text-muted-foreground">
              Loading job details...
            </div>
          )}

          {!loading && error && (
            <div className="rounded-xl border bg-card p-6 text-destructive">
              {error}
            </div>
          )}

          {!loading && !error && jobDetails && (
            <div className="grid lg:grid-cols-3 gap-8">
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
                    {jobDetails.tags.length > 0 ? jobDetails.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    )) : (
                      <Badge variant="secondary">No skills listed</Badge>
                    )}
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
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default JobDetail;
