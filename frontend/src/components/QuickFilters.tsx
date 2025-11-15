import { Button } from "@/components/ui/button";
import { GraduationCap, Laptop, TrendingUp, Wrench } from "lucide-react";
import { useNavigate } from "react-router-dom";

const filters = [
  { icon: GraduationCap, label: "Internships Near Me", color: "text-primary" },
  { icon: Laptop, label: "Remote IT Internships", color: "text-secondary" },
  { icon: TrendingUp, label: "Business & Marketing", color: "text-primary" },
  { icon: Wrench, label: "Engineering & Tech", color: "text-secondary" },
];

const QuickFilters = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Popular Searches</h2>
          <p className="text-muted-foreground">Quick access to the most sought-after opportunities</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {filters.map((filter, index) => {
            const Icon = filter.icon;
            return (
              <Button
                key={index}
                variant="outline"
                onClick={() => navigate('/jobs')}
                className="h-auto py-6 flex-col gap-3 hover:scale-105 hover:shadow-lg transition-all duration-300 bg-card"
              >
                <Icon className={`h-8 w-8 ${filter.color}`} />
                <span className="text-sm font-medium text-center">{filter.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default QuickFilters;
