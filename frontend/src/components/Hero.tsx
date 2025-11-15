import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Briefcase } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-accent via-background to-background">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="container mx-auto px-4 py-20 md:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <div className="inline-block">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                2,000+ new opportunities this week
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Kickstart Your Career
            </h1>
            <p className="text-xl text-muted-foreground">
              Find internships & first jobs that fit you perfectly. Start your journey to success today.
            </p>

            <div className="bg-card rounded-2xl p-4 shadow-xl border space-y-3">
              <div className="grid md:grid-cols-3 gap-3">
                <div className="relative flex items-center md:col-span-1">
                  <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Job title or keyword" 
                    className="pl-9 h-12 bg-background"
                  />
                </div>
                
                <Select>
                  <SelectTrigger className="h-12 bg-background">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="new-york">New York</SelectItem>
                    <SelectItem value="san-francisco">San Francisco</SelectItem>
                    <SelectItem value="london">London</SelectItem>
                    <SelectItem value="tokyo">Tokyo</SelectItem>
                  </SelectContent>
                </Select>

                <Select>
                  <SelectTrigger className="h-12 bg-background">
                    <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Job Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button variant="hero" size="lg" className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Search Jobs
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              Popular: <span className="text-foreground font-medium">Software Engineer</span>, 
              <span className="text-foreground font-medium"> Marketing Intern</span>, 
              <span className="text-foreground font-medium"> Data Analyst</span>
            </p>
          </div>

          <div className="hidden lg:block animate-slide-up">
            <div className="relative">
              <div className="absolute inset-0 gradient-hero blur-3xl opacity-20 rounded-3xl"></div>
              <img 
                src={heroImage}
                alt="Young professionals collaborating" 
                className="relative rounded-3xl shadow-2xl w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
