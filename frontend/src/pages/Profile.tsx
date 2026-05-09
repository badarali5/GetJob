import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { uploadResume, getUser } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const user = getUser();

  const handleUpload = async () => {
    if (!user || !user.id) {
      toast({ title: "Sign in required", description: "Please sign in to upload resume", variant: 'destructive' });
      return;
    }
    if (!file) {
      toast({ title: "No file", description: "Please choose a file to upload", variant: 'destructive' });
      return;
    }
    setIsUploading(true);
    try {
      const result = await uploadResume(user.id, file);
      // Ensure resume URL is persisted in localStorage
      const updatedUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (result.resumeUrl) {
        updatedUser.resumeUrl = result.resumeUrl;
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      toast({ 
        title: "✓ Resume Uploaded!", 
        description: "Your resume is saved. You can now apply for jobs without uploading again." 
      });
      setTimeout(() => navigate('/jobs'), 2000);
    } catch (err: any) {
      toast({ title: "Error", description: (err?.body?.error || err?.message) || 'Upload failed', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-semibold mb-2">Upload Resume</h2>
          <p className="text-muted-foreground mb-6">Upload your resume to apply for jobs. A resume is required for all applications.</p>
          
          <div className="space-y-4 p-6 border rounded-lg bg-card">
            <div>
              <label className="block text-sm font-medium mb-2">Choose Resume File</label>
              <input 
                type="file" 
                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                className="block w-full text-sm border rounded p-2"
                accept=".pdf,.doc,.docx"
              />
              {file && <p className="text-sm text-muted-foreground mt-2">Selected: {file.name}</p>}
            </div>
            
            <Button 
              onClick={handleUpload} 
              disabled={isUploading || !file}
              className="w-full"
            >
              {isUploading ? 'Uploading...' : 'Upload Resume'}
            </Button>
          </div>

          {user?.resumeUrl && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
              <p className="text-sm text-green-700">✓ Resume already uploaded</p>
              <p className="text-xs text-green-600 mt-1">{user.resumeUrl}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Profile;
