"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, AlertTriangle } from "lucide-react";

export function ServerStatus() {
  const services = [
    { name: "Web Server", status: "operational", uptime: "99.98%" },
    { name: "Database Server", status: "operational", uptime: "99.95%" },
    { name: "Email Server", status: "issues", uptime: "98.72%" },
    { name: "DNS Server", status: "operational", uptime: "100%" },
    { name: "FTP Server", status: "operational", uptime: "99.99%" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Status</CardTitle>
        <CardDescription>Current status of your services</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {services.map((service, index) => (
            <div
              key={index}
              className="flex items-center justify-between border-b last:border-0 pb-3 last:pb-0"
            >
              <div>
                <p className="font-medium">{service.name}</p>
                <p className="text-xs text-muted-foreground">
                  Uptime: {service.uptime}
                </p>
              </div>
              <div className="flex items-center">
                {service.status === "operational" ? (
                  <div className="flex items-center text-green-500">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span className="text-sm">Operational</span>
                  </div>
                ) : (
                  <div className="flex items-center text-amber-500">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    <span className="text-sm">Minor Issues</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
