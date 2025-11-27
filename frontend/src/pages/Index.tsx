import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import QuickFilters from "@/components/QuickFilters";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";
import { JobHeapSection, JobWithMetrics } from "@/components/JobHeapSection";
import { getJson } from "@/lib/api";
import { TrendingUp, Zap, Eye } from "lucide-react";

const Index = () => {
  const [jobs, setJobs] = useState<JobWithMetrics[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        let data: any[] = [];
        try {
          data = await getJson<any[]>('/jobs');
        } catch (e) {
          console.error('/jobs failed:', e);
          throw new Error('Failed to fetch jobs from backend');
        }
        
        // Enhance with mock metrics (in production, these would come from the backend)
        const jobsWithMetrics: JobWithMetrics[] = (data || []).map((job, index) => ({
          ...job,
          id: String(job.id),
          views: Math.floor(Math.random() * 1000) + 50,
          salary: job.salaryRange ? parseInt(job.salaryRange) : 50000 + Math.random() * 100000,
          popularity: Math.floor(Math.random() * 500) + 10,
        }));
        
        setJobs(jobsWithMetrics);
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    void fetchJobs();
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <QuickFilters />
      
      {/* Top Jobs by Salary */}
      {!loading && jobs.length > 0 && (
        <JobHeapSection
          jobs={jobs}
          title="💰 Top Paying Jobs"
          icon={<Zap className="h-6 w-6 text-yellow-500" />}
          metric="salary"
          limit={5}
        />
      )}

      {/* Trending Jobs by Views */}
      {!loading && jobs.length > 0 && (
        <JobHeapSection
          jobs={jobs}
          title="🔥 Trending Now"
          icon={<TrendingUp className="h-6 w-6 text-red-500" />}
          metric="views"
          limit={5}
        />
      )}

      {/* Most Popular Jobs */}
      {!loading && jobs.length > 0 && (
        <JobHeapSection
          jobs={jobs}
          title="⭐ Most Popular"
          icon={<Eye className="h-6 w-6 text-blue-500" />}
          metric="popularity"
          limit={5}
        />
      )}

      <HowItWorks />
      <Footer />
    </div>
  );
};

export default Index;
