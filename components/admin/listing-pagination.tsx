"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ListingQueryParams } from "@/lib/listing";
import { buildListingQueryParams, createListingSearchParams } from "@/lib/listing";

interface ListingPaginationProps {
  pathname: string;
  query: ListingQueryParams;
  page: number;
  totalPages: number;
  totalItems?: number;
  limitOptions?: number[];
  currentLimit?: number;
}

function buildPageHref(pathname: string, query: ListingQueryParams, page: number): string {
  return `${pathname}${createListingSearchParams({ ...query, page })}`;
}

export function ListingPagination({ 
  pathname, 
  query, 
  page, 
  totalPages, 
  totalItems, 
  limitOptions, 
  currentLimit 
}: ListingPaginationProps) {
  const router = useRouter();
  
  const minLimit = limitOptions && limitOptions.length > 0 ? Math.min(...limitOptions) : 0;
  const showLimitSelector = totalItems !== undefined && limitOptions && totalItems > minLimit;

  if (totalPages <= 1 && !showLimitSelector) return null;

  const onLimitChange = (newLimit: string | null) => {
    if (!newLimit) return;
    const nextQuery = buildListingQueryParams(query, {
      limit: parseInt(newLimit, 10),
      page: 1, // Reset ke halaman 1 jika limit diubah
    });
    router.replace(`${pathname}${createListingSearchParams(nextQuery)}`);
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-2">
      <div className="flex items-center gap-2">
        {showLimitSelector && currentLimit && limitOptions && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline-block">Tampilkan</span>
            <Select 
              value={currentLimit.toString()} 
              onValueChange={onLimitChange}
            >
              <SelectTrigger className="h-9 w-[110px] bg-background">
                <SelectValue placeholder="Limit" />
              </SelectTrigger>
              <SelectContent>
                {limitOptions.map((limit) => (
                  <SelectItem key={limit} value={limit.toString()}>
                    {limit} / hal
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 self-end sm:self-auto">
        <p className="text-sm text-muted-foreground">
          Halaman {page} dari {Math.max(1, totalPages)}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            render={<Link href={buildPageHref(pathname, query, Math.max(1, page - 1))} />}
            nativeButton={false}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Sebelumnya
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            render={<Link href={buildPageHref(pathname, query, Math.min(totalPages, page + 1))} />}
            nativeButton={false}
          >
            Selanjutnya
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

