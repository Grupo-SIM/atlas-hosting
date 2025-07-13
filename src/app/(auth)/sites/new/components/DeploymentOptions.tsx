"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

type DeploymentOption = "wordpress" | "coolify";

interface DeploymentOptionsProps {
  onSelect: (option: DeploymentOption) => void;
}

export function DeploymentOptions({ onSelect }: DeploymentOptionsProps) {
  const [selectedOption, setSelectedOption] = useState<DeploymentOption | null>(null);

  const handleSelect = (option: DeploymentOption) => {
    setSelectedOption(option);
    onSelect(option);
  };

  return (
    <div className="flex gap-4">
      <Button
        variant={selectedOption === "wordpress" ? "default" : "outline"}
        onClick={() => handleSelect("wordpress")}
      >
        WordPress
      </Button>
      <Button
        variant={selectedOption === "coolify" ? "default" : "outline"}
        onClick={() => handleSelect("coolify")}
      >
        Aplicação Customizada (Coolify)
      </Button>
    </div>
  );
}
