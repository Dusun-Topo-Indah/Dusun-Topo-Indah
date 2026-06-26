"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search, X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ListingQueryParams } from "@/lib/listing";
import { buildListingQueryParams, createListingSearchParams } from "@/lib/listing";

export interface ListingFilterOption {
  label: string;
  value: string;
}

interface ListingToolbarProps {
  searchPlaceholder: string;
  searchValue: string;
  activeFilter: string;
  filterOptions: ListingFilterOption[];
  currentLimit: number;
  currentPage: number;
}

export function ListingToolbar({
  searchPlaceholder,
  searchValue,
  activeFilter,
  filterOptions,
  currentLimit,
  currentPage,
}: ListingToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [draftSearch, setDraftSearch] = useState(searchValue);

  const currentQuery = useMemo<ListingQueryParams>(
    () => ({
      q: searchValue,
      filter: activeFilter,
      page: currentPage,
      limit: currentLimit,
    }),
    [activeFilter, currentLimit, currentPage, searchValue]
  );

  useEffect(() => {
    const nextSearch = draftSearch.trim();
    if (nextSearch === searchValue.trim()) {
      return;
    }

    const timer = window.setTimeout(() => {
      const nextQuery = buildListingQueryParams(currentQuery, {
        q: nextSearch,
        page: 1,
      });
      router.replace(`${pathname}${createListingSearchParams(nextQuery)}`);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [currentQuery, draftSearch, pathname, router, searchValue]);

  const navigate = (updates: Partial<ListingQueryParams>) => {
    const nextQuery = buildListingQueryParams(currentQuery, {
      ...updates,
      page: updates.page ?? 1,
    });
    router.replace(`${pathname}${createListingSearchParams(nextQuery)}`);
  };

  const resetFilters = () => {
    setDraftSearch("");
    router.replace(pathname);
  };

  return (
    <div className="flex flex-row items-center gap-3 rounded-lg w-full">
      <div className="flex flex-1 items-center gap-2">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            value={draftSearch}
            onChange={(e) => setDraftSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-11 h-14 bg-background shadow-sm border-muted-foreground/20 text-base"
          />
        </div>
        {(searchValue || (activeFilter && activeFilter !== "all")) && (
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={resetFilters} 
            className="h-14 px-4 text-muted-foreground shrink-0 hover:bg-background/80 hidden tablet:flex text-base"
          >
            Reset
            <X className="ml-2 h-5 w-5" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Select 
          value={activeFilter} 
          onValueChange={(value) => {
            if (value !== null) navigate({ filter: value, page: 1 });
          }}
        >
          <SelectTrigger className="h-14 w-full tablet:w-[220px] bg-background shadow-sm border-muted-foreground/20 text-base">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground shrink-0" />
              <span className="flex flex-1 text-left truncate">
                {filterOptions.find((opt) => opt.value === activeFilter)?.label || "Filter..."}
              </span>
            </div>
          </SelectTrigger>
          <SelectContent align="end">
            {filterOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
