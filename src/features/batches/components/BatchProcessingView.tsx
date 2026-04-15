import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BatchProcessingViewProps {
  step: string;
  detail: string;
}

export function BatchProcessingView({ step, detail }: BatchProcessingViewProps) {
  return (
    <div className="flex justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Creating Batch...</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm font-medium">{step}</p>
          <p className="text-sm text-muted-foreground">{detail}</p>
        </CardContent>
      </Card>
    </div>
  );
}
