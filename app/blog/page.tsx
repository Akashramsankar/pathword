import type { Metadata } from "next";
import Link from "next/link";

import { blogPosts } from "@/lib/blogPosts";

const siteUrl = "https://www.pathword.co";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Pathword Tips & Tricks: Solve in 6 Guesses (or Less)",
  datePublished: blogPosts[0]?.date,
  dateModified: blogPosts[0]?.date,
  url: `${siteUrl}/blog/${blogPosts[0]?.slug ?? "pathword-tips-and-tricks"}`,
  description:
    "Master Pathword logic with clue decoding strategies, column control, and backtracking techniques so you can consistently solve the daily puzzle in six guesses or fewer.",
  keywords: (blogPosts[0]?.tags ?? []).join(", "),
  articleSection: blogPosts[0]?.tags ?? [],
  wordCount: blogPosts[0]?.wordCount,
  timeRequired: blogPosts[0]?.timeRequired,
  image: `${siteUrl}/images/og-image-preview.png`,
  inLanguage: "en",
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": `${siteUrl}/blog/${blogPosts[0]?.slug ?? "pathword-tips-and-tricks"}`,
  },
  author: {
    "@type": "Organization",
    name: "Pathword Team",
    url: siteUrl,
  },
  publisher: {
    "@type": "Organization",
    name: "Pathword",
    url: siteUrl,
  },
};

export const metadata: Metadata = {
  title: "Pathword Tips & Tricks | Solve Pathword in Six Guesses",
  description:
    "Learn the definitive Pathword strategy: decode color clues, lock columns, and backtrack smartly to solve every daily puzzle in six guesses or fewer.",
  keywords: [
    "Pathword tips",
    "Pathword strategy guide",
    "solve Pathword",
    "word puzzle tricks",
    "daily word game tips",
    "Pathword clues",
  ],
  alternates: {
    canonical: `${siteUrl}/blog`,
  },
  authors: [{ name: "Pathword Team" }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "article",
    url: `${siteUrl}/blog/${blogPosts[0]?.slug ?? "pathword-tips-and-tricks"}`,
    title: "Pathword Tips & Tricks | Solve in Six Guesses",
    description:
      "Unlock Pathword mastery with clue interpretation strategies, column control, and backtracking tips to finish every puzzle efficiently.",
    siteName: "Pathword",
    locale: "en_US",
    images: [
      {
        url: `${siteUrl}/images/og-image-preview.png`,
        width: 1200,
        height: 630,
        alt: "Pathword blog hero image",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pathword Tips & Tricks | Solve Pathword Faster",
    description:
      "Master Pathword clues, strategy, and deduction with this definitive guide to solving the daily word puzzle in six guesses or fewer.",
    images: [`${siteUrl}/images/og-image-preview.png`],
    creator: "@playpathword",
  },
  category: "Games",
};

function formatDate(isoDate: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(isoDate));
}

const sortedPosts = [...blogPosts].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
);

export default function BlogPage() {
  return (
    <>
      <main className="relative min-h-screen overflow-hidden bg-teal-50 text-slate-900">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-16 h-64 w-64 -translate-x-1/2 rounded-full bg-emerald-200/40 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-72 w-72 translate-x-24 translate-y-24 rounded-full bg-teal-200/30 blur-3xl" />
        </div>

        <section className="relative mx-auto max-w-4xl px-6 pb-16 pt-20 sm:pb-20 sm:pt-24">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600">
            The Pathword Blog
          </p>
          <h1 className="mt-4 text-3xl font-semibold leading-tight text-slate-900 sm:text-5xl">
            Pathword Blog: Tips, Updates & Behind-the-Scenes
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
            Discover the world of Pathword — from smart strategies and solving tricks to the creative process behind our daily puzzles. Learn how we design letter paths, refine clue systems, and build the relaxing yet exciting atmosphere you love. New articles drop with every major update, so you’ll always have fresh insights, guides, and news to keep your Pathword skills sharp.
          </p>
        </section>

        <section className="relative mx-auto max-w-5xl px-6 pb-24">
          <div className="grid gap-12">
            {sortedPosts.map((post) => (
              <article
                key={post.slug}
                className="group rounded-3xl border border-emerald-100/70 bg-white/90 p-8 shadow-xl shadow-emerald-900/5 backdrop-blur"
              >
                <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-emerald-600">
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                  <span className="text-slate-300">•</span>
                  <span>{post.readingTime}</span>
                </div>
                <h2 className="mt-4 text-2xl font-semibold text-slate-900 transition-colors group-hover:text-emerald-700 sm:text-3xl">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>
                <p className="mt-4 text-base leading-relaxed text-slate-600">
                  {post.summary}
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <ul className="mt-6 space-y-3 text-sm font-medium text-slate-700">
                  {post.highlights.map((highlight, index) => (
                    <li key={`${post.slug}-highlight-${index}`} className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-emerald-500" aria-hidden="true" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 flex items-center justify-between">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-500 transition hover:text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                  >
                    Read more
                  </Link>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center text-sm font-semibold text-emerald-600 transition hover:text-emerald-700"
                  >
                    Dive into the article
                    <span aria-hidden="true" className="ml-2">&rarr;</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="relative border-t border-emerald-100/60 bg-white/70">
          <div className="mx-auto max-w-3xl px-6 py-16 text-center">
            <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
              Ready to chart today&apos;s Pathword?
            </h2>
            <p className="mt-4 text-base text-slate-600">
              Carry these insights into your next run and share your streak with the community. A fresh puzzle is waiting just beyond the next tile.
            </p>
            <div className="mt-6 flex justify-center">
              <Link
                href="/"
                className="inline-flex items-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/10 transition hover:bg-emerald-700"
              >
                Play today&apos;s challenge
              </Link>
            </div>
          </div>
        </section>
      </main>

      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </>
  );
}
