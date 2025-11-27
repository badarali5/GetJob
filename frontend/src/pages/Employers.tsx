import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Employers: React.FC = () => {
  return (
    <div className="container mx-auto py-20">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">Employers</h1>
        <p className="text-lg text-muted-foreground mb-6">
          Find top talent, post jobs, and manage applicants — all in one place.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/signup">
            <Button variant="hero">Get Started — Post a Job</Button>
          </Link>
          <Link to="/signin">
            <Button variant="ghost">Sign In</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Employers;
