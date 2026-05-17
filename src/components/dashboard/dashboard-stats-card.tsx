import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DashboardStatsCard({ title, value, detail }: { title: React.ReactNode; value: string | number; detail?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-black text-primary">{value}</div>
        {detail ? <p className="mt-1 text-sm text-muted-foreground">{detail}</p> : null}
      </CardContent>
    </Card>
  );
}
