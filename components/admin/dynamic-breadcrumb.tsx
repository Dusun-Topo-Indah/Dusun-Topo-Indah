"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useBreadcrumb } from "./breadcrumb-context";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React from "react";

export function DynamicBreadcrumb() {
  const pathname = usePathname();
  const { overrideLabel } = useBreadcrumb();
  const rawPaths = pathname.split("/").filter((path) => path);

  const breadcrumbItems = [];
  let currentHref = "";

  for (let i = 0; i < rawPaths.length; i++) {
    const path = rawPaths[i];
    currentHref += `/${path}`;

    if (path === "edit" && i < rawPaths.length - 1) {
      continue;
    }

    breadcrumbItems.push({
      segment: path,
      href: currentHref,
      isLast: i === rawPaths.length - 1,
    });
  }

  return (
    <Breadcrumb className="hidden md:flex">
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => {
          let label = item.segment.charAt(0).toUpperCase() + item.segment.slice(1).replace(/-/g, " ");

          if (item.isLast && overrideLabel) {
            label = overrideLabel;
          }

          return (
            <React.Fragment key={item.href}>
              <BreadcrumbItem>
                {item.isLast ? (
                  <BreadcrumbPage className="max-w-[300px] truncate" title={label}>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={<Link href={item.href} />}>
                    {label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!item.isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
