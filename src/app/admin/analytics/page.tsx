
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, Activity, FileText, TrendingUp, AlertTriangle, Search, Brain, UserCheck, ListChecks, UsersRound } from "lucide-react";
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend as RechartsLegend, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


// Mock Data for Charts
const monthlyRevenueData = [
  { month: "Jan", revenue: 4500 }, { month: "Feb", revenue: 5200 }, { month: "Mar", revenue: 6100 },
  { month: "Apr", revenue: 5800 }, { month: "May", revenue: 7200 }, { month: "Jun", revenue: 7900 },
  { month: "Jul", revenue: 8500 }
];
const monthlyRevenueChartConfig = { revenue: { label: "Revenue", color: "hsl(var(--chart-1))" } } satisfies ChartConfig;

const platformUsageData = [
  { day: "Mon", activeUsers: 120, programsCreated: 15 },
  { day: "Tue", activeUsers: 135, programsCreated: 18 },
  { day: "Wed", activeUsers: 150, programsCreated: 22 },
  { day: "Thu", activeUsers: 140, programsCreated: 20 },
  { day: "Fri", activeUsers: 160, programsCreated: 25 },
  { day: "Sat", activeUsers: 90, programsCreated: 10 },
  { day: "Sun", activeUsers: 80, programsCreated: 8 },
];
const platformUsageChartConfig = {
  activeUsers: { label: "Active Users", color: "hsl(var(--chart-2))" },
  programsCreated: { label: "Programs Created", color: "hsl(var(--chart-4))" },
} satisfies ChartConfig;

const exercisePopularityData = [
  { name: "Squats", usage: 250, fill: "hsl(var(--chart-1))" },
  { name: "Lunges", usage: 180, fill: "hsl(var(--chart-2))" },
  { name: "Plank", usage: 220, fill: "hsl(var(--chart-3))" },
  { name: "Bicep Curls", usage: 150, fill: "hsl(var(--chart-4))" },
  { name: "Bird Dog", usage: 190, fill: "hsl(var(--chart-5))" },
];
const exercisePopularityChartConfig = { usage: { label: "Usage Count" } } satisfies ChartConfig;

const aiInsights = [
    { id: "insight1", title: "Increased interest in 'Low Back Pain' programs", description: "Consider adding more diverse content or a featured program for this condition.", icon: Search, severity: "medium" },
    { id: "insight2", title: "Lower than average adherence for 'Post-ACL Advanced' template", description: "Review template difficulty or clarity. AI suggests breaking down complex exercises.", icon: AlertTriangle, severity: "high" },
    { id: "insight3", title: "AI model performance for exercise search is optimal", description: "Recent updates to the search algorithm show a 15% increase in relevant results for complex queries.", icon: Brain, severity: "low" },
];

const mostActiveCliniciansData = [
    { id: 'doc1', name: 'Dr. Ayesha Khan', avatarUrl: 'https://placehold.co/40x40.png?text=AK', programsCreated: 25, patientsManaged: 18, avgAdherence: 88 },
    { id: 'doc4', name: 'Dr. Ken Miles', avatarUrl: 'https://placehold.co/40x40.png?text=KM', programsCreated: 22, patientsManaged: 25, avgAdherence: 82 },
    { id: 'doc_new', name: 'Dr. Emily Carter', avatarUrl: 'https://placehold.co/40x40.png?text=EC', programsCreated: 18, patientsManaged: 15, avgAdherence: 90 },
];

const programCreationTrendsData = [
  { date: "Jan", count: 50 }, { date: "Feb", count: 65 }, { date: "Mar", count: 80 },
  { date: "Apr", count: 70 }, { date: "May", count: 95 }, { date: "Jun", count: 110 },
];
const programCreationTrendsConfig = { count: { label: "Programs Created", color: "hsl(var(--chart-3))" } } satisfies ChartConfig;


export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary">Platform Analytics</h1>
          <p className="text-muted-foreground">Detailed insights into platform usage, growth, and performance.</p>
        </div>
        <Button variant="outline">
          <FileText className="mr-2 h-4 w-4" /> Generate Report (Simulated)
        </Button>
      </div>

      {/* Key Metrics Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Users", value: "1,258", icon: UsersRound, trend: "+25 this week" },
          { title: "Active Clinicians", value: "157", icon: UserCheck, trend: "+5 this week" },
          { title: "Programs Created", value: "876", icon: ListChecks, trend: "+50 this month" },
          { title: "Exercises in Library", value: "2,500+", icon: BarChart3, trend: "Stable" },
        ].map(stat => (
          <Card key={stat.title} className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* AI-Driven Insights Section */}
      <Card className="shadow-md">
        <CardHeader>
            <CardTitle className="flex items-center text-xl font-headline">
              <Brain className="mr-2 h-6 w-6 text-primary"/> AI-Driven Platform Insights
            </CardTitle>
            <CardDescription>Automated analysis highlighting key trends and areas for attention.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {aiInsights.map(insight => (
                <div key={insight.id} className={cn("p-4 border rounded-lg flex items-start gap-3",
                    insight.severity === "high" && "bg-destructive/10 border-destructive",
                    insight.severity === "medium" && "bg-yellow-500/10 border-yellow-500",
                    insight.severity === "low" && "bg-green-500/10 border-green-500",
                )}>
                    <insight.icon className={cn("h-6 w-6 mt-0.5 shrink-0", 
                        insight.severity === "high" && "text-destructive",
                        insight.severity === "medium" && "text-yellow-600",
                        insight.severity === "low" && "text-green-600",
                    )} />
                    <div>
                        <h4 className="font-semibold">{insight.title}</h4>
                        <p className="text-sm text-muted-foreground">{insight.description}</p>
                    </div>
                </div>
            ))}
        </CardContent>
      </Card>


      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-headline flex items-center"><TrendingUp className="mr-2 h-5 w-5 text-primary"/>Monthly Recurring Revenue (MRR)</CardTitle>
            <CardDescription>Track your platform's revenue growth over time.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] pr-2">
            <ChartContainer config={monthlyRevenueChartConfig} className="w-full h-full">
              <LineChart data={monthlyRevenueData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickFormatter={(value) => `$${value/1000}k`} tickLine={false} axisLine={false} tickMargin={8}/>
                <ChartTooltip cursor={true} content={<ChartTooltipContent indicator="line" />} />
                <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} dot={{ r: 4, fill: "var(--color-revenue)" }} activeDot={{ r: 6 }} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-headline flex items-center"><Activity className="mr-2 h-5 w-5 text-primary"/>Platform Usage This Week</CardTitle>
            <CardDescription>Daily active users and programs created.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] pr-2">
            <ChartContainer config={platformUsageChartConfig} className="w-full h-full">
              <BarChart data={platformUsageData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent indicator="dashed" />} />
                <RechartsLegend verticalAlign="top" wrapperStyle={{paddingBottom: '10px'}}/>
                <Bar dataKey="activeUsers" fill="var(--color-activeUsers)" radius={4} />
                <Bar dataKey="programsCreated" fill="var(--color-programsCreated)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-headline flex items-center"><BarChart3 className="mr-2 h-5 w-5 text-primary"/>Exercise Popularity</CardTitle>
          <CardDescription>Most frequently used exercises in programs.</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px] pr-2">
           <ChartContainer config={exercisePopularityChartConfig} className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={exercisePopularityData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tickMargin={8} width={100} />
                 <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <Bar dataKey="usage" radius={4}>
                   {exercisePopularityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* New Detailed Analytics Sections */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-headline flex items-center"><UserCheck className="mr-2 h-5 w-5 text-primary"/>Most Active Clinicians</CardTitle>
            <CardDescription>Top performing clinicians by activity metrics.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Clinician</TableHead>
                  <TableHead className="text-center">Programs</TableHead>
                  <TableHead className="text-center">Patients</TableHead>
                  <TableHead className="text-right">Adherence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mostActiveCliniciansData.map(clinician => (
                  <TableRow key={clinician.id}>
                    <TableCell className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={clinician.avatarUrl} alt={clinician.name} data-ai-hint="person professional" />
                        <AvatarFallback>{clinician.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      {clinician.name}
                    </TableCell>
                    <TableCell className="text-center">{clinician.programsCreated}</TableCell>
                    <TableCell className="text-center">{clinician.patientsManaged}</TableCell>
                    <TableCell className="text-right text-green-600 font-medium">{clinician.avgAdherence}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-headline flex items-center"><ListChecks className="mr-2 h-5 w-5 text-primary"/>Program Creation Trends</CardTitle>
            <CardDescription>Number of new exercise programs created over time.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] pr-2">
            <ChartContainer config={programCreationTrendsConfig} className="w-full h-full">
              <LineChart data={programCreationTrendsData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8}/>
                <ChartTooltip cursor={true} content={<ChartTooltipContent indicator="line" />} />
                <Line type="monotone" dataKey="count" stroke="var(--color-count)" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      
      <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-headline flex items-center"><Users className="mr-2 h-5 w-5 text-primary"/>Patient Engagement Overview</CardTitle>
            <CardDescription>Key metrics for patient activity and engagement.</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4 text-center">
             <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-3xl font-bold text-primary">78%</p>
                <p className="text-sm text-muted-foreground">Average Program Adherence</p>
             </div>
             <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-3xl font-bold text-primary">65%</p>
                <p className="text-sm text-muted-foreground">Feedback Submission Rate</p>
             </div>
             <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-3xl font-bold text-primary">12k</p>
                <p className="text-sm text-muted-foreground">Total Exercises Completed</p>
             </div>
          </CardContent>
        </Card>

    </div>
  );
}
