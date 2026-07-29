"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle, Search, UserCircle, Users, XCircle } from "lucide-react";
import { useState } from "react";
import { SimpayCalendar } from "@/app/(auth)/billing/_/simpay-calendar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ReferredUser {
  id: string;
  name: string | null;
  email: string | null;
  createdAt: Date;
  deletedAt: Date | null;
}

export function ReferredUsersTable({ users }: { users: ReferredUser[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({
    end: null,
    start: null,
  });

  if (users.length === 0) {
    return (
      <div className="flex h-40 flex-col items-center justify-center text-center">
        <Users className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="font-semibold text-xl">Nenhum usuário indicado ainda</h3>
        <p className="text-muted-foreground">
          Compartilhe seu link de afiliado para começar a ganhar!
        </p>
      </div>
    );
  }

  const filteredUsers = users.filter(user => {
    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchesName = user.name?.toLowerCase().includes(searchLower);
      const matchesEmail = user.email?.toLowerCase().includes(searchLower);
      if (!matchesName && !matchesEmail) return false;
    }

    // Status filter
    if (statusFilter !== "all") {
      const isActive = !user.deletedAt;
      if (statusFilter === "active" && !isActive) return false;
      if (statusFilter === "inactive" && isActive) return false;
    }

    // Date filter
    if (dateRange.start && dateRange.end) {
      const userDate = new Date(user.createdAt);
      userDate.setHours(0, 0, 0, 0);

      const startDate = new Date(dateRange.start);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);

      if (
        userDate.getTime() < startDate.getTime() ||
        userDate.getTime() > endDate.getTime()
      ) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
          <Input
            className="pl-10"
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar usuários..."
            value={searchQuery}
          />
        </div>
        <div className="w-[260px]">
          <SimpayCalendar
            end={dateRange.end}
            label=""
            onChange={(start, end) => setDateRange({ end, start })}
            start={dateRange.start}
          />
        </div>
        <Select onValueChange={setStatusFilter} value={statusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Data de Registro</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <UserCircle className="mr-2 h-4 w-4" />
                      <span className="font-medium">
                        {user.name || user.email || "Usuário"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(user.createdAt), "PPP", {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell>
                    {!user.deletedAt ? (
                      <Badge
                        className="bg-green-500/10 text-green-500"
                        variant="outline"
                      >
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Ativo
                      </Badge>
                    ) : (
                      <Badge
                        className="bg-red-500/10 text-red-500"
                        variant="outline"
                      >
                        <XCircle className="mr-1 h-3 w-3" />
                        Inativo
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  className="h-24 text-center text-muted-foreground"
                  colSpan={3}
                >
                  Nenhum usuário encontrado com os filtros atuais.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
