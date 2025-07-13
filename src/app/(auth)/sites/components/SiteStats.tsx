"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import { getApplicationStats } from "../actions";

interface SiteStatsProps {
  applicationId: string;
}

export function SiteStats({ applicationId }: SiteStatsProps) {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const result = await getApplicationStats(applicationId);
        if (result.success) {
          setStats(result.data);
        } else {
          setError(result.error);
        }
      } catch (error) {
        setError("Failed to fetch application stats");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [applicationId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estatísticas</CardTitle>
        <CardDescription>
          Veja as estatísticas da sua aplicação em tempo real.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && <p>Carregando estatísticas...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {stats && (
          <div>
            <p>CPU: {stats.cpuUsage}%</p>
            <p>Memória: {stats.memoryUsage}MB</p>
            <p>Armazenamento: {stats.diskUsage}GB</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
