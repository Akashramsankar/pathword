import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { blogPosts, getBlogPost } from "@/lib/blogPosts";

const siteUrl = "https://www.pathword.co";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return {
      title: "Pathword Blog",
    };
  }

  const canonical = `${siteUrl}/blog/${post.slug}`;
  const title = `${post.title} | Pathword Blog`;

  return {
    title,
    description: post.summary,
    alternates: {
      canonical,
    },
    keywords: [...post.tags, "Pathword blog"],
    authors: [{ name: "Pathword Team" }],
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      type: "article",
      url: canonical,
      title,
      description: post.summary,
      siteName: "Pathword",
      locale: "en_US",
      publishedTime: post.date,
      modifiedTime: post.date,
      tags: post.tags,
      images: [
        {
          url: `${siteUrl}/images/og-image-preview.png`,
          width: 1200,
          height: 630,
          alt: `${post.title} - Pathword Blog`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: post.summary,
      images: [`${siteUrl}/images/og-image-preview.png`],
      creator: "@playpathword",
    },
    category: "Games",
  };
}

function formatDate(isoDate: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(isoDate));
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const articleStructuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.summary,
    datePublished: post.date,
    dateModified: post.date,
    url: `${siteUrl}/blog/${post.slug}`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/blog/${post.slug}`,
    },
    wordCount: post.wordCount,
    timeRequired: post.timeRequired,
    keywords: post.tags.join(", "),
    articleSection: post.tags,
    author: {
      "@type": "Organization",
      name: "Pathword Team",
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "Pathword",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/favicon.ico`,
      },
    },
    image: `${siteUrl}/images/og-image-preview.png`,
  };

  return (
    <>
      <main className="relative min-h-screen overflow-hidden bg-teal-50 text-slate-900">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-10 h-64 w-64 -translate-x-1/2 rounded-full bg-emerald-200/40 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-72 w-72 translate-x-24 translate-y-24 rounded-full bg-teal-200/30 blur-3xl" />
        </div>

        <article className="relative mx-auto max-w-3xl px-6 pb-24 pt-24">
          <nav aria-label="Breadcrumb" className="mb-8 text-sm font-semibold text-emerald-600">
            <Link href="/blog" className="hover:text-emerald-700">
              Pathword Blog
            </Link>
            <span className="mx-2 text-emerald-400" aria-hidden="true">
              /
            </span>
            <span className="text-emerald-700">{post.title}</span>
          </nav>

          <header>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600">
              Pathword Journal
            </p>
            <h1 className="mt-4 text-3xl font-semibold leading-tight text-slate-900 sm:text-5xl">
              {post.title}
            </h1>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm font-medium text-emerald-600">
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <span className="text-slate-300">•</span>
              <span>{post.readingTime}</span>
              <span className="text-slate-300">•</span>
              <span>{post.wordCount} words</span>
            </div>

            <p className="mt-6 text-lg leading-relaxed text-slate-600">
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
          </header>

          <div className="mt-12 space-y-6 text-base leading-relaxed text-slate-700">
            {post.content.map((paragraph, index) => (
              <p key={`${post.slug}-paragraph-${index}`}>{paragraph}</p>
            ))}
          </div>

          <section className="mt-12 rounded-2xl border border-emerald-100 bg-white/90 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
              Key takeaways
            </h2>
            <ul className="mt-4 space-y-3 text-sm font-medium text-slate-700">
              {post.highlights.map((highlight, index) => (
                <li key={`${post.slug}-highlight-${index}`} className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-emerald-500" aria-hidden="true" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </section>

          <footer className="mt-16 flex flex-col items-start gap-6 border-t border-emerald-100 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/blog"
              className="inline-flex items-center text-sm font-semibold text-emerald-600 transition hover:text-emerald-700"
            >
              <span aria-hidden="true" className="mr-2">
                &larr;
              </span>
              Back to all articles
            </Link>
            <Link
              href="/"
              className="inline-flex items-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/10 transition hover:bg-emerald-700"
            >
              Play today&apos;s Pathword
            </Link>
          </footer>
        </article>
      </main>

      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData) }}
      />
    </>
  );
}
