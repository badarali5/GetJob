import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JobCard from "@/components/JobCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Briefcase, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

// Sample job data
const sampleJobs = [
  {
    id: "1",
    title: "Frontend Developer Intern",
    company: "TechCorp",
    location: "San Francisco, CA",
    type: "Internship",
    postedDate: "2 days ago",
    tags: ["React", "TypeScript", "UI/UX"],
  },
  {
    id: "2",
    title: "Marketing Coordinator",
    company: "GrowthHub",
    location: "Remote",
    type: "Full-time",
    postedDate: "1 week ago",
    tags: ["Digital Marketing", "SEO", "Content"],
  },
  {
    id: "3",
    title: "Data Analyst Intern",
    company: "DataWorks",
    location: "New York, NY",
    type: "Internship",
    postedDate: "3 days ago",
    tags: ["Python", "SQL", "Analytics"],
  },
  {
    id: "4",
    title: "Product Designer",
    company: "DesignLab",
    location: "Remote",
    type: "Full-time",
    postedDate: "5 days ago",
    tags: ["Figma", "UI/UX", "Prototyping"],
  },
  {
    id: "5",
    title: "Software Engineering Intern",
    company: "StartupXYZ",
    location: "Austin, TX",
    type: "Internship",
    postedDate: "1 day ago",
    tags: ["JavaScript", "Node.js", "MongoDB"],
  },
  {
    id: "6",
    title: "Business Analyst",
    company: "ConsultPro",
    location: "Chicago, IL",
    type: "Full-time",
    postedDate: "4 days ago",
    tags: ["Excel", "Strategy", "Analytics"],
  },
];

const Jobs = () => {
  const [showFilters, setShowFilters] = useState(false);

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
                  />
                </div>
                
                <Select>
                  <SelectTrigger className="h-12 bg-background">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="new-york">New York</SelectItem>
                    <SelectItem value="san-francisco">San Francisco</SelectItem>
                    <SelectItem value="chicago">Chicago</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="hero" size="lg" className="h-12">
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
                    Showing <span className="font-semibold text-foreground">{sampleJobs.length}</span> opportunities
                  </p>
                  
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

                <div className="grid gap-6">
                  {sampleJobs.map((job) => (
                    <JobCard key={job.id} {...job} />
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
