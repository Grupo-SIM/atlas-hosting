"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, ShoppingCart, Loader2 } from "lucide-react";

interface DomainResultProps {
  searchQuery: string;
  addToCart: (domain: string) => void;
  cartItems: string[];
}

export function DomainResult({ searchQuery, addToCart, cartItems }: DomainResultProps) {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate domain availability check
  useEffect(() => {
    const timeout = setTimeout(() => {
      // Randomly determine domain availability for demo purposes
      // In a real app, this would be an API call to check availability
      setIsAvailable(Math.random() > 0.3);
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Checking domain availability...</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="p-6 bg-muted/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center">
              {isAvailable ? (
                <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 dark:bg-green-900/30 mr-3">
                  <Check className="h-4 w-4" />
                </div>
              ) : (
                <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center text-red-600 dark:bg-red-900/30 mr-3">
                  <X className="h-4 w-4" />
                </div>
              )}
              <h3 className="text-lg font-semibold">{searchQuery}</h3>
            </div>
            
            <p className="mt-2 text-muted-foreground">
              {isAvailable 
                ? "Good news! This domain is available for registration." 
                : "This domain is already registered."}
            </p>
          </div>
          
          <div className="flex flex-col md:items-end gap-2">
            {isAvailable && (
              <>
                <p className="font-semibold text-xl">$14.99</p>
                <p className="text-xs text-muted-foreground">Per year</p>
                
                {cartItems.includes(searchQuery) ? (
                  <Button variant="outline" disabled>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Added to cart
                  </Button>
                ) : (
                  <Button onClick={() => addToCart(searchQuery)}>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to cart
                  </Button>
                )}
              </>
            )}
            
            {!isAvailable && (
              <>
                <Button variant="outline" disabled>
                  <X className="h-4 w-4 mr-2" />
                  Unavailable
                </Button>
                <Button variant="link" className="text-sm">
                  Try WHOIS lookup
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {isAvailable && (
        <div className="p-4 bg-green-50 dark:bg-green-900/10 border-t border-green-100 dark:border-green-900/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <p className="text-green-700 dark:text-green-400 text-sm font-medium flex items-center">
              <Check className="h-4 w-4 mr-1 flex-shrink-0" />
              Domain includes free services:
            </p>
            <ul className="flex flex-wrap gap-2 items-center">
              <li className="text-xs bg-green-100 dark:bg-green-800/30 text-green-700 dark:text-green-400 px-2 py-1 rounded">DNS Management</li>
              <li className="text-xs bg-green-100 dark:bg-green-800/30 text-green-700 dark:text-green-400 px-2 py-1 rounded">Privacy Protection</li>
              <li className="text-xs bg-green-100 dark:bg-green-800/30 text-green-700 dark:text-green-400 px-2 py-1 rounded">Email Forwarding</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}