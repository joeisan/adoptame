"use client";

import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminMetrics } from "@/types/app";

const COLORS = ["#006d41", "#feb246", "#f17464", "#4bae78", "#5e5f5b", "#94f7bb"];

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-72">{children}</CardContent>
    </Card>
  );
}

export function AdminCharts({ metrics }: { metrics: AdminMetrics }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ChartCard title="Usuarios registrados">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart data={metrics.usersByPeriod}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="users" fill="#006d41" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Publicaciones por categoría">
        <ResponsiveContainer height="100%" width="100%">
          <PieChart>
            <Pie data={metrics.listingsByCategory} dataKey="value" nameKey="name" outerRadius={90}>
              {metrics.listingsByCategory.map((entry, index) => (
                <Cell fill={COLORS[index % COLORS.length]} key={entry.name} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Publicaciones por provincia">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart data={metrics.listingsByProvince}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#feb246" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Estados y reportes">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart data={[...metrics.listingsByStatus, ...metrics.reportsByStatus.map((item) => ({ ...item, name: `Reporte ${item.name}` }))]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#f17464" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
