"use client";

import { TooltipArrow } from "@radix-ui/react-tooltip";
import { debounce } from "lodash";
import { CheckCircle, Copy } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function AffiliateLinkDisplay({
  affiliateLink,
}: {
  affiliateLink: string;
}) {
  const [copied, setCopied] = useState(false);

  const stopCopying = useMemo(() => debounce(() => setCopied(false), 2000), []);

  const onCopy = useCallback(async () => {
    await navigator.clipboard.writeText(affiliateLink);
    setCopied(true);
    stopCopying();
  }, [affiliateLink, stopCopying]);

  useEffect(() => {
    return () => {
      stopCopying.cancel();
    };
  }, [stopCopying]);

  return (
    <div className="flex gap-2">
      <Input className="font-mono" readOnly value={affiliateLink} />
      <TooltipProvider>
        <Tooltip open={copied}>
          <TooltipTrigger asChild>
            <Button onClick={onCopy} variant="outline">
              {copied ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <div>Copiado!</div>
            <TooltipArrow className="fill-border" />
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
