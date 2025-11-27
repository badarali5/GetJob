import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import JobCard from "@/components/JobCard";
import { Button } from "@/components/ui/button";
import { TrendingUp, Star, Eye } from "lucide-react";
import { MaxHeap } from "@/lib/heap";

export interface JobWithMetrics {
  id: string;
  title?: string;
  companyName?: string;
  location?: string;
  jobType?: string;
  postedAt?: string | null;
  createdAt?: string | null;
  description?: string;
  salaryRange?: string;
  skills?: string[];
  views?: number;
  salary?: number;
  popularity?: number; // likes, applications, etc.
}

interface JobHeapSectionProps {
  jobs: JobWithMetrics[];
  title: string;
  icon: React.ReactNode;
  metric: "salary" | "views" | "popularity";
  limit?: number;
}

function timeAgo(dateLike?: string | null) {
  if (!dateLike) return '';
  const d = new Date(dateLike);
  if (isNaN(d.getTime())) return '';
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
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

/**
 * Component to display top jobs sorted by a specific metric using MaxHeap
 * Examples:
 * - Top Jobs by Salary (highest paying)
 * - Trending Jobs (most viewed)
 * - Most Popular Jobs (most applications)
 */
export const JobHeapSection: React.FC<JobHeapSectionProps> = ({
  jobs,
  title,
  icon,
  metric,
  limit = 5,
}) => {
  const topJobs = useMemo(() => {
    if (!jobs || jobs.length === 0) return [];

    // Create heap with priority based on metric
    const heap = new MaxHeap<JobWithMetrics & { priority: number }>();

    jobs.forEach(job => {
      let priority = 0;
      if (metric === "salary") {
        priority = job.salary || 0;
      } else if (metric === "views") {
        priority = job.views || 0;
      } else if (metric === "popularity") {
        priority = job.popularity || 0;
      }

      heap.insert({
        ...job,
        priority,
      });
    });

    // Extract top N items
    const result: (JobWithMetrics & { priority: number })[] = [];
    let count = 0;
    while (count < limit && !heap.isEmpty()) {
      const item = heap.extract();
      if (item) result.push(item);
      count++;
    }

    return result;
  }, [jobs, metric, limit]);

  if (topJobs.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-accent/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          {icon}
          <h2 className="text-2xl font-bold">{title}</h2>
          <span className="ml-auto text-sm text-muted-foreground">
            Top {topJobs.length} by{" "}
            {metric === "salary"
              ? "Salary"
              : metric === "views"
              ? "Views"
              : "Popularity"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topJobs.map((job, index) => (
            <div key={job.id} className="relative">
              {/* Ranking badge */}
              <div className="absolute -top-2 -left-2 bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm z-10">
                #{index + 1}
              </div>

              {/* Metric display */}
              <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm rounded-lg px-3 py-1 flex items-center gap-1 text-sm font-semibold">
                {metric === "salary" && (
                  <>
                    <span className="text-green-600">
                      ${job.salary?.toLocaleString() || "N/A"}
                    </span>
                  </>
                )}
                {metric === "views" && (
                  <>
                    <Eye className="h-4 w-4" />
                    <span>{job.views || 0}</span>
                  </>
                )}
                {metric === "popularity" && (
                  <>
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{job.popularity || 0}</span>
                  </>
                )}
              </div>

              <JobCard
                id={job.id}
                title={job.title || "Untitled"}
                company={job.companyName || "Unknown"}
                location={job.location || "Remote"}
                type={job.jobType || "N/A"}
                postedDate={
                  job.postedAt
                    ? timeAgo(job.postedAt)
                    : job.createdAt
                    ? timeAgo(job.createdAt)
                    : ""
                }
                tags={job.skills || []}
              />
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link to="/jobs">
            <Button variant="outline" size="lg">
              View All Jobs
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default JobHeapSection;
