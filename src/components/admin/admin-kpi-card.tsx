import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminKpiCard({ label, value }: { label: string; value: number | string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-black text-primary">{value}</p>
      </CardContent>
    </Card>
  );
}
