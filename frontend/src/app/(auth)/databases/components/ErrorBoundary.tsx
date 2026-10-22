"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error, hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Database Editor Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex h-64 flex-col items-center justify-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div className="text-center">
            <h3 className="font-medium text-lg">Algo deu errado</h3>
            <p className="mb-4 text-muted-foreground text-sm">
              {this.state.error?.message || "Erro inesperado no componente"}
            </p>
            <Button
              onClick={() =>
                this.setState({ error: undefined, hasError: false })
              }
              variant="outline"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar novamente
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
