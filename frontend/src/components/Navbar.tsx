import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getUser, clearToken } from "@/lib/api";
import { Briefcase } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-800">
      <div className="container mx-auto px-0 h-20 flex items-center justify-between">

        <div className="flex items-center">
          <Link 
            to="/" 
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <Briefcase className="h-8 w-8 text-primary" />
            <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              GetJob
            </span>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-6 flex-1 justify-center">
          <Link 
            to="/jobs" 
            className="text-md font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Browse Jobs
          </Link>
          <Link 
            to="/#how-it-works" 
            className="text-md font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            How It Works
          </Link>
          <Link 
            to="/employers" 
            className="text-md font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            For Employers
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {(() => {
            const user = getUser();
            if (user && user.id) {
              return (
                <div className="flex items-center gap-3">
                  <Link to="/profile">
                    <Button variant={user.resumeUrl ? "default" : "outline"} size="sm">
                      {user.resumeUrl ? "✓ Resume" : "Upload Resume"}
                    </Button>
                  </Link>
                  <Link to="/saved">
                    <Button variant="ghost" size="sm">Saved Jobs</Button>
                  </Link>
                  <Link to="/profile" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    {user.name}
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => { clearToken(); window.location.href = '/'; }}>Sign Out</Button>
                </div>
              );
            }
            return (
              <>
                <Link to="/signin">
                  <Button variant="ghost" size="lg">Sign In</Button>
                </Link>
                <Link to="/signup">
                  <Button variant="hero" size="lg">Get Started</Button>
                </Link>
              </>
            );
          })()}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
