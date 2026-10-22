"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type DeploymentOption = "wordpress" | "coolify";

interface DeploymentOptionsProps {
  onSelect: (option: DeploymentOption) => void;
}

export function DeploymentOptions({ onSelect }: DeploymentOptionsProps) {
  const [selectedOption, setSelectedOption] = useState<DeploymentOption | null>(
    null
  );

  const handleSelect = (option: DeploymentOption) => {
    setSelectedOption(option);
    onSelect(option);
  };

  return (
    <div className="flex gap-4">
      <Button
        onClick={() => handleSelect("wordpress")}
        variant={selectedOption === "wordpress" ? "default" : "outline"}
      >
        WordPress
      </Button>
      <Button
        onClick={() => handleSelect("coolify")}
        variant={selectedOption === "coolify" ? "default" : "outline"}
      >
        Aplicação Customizada (Coolify)
      </Button>
    </div>
  );
}
