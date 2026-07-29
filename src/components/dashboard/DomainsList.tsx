"use client";

import { ExternalLink, Globe, MoreHorizontal, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function DomainsList() {
  const domains = [
    {
      autoRenew: true,
      expiryDate: "Apr 12, 2025",
      id: 1,
      name: "mycompany.com",
      registrationDate: "Apr 12, 2024",
      status: "active",
    },
    {
      autoRenew: true,
      expiryDate: "Jun 22, 2025",
      id: 2,
      name: "shop.mycompany.com",
      registrationDate: "Jun 22, 2024",
      status: "active",
    },
    {
      autoRenew: false,
      expiryDate: "Apr 30, 2025",
      id: 3,
      name: "blog.mycompany.com",
      registrationDate: "Apr 30, 2024",
      status: "active",
    },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
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
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain Name</TableHead>
                <TableHead className="hidden sm:table-cell">
                  Registration Date
                </TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead className="hidden md:table-cell">
                  Auto-Renew
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {domains.map(domain => (
                <TableRow key={domain.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <Badge
                        className={
                          domain.status === "active"
                            ? "mr-2 h-2 w-2 rounded-full border-green-200 bg-green-500/10 p-0 text-green-500 dark:border-green-800"
                            : "mr-2 h-2 w-2 rounded-full border-amber-200 bg-amber-500/10 p-0 text-amber-500 dark:border-amber-800"
                        }
                        variant="outline"
                      />
                      {domain.name}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {domain.registrationDate}
                  </TableCell>
                  <TableCell>{domain.expiryDate}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {domain.autoRenew ? (
                      <Badge
                        className="border-green-200 bg-green-500/10 text-green-500 dark:border-green-800"
                        variant="outline"
                      >
                        <RefreshCw className="mr-1 h-3 w-3" />
                        Auto-Renew
                      </Badge>
                    ) : (
                      <Badge variant="outline">Manual</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild={true}>
                        <Button className="h-8 w-8" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Manage DNS</DropdownMenuItem>
                        <DropdownMenuItem>Renew Domain</DropdownMenuItem>
                        <DropdownMenuItem>
                          <ExternalLink className="mr-2 h-4 w-4" />
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
