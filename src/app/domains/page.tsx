"use client";

import { DomainCart } from "@/components/domains/DomainCart";
import { DomainResult } from "@/components/domains/DomainResult";
import { DomainSuggestions } from "@/components/domains/DomainSuggestions";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, ShoppingCart } from "lucide-react";
import { useState } from "react";

export default function DomainsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [cartItems, setCartItems] = useState<string[]>([]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    
    setIsSearching(true);
    // Simulate search delay
    setTimeout(() => {
      setIsSearching(false);
      setHasSearched(true);
    }, 1500);
  };

  const addToCart = (domain: string) => {
    if (!cartItems.includes(domain)) {
      setCartItems([...cartItems, domain]);
    }
  };

  const removeFromCart = (domain: string) => {
    setCartItems(cartItems.filter(item => item !== domain));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 pb-16">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Domain Registration</h1>
          <p className="text-muted-foreground mt-1">
            Search, register, and manage domain names for your websites
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Find Your Perfect Domain Name</CardTitle>
            <CardDescription>
              Enter a domain name to check availability or get suggestions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="e.g., mycompany.com"
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={isSearching || !searchQuery}>
                {isSearching ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Searching...
                  </>
                ) : (
                  "Search Domains"
                )}
              </Button>
            </form>

            {hasSearched && (
              <div className="mt-8">
                <Tabs defaultValue="results">
                  <TabsList className="mb-4">
                    <TabsTrigger value="results">Search Results</TabsTrigger>
                    <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
                    {cartItems.length > 0 && (
                      <TabsTrigger value="cart" className="flex items-center">
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Cart ({cartItems.length})
                      </TabsTrigger>
                    )}
                  </TabsList>
                  
                  <TabsContent value="results">
                    <DomainResult
                      searchQuery={searchQuery}
                      addToCart={addToCart}
                      cartItems={cartItems}
                    />
                  </TabsContent>
                  
                  <TabsContent value="suggestions">
                    <DomainSuggestions
                      searchQuery={searchQuery}
                      addToCart={addToCart}
                      cartItems={cartItems}
                    />
                  </TabsContent>
                  
                  {cartItems.length > 0 && (
                    <TabsContent value="cart">
                      <DomainCart
                        cartItems={cartItems}
                        removeFromCart={removeFromCart}
                      />
                    </TabsContent>
                  )}
                </Tabs>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Domain Name Pricing</CardTitle>
            <CardDescription>Transparent pricing for all popular TLDs</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>TLD</TableHead>
                  <TableHead className="hidden sm:table-cell">Registration</TableHead>
                  <TableHead>1st Year</TableHead>
                  <TableHead>Renewal</TableHead>
                  <TableHead className="text-right">Features</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">.com</TableCell>
                  <TableCell className="hidden sm:table-cell">$14.99</TableCell>
                  <TableCell className="font-medium">$12.99</TableCell>
                  <TableCell>$14.99/yr</TableCell>
                  <TableCell className="text-right">Free DNS, Privacy</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">.org</TableCell>
                  <TableCell className="hidden sm:table-cell">$13.99</TableCell>
                  <TableCell className="font-medium">$11.99</TableCell>
                  <TableCell>$13.99/yr</TableCell>
                  <TableCell className="text-right">Free DNS, Privacy</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">.net</TableCell>
                  <TableCell className="hidden sm:table-cell">$14.99</TableCell>
                  <TableCell className="font-medium">$12.99</TableCell>
                  <TableCell>$14.99/yr</TableCell>
                  <TableCell className="text-right">Free DNS, Privacy</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">.io</TableCell>
                  <TableCell className="hidden sm:table-cell">$49.99</TableCell>
                  <TableCell className="font-medium">$44.99</TableCell>
                  <TableCell>$49.99/yr</TableCell>
                  <TableCell className="text-right">Free DNS, Privacy</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">.dev</TableCell>
                  <TableCell className="hidden sm:table-cell">$19.99</TableCell>
                  <TableCell className="font-medium">$17.99</TableCell>
                  <TableCell>$19.99/yr</TableCell>
                  <TableCell className="text-right">Free DNS, Privacy, HTTPS</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}