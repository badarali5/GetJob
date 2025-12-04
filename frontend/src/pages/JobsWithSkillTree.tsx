import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JobCard from "@/components/JobCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Briefcase, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getJson } from "@/lib/api";
import { AVLTree } from "@/lib/avlTree";
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

function parseMinSalary(salaryRange?: string): number {
  if (!salaryRange) return 0;
  const numbers = salaryRange.match(/\d+/g);
  if (!numbers) return 0;
  return parseInt(numbers[0]) || 0;
}

const Jobs = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [jobs, setJobs] = useState<BackendJob[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<BackendJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loc, setLoc] = useState('');
  const [workplace, setWorkplace] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('');
  const [minSalaryFilter, setMinSalaryFilter] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillAutocomplete, setSkillAutocomplete] = useState<string[]>([]);
  const [skillSearchInput, setSkillSearchInput] = useState('');
  const [skillTree, setSkillTree] = useState<AVLTree<BackendJob> | null>(null);
  const [allSkills, setAllSkills] = useState<string[]>([]);
  const locationHook = useLocation();
  const navigate = useNavigate();

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getJson<BackendJob[]>('/jobs');
      let results = data || [];
      const tree = new AVLTree<BackendJob>();
      results.forEach(job => {
        const skills = job.skills && job.skills.length > 0 
          ? job.skills 
          : extractSkillsFromJob(job);
        skills.forEach(skill => {
          tree.insert(skill, job);
        });
      });

      setSkillTree(tree);
      setAllSkills(tree.getAllSkills());
      setJobs(results);
      applyFilters(results, '', '', '', '', []);
    } catch (err: any) {
      console.error('Failed to fetch jobs', err);
      setError(err?.message || 'Failed to fetch jobs');
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
      results = results.filter(j => (j.jobType || '').toLowerCase().includes(jobType.toLowerCase()));
    }

    if (minSalaryFilter && minSalaryFilter.trim() !== '') {
      const minSalary = parseInt(minSalaryFilter);
      if (!isNaN(minSalary)) {
        results = results.filter(j => parseMinSalary(j.salaryRange) >= minSalary);
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
    if (sortBy === 'salary-high') {
      results = results.sort((a, b) => parseMinSalary(b.salaryRange) - parseMinSalary(a.salaryRange));
    } else if (sortBy === 'salary-low') {
      results = results.sort((a, b) => parseMinSalary(a.salaryRange) - parseMinSalary(b.salaryRange));
    } else if (sortBy === 'recent') {
      results = results.sort((a, b) => {
        const dateA = new Date(a.postedAt || a.createdAt || 0).getTime();
        const dateB = new Date(b.postedAt || b.createdAt || 0).getTime();
        return dateB - dateA;
      });
    }

    setFilteredJobs(results);
  };

  const handleSkillAdd = (skill: string) => {
    if (!selectedSkills.includes(skill)) {
      const newSkills = [...selectedSkills, skill];
      setSelectedSkills(newSkills);
      applyFilters(jobs, searchTerm, loc, workplace, jobTypeFilter, newSkills);
    }
    setSkillSearchInput('');
    setSkillAutocomplete([]);
  };

  const handleSkillRemove = (skill: string) => {
    const newSkills = selectedSkills.filter(s => s !== skill);
    setSelectedSkills(newSkills);
    applyFilters(jobs, searchTerm, loc, workplace, jobTypeFilter, newSkills);
  };

  const handleSkillSearchChange = (value: string) => {
    setSkillSearchInput(value);
    if (value && skillTree) {
      const suggestions = skillTree.searchByPrefix(value);
      setSkillAutocomplete(suggestions.slice(0, 10));
    } else {
      setSkillAutocomplete([]);
    }
  };

  useEffect(() => {
    void fetchJobs();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {}
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
                    onChange={(e) => {
                      setLoc(e.target.value);
                      applyFilters(jobs, searchTerm, e.target.value, workplace, jobTypeFilter, selectedSkills);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                      }
                    }}
                  />
                </div>

                <Button 
                  variant="hero" 
                  size="lg" 
                  className="h-12"
                  onClick={() => {
                    navigate(`/jobs?q=${encodeURIComponent(searchTerm)}&loc=${encodeURIComponent(loc)}`);
                  }}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </div>
        </section>

        {}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              {}
              <aside className={`lg:w-80 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Filters</h3>

                  {}
                  <div className="space-y-3 p-4 bg-accent/30 rounded-lg border">
                    <label className="text-sm font-medium">Search by Skills</label>
                    <div className="relative">
                      <Input
                        placeholder="e.g., React, Python, AWS"
                        className="bg-background text-sm"
                        value={skillSearchInput}
                        onChange={(e) => handleSkillSearchChange(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && skillAutocomplete.length > 0) {
                            handleSkillAdd(skillAutocomplete[0]);
                          }
                        }}
                      />
                      {skillAutocomplete.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg z-10">
                          {skillAutocomplete.map(skill => (
                            <button
                              key={skill}
                              className="w-full text-left px-3 py-2 hover:bg-accent text-sm"
                              onClick={() => handleSkillAdd(skill)}
                            >
                              {skill}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {selectedSkills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedSkills.map(skill => (
                          <Badge 
                            key={skill} 
                            variant="secondary" 
                            className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => handleSkillRemove(skill)}
                          >
                            {skill}
                            <X className="h-3 w-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {allSkills.length > 0 ? `${allSkills.length} skills indexed` : 'Loading skills...'}
                    </p>
                  </div>

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
                        <SelectItem value="">All Types</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Minimum Salary ($)</label>
                    <Input
                      type="number"
                      placeholder="e.g., 50000"
                      className="bg-background"
                      value={minSalaryFilter}
                      onChange={(e) => {
                        setMinSalaryFilter(e.target.value);
                        applyFilters(jobs, searchTerm, loc, workplace, jobTypeFilter, selectedSkills);
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sort By</label>
                    <Select value={sortBy} onValueChange={(value) => {
                      setSortBy(value);
                      applyFilters(jobs, searchTerm, loc, workplace, jobTypeFilter, selectedSkills);
                    }}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Default" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value="">Default</SelectItem>
                        <SelectItem value="salary-high">Highest Salary</SelectItem>
                        <SelectItem value="salary-low">Lowest Salary</SelectItem>
                        <SelectItem value="recent">Most Recent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </aside>

              {}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-muted-foreground">
                    Showing <span className="font-semibold text-foreground">{filteredJobs.length}</span> opportunities
                  </p>

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
                  {filteredJobs.length > 0 ? (
                    filteredJobs.map((job) => (
                      <JobCard
                        key={job.id}
                        id={job.id}
                        title={job.title || 'Untitled'}
                        company={job.companyName || 'Unknown'}
                        location={job.location || 'Remote'}
                        type={job.jobType || 'N/A'}
                        postedDate={job.postedAt ? timeAgo(job.postedAt) : (job.createdAt ? timeAgo(job.createdAt) : '')}
                        tags={job.skills || extractSkillsFromJob(job)}
                      />
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No jobs match your filters.</p>
                    </div>
                  )}
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
