import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Briefcase, ChevronDown, TrendingUp, Users, Award } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Hero = () => {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [workplace, setWorkplace] = useState('');
  const [jobType, setJobType] = useState('');
  const [salary, setSalary] = useState('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const locationOptions = ['Remote', 'Karachi', 'Lahore', 'Rawalpindi', 'Faisalabad', 'Multan', 'Islamabad', 'Peshawar'];
  const jobTypeOptions = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance'];
  const salaryOptions = ['$0 - $30k', '$30k - $60k', '$60k - $100k', '$100k - $150k', '$150k+'];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performSearch = (overrides: Partial<{ q: string; loc: string; workplace: string; type: string; salary: string }> = {}) => {
    const q = overrides.q ?? title;
    const locVal = overrides.loc ?? location;
    const wp = overrides.workplace ?? workplace;
    const typeVal = overrides.type ?? jobType;
    const sal = overrides.salary ?? salary;

    const params = new URLSearchParams();
    if (q && q.trim()) params.append('q', q);
    if (locVal && locVal.trim()) params.append('loc', locVal);
    if (wp) params.append('workplace', wp);
    if (typeVal) params.append('type', typeVal);
    if (sal) params.append('salary', sal);

    const queryString = params.toString();
    const url = queryString ? `/jobs?${queryString}` : '/jobs';
    navigate(url);
  };

  const handleLocationSelect = (loc: string) => {
    setLocation(loc);
    setOpenDropdown(null);
    performSearch({ loc });
  };

  const handleJobTypeSelect = (type: string) => {
    setJobType(type);
    setOpenDropdown(null);
    performSearch({ type });
  };

  const handleSalarySelect = (sal: string) => {
    setSalary(sal);
    setOpenDropdown(null);
    performSearch({ salary: sal });
  };

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-accent via-background to-background">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

        <div className="w-full px-5 py-24">
          <div className="space-y-6 animate-fade-in">
            <div className="inline-block">
              <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                2,000+ new opportunities this week
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight w-full px-5">
              Kickstart Your Career
            </h1>
            <p className="text-muted-foreground text-0xl md:text-xl lg:text-2xl max-w px-5 py-0">
              Find internships & first jobs that fit you perfectly. Start your journey to success today.
            </p>

            <div className="m-auto w-full max-w-none py-8">
              <div className="bg-card rounded-3xl p-8 shadow-2xl border w-full">
                <div className="flex flex-col md:flex-row md:items-center md:gap-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
                    <Input
                      placeholder="Job Title or Company"
                      className="pl-16 pr-6 h-20 bg-background text-xl placeholder:text-muted-foreground w-full"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          performSearch();
                        }
                      }}
                    />
                  </div>

                  <div className="relative mt-4 md:mt-0 md:flex-1">
                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
                    <Input
                      placeholder="Location"
                      className="pl-16 pr-6 h-20 bg-background text-xl placeholder:text-muted-foreground w-full"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          performSearch();
                        }
                      }}
                    />
                  </div>

                  <div className="mt-4 md:mt-0 md:ml-4 md:flex-shrink-0">
                    <Button
                      variant="hero"
                      size="lg"
                      className="h-20 px-8 text-xl w-full md:w-auto cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/50"
                      onClick={() => performSearch()}
                    >
                      <Search className="h-6 w-6 mr-3" />
                      Search
                    </Button>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3" ref={dropdownRef}>
                  <div className="relative">
                    <button
                      className={`px-4 py-2 rounded-md text-sm flex items-center gap-2 transition-all ${
                        location ? 'bg-primary text-white' : 'bg-card/60 text-muted-foreground border'
                      }`}
                      onClick={() => setOpenDropdown(openDropdown === 'location' ? null : 'location')}
                    >
                      <MapPin className="w-4 h-4" />
                      {location || 'Location'}
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    {openDropdown === 'location' && (
                      <div className="absolute top-full mt-2 left-0 bg-card border rounded-lg shadow-lg z-10 w-48">
                        {locationOptions.map((loc) => (
                          <button
                            key={loc}
                            onClick={() => handleLocationSelect(loc)}
                            className={`w-full text-left px-4 py-2 hover:bg-primary/10 transition-colors ${
                              location === loc ? 'bg-primary/20 text-primary font-medium' : ''
                            }`}
                          >
                            {loc}
                          </button>
                        ))}
                        {location && (
                          <button
                            onClick={() => {
                              setLocation('');
                              setOpenDropdown(null);
                              performSearch({ loc: '' });
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-destructive/10 text-destructive border-t transition-colors"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <button
                      className={`px-4 py-2 rounded-md text-sm flex items-center gap-2 transition-all ${
                        jobType ? 'bg-primary text-white' : 'bg-card/60 text-muted-foreground border'
                      }`}
                      onClick={() => setOpenDropdown(openDropdown === 'jobType' ? null : 'jobType')}
                    >
                      <Briefcase className="w-4 h-4" />
                      {jobType || 'Job Type'}
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    {openDropdown === 'jobType' && (
                      <div className="absolute top-full mt-2 left-0 bg-card border rounded-lg shadow-lg z-10 w-48">
                        {jobTypeOptions.map((type) => (
                          <button
                            key={type}
                            onClick={() => handleJobTypeSelect(type)}
                            className={`w-full text-left px-4 py-2 hover:bg-primary/10 transition-colors ${
                              jobType === type ? 'bg-primary/20 text-primary font-medium' : ''
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                        {jobType && (
                          <button
                            onClick={() => {
                              setJobType('');
                              setOpenDropdown(null);
                              performSearch({ type: '' });
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-destructive/10 text-destructive border-t transition-colors"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <button
                      className={`px-4 py-2 rounded-md text-sm flex items-center gap-2 transition-all ${
                        salary ? 'bg-primary text-white' : 'bg-card/60 text-muted-foreground border'
                      }`}
                      onClick={() => setOpenDropdown(openDropdown === 'salary' ? null : 'salary')}
                    >
                      {salary || 'Salary'}
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    {openDropdown === 'salary' && (
                      <div className="absolute top-full mt-2 left-0 bg-card border rounded-lg shadow-lg z-10 w-48">
                        {salaryOptions.map((sal) => (
                          <button
                            key={sal}
                            onClick={() => handleSalarySelect(sal)}
                            className={`w-full text-left px-4 py-2 hover:bg-primary/10 transition-colors ${
                              salary === sal ? 'bg-primary/20 text-primary font-medium' : ''
                            }`}
                          >
                            {sal}
                          </button>
                        ))}
                        {salary && (
                          <button
                            onClick={() => {
                              setSalary('');
                              setOpenDropdown(null);
                              performSearch({ salary: '' });
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-destructive/10 text-destructive border-t transition-colors"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Why Choose GetJob?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Smart Applicant Ranking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our priority queue algorithm ranks applicants by skill match, resume quality, and experience.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Top Talent Discovery</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Find the best candidates instantly using our advanced sorting and filtering algorithms.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Analytics & Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Track job performance, trending opportunities, and make data-driven hiring decisions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

    </>
  );
};

export default Hero;
