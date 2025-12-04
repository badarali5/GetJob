import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, Clock, Bookmark, BookmarkCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { saveJobForLater, getUser } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface JobCardProps {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  postedDate: string;
  logo?: string;
  tags?: string[];
}

const JobCard = ({ id, title, company, location, type, postedDate, logo, tags = [] }: JobCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const user = getUser();
    if (!user || !user.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save jobs.",
        variant: "destructive",
      });
      navigate("/signin");
      return;
    }

    setIsSaving(true);
    try {
      await saveJobForLater(user.id, id);
      setIsSaved(true);
      toast({
        title: "Success!",
        description: "Job saved for later.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to save job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer gradient-card group">
      <div onClick={() => navigate(`/jobs/${id}`)} className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-4">
            {logo ? (
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <img src={logo} alt={company} className="w-8 h-8 object-contain" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-lg gradient-hero flex items-center justify-center flex-shrink-0">
                <Briefcase className="h-6 w-6 text-primary-foreground" />
              </div>
            )}

            <div className="space-y-1">
              <h3 className="font-semibold text-xl group-hover:text-primary transition-colors">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground">{company}</p>
            </div>
          </div>

          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleBookmark}
            disabled={isSaving || isSaved}
            className="flex-shrink-0"
          >
            {isSaved ? (
              <BookmarkCheck className="h-4 w-4 fill-current" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {location}
          </div>
          <div className="flex items-center gap-1">
            <Briefcase className="h-4 w-4" />
            {type}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {postedDate}
          </div>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t" onClick={(e) => e.stopPropagation()}>
        <Button 
          variant="default" 
          className="w-full"
          onClick={() => navigate(`/jobs/${id}`)}
        >
          View Details
        </Button>
      </div>
    </Card>
  );
};

export default JobCard;
