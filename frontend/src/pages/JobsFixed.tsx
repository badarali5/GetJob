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
import { AVLTree } from "@/lib/avlTree";

// shape returned by backend /jobs
type BackendJob = {
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
};

// --- Salary helpers: parse, merge sort, binary search ---
function parseSalaryToNumber(s?: string): number | null {
  if (!s) return null;
  // Normalize: remove currency symbols, commas
  const cleaned = s.replace(/[$,]/g, '').trim();
  // Handle ranges like "60k - 80k" or "60k-80k" or "60000-80000"
  const rangeMatch = cleaned.match(/(\d+[\d\.]*)\s*(k|m)?\s*(?:-|to)\s*(\d+[\d\.]*)\s*(k|m)?/i);
  if (rangeMatch) {
    const a = Number(rangeMatch[1]);
    const aSuffix = (rangeMatch[2] || '').toLowerCase();
    const b = Number(rangeMatch[3]);
    const bSuffix = (rangeMatch[4] || '').toLowerCase();
    const mulA = aSuffix === 'k' ? 1000 : aSuffix === 'm' ? 1000000 : 1;
    const mulB = bSuffix === 'k' ? 1000 : bSuffix === 'm' ? 1000000 : 1;
    const val = ((a * mulA) + (b * mulB)) / 2; // average
    return Number.isFinite(val) ? val : null;
  }

  // Single number with optional suffix
  const singleMatch = cleaned.match(/(\d+[\d\.]*)\s*(k|m)?/i);
  if (singleMatch) {
    const num = Number(singleMatch[1]);
    const suffix = (singleMatch[2] || '').toLowerCase();
    const mul = suffix === 'k' ? 1000 : suffix === 'm' ? 1000000 : 1;
    const val = num * mul;
    return Number.isFinite(val) ? val : null;
  }

  return null;
}

function getJobSalaryValue(job: BackendJob): number | null {
  // Prefer explicit salaryRange; fallback: try to extract from description/title
  const v = parseSalaryToNumber(job.salaryRange || undefined);
  if (v !== null) return v;
  // attempt to parse from description/title heuristically
  const combined = `${job.title || ''} ${job.description || ''}`;
  return parseSalaryToNumber(combined);
}

function mergeSortJobsBySalary(arr: BackendJob[]): BackendJob[] {
  if (arr.length <= 1) return arr.slice();
  const mid = Math.floor(arr.length / 2);
  const left = mergeSortJobsBySalary(arr.slice(0, mid));
  const right = mergeSortJobsBySalary(arr.slice(mid));
  const out: BackendJob[] = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    const lv = getJobSalaryValue(left[i]);
    const rv = getJobSalaryValue(right[j]);
    // Treat nulls as lesser so they appear first; when filtering by min salary we'll skip them
    const lnum = lv === null ? -Infinity : lv;
    const rnum = rv === null ? -Infinity : rv;
    if (lnum <= rnum) {
      out.push(left[i++]);
    } else {
      out.push(right[j++]);
    }
  }
  while (i < left.length) out.push(left[i++]);
  while (j < right.length) out.push(right[j++]);
  return out;
}

// Heap sort implementation: sorts ascending by salary (nulls treated as -Infinity)
function heapSortJobsBySalary(arr: BackendJob[]): BackendJob[] {
  // Copy to avoid mutating input
  const a = arr.slice();
  const n = a.length;

  const cmp = (i: number, j: number) => {
    const vi = getJobSalaryValue(a[i]);
    const vj = getJobSalaryValue(a[j]);
    const ni = vi === null ? -Infinity : vi;
    const nj = vj === null ? -Infinity : vj;
    return ni - nj;
  };

  const swap = (i: number, j: number) => { const t = a[i]; a[i] = a[j]; a[j] = t; };

  const heapify = (size: number, root: number) => {
    let smallest = root;
    const l = 2 * root + 1;
    const r = 2 * root + 2;
    if (l < size && cmp(l, smallest) < 0) smallest = l;
    if (r < size && cmp(r, smallest) < 0) smallest = r;
    if (smallest !== root) {
      swap(root, smallest);
      heapify(size, smallest);
    }
  };

  // Build min-heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(n, i);

  // Extract elements to produce ascending array
  const out: BackendJob[] = [];
  const temp = a.slice();
  let size = n;
  while (size > 0) {
    // root is smallest
    out.push(temp[0]);
    // move last to root
    temp[0] = temp[size - 1];
    size--;
    // heapify reduced heap
    const heapifyTemp = (s: number, rootIdx: number) => {
      let smallest = rootIdx;
      const l = 2 * rootIdx + 1;
      const r = 2 * rootIdx + 2;
      const getVal = (idx: number) => {
        const v = getJobSalaryValue(temp[idx]);
        return v === null ? -Infinity : v;
      };
      if (l < s && getVal(l) < getVal(smallest)) smallest = l;
      if (r < s && getVal(r) < getVal(smallest)) smallest = r;
      if (smallest !== rootIdx) {
        const t = temp[rootIdx]; temp[rootIdx] = temp[smallest]; temp[smallest] = t;
        heapifyTemp(s, smallest);
      }
    };
    heapifyTemp(size, 0);
  }

  return out;
}

// find first index where job salary >= target. Jobs with null salary are treated as -Infinity and ignored (i.e., they come before target)
function binarySearchFirstAtLeast(sorted: BackendJob[], target: number): number {
  let lo = 0;
  let hi = sorted.length - 1;
  let ans = sorted.length;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const val = getJobSalaryValue(sorted[mid]);
    const num = val === null ? -Infinity : val;
    if (num >= target) {
      ans = mid;
      hi = mid - 1;
    } else {
      lo = mid + 1;
    }
  }
  return ans;
}

function filterJobsByMinSalary(jobList: BackendJob[], minSalary: number): BackendJob[] {
  // Use heap sort to produce ascending order by salary, then binary search
  const sorted = heapSortJobsBySalary(jobList);
  const idx = binarySearchFirstAtLeast(sorted, minSalary);
  return sorted.slice(idx).filter(j => {
    const v = getJobSalaryValue(j);
    return v !== null && v >= minSalary;
  });
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

function extractSkillsFromJob(job: BackendJob): string[] {
  const commonSkills = [
    'React', 'Vue', 'Angular', 'Node.js', 'Python', 'Java', 'C++', 'JavaScript', 'TypeScript',
    'AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'MongoDB', 'SQL', 'Git', 'GraphQL', 'REST',
    'HTML', 'CSS', 'Tailwind', 'Next.js', 'Express', 'Django', 'Flask', 'Spring Boot',
    'DevOps', 'CI/CD', 'Machine Learning', 'AI', 'Data Science', 'Cloud', 'Microservices'
  ];
  const text = `${job.title || ''} ${job.description || ''}`.toLowerCase();
  return commonSkills.filter(skill => text.includes(skill.toLowerCase()));
}

const JobsFixed = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [jobs, setJobs] = useState<BackendJob[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<BackendJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loc, setLoc] = useState('');
  const [workplace, setWorkplace] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('');
  const [salaryFilter, setSalaryFilter] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillAutocomplete, setSkillAutocomplete] = useState<string[]>([]);
  const [skillSearchInput, setSkillSearchInput] = useState('');
  const [skillTree, setSkillTree] = useState<AVLTree<BackendJob> | null>(null);
  const [allSkills, setAllSkills] = useState<string[]>([]);
  const [jobTypeTree, setJobTypeTree] = useState<AVLTree<BackendJob> | null>(null);
  const locationHook = useLocation();
  const navigate = useNavigate();

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      // Call backend jobs endpoint
      let data: BackendJob[] = [];
      try {
        data = await getJson<BackendJob[]>('/jobs');
      } catch (e) {
        console.error('/jobs failed:', e);
        throw new Error('Failed to fetch jobs from backend');
      }

      const results = data || [];

      // Build AVL Tree for skill-based indexing
      const tree = new AVLTree<BackendJob>();
      results.forEach(job => {
        const skills = job.skills && job.skills.length > 0 ? job.skills : extractSkillsFromJob(job);
        skills.forEach(skill => tree.insert(skill, job));
      });

          // Build AVL Tree for jobType indexing
          const jtTree = new AVLTree<BackendJob>();
          results.forEach(job => {
            const jt = (job.jobType || 'Unknown').toString();
            jtTree.insert(jt, job);
          });

      setSkillTree(tree);
      setAllSkills(tree.getAllSkills());
      setJobTypeTree(jtTree);
      setJobs(results);
      // Apply current filters if any
      applyFilters(results, searchTerm, loc, workplace, jobTypeFilter, selectedSkills);
    } catch (err: any) {
      console.error('Failed to fetch jobs', err);
      setError(err?.message || 'Failed to fetch jobs. Make sure the backend is running on port 8081.');
      setFilteredJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (
    jobList: BackendJob[],
    searchQuery: string,
    location: string,
    workplaceType: string,
    jobType: string,
    skills: string[]
  ) => {
    let results = jobList;

    if (searchQuery && searchQuery.trim() !== '') {
      results = results.filter(j =>
        (j.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (j.companyName || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (location && location.trim() !== '') {
      results = results.filter(j => (j.location || '').toLowerCase().includes(location.toLowerCase()));
    }

    if (workplaceType && workplaceType === 'remote') {
      results = results.filter(j => (j.location || '').toLowerCase().includes('remote'));
    }

    if (jobType && jobType.trim() !== '') {
      // Use the AVL jobType index when available for O(log n) lookup + set intersection
      if (jobTypeTree) {
        const jobsWithType = jobTypeTree.search(jobType);
        const typeSet = new Set(jobsWithType.map(j => j.id));
        results = results.filter(j => typeSet.has(j.id));
      } else {
        results = results.filter(j => (j.jobType || '').toLowerCase().includes(jobType.toLowerCase()));
      }
    }

    if (salaryFilter && salaryFilter.trim() !== '') {
      // Try to parse the salaryFilter as a numeric minimum (e.g. "80k", "80000", "$80k")
      const parsed = parseSalaryToNumber(salaryFilter);
      if (parsed !== null) {
        // Use merge sort + binary search to efficiently find jobs >= parsed
        results = filterJobsByMinSalary(results, parsed);
      } else {
        // Fallback to substring match if parsing fails
        results = results.filter(j => (j.salaryRange || '').toLowerCase().includes(salaryFilter.toLowerCase()));
      }
    }

    if (skills.length > 0 && skillTree) {
      const jobsBySkill = new Set<BackendJob>();
      skills.forEach(skill => {
        const jobsWithSkill = skillTree.search(skill);
        jobsWithSkill.forEach(job => jobsBySkill.add(job));
      });
      results = results.filter(job => jobsBySkill.has(job));
    }

    setFilteredJobs(results);
  };

  const searchJobs = async (q = '', l = '', opts: { workplace?: string; jobType?: string; salary?: string } = {}) => {
    setSearchTerm(q);
    setLoc(l);
    if (opts.workplace) setWorkplace(opts.workplace);
    if (opts.jobType) setJobTypeFilter(opts.jobType);
    if (opts.salary) setSalaryFilter(opts.salary);
    await fetchJobs();
    applyFilters(jobs, q, l, opts.workplace || '', opts.jobType || '', selectedSkills);
  };

  useEffect(() => {
    const params = new URLSearchParams(locationHook.search);
    const q = params.get('q') || '';
    const l = params.get('loc') || '';
    const wp = params.get('workplace') || '';
    const jt = params.get('type') || '';
    const sal = params.get('salary') || '';
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
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      applyFilters(jobs, e.target.value, loc, workplace, jobTypeFilter, selectedSkills);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        void searchJobs(searchTerm, loc);
                      }
                    }}
                  />
                </div>

                <div className="relative">
                  <MapPin className="absolute left-4 h-4 w-4 top-4 text-muted-foreground" />
                  <Input
                    placeholder="Location (city, remote)"
                    className="pl-9 h-12 bg-background"
                    value={loc}
                    onChange={(e) => {
                      setLoc(e.target.value);
                      applyFilters(jobs, searchTerm, e.target.value, workplace, jobTypeFilter, selectedSkills);
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

        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              <aside className={`lg:w-64 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Filters</h3>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Job Type</label>
                    <Select value={jobTypeFilter} onValueChange={(value) => {
                      setJobTypeFilter(value);
                      applyFilters(jobs, searchTerm, loc, workplace, value, selectedSkills);
                    }}>
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
                </div>
              </aside>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-muted-foreground">Showing <span className="font-semibold text-foreground">{filteredJobs.length || jobs.length}</span> opportunities</p>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={async () => {
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
                      {loading ? 'Syncing' : 'Sync jobs'}
                    </Button>

                    <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setShowFilters(!showFilters)}>
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
                  {(filteredJobs.length > 0 ? filteredJobs : jobs).map((job) => (
                    <JobCard
                      key={String(job.id)}
                      id={String(job.id)}
                      title={job.title || 'Untitled'}
                      company={job.companyName || 'Unknown'}
                      location={job.location || 'Remote'}
                      type={job.jobType || 'N/A'}
                      postedDate={job.postedAt ? timeAgo(job.postedAt) : (job.createdAt ? timeAgo(job.createdAt) : '')}
                      tags={job.skills || []}
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

export default JobsFixed;
