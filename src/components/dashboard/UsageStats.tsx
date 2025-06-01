"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function UsageStats() {
  const resources = [
    { name: "Disk Space", used: 12.4, total: 50, percentage: 24.8 },
    { name: "Bandwidth", used: 164, total: 500, percentage: 32.8 },
    { name: "Databases", used: 3, total: 10, percentage: 30 },
    { name: "Email Accounts", used: 5, total: 20, percentage: 25 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resource Usage</CardTitle>
        <CardDescription>
          Current usage of your allocated resources
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {resources.map((resource, index) => (
          <div key={index}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">{resource.name}</span>
              <span className="text-sm text-muted-foreground">
                {resource.used} / {resource.total}
                {resource.name === "Disk Space" || resource.name === "Bandwidth"
                  ? " GB"
                  : ""}
              </span>
            </div>
            <div className="flex items-center">
              <Progress value={resource.percentage} className="h-2 flex-1" />
              <span className="text-xs font-medium ml-2 w-10 text-right">
                {resource.percentage}%
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
