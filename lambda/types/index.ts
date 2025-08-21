// Types for Lambda function
export interface ReportItem {
  ReportId: string;
  UserId: string;
  Title?: string;
  Body: string;
  Summary?: string;
  Tags?: string[];
  Category: string;
  CreatedAt: string;
}

export interface ApiReport {
  reportId: string;
  userId: string;
  title?: string;
  body: string;
  summary?: string;
  tags?: string[];
  category: string;
  createdAt: string;
}

export interface ProhibitedMatch {
  original: string;
  suggested: string;
  type: string;
}

export interface AIResponse {
  title: string;
  category: string;
  summary: string;
  improvements: string;
  suggestedReplacements: ProhibitedMatch[];
}
