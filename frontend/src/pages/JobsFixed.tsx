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
      // ========== COMMENTED OUT API CALL ==========
      // Fetch jobs from backend API
      // const data = await getJson<BackendJob[]>('/jobs');
      // const results = data || [];
      // ============================================

      // ========== HARDCODED 100 JOBS ==========
      const results: BackendJob[] = [
        { id: "1", title: "Senior React Developer", companyName: "TechCorp", location: "San Francisco, CA", jobType: "Full-time", postedAt: "2024-12-01", description: "Build modern web apps with React, TypeScript, and Node.js", salaryRange: "$120k - $160k", skills: ["React", "TypeScript", "Node.js"] },
        { id: "2", title: "Full Stack Engineer", companyName: "StartupXYZ", location: "Remote", jobType: "Full-time", postedAt: "2024-11-30", description: "Work on cutting-edge products with Python, Django, and PostgreSQL", salaryRange: "$100k - $140k", skills: ["Python", "Django", "PostgreSQL"] },
        { id: "3", title: "DevOps Engineer", companyName: "CloudSolutions", location: "Austin, TX", jobType: "Full-time", postedAt: "2024-11-29", description: "Manage cloud infrastructure with AWS, Docker, Kubernetes", salaryRange: "$130k - $170k", skills: ["AWS", "Docker", "Kubernetes"] },
        { id: "4", title: "Frontend Developer", companyName: "WebAgency", location: "New York, NY", jobType: "Contract", postedAt: "2024-11-28", description: "Create beautiful UIs with Vue.js and Tailwind CSS", salaryRange: "$90k - $120k", skills: ["Vue", "Tailwind", "JavaScript"] },
        { id: "5", title: "Backend Developer", companyName: "DataCorp", location: "Seattle, WA", jobType: "Full-time", postedAt: "2024-11-27", description: "Build scalable APIs with Java Spring Boot and microservices", salaryRange: "$110k - $150k", skills: ["Java", "Spring Boot", "Microservices"] },
        { id: "6", title: "Machine Learning Engineer", companyName: "AI Labs", location: "Boston, MA", jobType: "Full-time", postedAt: "2024-11-26", description: "Develop ML models with Python, TensorFlow, and PyTorch", salaryRange: "$140k - $180k", skills: ["Python", "Machine Learning", "AI"] },
        { id: "7", title: "Mobile Developer", companyName: "AppStudio", location: "Los Angeles, CA", jobType: "Full-time", postedAt: "2024-11-25", description: "Build native mobile apps with React Native and Flutter", salaryRange: "$100k - $130k", skills: ["React", "JavaScript", "Mobile"] },
        { id: "8", title: "Data Scientist", companyName: "Analytics Inc", location: "Chicago, IL", jobType: "Full-time", postedAt: "2024-11-24", description: "Analyze big data using Python, SQL, and Data Science tools", salaryRange: "$120k - $160k", skills: ["Python", "SQL", "Data Science"] },
        { id: "9", title: "QA Engineer", companyName: "QualityFirst", location: "Remote", jobType: "Part-time", postedAt: "2024-11-23", description: "Test software with automated testing frameworks and CI/CD", salaryRange: "$80k - $100k", skills: ["Testing", "CI/CD", "JavaScript"] },
        { id: "10", title: "UI/UX Designer", companyName: "DesignHub", location: "Portland, OR", jobType: "Full-time", postedAt: "2024-11-22", description: "Design user interfaces with Figma and modern design tools", salaryRange: "$90k - $120k", skills: ["HTML", "CSS", "Design"] },
        { id: "11", title: "Cloud Architect", companyName: "MegaCorp", location: "Denver, CO", jobType: "Full-time", postedAt: "2024-11-21", description: "Design cloud solutions with AWS, Azure, and Cloud technologies", salaryRange: "$150k - $200k", skills: ["AWS", "Cloud", "Architecture"] },
        { id: "12", title: "JavaScript Developer", companyName: "CodeFactory", location: "Miami, FL", jobType: "Full-time", postedAt: "2024-11-20", description: "Develop web applications with JavaScript, Node.js, and Express", salaryRange: "$95k - $125k", skills: ["JavaScript", "Node.js", "Express"] },
        { id: "13", title: "Python Developer", companyName: "PyTech", location: "Remote", jobType: "Full-time", postedAt: "2024-11-19", description: "Build backend services with Python, Flask, and REST APIs", salaryRange: "$100k - $135k", skills: ["Python", "Flask", "REST"] },
        { id: "14", title: "Security Engineer", companyName: "SecureNet", location: "Washington DC", jobType: "Full-time", postedAt: "2024-11-18", description: "Protect systems with cybersecurity and DevOps practices", salaryRange: "$130k - $170k", skills: ["Security", "DevOps", "Cloud"] },
        { id: "15", title: "Database Administrator", companyName: "DataMasters", location: "Phoenix, AZ", jobType: "Full-time", postedAt: "2024-11-17", description: "Manage databases with PostgreSQL, MongoDB, and SQL", salaryRange: "$110k - $140k", skills: ["PostgreSQL", "MongoDB", "SQL"] },
        { id: "16", title: "Angular Developer", companyName: "WebWorks", location: "San Diego, CA", jobType: "Contract", postedAt: "2024-11-16", description: "Create SPAs with Angular and TypeScript", salaryRange: "$90k - $115k", skills: ["Angular", "TypeScript", "JavaScript"] },
        { id: "17", title: "Go Developer", companyName: "GoLang Inc", location: "Remote", jobType: "Full-time", postedAt: "2024-11-15", description: "Build microservices with Go and Docker", salaryRange: "$120k - $155k", skills: ["Go", "Docker", "Microservices"] },
        { id: "18", title: "Rust Developer", companyName: "SystemCorp", location: "San Jose, CA", jobType: "Full-time", postedAt: "2024-11-14", description: "Develop high-performance systems with Rust and C++", salaryRange: "$130k - $170k", skills: ["Rust", "C++", "Systems"] },
        { id: "19", title: "GraphQL Engineer", companyName: "API Solutions", location: "Atlanta, GA", jobType: "Full-time", postedAt: "2024-11-13", description: "Build APIs with GraphQL, Node.js, and REST", salaryRange: "$105k - $140k", skills: ["GraphQL", "Node.js", "REST"] },
        { id: "20", title: "Kubernetes Specialist", companyName: "ContainerCo", location: "Remote", jobType: "Full-time", postedAt: "2024-11-12", description: "Manage container orchestration with Kubernetes and Docker", salaryRange: "$125k - $165k", skills: ["Kubernetes", "Docker", "DevOps"] },
        { id: "21", title: "Next.js Developer", companyName: "Modern Web", location: "Dallas, TX", jobType: "Full-time", postedAt: "2024-11-11", description: "Build server-side rendered apps with Next.js and React", salaryRange: "$110k - $145k", skills: ["Next.js", "React", "TypeScript"] },
        { id: "22", title: "AI Research Scientist", companyName: "DeepMind Labs", location: "Palo Alto, CA", jobType: "Full-time", postedAt: "2024-11-10", description: "Research AI and Machine Learning algorithms", salaryRange: "$160k - $220k", skills: ["AI", "Machine Learning", "Python"] },
        { id: "23", title: "Blockchain Developer", companyName: "CryptoTech", location: "Remote", jobType: "Full-time", postedAt: "2024-11-09", description: "Develop blockchain applications with Solidity and Web3", salaryRange: "$140k - $180k", skills: ["Blockchain", "Solidity", "JavaScript"] },
        { id: "24", title: "iOS Developer", companyName: "MobileFirst", location: "San Francisco, CA", jobType: "Full-time", postedAt: "2024-11-08", description: "Build iOS apps with Swift and Xcode", salaryRange: "$115k - $150k", skills: ["iOS", "Swift", "Mobile"] },
        { id: "25", title: "Android Developer", companyName: "AppDev", location: "Mountain View, CA", jobType: "Full-time", postedAt: "2024-11-07", description: "Create Android applications with Kotlin and Java", salaryRange: "$110k - $145k", skills: ["Android", "Kotlin", "Java"] },
        { id: "26", title: "Site Reliability Engineer", companyName: "ReliableOps", location: "Seattle, WA", jobType: "Full-time", postedAt: "2024-11-06", description: "Ensure system reliability with SRE practices and automation", salaryRange: "$135k - $175k", skills: ["SRE", "DevOps", "Cloud"] },
        { id: "27", title: "ETL Developer", companyName: "DataPipeline", location: "Chicago, IL", jobType: "Full-time", postedAt: "2024-11-05", description: "Build data pipelines with ETL tools and SQL", salaryRange: "$95k - $130k", skills: ["ETL", "SQL", "Data Science"] },
        { id: "28", title: "Scala Developer", companyName: "Functional Code", location: "Remote", jobType: "Full-time", postedAt: "2024-11-04", description: "Develop functional programming solutions with Scala", salaryRange: "$120k - $160k", skills: ["Scala", "Functional", "Java"] },
        { id: "29", title: "WordPress Developer", companyName: "CMS Agency", location: "Austin, TX", jobType: "Contract", postedAt: "2024-11-03", description: "Build custom WordPress sites with PHP and JavaScript", salaryRange: "$70k - $90k", skills: ["WordPress", "PHP", "JavaScript"] },
        { id: "30", title: "Shopify Developer", companyName: "Ecommerce Pro", location: "New York, NY", jobType: "Full-time", postedAt: "2024-11-02", description: "Create Shopify stores with Liquid and JavaScript", salaryRange: "$85k - $110k", skills: ["Shopify", "JavaScript", "Ecommerce"] },
        { id: "31", title: "Unity Developer", companyName: "GameStudio", location: "Los Angeles, CA", jobType: "Full-time", postedAt: "2024-11-01", description: "Develop games with Unity and C#", salaryRange: "$100k - $130k", skills: ["Unity", "C#", "Gaming"] },
        { id: "32", title: "Unreal Engine Developer", companyName: "Epic Games Studio", location: "Raleigh, NC", jobType: "Full-time", postedAt: "2024-10-31", description: "Build AAA games with Unreal Engine and C++", salaryRange: "$110k - $150k", skills: ["Unreal", "C++", "Gaming"] },
        { id: "33", title: "Salesforce Developer", companyName: "CRM Solutions", location: "Remote", jobType: "Full-time", postedAt: "2024-10-30", description: "Customize Salesforce with Apex and Lightning", salaryRange: "$105k - $140k", skills: ["Salesforce", "Apex", "CRM"] },
        { id: "34", title: "SAP Consultant", companyName: "Enterprise Systems", location: "Boston, MA", jobType: "Full-time", postedAt: "2024-10-29", description: "Implement SAP solutions for enterprise clients", salaryRange: "$120k - $160k", skills: ["SAP", "ERP", "Consulting"] },
        { id: "35", title: "Embedded Systems Engineer", companyName: "Hardware Co", location: "San Diego, CA", jobType: "Full-time", postedAt: "2024-10-28", description: "Develop embedded systems with C and C++", salaryRange: "$110k - $145k", skills: ["C", "C++", "Embedded"] },
        { id: "36", title: "IoT Developer", companyName: "Smart Devices", location: "Seattle, WA", jobType: "Full-time", postedAt: "2024-10-27", description: "Build IoT solutions with embedded systems and cloud", salaryRange: "$115k - $150k", skills: ["IoT", "Cloud", "Embedded"] },
        { id: "37", title: "Robotics Engineer", companyName: "RoboTech", location: "Pittsburgh, PA", jobType: "Full-time", postedAt: "2024-10-26", description: "Design robots with C++, Python, and AI", salaryRange: "$125k - $170k", skills: ["Robotics", "Python", "C++"] },
        { id: "38", title: "Computer Vision Engineer", companyName: "Vision Labs", location: "Remote", jobType: "Full-time", postedAt: "2024-10-25", description: "Develop computer vision models with OpenCV and Python", salaryRange: "$130k - $175k", skills: ["Computer Vision", "Python", "AI"] },
        { id: "39", title: "NLP Engineer", companyName: "Language AI", location: "San Francisco, CA", jobType: "Full-time", postedAt: "2024-10-24", description: "Build NLP models with Python and Machine Learning", salaryRange: "$135k - $180k", skills: ["NLP", "Python", "Machine Learning"] },
        { id: "40", title: "Data Engineer", companyName: "Big Data Corp", location: "Chicago, IL", jobType: "Full-time", postedAt: "2024-10-23", description: "Build data infrastructure with Spark, Kafka, and Python", salaryRange: "$120k - $160k", skills: ["Spark", "Kafka", "Python"] },
        { id: "41", title: "Business Intelligence Analyst", companyName: "Analytics Pro", location: "Denver, CO", jobType: "Full-time", postedAt: "2024-10-22", description: "Analyze data with Tableau, SQL, and BI tools", salaryRange: "$85k - $115k", skills: ["BI", "SQL", "Tableau"] },
        { id: "42", title: "Technical Writer", companyName: "DocuTech", location: "Remote", jobType: "Contract", postedAt: "2024-10-21", description: "Write technical documentation for software products", salaryRange: "$70k - $95k", skills: ["Documentation", "Writing", "Technical"] },
        { id: "43", title: "Product Manager", companyName: "ProductCo", location: "San Francisco, CA", jobType: "Full-time", postedAt: "2024-10-20", description: "Manage product roadmap and work with engineering teams", salaryRange: "$130k - $170k", skills: ["Product", "Management", "Strategy"] },
        { id: "44", title: "Scrum Master", companyName: "Agile Teams", location: "Austin, TX", jobType: "Full-time", postedAt: "2024-10-19", description: "Facilitate agile processes and remove blockers", salaryRange: "$95k - $125k", skills: ["Scrum", "Agile", "Leadership"] },
        { id: "45", title: "Engineering Manager", companyName: "Tech Leaders", location: "Seattle, WA", jobType: "Full-time", postedAt: "2024-10-18", description: "Lead engineering teams and drive technical excellence", salaryRange: "$150k - $200k", skills: ["Leadership", "Management", "Technical"] },
        { id: "46", title: "Solutions Architect", companyName: "Architecture Firm", location: "Remote", jobType: "Full-time", postedAt: "2024-10-17", description: "Design scalable solutions with cloud and microservices", salaryRange: "$140k - $185k", skills: ["Architecture", "Cloud", "Microservices"] },
        { id: "47", title: "Network Engineer", companyName: "NetWorks Inc", location: "Washington DC", jobType: "Full-time", postedAt: "2024-10-16", description: "Manage network infrastructure and security", salaryRange: "$100k - $135k", skills: ["Networking", "Security", "Infrastructure"] },
        { id: "48", title: "Systems Administrator", companyName: "IT Services", location: "Phoenix, AZ", jobType: "Full-time", postedAt: "2024-10-15", description: "Administer Linux and Windows servers", salaryRange: "$80k - $110k", skills: ["Linux", "Windows", "Admin"] },
        { id: "49", title: "Help Desk Technician", companyName: "Support Center", location: "Remote", jobType: "Part-time", postedAt: "2024-10-14", description: "Provide technical support to users", salaryRange: "$40k - $60k", skills: ["Support", "Technical", "Communication"] },
        { id: "50", title: "Penetration Tester", companyName: "Security Pro", location: "New York, NY", jobType: "Full-time", postedAt: "2024-10-13", description: "Test security vulnerabilities and perform ethical hacking", salaryRange: "$110k - $145k", skills: ["Security", "Hacking", "Testing"] },
        { id: "51", title: "Compliance Engineer", companyName: "RegTech", location: "Boston, MA", jobType: "Full-time", postedAt: "2024-10-12", description: "Ensure compliance with security and regulatory standards", salaryRange: "$105k - $140k", skills: ["Compliance", "Security", "Regulatory"] },
        { id: "52", title: "Release Manager", companyName: "Deploy Systems", location: "Remote", jobType: "Full-time", postedAt: "2024-10-11", description: "Manage software releases and CI/CD pipelines", salaryRange: "$100k - $130k", skills: ["CI/CD", "DevOps", "Management"] },
        { id: "53", title: "Integration Engineer", companyName: "Connect API", location: "San Jose, CA", jobType: "Full-time", postedAt: "2024-10-10", description: "Integrate systems with APIs and middleware", salaryRange: "$95k - $125k", skills: ["APIs", "Integration", "Middleware"] },
        { id: "54", title: "Performance Engineer", companyName: "Speed Tech", location: "Seattle, WA", jobType: "Full-time", postedAt: "2024-10-09", description: "Optimize system performance and scalability", salaryRange: "$115k - $150k", skills: ["Performance", "Optimization", "Testing"] },
        { id: "55", title: "Build Engineer", companyName: "BuildOps", location: "Austin, TX", jobType: "Full-time", postedAt: "2024-10-08", description: "Manage build systems and automation tools", salaryRange: "$90k - $120k", skills: ["Build", "CI/CD", "Automation"] },
        { id: "56", title: "Configuration Manager", companyName: "Config Pro", location: "Chicago, IL", jobType: "Full-time", postedAt: "2024-10-07", description: "Manage configuration and version control systems", salaryRange: "$85k - $115k", skills: ["Configuration", "Git", "DevOps"] },
        { id: "57", title: "Platform Engineer", companyName: "Platform Systems", location: "Remote", jobType: "Full-time", postedAt: "2024-10-06", description: "Build internal platforms and developer tools", salaryRange: "$125k - $165k", skills: ["Platform", "Infrastructure", "DevOps"] },
        { id: "58", title: "Reliability Engineer", companyName: "Stable Systems", location: "San Francisco, CA", jobType: "Full-time", postedAt: "2024-10-05", description: "Ensure system reliability and uptime", salaryRange: "$120k - $160k", skills: ["Reliability", "SRE", "Monitoring"] },
        { id: "59", title: "Monitoring Engineer", companyName: "ObserveTech", location: "Denver, CO", jobType: "Full-time", postedAt: "2024-10-04", description: "Implement monitoring and alerting systems", salaryRange: "$95k - $130k", skills: ["Monitoring", "Observability", "DevOps"] },
        { id: "60", title: "Automation Engineer", companyName: "AutoSystems", location: "Remote", jobType: "Full-time", postedAt: "2024-10-03", description: "Automate infrastructure and deployment processes", salaryRange: "$110k - $145k", skills: ["Automation", "Python", "DevOps"] },
        { id: "61", title: "Infrastructure Engineer", companyName: "InfraCo", location: "Seattle, WA", jobType: "Full-time", postedAt: "2024-10-02", description: "Manage cloud infrastructure and IaC", salaryRange: "$115k - $155k", skills: ["Infrastructure", "Cloud", "Terraform"] },
        { id: "62", title: "API Developer", companyName: "API First", location: "San Diego, CA", jobType: "Full-time", postedAt: "2024-10-01", description: "Design and build REST and GraphQL APIs", salaryRange: "$100k - $135k", skills: ["API", "REST", "GraphQL"] },
        { id: "63", title: "Microservices Architect", companyName: "Micro Systems", location: "Remote", jobType: "Full-time", postedAt: "2024-09-30", description: "Design microservices architectures", salaryRange: "$135k - $180k", skills: ["Microservices", "Architecture", "Cloud"] },
        { id: "64", title: "Event-Driven Architect", companyName: "Event Systems", location: "New York, NY", jobType: "Full-time", postedAt: "2024-09-29", description: "Build event-driven systems with Kafka and messaging", salaryRange: "$130k - $175k", skills: ["Kafka", "Messaging", "Architecture"] },
        { id: "65", title: "Serverless Developer", companyName: "Lambda Tech", location: "Remote", jobType: "Full-time", postedAt: "2024-09-28", description: "Build serverless applications with AWS Lambda", salaryRange: "$110k - $145k", skills: ["Serverless", "AWS", "Lambda"] },
        { id: "66", title: "Edge Computing Engineer", companyName: "Edge Systems", location: "San Francisco, CA", jobType: "Full-time", postedAt: "2024-09-27", description: "Develop edge computing solutions", salaryRange: "$120k - $160k", skills: ["Edge", "Cloud", "Distributed"] },
        { id: "67", title: "Distributed Systems Engineer", companyName: "Distributed Co", location: "Seattle, WA", jobType: "Full-time", postedAt: "2024-09-26", description: "Build distributed systems and consensus algorithms", salaryRange: "$135k - $180k", skills: ["Distributed", "Systems", "Algorithms"] },
        { id: "68", title: "Stream Processing Engineer", companyName: "Stream Tech", location: "Remote", jobType: "Full-time", postedAt: "2024-09-25", description: "Process real-time data streams with Kafka and Flink", salaryRange: "$125k - $165k", skills: ["Streaming", "Kafka", "Real-time"] },
        { id: "69", title: "Search Engineer", companyName: "Search Systems", location: "Austin, TX", jobType: "Full-time", postedAt: "2024-09-24", description: "Build search systems with Elasticsearch", salaryRange: "$115k - $150k", skills: ["Elasticsearch", "Search", "Data"] },
        { id: "70", title: "Caching Engineer", companyName: "Cache Pro", location: "Chicago, IL", jobType: "Full-time", postedAt: "2024-09-23", description: "Optimize caching layers with Redis and Memcached", salaryRange: "$105k - $140k", skills: ["Redis", "Caching", "Performance"] },
        { id: "71", title: "Message Queue Engineer", companyName: "Queue Systems", location: "Remote", jobType: "Full-time", postedAt: "2024-09-22", description: "Build message queues with RabbitMQ and Kafka", salaryRange: "$110k - $145k", skills: ["RabbitMQ", "Kafka", "Messaging"] },
        { id: "72", title: "WebAssembly Developer", companyName: "Wasm Tech", location: "San Francisco, CA", jobType: "Full-time", postedAt: "2024-09-21", description: "Build high-performance web apps with WebAssembly", salaryRange: "$120k - $160k", skills: ["WebAssembly", "Rust", "Performance"] },
        { id: "73", title: "WebRTC Engineer", companyName: "Video Systems", location: "Remote", jobType: "Full-time", postedAt: "2024-09-20", description: "Develop real-time communication with WebRTC", salaryRange: "$115k - $155k", skills: ["WebRTC", "Real-time", "Video"] },
        { id: "74", title: "AR/VR Developer", companyName: "Reality Labs", location: "Los Angeles, CA", jobType: "Full-time", postedAt: "2024-09-19", description: "Create AR/VR experiences with Unity and Unreal", salaryRange: "$125k - $165k", skills: ["AR", "VR", "Unity"] },
        { id: "75", title: "3D Graphics Engineer", companyName: "Graphics Pro", location: "San Jose, CA", jobType: "Full-time", postedAt: "2024-09-18", description: "Develop 3D graphics with WebGL and Three.js", salaryRange: "$120k - $160k", skills: ["3D", "WebGL", "Graphics"] },
        { id: "76", title: "Animation Engineer", companyName: "Motion Studio", location: "Remote", jobType: "Full-time", postedAt: "2024-09-17", description: "Build animation systems and tools", salaryRange: "$105k - $140k", skills: ["Animation", "Graphics", "Tools"] },
        { id: "77", title: "Physics Engine Developer", companyName: "Physics Systems", location: "Seattle, WA", jobType: "Full-time", postedAt: "2024-09-16", description: "Develop physics simulations for games", salaryRange: "$115k - $150k", skills: ["Physics", "C++", "Simulation"] },
        { id: "78", title: "Audio Engineer", companyName: "Sound Tech", location: "Nashville, TN", jobType: "Full-time", postedAt: "2024-09-15", description: "Implement audio systems for games and apps", salaryRange: "$95k - $125k", skills: ["Audio", "DSP", "C++"] },
        { id: "79", title: "Compiler Engineer", companyName: "Language Systems", location: "Remote", jobType: "Full-time", postedAt: "2024-09-14", description: "Build compilers and programming languages", salaryRange: "$130k - $175k", skills: ["Compilers", "LLVM", "C++"] },
        { id: "80", title: "Runtime Engineer", companyName: "VM Systems", location: "San Francisco, CA", jobType: "Full-time", postedAt: "2024-09-13", description: "Develop language runtimes and VMs", salaryRange: "$125k - $170k", skills: ["Runtime", "VM", "Systems"] },
        { id: "81", title: "Garbage Collection Engineer", companyName: "Memory Systems", location: "Remote", jobType: "Full-time", postedAt: "2024-09-12", description: "Optimize garbage collection algorithms", salaryRange: "$120k - $160k", skills: ["GC", "Memory", "Performance"] },
        { id: "82", title: "JIT Compiler Engineer", companyName: "JIT Systems", location: "Austin, TX", jobType: "Full-time", postedAt: "2024-09-11", description: "Build JIT compilers for dynamic languages", salaryRange: "$125k - $165k", skills: ["JIT", "Compilers", "Performance"] },
        { id: "83", title: "Browser Engine Developer", companyName: "Browser Co", location: "Remote", jobType: "Full-time", postedAt: "2024-09-10", description: "Work on browser rendering engines", salaryRange: "$130k - $180k", skills: ["Browser", "Rendering", "C++"] },
        { id: "84", title: "JavaScript Engine Developer", companyName: "JS Systems", location: "San Francisco, CA", jobType: "Full-time", postedAt: "2024-09-09", description: "Optimize JavaScript engines", salaryRange: "$135k - $185k", skills: ["JavaScript", "V8", "Performance"] },
        { id: "85", title: "OS Kernel Developer", companyName: "Kernel Systems", location: "Remote", jobType: "Full-time", postedAt: "2024-09-08", description: "Develop operating system kernels", salaryRange: "$140k - $190k", skills: ["Kernel", "C", "OS"] },
        { id: "86", title: "Driver Developer", companyName: "Hardware Systems", location: "San Diego, CA", jobType: "Full-time", postedAt: "2024-09-07", description: "Write device drivers for hardware", salaryRange: "$110k - $145k", skills: ["Drivers", "C", "Hardware"] },
        { id: "87", title: "Firmware Engineer", companyName: "Embedded Pro", location: "Seattle, WA", jobType: "Full-time", postedAt: "2024-09-06", description: "Develop firmware for embedded devices", salaryRange: "$115k - $150k", skills: ["Firmware", "C", "Embedded"] },
        { id: "88", title: "Hardware Engineer", companyName: "Silicon Valley Co", location: "San Jose, CA", jobType: "Full-time", postedAt: "2024-09-05", description: "Design hardware and circuit boards", salaryRange: "$120k - $160k", skills: ["Hardware", "FPGA", "Design"] },
        { id: "89", title: "FPGA Engineer", companyName: "Logic Systems", location: "Remote", jobType: "Full-time", postedAt: "2024-09-04", description: "Program FPGAs with VHDL and Verilog", salaryRange: "$115k - $155k", skills: ["FPGA", "VHDL", "Hardware"] },
        { id: "90", title: "ASIC Engineer", companyName: "Chip Design Co", location: "Austin, TX", jobType: "Full-time", postedAt: "2024-09-03", description: "Design custom ASICs for specialized hardware", salaryRange: "$130k - $180k", skills: ["ASIC", "Verilog", "Design"] },
        { id: "91", title: "Quantum Computing Engineer", companyName: "Quantum Labs", location: "Remote", jobType: "Full-time", postedAt: "2024-09-02", description: "Research quantum algorithms and systems", salaryRange: "$150k - $200k", skills: ["Quantum", "Physics", "Algorithms"] },
        { id: "92", title: "Cryptography Engineer", companyName: "Crypto Systems", location: "Washington DC", jobType: "Full-time", postedAt: "2024-09-01", description: "Implement cryptographic systems and protocols", salaryRange: "$125k - $170k", skills: ["Cryptography", "Security", "Math"] },
        { id: "93", title: "Protocol Engineer", companyName: "Network Pro", location: "Remote", jobType: "Full-time", postedAt: "2024-08-31", description: "Design network protocols and standards", salaryRange: "$120k - $160k", skills: ["Protocols", "Networking", "Standards"] },
        { id: "94", title: "DNS Engineer", companyName: "DNS Systems", location: "San Francisco, CA", jobType: "Full-time", postedAt: "2024-08-30", description: "Manage DNS infrastructure at scale", salaryRange: "$110k - $145k", skills: ["DNS", "Networking", "Infrastructure"] },
        { id: "95", title: "CDN Engineer", companyName: "Content Delivery", location: "Remote", jobType: "Full-time", postedAt: "2024-08-29", description: "Build content delivery networks", salaryRange: "$115k - $155k", skills: ["CDN", "Networking", "Performance"] },
        { id: "96", title: "Load Balancer Engineer", companyName: "Balance Systems", location: "Seattle, WA", jobType: "Full-time", postedAt: "2024-08-28", description: "Develop load balancing solutions", salaryRange: "$110k - $150k", skills: ["Load Balancing", "Networking", "HA"] },
        { id: "97", title: "Proxy Engineer", companyName: "Proxy Tech", location: "Chicago, IL", jobType: "Full-time", postedAt: "2024-08-27", description: "Build reverse proxies and API gateways", salaryRange: "$105k - $140k", skills: ["Proxy", "Nginx", "Networking"] },
        { id: "98", title: "Service Mesh Engineer", companyName: "Mesh Systems", location: "Remote", jobType: "Full-time", postedAt: "2024-08-26", description: "Implement service mesh with Istio", salaryRange: "$120k - $160k", skills: ["Service Mesh", "Istio", "Kubernetes"] },
        { id: "99", title: "API Gateway Engineer", companyName: "Gateway Pro", location: "Austin, TX", jobType: "Full-time", postedAt: "2024-08-25", description: "Build API gateways and management platforms", salaryRange: "$115k - $150k", skills: ["API Gateway", "REST", "Microservices"] },
        { id: "100", title: "Backend for Frontend Engineer", companyName: "BFF Systems", location: "Remote", jobType: "Full-time", postedAt: "2024-08-24", description: "Create BFF layers for mobile and web clients", salaryRange: "$110k - $145k", skills: ["BFF", "Node.js", "GraphQL"] }
      ];
      // ========================================

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

  // ========== COMMENTED OUT LIVE SEARCH API ==========
  // Debounced live search: queries backend /jobs/search when possible, falls back to client filtering
  const searchTimeout = useRef<number | null>(null);
  const handleLiveSearch = (q: string) => {
    // clear previous timer
    if (searchTimeout.current) {
      window.clearTimeout(searchTimeout.current);
      searchTimeout.current = null;
    }

    // Just filter client-side dataset (API search commented out)
    applyFilters(jobs, q, loc, workplace, jobTypeFilter, selectedSkills);

    // // debounce network calls
    // searchTimeout.current = window.setTimeout(async () => {
    //   try {
    //     // try backend search endpoint first
    //     const path = `/jobs/search?title=${encodeURIComponent(q)}`;
    //     const remote = await getJson<BackendJob[]>(path);
    //     if (remote && Array.isArray(remote)) {
    //       // replace job list with remote results and apply other filters
    //       setJobs(remote);
    //       applyFilters(remote, q, loc, workplace, jobTypeFilter, selectedSkills);
    //       return;
    //     }
    //   } catch (err) {
    //     // network or endpoint not available — fall back to client filtering
    //     applyFilters(jobs, q, loc, workplace, jobTypeFilter, selectedSkills);
    //   }
    // }, 300) as unknown as number;
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
                    {/* ========== COMMENTED OUT SYNC API ========== */}
                    {/* <Button
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
                    </Button> */}

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
