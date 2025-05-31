"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Users,
  HardDrive,
  Globe,
  ArrowUpRight,
  CreditCard,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Organization } from "@/lib/db/schema/tables/organization";
import type { User } from "@/lib/db/schema/tables/user";
import { useEffect, useState } from "react";

interface OrganizationOverviewProps {
  organization: {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    members: User[];
    owner: User | null;
    [key: string]: unknown;
  };
}

export function OrganizationOverview({ organization }: OrganizationOverviewProps) {
  const [memberGrowthData, setMemberGrowthData] = useState<{ month: string; members: number }[]>([]);
  
  useEffect(() => {
    // Generate demo data based on organization information
    const generateData = () => {
      const memberCount = organization.members?.length || 0;
      // Generate 6 months of data with a slight upward trend
      const today = new Date();
      const months: { month: string; members: number }[] = [];
      
      for (let i = 5; i >= 0; i--) {
        const month = new Date(today);
        month.setMonth(today.getMonth() - i);
        
        // Start with a value lower than current member count and gradually increase
        const growthFactor = 0.85 + (i * 0.03);
        const value = Math.max(1, Math.floor(memberCount * growthFactor));
        
        months.push({
          month: month.toLocaleString('default', { month: 'short' }),
          members: value
        });
      }
      
      return months;
    };
    
    setMemberGrowthData(generateData());
  }, [organization.members?.length]);

  return (
    <div className="space-y-6">
      {/* Organization Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organization.members?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Organization members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Domains
            </CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground mt-1">
              All domains active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">75 GB</div>
            <p className="text-xs text-muted-foreground mt-1">
              of 100 GB quota
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organization Name</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organization.name}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Created on {new Date(organization.createdAt).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Subscription & Usage */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Subscription & Usage</CardTitle>
              <CardDescription>
                Current plan details and resource usage
              </CardDescription>
            </div>
            <Button>
              Manage Subscription
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Pro Plan</p>
              <p className="text-sm text-muted-foreground">
                Active until May 30, 2026
              </p>
            </div>
            <Button variant="outline">Upgrade Plan</Button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Storage Usage</p>
                  <p className="text-sm text-muted-foreground">
                    75 GB of 100 GB used
                  </p>
                </div>
                <span className="text-sm font-medium">75%</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium">API Calls</p>
                  <p className="text-sm text-muted-foreground">
                    150,000 of 200,000 used this month
                  </p>
                </div>
                <span className="text-sm font-medium">75%</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Team Members</p>
                  <p className="text-sm text-muted-foreground">
                    {organization.members?.length || 0} of 75 seats used
                  </p>
                </div>
                <span className="text-sm font-medium">
                  {Math.round(((organization.members?.length || 0) / 75) * 100)}%
                </span>
              </div>
              <Progress 
                value={Math.round(((organization.members?.length || 0) / 75) * 100)} 
                className="h-2" 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Member Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Member Growth</CardTitle>
          <CardDescription>
            Team member growth over the past 6 months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={memberGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="members"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
