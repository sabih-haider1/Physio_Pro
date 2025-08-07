
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, FileText, Clock, ArrowRight, UserPlus, FileSignature, Layers, ListChecks, BarChart3 as BarChartIcon, LineChart as LineChartIcon, Activity, DollarSign, UserMinus, CheckSquare } from "lucide-react";
import Link from "next/link";
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend as RechartsLegend, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

// Mock data - replace with actual data fetching
const summaryStats = [
  { title: "Monthly Revenue", value: "$12,345", icon: DollarSign, change: "+5.2% from last month", color: "text-green-600", bgColor: "bg-green-100" },
  { title: "New Subscribers", value: "42", icon: UserPlus, change: "this month", color: "text-blue-600", bgColor: "bg-blue-100" },
  { title: "Active Subscriptions", value: "457", icon: ListChecks, change: "+12 from last month", color: "text-purple-600", bgColor: "bg-purple-100" },
  { title: "Churned Accounts", value: "8", icon: UserMinus, change: "this month", color: "text-red-600", bgColor: "bg-red-100" },
];

const pendingActions = [
  { id: "1", type: "Subscription", user: "Dr. Emily Carter", date: "2024-07-28", link: "/admin/billing" },
  { id: "2", type: "User Approval", user: "John B. (Patient)", date: "2024-07-28", link: "/admin/users" },
  { id: "3", type: "Exercise Submission", user: "Dr. Alex Chen", date: "2024-07-27", link: "/admin/exercises" },
  { id: "4", type: "Subscription", user: "Dr. Priya Sharma", date: "2024-07-26", link: "/admin/billing" },
];

const userRegistrationsData = [
  { month: "Jan", newUsers: 20 },
  { month: "Feb", newUsers: 35 },
  { month: "Mar", newUsers: 40 },
  { month: "Apr", newUsers: 55 },
  { month: "May", newUsers: 60 },
  { month: "Jun", newUsers: 75 },
  { month: "Jul", newUsers: 80 },
];

const userRegistrationsChartConfig = {
  newUsers: {
    label: "New Users",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

const exerciseCategoriesData = [
  { category: "Strength", count: 250, fill: "hsl(var(--chart-1))" },
  { category: "Flexibility", count: 180, fill: "hsl(var(--chart-2))" },
  { category: "Cardio", count: 120, fill: "hsl(var(--chart-3))" },
  { category: "Balance", count: 90, fill: "hsl(var(--chart-4))" },
  { category: "Mobility", count: 150, fill: "hsl(var(--chart-5))" },
];

const exerciseCategoriesChartConfig = {
  count: {
    label: "Exercises",
  },
} satisfies ChartConfig;


export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of system activity, analytics, and pending actions.</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {summaryStats.map((stat) => (
          <Card key={stat.title} className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-md ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Charts */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-headline flex items-center">
              <LineChartIcon className="mr-2 h-5 w-5 text-primary" />
              User Registrations
            </CardTitle>
            <CardDescription>New user sign-ups over the past months.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ChartContainer config={userRegistrationsChartConfig} className="w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userRegistrationsData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                  />
                  <Line dataKey="newUsers" type="monotone" stroke="var(--color-newUsers)" strokeWidth={2} dot={true} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-headline flex items-center">
              <BarChartIcon className="mr-2 h-5 w-5 text-primary" />
              Exercise Categories
            </CardTitle>
            <CardDescription>Distribution of exercises in the library.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
             <ChartContainer config={exerciseCategoriesChartConfig} className="w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={exerciseCategoriesData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis dataKey="category" type="category" tickLine={false} axisLine={false} tickMargin={8} width={80} />
                   <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                  />
                  <Bar dataKey="count" radius={4}>
                     {exerciseCategoriesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>


      {/* Pending Actions Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-headline flex items-center">
            <ListChecks className="mr-2 h-5 w-5 text-primary" />
            Pending Actions
          </CardTitle>
          <CardDescription>Tasks requiring administrative review and action.</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingActions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task Type</TableHead>
                  <TableHead>User / Item</TableHead>
                  <TableHead>Date Submitted</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingActions.map((action) => (
                  <TableRow key={action.id} className="hover:bg-muted/50">
                    <TableCell>
                      <span className="flex items-center">
                        {action.type === "Subscription" && <FileSignature className="h-4 w-4 mr-2 text-green-600" />}
                        {action.type === "User Approval" && <UserPlus className="h-4 w-4 mr-2 text-blue-600" />}
                        {action.type === "Exercise Submission" && <CheckSquare className="h-4 w-4 mr-2 text-purple-600" />}
                        {action.type}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">{action.user}</TableCell>
                    <TableCell>{action.date}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={action.link}>Review <ArrowRight className="ml-1 h-3 w-3" /></Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <CheckSquare className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <h3 className="text-lg font-medium">All Caught Up!</h3>
              <p>No pending actions at the moment.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

