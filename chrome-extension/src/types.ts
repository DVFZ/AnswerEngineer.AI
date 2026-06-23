/**
 * AnswerEngineer.AI - 7-Point GEO Audit Types
 */

export interface AuditPoint {
  id: string;
  name: string;
  score: number; // 0-100
  weight: number; // multiplier for final score
  findings: string[];
  status: 'pass' | 'warning' | 'fail';
}

export interface AuditResult {
  url: string;
  timestamp: number;
  overallScore: number; // weighted 0-100
  points: {
    websiteStructure: AuditPoint;
    schema: AuditPoint;
    contentFreshness: AuditPoint;
    jsHandling: AuditPoint;
    authority: AuditPoint;
    ctrSignals: AuditPoint;
    coverage: AuditPoint;
  };
  recommendations: string[];
}

export interface PageData {
  url: string;
  title: string;
  description: string;
  headings: string[];
  canonicalUrl: string;
  robotsTxt: string | null;
  sitemapUrl: string | null;
  schemaMarkup: any[];
  lastModified: string | null;
  isClientRendered: boolean;
  htmlSize: number;
  cssCount: number;
  jsCount: number;
  imageCount: number;
  externalLinks: number;
  internalLinks: number;
  metaTitle: string;
  metaDescription: string;
}
