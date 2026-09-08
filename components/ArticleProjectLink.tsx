"use client";

import Link from "next/link";
import { track } from "@/lib/analytics";

export function ArticleProjectLink({
  slug,
  label,
  placement,
}: {
  slug: string;
  label: string;
  placement: string;
}) {
  return (
    <Link
      className="button"
      href={`/project?source=${encodeURIComponent(slug)}`}
      onClick={() =>
        track("article_to_project", {
          page: `/articles/${slug}`,
          placement,
          article_slug: slug,
          cta_placement: placement,
          source_context: "article",
          route_category: "article",
        })
      }
    >
      {label}
    </Link>
  );
}
