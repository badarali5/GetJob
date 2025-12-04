import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Briefcase } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [workplace, setWorkplace] = useState('');
  const [jobType, setJobType] = useState('');
  const [salary, setSalary] = useState('');
  const navigate = useNavigate();

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

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-accent via-background to-background">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      {/* full viewport width content */}
      <div className="w-full px-5 py-24">
        <div className="gap-8 items-center w-full">
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

            

         </div>

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

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      className={`px-3 py-1 rounded-md text-sm ${location.trim() ? 'bg-primary text-white' : 'bg-card/60 text-muted-foreground border'}`}
                      onClick={() => {
                        if (location.trim()) {
                          performSearch({ loc: location });
                        }
                      }}
                      disabled={!location.trim()}
                    >
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Search by Location
                    </button>

                    <button
                      className={`px-3 py-1 rounded-md text-sm flex items-center gap-2 ${jobType === 'internship' ? 'bg-primary text-white' : 'bg-card/60 text-muted-foreground border'}`}
                      onClick={() => {
                        const next = jobType === 'internship' ? '' : 'internship';
                        setJobType(next);
                        performSearch({ type: next });
                      }}
                    >
                      <Briefcase className="w-4 h-4" />
                      Type
                    </button>

                    <button
                      className={`px-3 py-1 rounded-md text-sm ${salary === 'any' ? 'bg-primary text-white' : 'bg-card/60 text-muted-foreground border'}`}
                      onClick={() => {
                        const next = salary === 'any' ? '' : 'any';
                        setSalary(next);
                        performSearch({ salary: next });
                      }}
                    >
                      Salary
                    </button>


                    {location && (
                      <span className="ml-auto md:ml-0 bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                        {location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground py-5">
              Popular: 
              <button className="text-foreground font-medium ml-1 mr-2" onClick={() => { setTitle('Software Engineer'); performSearch({ q: 'Software Engineer' }); }}>Software Engineer</button>,
              <button className="text-foreground font-medium ml-1 mr-2" onClick={() => { setTitle('Marketing Intern'); performSearch({ q: 'Marketing Intern' }); }}>Marketing Intern</button>,
              <button className="text-foreground font-medium ml-1" onClick={() => { setTitle('Data Analyst'); performSearch({ q: 'Data Analyst' }); }}>Data Analyst</button>
            </p>
          </div>
      
    </section>
  );
};

export default Hero;
