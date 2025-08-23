// Types for Lambda function
export interface ReportItem {
  // DynamoDB Primary Key (optional for backward compatibility)
  PK?: string; // REPORT#<reportId>
  SK?: string; // META

  // GSI Keys (optional)
  GSI1PK?: string; // Category for category-based queries
  GSI1SK?: string; // CreatedAt for category-based queries
  GSI2PK?: string; // "ALL" for global queries
  GSI2SK?: string; // CreatedAt for global queries

  // Report Data (primary fields for existing table structure)
  ReportId: string;
  UserId: string;
  Title?: string;
  Body: string;
  Summary?: string;
  Tags?: string[];
  Category: string;
  CreatedAt: string;
  Improvements?: string;
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
  improvements?: string;
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
