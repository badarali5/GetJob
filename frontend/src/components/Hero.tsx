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
                      />
                    </div>

                    <div className="relative mt-4 md:mt-0 md:flex-1">
                      <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
                      <Input
                        placeholder="Location"
                        className="pl-16 pr-6 h-20 bg-background text-xl placeholder:text-muted-foreground w-full"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>

                    <div className="mt-4 md:mt-0 md:ml-4 md:flex-shrink-0">
                      <Button
                        variant="hero"
                        size="lg"
                        className="h-20 px-8 text-xl w-full md:w-auto"
                        onClick={() => {
                          const url = `/jobs?q=${encodeURIComponent(title)}&loc=${encodeURIComponent(location)}${workplace ? `&workplace=${encodeURIComponent(workplace)}` : ''}${jobType ? `&type=${encodeURIComponent(jobType)}` : ''}${salary ? `&salary=${encodeURIComponent(salary)}` : ''}`;
                          navigate(url);
                        }}
                      >
                        <Search className="h-6 w-6 mr-3" />
                        Search
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      className={`px-3 py-1 rounded-md text-sm ${workplace === 'remote' ? 'bg-primary text-white' : 'bg-card/60 text-muted-foreground border'}`}
                      onClick={() => {
                        const next = workplace === 'remote' ? '' : 'remote';
                        setWorkplace(next);
                        navigate(`/jobs?q=${encodeURIComponent(title)}&loc=${encodeURIComponent(location)}&workplace=${encodeURIComponent(next)}&type=${encodeURIComponent(jobType)}&salary=${encodeURIComponent(salary)}`);
                      }}
                    >
                      <span className="sr-only">Workplace</span>
                      Workplace
                    </button>

                    <button
                      className={`px-3 py-1 rounded-md text-sm flex items-center gap-2 ${jobType === 'internship' ? 'bg-primary text-white' : 'bg-card/60 text-muted-foreground border'}`}
                      onClick={() => {
                        const next = jobType === 'internship' ? '' : 'internship';
                        setJobType(next);
                        navigate(`/jobs?q=${encodeURIComponent(title)}&loc=${encodeURIComponent(location)}&workplace=${encodeURIComponent(workplace)}&type=${encodeURIComponent(next)}&salary=${encodeURIComponent(salary)}`);
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
                        navigate(`/jobs?q=${encodeURIComponent(title)}&loc=${encodeURIComponent(location)}&workplace=${encodeURIComponent(workplace)}&type=${encodeURIComponent(jobType)}&salary=${encodeURIComponent(next)}`);
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
              Popular: <span className="text-foreground font-medium">Software Engineer</span>, 
              <span className="text-foreground font-medium"> Marketing Intern</span>, 
              <span className="text-foreground font-medium"> Data Analyst</span>
            </p>
          </div>
      
    </section>
  );
};

export default Hero;
