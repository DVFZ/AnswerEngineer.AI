/**
 * AnswerEngineer.AI - 7-Point GEO Audit Engine
 * Orchestrates all auditors and produces final GEO score
 */

import { AuditResult, PageData } from './types';
import { PageCollector } from './page-collector';
import { WebsiteStructureAuditor } from './auditors/website-structure';
import { SchemaAuditor } from './auditors/schema';
import { ContentFreshnessAuditor } from './auditors/content-freshness';
import { JsHandlingAuditor } from './auditors/js-handling';
import { AuthorityAuditor } from './auditors/authority';
import { CTRSignalsAuditor } from './auditors/ctr-signals';
import { CoverageAuditor } from './auditors/coverage';

export class GEOAudit {
  /**
   * Run the complete 7-point GEO audit
   * Returns audit results with overall score
   */
  static async run(): Promise<AuditResult> {
    const startTime = performance.now();

    // Collect page data
    const pageData = PageCollector.collect();
    console.log('[GEO Audit] Page data collected:', pageData);

    // Run all 7 auditors in parallel
    const results = await Promise.all([
      WebsiteStructureAuditor.audit(pageData),
      SchemaAuditor.audit(pageData),
      ContentFreshnessAuditor.audit(pageData),
      JsHandlingAuditor.audit(pageData),
      AuthorityAuditor.audit(pageData),
      CTRSignalsAuditor.audit(pageData),
      CoverageAuditor.audit(pageData),
    ]);

    const [websiteStructure, schema, contentFreshness, jsHandling, authority, ctrSignals, coverage] = results;

    // Calculate weighted overall score
    const overallScore = this.calculateWeightedScore([
      websiteStructure,
      schema,
      contentFreshness,
      jsHandling,
      authority,
      ctrSignals,
      coverage,
    ]);

    // Generate recommendations
    const recommendations = this.generateRecommendations([
      websiteStructure,
      schema,
      contentFreshness,
      jsHandling,
      authority,
      ctrSignals,
      coverage,
    ]);

    const duration = performance.now() - startTime;
    console.log(`[GEO Audit] Completed in ${duration.toFixed(2)}ms`);

    return {
      url: pageData.url,
      timestamp: Date.now(),
      overallScore,
      points: {
        websiteStructure,
        schema,
        contentFreshness,
        jsHandling,
        authority,
        ctrSignals,
        coverage,
      },
      recommendations,
    };
  }

  private static calculateWeightedScore(
    points: Array<{ score: number; weight: number }>
  ): number {
    const totalWeight = points.reduce((sum, p) => sum + p.weight, 0);
    const weightedSum = points.reduce((sum, p) => sum + p.score * p.weight, 0);
    const score = Math.round((weightedSum / totalWeight) * 100) / 100;
    return Math.min(100, Math.max(0, score));
  }

  private static generateRecommendations(points: any[]): string[] {
    const recommendations: string[] = [];

    points.forEach((point) => {
      // Extract critical issues (fails)
      const failures = point.findings.filter((f: string) => f.startsWith('✗'));
      failures.forEach((f: string) => {
        recommendations.push(`[${point.name}] ${f}`);
      });

      // Extract warnings
      const warnings = point.findings.filter((f: string) => f.startsWith('⚠'));
      if (warnings.length > 0) {
        recommendations.push(`[${point.name}] Priority: ${warnings[0]}`);
      }
    });

    // Sort by severity
    return recommendations.sort((a, b) => {
      const aIsCritical = a.includes('✗');
      const bIsCritical = b.includes('✗');
      if (aIsCritical && !bIsCritical) return -1;
      if (!aIsCritical && bIsCritical) return 1;
      return 0;
    });
  }

  /**
   * Format audit result for display
   */
  static format(result: AuditResult): string {
    let output = '\n📊 GEO AUDIT RESULTS\n';
    output += `${'='.repeat(50)}\n\n`;
    output += `🎯 Overall GEO Score: ${result.overallScore}/100\n`;
    output += `URL: ${result.url}\n`;
    output += `Time: ${new Date(result.timestamp).toLocaleString()}\n\n`;

    output += 'DETAILED RESULTS:\n';
    output += `${'-'.repeat(50)}\n`;

    Object.entries(result.points).forEach(([_, point]: [string, any]) => {
      const icon = point.status === 'pass' ? '✅' : point.status === 'warning' ? '⚠️' : '❌';
      output += `\n${icon} ${point.name} (${point.score}/100)\n`;
      point.findings.forEach((finding: string) => {
        output += `   ${finding}\n`;
      });
    });

    if (result.recommendations.length > 0) {
      output += `\n📋 TOP RECOMMENDATIONS:\n`;
      output += `${'-'.repeat(50)}\n`;
      result.recommendations.slice(0, 5).forEach((rec) => {
        output += `• ${rec}\n`;
      });
    }

    return output;
  }
}
