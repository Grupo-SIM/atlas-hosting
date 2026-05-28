"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreditCard, Server, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";

interface DomainCartProps {
  cartItems: string[];
  removeFromCart: (domain: string) => void;
}

export function DomainCart({ cartItems, removeFromCart }: DomainCartProps) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const getPriceForDomain = (domain: string): number => {
    const tld = domain.split(".").pop();

    switch (tld) {
      case "com":
      case "net":
        return 14.99;
      case "org":
        return 13.99;
      case "io":
        return 49.99;
      case "dev":
        return 19.99;
      case "co":
        return 29.99;
      case "app":
        return 17.99;
      case "online":
        return 9.99;
      default:
        return 14.99;
    }
  };

  const calculateSubtotal = (): number => {
    return cartItems.reduce(
      (total, domain) => total + getPriceForDomain(domain),
      0
    );
  };

  const handleCheckout = () => {
    setIsCheckingOut(true);
    // In a real app, this would redirect to a checkout page or process
    setTimeout(() => {
      setIsCheckingOut(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Domain Name</TableHead>
              <TableHead>Registration Period</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {cartItems.map((domain, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{domain}</TableCell>
                <TableCell>1 Year</TableCell>
                <TableCell className="text-right">
                  ${getPriceForDomain(domain).toFixed(2)}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFromCart(domain)}
                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Included with your domains:</h3>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">Privacy Protection</p>
                <p className="text-sm text-muted-foreground">
                  Keep your personal information hidden from the public WHOIS
                  directory
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Server className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">DNS Management</p>
                <p className="text-sm text-muted-foreground">
                  Configure your domain settings with our easy-to-use control
                  panel
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-medium">Order Summary</h3>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Domains ({cartItems.length})
              </span>
              <span>${calculateSubtotal().toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Privacy Protection</span>
              <span className="text-green-600 dark:text-green-400">Free</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">DNS Management</span>
              <span className="text-green-600 dark:text-green-400">Free</span>
            </div>

            <div className="pt-2 border-t flex justify-between font-semibold">
              <span>Total (USD)</span>
              <span>${calculateSubtotal().toFixed(2)}</span>
            </div>
          </div>

          <Button
            className="w-full mt-4"
            size="lg"
            onClick={handleCheckout}
            disabled={isCheckingOut || cartItems.length === 0}
          >
            {isCheckingOut ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Proceed to Checkout
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground pt-2">
            By proceeding, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
