import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JobCard from "@/components/JobCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Briefcase, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

import { getJson } from "@/lib/api";

// shape returned by backend /jobs
type BackendJob = {
  id: number | string;
  title?: string;
  companyName?: string;
  location?: string;
  jobType?: string;
  postedAt?: string | null;
  createdAt?: string | null;
  description?: string;
  salaryRange?: string;
};

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

const Jobs = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [jobs, setJobs] = useState<BackendJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loc, setLoc] = useState('');
  const [workplace, setWorkplace] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('');
  const [salaryFilter, setSalaryFilter] = useState('');
  const locationHook = useLocation();
  const navigate = useNavigate();

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getJson<BackendJob[]>('/jobs');
      // apply filters client-side if provided
      let results = data || [];
      if (loc && loc.trim() !== '') {
        results = results.filter(j => (j.location || '').toLowerCase().includes(loc.toLowerCase()));
      }
      if (workplace && workplace.trim() !== '') {
        if (workplace === 'remote') {
          results = results.filter(j => (j.location || '').toLowerCase().includes('remote'));
        }
      }
      if (jobTypeFilter && jobTypeFilter.trim() !== '') {
        results = results.filter(j => (j.jobType || '').toLowerCase().includes(jobTypeFilter.toLowerCase()));
      }
      if (salaryFilter && salaryFilter.trim() !== '') {
        results = results.filter(j => (j.salaryRange || '').toLowerCase().includes(salaryFilter.toLowerCase()));
      }
      setJobs(results);
    } catch (err: any) {
      console.error('Failed to fetch jobs', err);
      setError(err?.message || 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const searchJobs = async (title: string, locationFilter?: string, filters?: { workplace?: string; jobType?: string; salary?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const path = title && title.trim() !== '' ? `/jobs/search?title=${encodeURIComponent(title)}` : '/jobs';
      const data = await getJson<BackendJob[]>(path);
      let results = data || [];
      if (locationFilter && locationFilter.trim() !== '') {
        results = results.filter(j => (j.location || '').toLowerCase().includes(locationFilter.toLowerCase()));
      }
      if (filters?.workplace) {
        if (filters.workplace === 'remote') {
          results = results.filter(j => (j.location || '').toLowerCase().includes('remote'));
        }
      }
      if (filters?.jobType) {
        results = results.filter(j => (j.jobType || '').toLowerCase().includes(filters.jobType.toLowerCase()));
      }
      if (filters?.salary) {
        results = results.filter(j => (j.salaryRange || '').toLowerCase().includes(filters.salary.toLowerCase()));
      }
      setJobs(results);
    } catch (err: any) {
      console.error('Search failed', err);
      setError(err?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // read query params q and loc to prefill search
    const params = new URLSearchParams(locationHook.search);
    const q = params.get('q') || '';
    const l = params.get('loc') || '';
    const wp = params.get('workplace') || '';
    const jt = params.get('type') || '';
    const sal = params.get('salary') || '';
    setSearchTerm(q);
    setLoc(l);
    setWorkplace(wp);
    setJobTypeFilter(jt);
    setSalaryFilter(sal);
    if (q || l || wp || jt || sal) {
      void searchJobs(q, l, { workplace: wp, jobType: jt, salary: sal });
    } else {
      void fetchJobs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationHook.search]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Search Bar */}
        <section className="bg-accent/50 py-12 border-b">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold mb-6">Browse Opportunities</h1>
            
            <div className="bg-card rounded-xl p-4 shadow-lg border">
              <div className="grid md:grid-cols-4 gap-3">
                <div className="relative flex items-center md:col-span-2">
                  <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Job title, keyword, or company"
                    className="pl-9 h-12 bg-background"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        void searchJobs(searchTerm);
                      }
                    }}
                  />
                </div>
                
                <div className="relative">
                  <MapPin className="absolute left-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Location (city, remote)"
                    className="pl-9 h-12 bg-background"
                    value={loc}
                    onChange={(e) => setLoc(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        // navigate to include query params
                        navigate(`/jobs?q=${encodeURIComponent(searchTerm)}&loc=${encodeURIComponent(loc)}`);
                      }
                    }}
                  />
                </div>

                <Button variant="hero" size="lg" className="h-12" onClick={() => { navigate(`/jobs?q=${encodeURIComponent(searchTerm)}&loc=${encodeURIComponent(loc)}`); void searchJobs(searchTerm, loc); }}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Job Listings */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Filters Sidebar */}
              <aside className={`lg:w-64 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Filters</h3>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Job Type</label>
                    <Select>
                      <SelectTrigger className="bg-background">
                        <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Select>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="tech">Technology</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="engineering">Engineering</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </aside>

              {/* Job Cards */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-muted-foreground">
                    Showing <span className="font-semibold text-foreground">{jobs.length}</span> opportunities
                  </p>
                  
                  <div className="flex items-center gap-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={async () => {
                        // Trigger backend sync (JSearch) then refresh
                        try {
                          setLoading(true);
                          await getJson<string>('/jobs/sync');
                          await fetchJobs();
                        } catch (e) {
                          console.error(e);
                          setError('Sync failed');
                        } finally {
                          setLoading(false);
                        }
                      }}
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" />
                          Syncing
                        </div>
                      ) : (
                        'Sync jobs'
                      )}
                    </Button>

                    <Button 
                      variant="outline" 
                      size="sm"
                      className="lg:hidden"
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </div>
                </div>

                {loading && (
                  <div className="p-6 flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" />
                    <span>Loading jobs...</span>
                  </div>
                )}
                {error && <div className="p-6 text-destructive">{error}</div>}

                <div className="grid gap-6">
                  {jobs.map((job) => (
                    <JobCard
                      key={String(job.id)}
                      id={String(job.id)}
                      title={job.title || 'Untitled'}
                      company={job.companyName || 'Unknown'}
                      location={job.location || 'Remote'}
                      type={job.jobType || 'N/A'}
                      postedDate={job.postedAt ? timeAgo(job.postedAt) : (job.createdAt ? timeAgo(job.createdAt) : '')}
                      tags={[]}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Jobs;
