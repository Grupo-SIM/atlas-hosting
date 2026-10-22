"use client";

import * as React from "react";
import type { DomainPriceInfo } from "@/app/(auth)/domain/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"; // Assuming this is your correct path
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, toBrl } from "@/lib/utils";

const ITEMS_PER_TLD_PAGE = 10; // Or make this a prop

// Helper function to generate pagination numbers (can be moved to utils if used elsewhere)
const generatePagination = (
  currentPage: number,
  totalPages: number,
  maxPagesToShow = 5
) => {
  const pages: (number | string)[] = [];
  if (totalPages <= maxPagesToShow) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push("...");
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push("...");
      }
      pages.push(totalPages);
    }
  }
  return pages;
};

interface PaginatedTldTableProps {
  allTldData: DomainPriceInfo[];
}

export function PaginatedTldTable({ allTldData }: PaginatedTldTableProps) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [search, setSearch] = React.useState("");

  const filteredTldData = allTldData.filter(item =>
    [item.tld, `.${item.tld}`]
      .map(tld => tld.toLowerCase())
      .some(tld => tld.includes(search))
  );

  const totalTldCount = filteredTldData.length;
  const totalTldPages = Math.ceil(totalTldCount / ITEMS_PER_TLD_PAGE);

  const paginatedTldItems = filteredTldData.slice(
    (currentPage - 1) * ITEMS_PER_TLD_PAGE,
    currentPage * ITEMS_PER_TLD_PAGE
  );

  const handlePageChange = (
    page: number | string,
    event?: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    if (event) {
      event.preventDefault(); // Prevent navigation for client-side state change
    }
    if (typeof page === "number" && page >= 1 && page <= totalTldPages) {
      setCurrentPage(page);
    }
  };

  const handlePreviousPage = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    event.preventDefault();
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    event.preventDefault();
    setCurrentPage(prev => Math.min(totalTldPages, prev + 1));
  };

  const onSearch = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value.toLowerCase();
      setSearch(value);
    },
    []
  );

  if (!allTldData || allTldData.length === 0) {
    return (
      <p className="py-4 text-center text-muted-foreground">
        Nenhuma informação de TLD disponível.
      </p>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preços de Nomes de Domínio (BRL)</CardTitle>
        <CardDescription>
          Lista de TLDs com preços de registro em BRL (convertidos de USD,
          atualizado diariamente).
        </CardDescription>
        <Input
          className="mt-2 w-full"
          onChange={onSearch}
          placeholder="Pesquisar TLD"
          type="search"
          value={search}
        />
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>TLD</TableHead>
                <TableHead className="hidden text-right sm:table-cell">
                  Registro (BRL)
                </TableHead>
                <TableHead className="text-right">Renovação (BRL)</TableHead>
                <TableHead className="text-right">
                  Transferência (BRL)
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTldItems.length === 0 && currentPage > 1 ? (
                <TableRow>
                  <TableCell
                    className="text-center text-muted-foreground"
                    colSpan={4}
                  >
                    Nenhum item nesta página. Retorne à página anterior.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTldItems.map(item => (
                  <TableRow key={item.tld}>
                    <TableCell className="font-medium">.{item.tld}</TableCell>
                    <TableCell className="hidden text-right sm:table-cell">
                      {item.price !== undefined ? toBrl(item.price) : "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.renew !== undefined ? toBrl(item.renew) : "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.transfer !== undefined
                        ? toBrl(item.transfer)
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalTldPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  className={cn({
                    "cursor-not-allowed opacity-70": currentPage <= 1,
                  })}
                  href="#"
                  onClick={currentPage <= 1 ? undefined : handlePreviousPage}
                />
              </PaginationItem>
              {generatePagination(currentPage, totalTldPages).map(
                (page, index) => (
                  <PaginationItem key={index}>
                    {page === "..." ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        href="#" // href is required by Link
                        isActive={currentPage === page}
                        onClick={e => handlePageChange(page as number, e)}
                      >
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                )
              )}
              <PaginationItem>
                <PaginationNext
                  className={cn({
                    "cursor-not-allowed opacity-70":
                      currentPage >= totalTldPages,
                  })}
                  href="#" // href is required by Link
                  onClick={
                    currentPage >= totalTldPages ? undefined : handleNextPage
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </CardContent>
    </Card>
  );
}
