export interface Profile {
  id: string;
  full_name: string;
  field_of_interest: string[];
  opportunity_types: string[];
  country: string;
  target_country: string;
  education_level: "high_school" | "undergraduate" | "masters" | "phd" | "working_professional";
  cgpa: number | null;
  created_at: string;
}

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  type: "hackathon" | "scholarship" | "internship" | "research" | "job" | "grant" | "bounty";
  deadline: string | null;
  location: string | null;
  tags: string[];
  scraped_at: string;
}

export interface UserMatch {
  id: string;
  user_id: string;
  opportunity_id: string;
  score: number;
  reason: string;
  status: "new" | "saved" | "dismissed" | "applied";
  notified_at: string | null;
  created_at: string;
}

export interface UserMatchWithOpportunity extends UserMatch {
  opportunities: Opportunity;
}

export type OpportunityType =
  | "hackathon"
  | "scholarship"
  | "internship"
  | "research"
  | "job"
  | "grant"
  | "bounty";

export type MatchStatus = "new" | "saved" | "dismissed" | "applied";

export type EducationLevel =
  | "high_school"
  | "undergraduate"
  | "masters"
  | "phd"
  | "working_professional";
