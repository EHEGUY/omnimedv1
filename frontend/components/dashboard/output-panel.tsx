'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyMedia, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty';

interface AnalysisResult {
  findings: string;
  impression: string;
}

interface OutputPanelProps {
  result: AnalysisResult | null;
  isLoading: boolean;
}

export default function OutputPanel({ result, isLoading }: OutputPanelProps) {
  return (
    <Card className="border border-border">
      <CardHeader className="border-b border-border">
        <CardTitle className="text-lg">Analysis Report</CardTitle>
        <CardDescription>AI-Generated Clinical Insights</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {isLoading ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32 bg-muted" />
              <Skeleton className="h-20 w-full bg-muted" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 bg-muted" />
              <Skeleton className="h-20 w-full bg-muted" />
            </div>
          </div>
        ) : result ? (
          <div className="space-y-6">
            {/* Findings Section */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Findings</h3>
              <p className="text-sm leading-relaxed text-foreground/90">
                {result.findings}
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Impression Section */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Impression</h3>
              <p className="text-sm leading-relaxed text-foreground/90">
                {result.impression}
              </p>
            </div>

            {/* Footer Note */}
            <div className="rounded-lg bg-muted/50 px-3 py-2">
              <p className="text-xs text-muted-foreground">
                💡 This analysis is AI-generated and should be reviewed by a qualified healthcare professional before clinical use.
              </p>
            </div>
          </div>
        ) : (
          <Empty>
            <EmptyMedia variant="icon">📋</EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>No Analysis Yet</EmptyTitle>
              <EmptyDescription>Upload a scan and generate a report to view results here</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  );
}
