"use client";

import { Button } from "@/components/ui/button";
import { Loader2, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";

interface DomainSuggestionsProps {
  searchQuery: string;
  addToCart: (domain: string) => void;
  cartItems: string[];
}

export function DomainSuggestions({ searchQuery, addToCart, cartItems }: DomainSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Extract the domain name without extension
  const domainName = searchQuery.split(".")[0];
  
  // Simulate loading suggestions
  useEffect(() => {
    const timeout = setTimeout(() => {
      // Generate suggestions based on the domain name
      // In a real app, this would be an API call to get suggestions
      const generatedSuggestions = tlds.map(tld => `${domainName}${tld}`);
      setSuggestions(generatedSuggestions);
      setIsLoading(false);
    }, 1200);
    
    return () => clearTimeout(timeout);
  }, [domainName]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Finding domain suggestions...</p>
      </div>
    );
  }

  const prices: Record<string, number> = {
    ".com": 14.99,
    ".net": 14.99,
    ".org": 13.99,
    ".io": 49.99,
    ".dev": 19.99,
    ".co": 29.99,
    ".app": 17.99,
    ".online": 9.99,
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Suggested Domains</h3>
      
      <div className="grid gap-4">
        {suggestions.map((domain, index) => {
          const tld = tlds.find(t => domain.endsWith(t)) || ".com";
          const price = prices[tld] || 14.99;
          
          return (
            <div 
              key={index}
              className="border rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-primary/50 hover:bg-muted/50 transition-colors"
            >
              <div>
                <p className="font-medium">{domain}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Includes free privacy protection and DNS management
                </p>
              </div>
              
              <div className="flex items-center gap-4 self-end sm:self-auto">
                <div className="text-right">
                  <p className="font-semibold">${price}</p>
                  <p className="text-xs text-muted-foreground">Per year</p>
                </div>
                
                {cartItems.includes(domain) ? (
                  <Button variant="outline" disabled size="sm">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Added
                  </Button>
                ) : (
                  <Button onClick={() => addToCart(domain)} size="sm">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const tlds = [".com", ".net", ".org", ".io", ".dev", ".co", ".app", ".online"];
