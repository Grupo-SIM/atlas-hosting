"use client";

import { AlertTriangle, CheckCircle, Clock } from "lucide-react";
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

export function HostingOverview() {
  const services = [
    {
      domain: "mycompany.com",
      id: 1,
      name: "Website Hosting",
      nextRenewal: "May 15, 2025",
      status: "active",
      totalBandwidth: 100,
      totalStorage: 20,
      usedBandwidth: 28,
      usedStorage: 3.2,
    },
    {
      domain: "shop.mycompany.com",
      id: 2,
      name: "E-commerce Store",
      nextRenewal: "Jun 22, 2025",
      status: "active",
      totalBandwidth: 200,
      totalStorage: 50,
      usedBandwidth: 75,
      usedStorage: 8.5,
    },
    {
      domain: "blog.mycompany.com",
      id: 3,
      name: "Blog",
      nextRenewal: "Apr 30, 2025",
      status: "maintenance",
      totalBandwidth: 50,
      totalStorage: 10,
      usedBandwidth: 12,
      usedStorage: 1.8,
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
          <TabsList className="mb-4 grid grid-cols-3">
            <TabsTrigger value="website">Website</TabsTrigger>
            <TabsTrigger value="ecommerce">E-commerce</TabsTrigger>
            <TabsTrigger value="blog">Blog</TabsTrigger>
          </TabsList>

          {services.map(service => (
            <TabsContent
              key={service.id}
              value={service.name.toLowerCase().replace(/\s+/g, "")}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{service.domain}</h3>
                    <div className="mt-1 flex items-center">
                      {service.status === "active" ? (
                        <Badge
                          className="border-green-200 bg-green-500/10 text-green-500 dark:border-green-800"
                          variant="outline"
                        >
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Active
                        </Badge>
                      ) : service.status === "maintenance" ? (
                        <Badge
                          className="border-amber-200 bg-amber-500/10 text-amber-500 dark:border-amber-800"
                          variant="outline"
                        >
                          <Clock className="mr-1 h-3 w-3" />
                          Maintenance
                        </Badge>
                      ) : (
                        <Badge
                          className="border-red-200 bg-red-500/10 text-red-500 dark:border-red-800"
                          variant="outline"
                        >
                          <AlertTriangle className="mr-1 h-3 w-3" />
                          Issues
                        </Badge>
                      )}
                      <span className="ml-3 text-muted-foreground text-xs">
                        Renews on {service.nextRenewal}
                      </span>
                    </div>
                  </div>
                  <Badge className="ml-2" variant="outline">
                    {service.totalStorage} GB
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm">Storage</span>
                      <span className="font-medium text-sm">
                        {service.usedStorage} GB / {service.totalStorage} GB
                      </span>
                    </div>
                    <Progress
                      className="h-2"
                      value={(service.usedStorage / service.totalStorage) * 100}
                    />
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm">Bandwidth</span>
                      <span className="font-medium text-sm">
                        {service.usedBandwidth} GB / {service.totalBandwidth} GB
                      </span>
                    </div>
                    <Progress
                      className="h-2"
                      value={
                        (service.usedBandwidth / service.totalBandwidth) * 100
                      }
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
