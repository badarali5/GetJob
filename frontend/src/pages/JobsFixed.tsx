import { useEffect, useState, useRef } from "react";
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

// --- MaxHeap for top-paying jobs ---
class MaxHeap {
  private arr: BackendJob[];
  constructor(jobs: BackendJob[] = []) {
    this.arr = jobs.slice();
    for (let i = Math.floor(this.arr.length / 2) - 1; i >= 0; i--) this.heapifyDown(i);
  }
  private left(i: number): number { return 2 * i + 1; }
  private right(i: number): number { return 2 * i + 2; }
  private swap(i: number, j: number) { const t = this.arr[i]; this.arr[i] = this.arr[j]; this.arr[j] = t; }
  private getSalary(i: number): number { const v = getJobSalaryValue(this.arr[i]); return v === null ? -Infinity : v; }
  private heapifyDown(i: number) {
    let largest = i;
    const l = this.left(i), r = this.right(i);
    if (l < this.arr.length && this.getSalary(l) > this.getSalary(largest)) largest = l;
    if (r < this.arr.length && this.getSalary(r) > this.getSalary(largest)) largest = r;
    if (largest !== i) { this.swap(i, largest); this.heapifyDown(largest); }
  }
  extractMax(): BackendJob | null {
    if (this.arr.length === 0) return null;
    const max = this.arr[0];
    this.arr[0] = this.arr[this.arr.length - 1];
    this.arr.pop();
    if (this.arr.length > 0) this.heapifyDown(0);
    return max;
  }
  topK(k: number): BackendJob[] {
    const result: BackendJob[] = [];
    const heap = new MaxHeap(this.arr);
    for (let i = 0; i < k && heap.arr.length > 0; i++) {
      const job = heap.extractMax();
      if (job) result.push(job);
    }
    return result;
  }
}

// --- KMP for exact title matching ---
function computeKMPTable(pattern: string): number[] {
  const table = Array(pattern.length).fill(0);
  let j = 0;
  for (let i = 1; i < pattern.length; i++) {
    while (j > 0 && pattern[i] !== pattern[j]) j = table[j - 1];
    if (pattern[i] === pattern[j]) j++;
    table[i] = j;
  }
  return table;
}
function kmpSearch(text: string, pattern: string): boolean {
  if (pattern.length === 0) return true;
  const table = computeKMPTable(pattern);
  let j = 0;
  for (let i = 0; i < text.length; i++) {
    while (j > 0 && text[i] !== pattern[j]) j = table[j - 1];
    if (text[i] === pattern[j]) j++;
    if (j === pattern.length) return true;
  }
  return false;
}

// --- Boyer-Moore for description search ---
function buildBadCharTable(pattern: string): Map<string, number> {
  const table = new Map<string, number>();
  for (let i = 0; i < pattern.length - 1; i++) table.set(pattern[i], pattern.length - 1 - i);
  return table;
}
function boyerMooreSearch(text: string, pattern: string): boolean {
  if (pattern.length === 0) return true;
  if (pattern.length > text.length) return false;
  const badChar = buildBadCharTable(pattern);
  let i = 0;
  while (i <= text.length - pattern.length) {
    let j = pattern.length - 1;
    while (j >= 0 && text[i + j] === pattern[j]) j--;
    if (j < 0) return true;
    const shift = badChar.get(text[i + j]) ?? pattern.length;
    i += Math.max(1, shift);
  }
  return false;
}

// --- HashMap for skill lookups ---
class SkillHashMap {
  private map: Map<string, Set<string>>;
  constructor() { this.map = new Map(); }
  addSkill(skill: string, jobId: string) {
    const key = skill.toLowerCase();
    if (!this.map.has(key)) this.map.set(key, new Set());
    this.map.get(key)!.add(jobId);
  }
  getJobsBySkill(skill: string): string[] { return Array.from(this.map.get(skill.toLowerCase()) ?? new Set()); }
  hasSkill(skill: string): boolean { return this.map.has(skill.toLowerCase()); }
  getAllSkills(): string[] { return Array.from(this.map.keys()); }
}

// --- Recommendation engine ---
interface UserProfile {
  userId: string;
  skills: Set<string>;
  appliedJobs: Set<string>;
  preferences: Map<string, number>;
}
class JobRecommendationEngine {
  private userProfiles: Map<string, UserProfile>;
  private skillJobMap: SkillHashMap;
  private categoryJobMap: Map<string, Set<string>>;
  constructor(skillJobMap: SkillHashMap) {
    this.userProfiles = new Map();
    this.skillJobMap = skillJobMap;
    this.categoryJobMap = new Map();
  }
  addUser(userId: string, skills: string[], preferences: Map<string, number>) {
    this.userProfiles.set(userId, {
      userId,
      skills: new Set(skills.map(s => s.toLowerCase())),
      appliedJobs: new Set(),
      preferences
    });
  }
  addJobToCategory(jobId: string, category: string) {
    const key = category.toLowerCase();
    if (!this.categoryJobMap.has(key)) this.categoryJobMap.set(key, new Set());
    this.categoryJobMap.get(key)!.add(jobId);
  }
  recommendJobs(userId: string, topN: number = 5): string[] {
    const user = this.userProfiles.get(userId);
    if (!user) return [];
    const scoreMap = new Map<string, number>();
    for (const skill of user.skills) {
      const jobIds = this.skillJobMap.getJobsBySkill(skill);
      for (const jobId of jobIds) {
        if (!user.appliedJobs.has(jobId)) scoreMap.set(jobId, (scoreMap.get(jobId) ?? 0) + 2);
      }
    }
    for (const [category, preference] of user.preferences) {
      const jobIds = this.categoryJobMap.get(category.toLowerCase()) ?? new Set();
      for (const jobId of jobIds) {
        if (!user.appliedJobs.has(jobId)) scoreMap.set(jobId, (scoreMap.get(jobId) ?? 0) + preference);
      }
    }
    return Array.from(scoreMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, topN).map(([jobId]) => jobId);
  }
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
  const [sortOption, setSortOption] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillAutocomplete, setSkillAutocomplete] = useState<string[]>([]);
  const [skillSearchInput, setSkillSearchInput] = useState('');
  const [skillTree, setSkillTree] = useState<AVLTree<BackendJob> | null>(null);
  const [allSkills, setAllSkills] = useState<string[]>([]);
  const [jobTypeTree, setJobTypeTree] = useState<AVLTree<BackendJob> | null>(null);
  const [skillHashMap, setSkillHashMap] = useState<SkillHashMap | null>(null);
  const [recommendationEngine, setRecommendationEngine] = useState<JobRecommendationEngine | null>(null);
  const locationHook = useLocation();
  const navigate = useNavigate();

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch jobs from backend API
      const data = await getJson<BackendJob[]>('/jobs');
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

      // Build HashMap for skill lookups and recommendation engine
      const smap = new SkillHashMap();
      results.forEach(job => {
        const skills = job.skills && job.skills.length > 0 ? job.skills : extractSkillsFromJob(job);
        skills.forEach(skill => smap.addSkill(skill, job.id));
      });
      setSkillHashMap(smap);
      
      const recEngine = new JobRecommendationEngine(smap);
      results.forEach(job => {
        const category = job.jobType || 'Unknown';
        recEngine.addJobToCategory(job.id, category);
      });
      setRecommendationEngine(recEngine);

      setJobs(results);
    } catch (err: any) {
      console.error('Failed to fetch jobs', err);
      setError(err?.message || 'Failed to fetch jobs. Make sure the backend is running on port 8081.');
      setFilteredJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced live search: queries backend /jobs/search when possible, falls back to client filtering
  const searchTimeout = useRef<number | null>(null);
  const handleLiveSearch = (q: string) => {
    // clear previous timer
    if (searchTimeout.current) {
      window.clearTimeout(searchTimeout.current);
      searchTimeout.current = null;
    }

    // If query is short, just filter client-side dataset
    if (!q || q.trim().length < 2) {
      applyFilters(jobs, q, loc, workplace, jobTypeFilter, selectedSkills);
      return;
    }

    // debounce network calls
    searchTimeout.current = window.setTimeout(async () => {
      try {
        // try backend search endpoint first
        const path = `/jobs/search?title=${encodeURIComponent(q)}`;
        const remote = await getJson<BackendJob[]>(path);
        if (remote && Array.isArray(remote)) {
          // replace job list with remote results and apply other filters
          setJobs(remote);
          applyFilters(remote, q, loc, workplace, jobTypeFilter, selectedSkills);
          return;
        }
      } catch (err) {
        // network or endpoint not available — fall back to client filtering
        applyFilters(jobs, q, loc, workplace, jobTypeFilter, selectedSkills);
      }
    }, 300) as unknown as number;
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
      const q = searchQuery.trim().toLowerCase();
      results = results.filter(j => {
        const title = (j.title || '').toLowerCase();
        const desc = (j.description || '').toLowerCase();
        const company = (j.companyName || '').toLowerCase();
        // Use KMP for title exact matching
        const titleMatch = kmpSearch(title, q);
        // Use Boyer-Moore for description search
        const descMatch = boyerMooreSearch(desc, q);
        // Also check company name substring
        const companyMatch = company.includes(q);
        return titleMatch || descMatch || companyMatch;
      });
    }

    if (location && location.trim() !== '') {
      results = results.filter(j => (j.location || '').toLowerCase().includes(location.toLowerCase()));
    }

    if (workplaceType && workplaceType === 'remote') {
      results = results.filter(j => (j.location || '').toLowerCase().includes('remote'));
    }

    if (jobType && jobType.trim() !== '' && jobType !== 'all') {
      // Use the AVL jobType index when available for O(log n) lookup + set intersection
      if (jobTypeTree) {
        const jobsWithType = jobTypeTree.search(jobType);
        const typeSet = new Set(jobsWithType.map(j => j.id));
        results = results.filter(j => typeSet.has(j.id));
      } else {
        results = results.filter(j => (j.jobType || '').toLowerCase() === jobType.toLowerCase());
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

    if (skills.length > 0 && skillHashMap) {
      // Use HashMap for quick skill lookups
      const jobsBySkillId = new Set<string>();
      skills.forEach(skill => {
        const jobIds = skillHashMap.getJobsBySkill(skill);
        jobIds.forEach(id => jobsBySkillId.add(id));
      });
      results = results.filter(j => jobsBySkillId.has(j.id));
    } else if (skills.length > 0 && skillTree) {
      const jobsBySkill = new Set<BackendJob>();
      skills.forEach(skill => {
        const jobsWithSkill = skillTree.search(skill);
        jobsWithSkill.forEach(job => jobsBySkill.add(job));
      });
      results = results.filter(job => jobsBySkill.has(job));
    }

    setFilteredJobs(results);
  };

  // Get top N paying jobs using MaxHeap
  const getTopPayingJobs = (topN: number = 10): BackendJob[] => {
    const heap = new MaxHeap(jobs);
    return heap.topK(topN);
  };

  const searchJobs = async (q = '', l = '', opts: { workplace?: string; jobType?: string; salary?: string } = {}) => {
    setSearchTerm(q);
    setLoc(l);
    if (opts.workplace) setWorkplace(opts.workplace);
    if (opts.jobType) setJobTypeFilter(opts.jobType);
    if (opts.salary) setSalaryFilter(opts.salary);
    // Note: fetchJobs is called via useEffect when URL parameters change
  };

  useEffect(() => {
    const params = new URLSearchParams(locationHook.search);
    const q = params.get('q') || '';
    const l = params.get('loc') || '';
    const wp = params.get('workplace') || '';
    const jt = params.get('type') || '';
    const sal = params.get('salary') || '';
    
    // Update search fields
    if (q) setSearchTerm(q);
    if (l) setLoc(l);
    if (wp) setWorkplace(wp);
    if (jt) setJobTypeFilter(jt);
    if (sal) setSalaryFilter(sal);
    
    // Always fetch jobs (with or without filters)
    void fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationHook.search]);

  // Apply filters whenever jobs or filter state changes
  useEffect(() => {
    applyFilters(jobs, searchTerm, loc, workplace, jobTypeFilter, selectedSkills);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobs, searchTerm, loc, workplace, jobTypeFilter, selectedSkills, salaryFilter]);

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

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Minimum Salary</label>
                    <Input
                      placeholder="e.g., 80k, $100,000"
                      className="bg-background"
                      value={salaryFilter}
                      onChange={(e) => {
                        setSalaryFilter(e.target.value);
                        applyFilters(jobs, searchTerm, loc, workplace, jobTypeFilter, selectedSkills);
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Skills</label>
                    <Input
                      placeholder="e.g., React, Python, AWS"
                      className="bg-background"
                      value={selectedSkills.join(', ')}
                      onChange={(e) => {
                        const skills = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                        setSelectedSkills(skills);
                        applyFilters(jobs, searchTerm, loc, workplace, jobTypeFilter, skills);
                      }}
                    />
                    <p className="text-xs text-muted-foreground">Comma-separated skill list</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sort By Salary</label>
                    <Select value={sortOption} onValueChange={(value) => {
                      setSortOption(value);
                      let sorted = [...(filteredJobs.length > 0 ? filteredJobs : jobs)];
                      if (value === 'asc') {
                        sorted = heapSortJobsBySalary(sorted);
                      } else if (value === 'desc') {
                        sorted = heapSortJobsBySalary(sorted).reverse();
                      }
                      setFilteredJobs(sorted);
                    }}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="No Sort" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value="none">No Sort</SelectItem>
                        <SelectItem value="asc">Salary: Low to High</SelectItem>
                        <SelectItem value="desc">Salary: High to Low</SelectItem>
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

                {jobs.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4">Top Paying Opportunities</h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {getTopPayingJobs(3).map((job) => (
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
                )}

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
