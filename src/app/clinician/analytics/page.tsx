
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, Activity, TrendingUp, TrendingDown, ListChecks, CheckCircle, AlertCircle, PieChartIcon, Download, UserCog } from "lucide-react";
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend as RechartsLegend, Pie, Cell as RechartsCell, PieChart } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { mockPatientsData } from '@/app/clinician/patients/page';
import { clinicianAssignedPrograms } from '@/app/clinician/programs/page';
import { cn } from '@/lib/utils';

// Mock Data for existing charts
const overallAdherenceData = [
  { month: "Jan", adherence: 75 }, { month: "Feb", adherence: 78 }, { month: "Mar", adherence: 82 },
  { month: "Apr", adherence: 80 }, { month: "May", adherence: 85 }, { month: "Jun", adherence: 88 },
  { month: "Jul", adherence: 86 },
];
const overallAdherenceConfig = { adherence: { label: "Adherence %", color: "hsl(var(--chart-1))" } } satisfies ChartConfig;

const adherenceTiersData = [
  { name: 'High (80-100%)', value: mockPatientsData.filter(p => (p.overallAdherence || 0) >= 80).length, fill: 'hsl(var(--chart-1))' },
  { name: 'Medium (60-79%)', value: mockPatientsData.filter(p => (p.overallAdherence || 0) >= 60 && (p.overallAdherence || 0) < 80).length, fill: 'hsl(var(--chart-2))' },
  { name: 'Low (<60%)', value: mockPatientsData.filter(p => (p.overallAdherence || 0) < 60).length, fill: 'hsl(var(--chart-4))' },
];
const adherenceTiersConfig = { value: { label: "Patients" } } satisfies ChartConfig;

const nonAdherentExercisesData = [
  { name: "Wall Slides", nonCompletionRate: 35, fill: 'hsl(var(--chart-5))' },
  { name: "Single Leg Squat", nonCompletionRate: 28, fill: 'hsl(var(--chart-3))'},
  { name: "Plank (Advanced)", nonCompletionRate: 22, fill: 'hsl(var(--chart-2))' },
  { name: "Foam Rolling ITB", nonCompletionRate: 15, fill: 'hsl(var(--chart-4))' },
];
const nonAdherentExercisesConfig = { nonCompletionRate: { label: "Non-Completion %" } } satisfies ChartConfig;


export default function AdherenceAnalyticsPage() {
  const { toast } = useToast();

  const getAdherenceStatus = (adherence?: number): { text: string; variant: "default" | "secondary" | "destructive" | "outline" } => {
    if (adherence === undefined || adherence === null) return { text: "N/A", variant: "outline" };
    if (adherence >= 80) return { text: "On Track", variant: "default" };
    if (adherence >= 60) return { text: "Needs Attention", variant: "secondary" };
    return { text: "At Risk", variant: "destructive" };
  };

  const escapeCSVField = (field: any): string => {
    if (field === null || field === undefined) return '';
    let stringField = String(field);
    if (stringField.includes('"') || stringField.includes(',') || stringField.includes('\n')) {
      stringField = `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
  };

  const handleExportAdherenceCSV = () => {
    const headers = ["Patient ID", "Patient Name", "Email", "Current Program ID", "Current Program Name", "Overall Adherence (%)", "Last Activity", "Adherence Status"];
    const csvRows = [headers.join(',')];

    mockPatientsData.forEach(patient => {
      const program = clinicianAssignedPrograms.find(p => p.id === patient.currentProgramId);
      const statusInfo = getAdherenceStatus(patient.overallAdherence);
      const row = [
        escapeCSVField(patient.id),
        escapeCSVField(patient.name),
        escapeCSVField(patient.email),
        escapeCSVField(patient.currentProgramId),
        escapeCSVField(program?.name),
        escapeCSVField(patient.overallAdherence),
        escapeCSVField(patient.lastActivity ? format(new Date(patient.lastActivity), 'yyyy-MM-dd') : ''),
        escapeCSVField(statusInfo.text),
      ];
      csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'patient_adherence_report.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({ title: "Report Exported", description: "Patient adherence report CSV downloaded." });
  };


  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary">Patient Adherence Analytics</h1>
          <p className="text-muted-foreground">Track patient adherence, program effectiveness, and identify areas for intervention.</p>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Overall Adherence", value: `${(mockPatientsData.reduce((acc, p) => acc + (p.overallAdherence || 0), 0) / mockPatientsData.length).toFixed(0)}%`, icon: CheckCircle, trend: "+3% this month", color: "text-green-600" },
          { title: "At-Risk Patients", value: `${mockPatientsData.filter(p => (p.overallAdherence || 0) < 60).length}`, icon: AlertCircle, trend: "2 new this week", color: "text-red-600" },
          { title: "Avg. Program Completion", value: "75%", icon: ListChecks, trend: "Stable", color: "text-blue-600" },
          { title: "Feedback Rate", value: "68%", icon: Users, trend: "+5% this month", color: "text-purple-600" },
        ].map(stat => (
          <Card key={stat.title} className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color || 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-headline flex items-center"><TrendingUp className="mr-2 h-5 w-5 text-primary"/>Overall Patient Adherence Trend</CardTitle>
            <CardDescription>Monthly average adherence rate across all your patients.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] pr-2">
            <ChartContainer config={overallAdherenceConfig} className="w-full h-full">
              <LineChart data={overallAdherenceData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis unit="%" tickLine={false} axisLine={false} tickMargin={8} domain={[0, 100]}/>
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                <Line type="monotone" dataKey="adherence" stroke="var(--color-adherence)" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-headline flex items-center"><PieChartIcon className="mr-2 h-5 w-5 text-primary"/>Patients by Adherence Tier</CardTitle>
            <CardDescription>Distribution of patients based on their adherence levels.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <ChartContainer config={adherenceTiersConfig} className="w-full aspect-square max-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent nameKey="name" hideIndicator />} />
                  <Pie data={adherenceTiersData} dataKey="value" nameKey="name" labelLine={false}
                     label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
                        const RADIAN = Math.PI / 180;
                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                        return (percent * 100) > 5 ? (
                          <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="10px" fontWeight="bold">
                            {`${(percent * 100).toFixed(0)}%`}
                          </text>
                        ) : null;
                      }}
                  >
                    {adherenceTiersData.map((entry, index) => (
                      <RechartsCell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                   <RechartsLegend verticalAlign="bottom" content={({ payload }) => (
                      <div className="flex items-center justify-center gap-2 text-xs mt-2">
                        {payload?.map((entry: any) => (
                          <div key={entry.value} className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            {entry.value}
                          </div>
                        ))}
                      </div>
                    )} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-headline flex items-center"><BarChart3 className="mr-2 h-5 w-5 text-primary"/>Most Common Non-Adherent Exercises</CardTitle>
          <CardDescription>Exercises frequently skipped or marked incomplete by patients.</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px] pr-2">
           <ChartContainer config={nonAdherentExercisesConfig} className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={nonAdherentExercisesData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" unit="%" tickLine={false} axisLine={false} tickMargin={8} domain={[0, 'dataMax + 5']}/>
                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tickMargin={8} width={120} />
                 <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
                <Bar dataKey="nonCompletionRate" radius={4}>
                    {nonAdherentExercisesData.map((entry, index) => (
                      <RechartsCell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle className="text-xl font-headline flex items-center"><UserCog className="mr-2 h-5 w-5 text-primary"/>Patient Adherence Report</CardTitle>
            <CardDescription>Detailed adherence metrics for each patient.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleExportAdherenceCSV}>
            <Download className="mr-2 h-4 w-4" /> Export Report (CSV)
          </Button>
        </CardHeader>
        <CardContent>
           <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Patient Name</TableHead>
                    <TableHead>Assigned Program</TableHead>
                    <TableHead className="text-center">Adherence</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {mockPatientsData.map(patient => {
                    const program = clinicianAssignedPrograms.find(p => p.id === patient.currentProgramId);
                    const statusInfo = getAdherenceStatus(patient.overallAdherence);
                    return (
                        <TableRow key={patient.id}>
                            <TableCell>
                                <Link href={`/clinician/patients/${patient.id}`} className="font-medium text-primary hover:underline">
                                    {patient.name}
                                </Link>
                                <div className="text-xs text-muted-foreground">{patient.email}</div>
                            </TableCell>
                            <TableCell className="text-sm">{program?.name || 'N/A'}</TableCell>
                            <TableCell className="text-center font-semibold">
                                <span className={cn(
                                    statusInfo.variant === 'default' && 'text-green-600',
                                    statusInfo.variant === 'secondary' && 'text-yellow-600',
                                    statusInfo.variant === 'destructive' && 'text-red-600',
                                )}>
                                    {patient.overallAdherence !== undefined ? `${patient.overallAdherence}%` : 'N/A'}
                                </span>
                            </TableCell>
                            <TableCell className="text-xs">{patient.lastActivity ? format(new Date(patient.lastActivity), 'MMM d, yyyy') : 'N/A'}</TableCell>
                            <TableCell className="text-center">
                                <Badge variant={statusInfo.variant} className="text-xs">{statusInfo.text}</Badge>
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
           </Table>
        </CardContent>
      </Card>

    </div>
  );
}

