import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { TrendingUp, Zap, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getJson } from "@/lib/api";
import { MaxHeap } from "@/lib/heap";

export interface JobWithMetrics {
  id: string;
  title?: string;
  companyName?: string;
  location?: string;
  jobType?: string;
  views?: number;
  salary?: number;
  popularity?: number;
}

const QuickFilters = () => {
  const navigate = useNavigate();
  const [topJobs, setTopJobs] = useState<JobWithMetrics[]>([]);
  const [trendingJobs, setTrendingJobs] = useState<JobWithMetrics[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAndRankJobs = async () => {
      setLoading(true);
      try {
        let data: any[] = [];
        try {
          data = await getJson<any[]>('/jobs');
        } catch (e) {
          console.error('/jobs failed:', e);
          data = [];
        }
        
        // Enhance with mock metrics
        const jobsWithMetrics: JobWithMetrics[] = (data || []).map((job) => ({
          ...job,
          id: String(job.id),
          views: Math.floor(Math.random() * 1000) + 50,
          salary: job.salaryRange ? parseInt(job.salaryRange) : 50000 + Math.random() * 100000,
          popularity: Math.floor(Math.random() * 500) + 10,
        }));

        // Get top 3 jobs by salary using MaxHeap
        const salaryHeap = new MaxHeap<JobWithMetrics & { priority: number }>();
        jobsWithMetrics.forEach(job => {
          salaryHeap.insert({ ...job, priority: job.salary || 0 });
        });
        const topSalaryJobs: JobWithMetrics[] = [];
        for (let i = 0; i < 3 && !salaryHeap.isEmpty(); i++) {
          const item = salaryHeap.extract();
          if (item) topSalaryJobs.push(item);
        }
        setTopJobs(topSalaryJobs);

        // Get top 3 jobs by views using MaxHeap
        const viewsHeap = new MaxHeap<JobWithMetrics & { priority: number }>();
        jobsWithMetrics.forEach(job => {
          viewsHeap.insert({ ...job, priority: job.views || 0 });
        });
        const topViewJobs: JobWithMetrics[] = [];
        for (let i = 0; i < 3 && !viewsHeap.isEmpty(); i++) {
          const item = viewsHeap.extract();
          if (item) topViewJobs.push(item);
        }
        setTrendingJobs(topViewJobs);
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
        // Set empty arrays on error (graceful degradation)
        setTopJobs([]);
        setTrendingJobs([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchAndRankJobs();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">Loading top opportunities...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Top Jobs by Salary */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-3 flex items-center justify-center gap-2">
              <Zap className="h-8 w-8 text-yellow-500" />
              💰 Top Paying Jobs
            </h2>
            <p className="text-muted-foreground">Highest salary opportunities right now</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {topJobs.length > 0 ? (
              topJobs.map((job, index) => (
                <Button
                  key={job.id}
                  variant="outline"
                  onClick={() => navigate(`/jobs/${job.id}`)}
                  className="h-auto py-6 flex-col gap-3 hover:scale-105 hover:shadow-lg transition-all duration-300 bg-card relative overflow-hidden"
                >
                  {/* Ranking badge */}
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    #{index + 1}
                  </div>

                  <div className="w-full">
                    <p className="text-sm font-semibold line-clamp-2">{job.title}</p>
                    <p className="text-xs text-muted-foreground">{job.companyName}</p>
                    <p className="text-sm font-bold text-green-600 mt-2">
                      ${(job.salary || 0).toLocaleString()}
                    </p>
                  </div>
                </Button>
              ))
            ) : (
              <p className="text-muted-foreground col-span-full text-center">No jobs available</p>
            )}
          </div>
        </div>

        {/* Trending Jobs by Views */}
        <div>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-3 flex items-center justify-center gap-2">
              <TrendingUp className="h-8 w-8 text-red-500" />
              🔥 Trending Now
            </h2>
            <p className="text-muted-foreground">Most viewed opportunities this week</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {trendingJobs.length > 0 ? (
              trendingJobs.map((job, index) => (
                <Button
                  key={job.id}
                  variant="outline"
                  onClick={() => navigate(`/jobs/${job.id}`)}
                  className="h-auto py-6 flex-col gap-3 hover:scale-105 hover:shadow-lg transition-all duration-300 bg-card relative overflow-hidden"
                >
                  {/* Ranking badge */}
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    #{index + 1}
                  </div>

                  <div className="w-full">
                    <p className="text-sm font-semibold line-clamp-2">{job.title}</p>
                    <p className="text-xs text-muted-foreground">{job.companyName}</p>
                    <div className="flex items-center gap-1 mt-2 justify-center text-sm">
                      <Eye className="h-4 w-4" />
                      <span className="font-bold">{job.views?.toLocaleString() || 0}</span>
                      <span className="text-xs text-muted-foreground">views</span>
                    </div>
                  </div>
                </Button>
              ))
            ) : (
              <p className="text-muted-foreground col-span-full text-center">No jobs available</p>
            )}
          </div>
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button
            variant="hero"
            size="lg"
            onClick={() => navigate('/jobs')}
          >
            View All Opportunities
          </Button>
        </div>
      </div>
    </section>
  );
};

export default QuickFilters;
