import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { getUser, getJson } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface SavedJobItem {
  id: number;
  job: {
    id: number;
    title: string;
    companyName: string;
    location: string;
    description: string;
  };
  savedAt: string;
}

const SavedJobs = () => {
  const [saved, setSaved] = useState<SavedJobItem[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchSavedJobs = async () => {
    const user = getUser();
    if (!user || !user.id) {
      toast({ title: "Error", description: "Please sign in first", variant: 'destructive' });
      navigate('/signin');
      return;
    }
    setLoading(true);
    try {
      // Read saved jobs from localStorage (client-side skeleton)
      const all: SavedJobItem[] = JSON.parse(localStorage.getItem('savedJobs') || '[]');
      const mine = all.filter((s) => s.userId === user.id);
      setSaved(mine || []);
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || 'Failed to load saved jobs', variant: 'destructive' });
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    void fetchSavedJobs();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Saved Jobs</h2>
          <Button onClick={() => fetchSavedJobs()} variant="outline" size="sm">
            Refresh
          </Button>
        </div>
        {loading && <div className="text-center py-8">Loading...</div>}
        {!loading && saved.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No saved jobs yet. Browse jobs and save ones you're interested in!
          </div>
        )}
        <div className="space-y-4">
          {saved.map((s) => (
            <div key={s.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{s.job?.title || 'Untitled Job'}</h3>
                  <p className="text-sm text-muted-foreground">{s.job?.companyName || 'Company'}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.job?.location || ''}</p>
                </div>
                <Button 
                  onClick={() => navigate(`/jobs/${s.job?.id}`)}
                  variant="default" 
                  size="sm"
                >
                  View & Apply
                </Button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default SavedJobs;
