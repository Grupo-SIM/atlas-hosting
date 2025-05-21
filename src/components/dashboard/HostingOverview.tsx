"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";

export function HostingOverview() {
  const services = [
    {
      id: 1,
      name: "Website Hosting",
      domain: "mycompany.com",
      status: "active",
      usedStorage: 3.2,
      totalStorage: 20,
      usedBandwidth: 28,
      totalBandwidth: 100,
      nextRenewal: "May 15, 2025",
    },
    {
      id: 2,
      name: "E-commerce Store",
      domain: "shop.mycompany.com",
      status: "active",
      usedStorage: 8.5,
      totalStorage: 50,
      usedBandwidth: 75,
      totalBandwidth: 200,
      nextRenewal: "Jun 22, 2025",
    },
    {
      id: 3,
      name: "Blog",
      domain: "blog.mycompany.com",
      status: "maintenance",
      usedStorage: 1.8,
      totalStorage: 10,
      usedBandwidth: 12,
      totalBandwidth: 50,
      nextRenewal: "Apr 30, 2025",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hosting Services</CardTitle>
        <CardDescription>
          Overview of your current hosting services
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="website">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="website">Website</TabsTrigger>
            <TabsTrigger value="ecommerce">E-commerce</TabsTrigger>
            <TabsTrigger value="blog">Blog</TabsTrigger>
          </TabsList>

          {services.map((service) => (
            <TabsContent
              key={service.id}
              value={service.name.toLowerCase().replace(/\s+/g, "")}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{service.domain}</h3>
                    <div className="flex items-center mt-1">
                      {service.status === "active" ? (
                        <Badge
                          variant="outline"
                          className="bg-green-500/10 text-green-500 border-green-200 dark:border-green-800"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      ) : service.status === "maintenance" ? (
                        <Badge
                          variant="outline"
                          className="bg-amber-500/10 text-amber-500 border-amber-200 dark:border-amber-800"
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          Maintenance
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-red-500/10 text-red-500 border-red-200 dark:border-red-800"
                        >
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Issues
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground ml-3">
                        Renews on {service.nextRenewal}
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    {service.totalStorage} GB
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Storage</span>
                      <span className="text-sm font-medium">
                        {service.usedStorage} GB / {service.totalStorage} GB
                      </span>
                    </div>
                    <Progress
                      value={(service.usedStorage / service.totalStorage) * 100}
                      className="h-2"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Bandwidth</span>
                      <span className="text-sm font-medium">
                        {service.usedBandwidth} GB / {service.totalBandwidth} GB
                      </span>
                    </div>
                    <Progress
                      value={
                        (service.usedBandwidth / service.totalBandwidth) * 100
                      }
                      className="h-2"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
