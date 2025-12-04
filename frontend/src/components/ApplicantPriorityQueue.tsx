import React, { useMemo } from "react";
import { MaxHeap } from "@/lib/heap";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, User } from "lucide-react";

export interface Applicant {
  id: string;
  name: string;
  email: string;
  jobId: string;
  skillMatch: number; // 0-100
  experience: number; // years
  resumeScore: number; // 0-100
  appliedAt?: string;
}

interface ApplicantPriorityQueueProps {
  applicants: Applicant[];
  jobTitle?: string;
  limit?: number;
}

export const ApplicantPriorityQueue: React.FC<ApplicantPriorityQueueProps> = ({
  applicants,
  jobTitle = "Applicants",
  limit = 10,
}) => {
  const rankedApplicants = useMemo(() => {
    if (!applicants || applicants.length === 0) return [];
    const scored = applicants.map(applicant => ({
      ...applicant,
      priority:
        applicant.skillMatch * 0.4 +
        applicant.resumeScore * 0.35 +
        Math.min(applicant.experience * 5, 100) * 0.25, // Cap experience at 100
    }));
    const heap = new MaxHeap(scored);
    const result: typeof scored = [];
    let count = 0;
    while (count < limit && !heap.isEmpty()) {
      const item = heap.extract();
      if (item) result.push(item);
      count++;
    }

    return result;
  }, [applicants, limit]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";
    return "text-orange-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-blue-100 text-blue-800";
    if (score >= 40) return "bg-yellow-100 text-yellow-800";
    return "bg-orange-100 text-orange-800";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          {jobTitle}
        </CardTitle>
        <CardDescription>
          Ranked by skill match, resume score, and experience
        </CardDescription>
      </CardHeader>
      <CardContent>
        {rankedApplicants.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No applicants yet</p>
        ) : (
          <div className="space-y-4">
            {rankedApplicants.map((applicant, index) => (
              <div
                key={applicant.id}
                className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <p className="font-semibold">{applicant.name}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">{applicant.email}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mt-3">
                      {}
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Skill Match</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${applicant.skillMatch}%` }}
                            />
                          </div>
                          <span className={`text-sm font-semibold ${getScoreColor(applicant.skillMatch)}`}>
                            {applicant.skillMatch}%
                          </span>
                        </div>
                      </div>

                      {}
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Resume Score</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${applicant.resumeScore}%` }}
                            />
                          </div>
                          <span className={`text-sm font-semibold ${getScoreColor(applicant.resumeScore)}`}>
                            {applicant.resumeScore}%
                          </span>
                        </div>
                      </div>

                      {}
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Experience</p>
                        <p className="text-sm font-semibold">
                          {applicant.experience} {applicant.experience === 1 ? "year" : "years"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {}
                  <div className="ml-4">
                    <Badge className={`text-lg px-3 py-1 ${getScoreBadge(applicant.priority)}`}>
                      {applicant.priority.toFixed(1)}
                    </Badge>
                  </div>
                </div>

                {applicant.appliedAt && (
                  <p className="text-xs text-muted-foreground mt-3">
                    Applied on {new Date(applicant.appliedAt).toLocaleDateString()}
                  </p>
                )}

                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="default">
                    Review
                  </Button>
                  <Button size="sm" variant="outline">
                    Message
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ApplicantPriorityQueue;
