import React from "react";
import Metadata from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PublicHeader from "@/components/public/Header";
import PublicFooter from "@/components/public/Footer";
import { BLOG_POSTS, BlogPost } from "@/lib/blog-data";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    return {
      title: "Article Not Found | Beacon Capital",
    };
  }

  return {
    title: `${post.title} | Beacon Capital Insights`,
    description: post.excerpt,
    alternates: {
      canonical: `https://beaconcapital.site/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://beaconcapital.site/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author.name],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = BLOG_POSTS.filter((p) => p.slug !== slug).slice(0, 2);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    author: {
      "@type": "Person",
      name: post.author.name,
      jobTitle: post.author.role,
    },
    publisher: {
      "@type": "Organization",
      name: "Beacon Capital",
      logo: {
        "@type": "ImageObject",
        url: "https://beaconcapital.site/favicon.ico",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://beaconcapital.site/blog/${post.slug}`,
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-background antialiased text-on-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PublicHeader />

      <main className="flex-1 py-16">
        <article className="max-w-4xl mx-auto px-margin-mobile md:px-margin-desktop">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs text-on-surface-variant mb-8">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-primary">Blog</Link>
            <span>/</span>
            <span className="text-on-background font-semibold truncate max-w-xs">{post.title}</span>
          </nav>

          {/* Header Metadata */}
          <header className="flex flex-col gap-4 pb-8 border-b border-surface-variant mb-10">
            <div className="flex items-center gap-3 text-xs">
              <span className="px-3 py-1 bg-primary text-on-primary font-bold uppercase">
                {post.category}
              </span>
              <span className="text-on-surface-variant">{post.readTime}</span>
              <span className="text-on-surface-variant">• Published {post.publishedAt}</span>
            </div>
            <h1 className="font-display-lg text-3xl md:text-5xl font-extrabold text-on-background leading-tight">
              {post.title}
            </h1>

            <div className="flex items-center gap-4 pt-4 text-xs text-on-surface-variant">
              <div className="w-10 h-10 bg-primary/10 text-primary font-bold flex items-center justify-center rounded-full text-base">
                {post.author.name.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-on-background text-sm">{post.author.name}</div>
                <div>{post.author.role}</div>
              </div>
            </div>
          </header>

          {/* Main Article Body */}
          <div
            className="prose max-w-none text-on-background text-base leading-relaxed space-y-6"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags Strip */}
          <div className="pt-10 mt-12 border-t border-surface-variant flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-on-surface-variant uppercase mr-2">Tags:</span>
            {post.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 bg-surface-container text-on-surface-variant text-xs font-medium">
                #{tag}
              </span>
            ))}
          </div>

          {/* Related Articles Section */}
          {relatedPosts.length > 0 && (
            <div className="mt-16 pt-12 border-t border-surface-variant">
              <h2 className="font-headline-md text-2xl font-bold text-on-background mb-8">
                Related Research & Articles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {relatedPosts.map((rel) => (
                  <div key={rel.slug} className="p-6 bg-surface-container-lowest border border-surface-variant flex flex-col gap-3">
                    <span className="text-xs font-bold text-primary uppercase">{rel.category}</span>
                    <h3 className="font-bold text-lg text-on-background hover:text-primary transition-colors">
                      <Link href={`/blog/${rel.slug}`}>{rel.title}</Link>
                    </h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2">
                      {rel.excerpt}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>
      </main>

      <PublicFooter />
    </div>
  );
}
