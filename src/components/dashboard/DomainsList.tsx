"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExternalLink, Globe, MoreHorizontal, RefreshCw } from "lucide-react";
import Link from "next/link";

export function DomainsList() {
  const domains = [
    {
      id: 1,
      name: "mycompany.com",
      registrationDate: "Apr 12, 2024",
      expiryDate: "Apr 12, 2025",
      autoRenew: true,
      status: "active",
    },
    {
      id: 2,
      name: "shop.mycompany.com",
      registrationDate: "Jun 22, 2024",
      expiryDate: "Jun 22, 2025",
      autoRenew: true,
      status: "active",
    },
    {
      id: 3,
      name: "blog.mycompany.com",
      registrationDate: "Apr 30, 2024",
      expiryDate: "Apr 30, 2025",
      autoRenew: false,
      status: "active",
    },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <CardTitle>Domains</CardTitle>
          <CardDescription>Manage your registered domains</CardDescription>
        </div>
        <Link href="/domains">
          <Button>
            <Globe className="mr-2 h-4 w-4" />
            Register Domain
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain Name</TableHead>
                <TableHead className="hidden sm:table-cell">Registration Date</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead className="hidden md:table-cell">Auto-Renew</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {domains.map((domain) => (
                <TableRow key={domain.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <Badge
                        variant="outline"
                        className={
                          domain.status === "active"
                            ? "bg-green-500/10 text-green-500 border-green-200 dark:border-green-800 mr-2 h-2 w-2 p-0 rounded-full"
                            : "bg-amber-500/10 text-amber-500 border-amber-200 dark:border-amber-800 mr-2 h-2 w-2 p-0 rounded-full"
                        }
                      />
                      {domain.name}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{domain.registrationDate}</TableCell>
                  <TableCell>{domain.expiryDate}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {domain.autoRenew ? (
                      <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-200 dark:border-green-800">
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Auto-Renew
                      </Badge>
                    ) : (
                      <Badge variant="outline">Manual</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Manage DNS</DropdownMenuItem>
                        <DropdownMenuItem>Renew Domain</DropdownMenuItem>
                        <DropdownMenuItem>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          <span>Open Website</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}