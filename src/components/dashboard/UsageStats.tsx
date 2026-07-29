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
    { name: "Disk Space", percentage: 24.8, total: 50, used: 12.4 },
    { name: "Bandwidth", percentage: 32.8, total: 500, used: 164 },
    { name: "Databases", percentage: 30, total: 10, used: 3 },
    { name: "Email Accounts", percentage: 25, total: 20, used: 5 },
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
            <div className="mb-1 flex items-center justify-between">
              <span className="font-medium text-sm">{resource.name}</span>
              <span className="text-muted-foreground text-sm">
                {resource.used} / {resource.total}
                {resource.name === "Disk Space" || resource.name === "Bandwidth"
                  ? " GB"
                  : ""}
              </span>
            </div>
            <div className="flex items-center">
              <Progress className="h-2 flex-1" value={resource.percentage} />
              <span className="ml-2 w-10 text-right font-medium text-xs">
                {resource.percentage}%
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
