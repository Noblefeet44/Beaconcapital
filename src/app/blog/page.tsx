import React from "react";
import Metadata from "next";
import Link from "next/link";
import PublicHeader from "@/components/public/Header";
import PublicFooter from "@/components/public/Footer";
import { BLOG_POSTS } from "@/lib/blog-data";

export const metadata = {
  title: "Blog & Market Insights | Beacon Capital Research",
  description:
    "Read market analysis, private credit insights, digital ledger reconciliation updates, and institutional financial technology articles by Beacon Capital experts.",
  alternates: {
    canonical: "https://beaconcapital.site/blog",
  },
  openGraph: {
    title: "Blog & Market Insights | Beacon Capital Research",
    description:
      "Read market analysis, private credit insights, digital ledger reconciliation updates, and financial tech research.",
    url: "https://beaconcapital.site/blog",
  },
};

export default function BlogIndexPage() {
  const featuredPost = BLOG_POSTS[0];
  const regularPosts = BLOG_POSTS.slice(1);

  return (
    <div className="min-h-screen flex flex-col bg-background antialiased text-on-background">
      <PublicHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-primary text-on-primary py-16 lg:py-20">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="max-w-3xl flex flex-col gap-4">
              <span className="text-xs font-bold uppercase tracking-widest text-white/80">Thought Leadership</span>
              <h1 className="font-display-lg text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                Beacon Capital Insights & Research
              </h1>
              <p className="font-body-lg text-lg text-white/90 leading-relaxed">
                In-depth analysis of private credit markets, digital asset reconciliation, zero-trust financial infrastructure, and macro treasury management.
              </p>
            </div>
          </div>
        </section>

        {/* Featured Post Spotlight */}
        <section className="py-16 bg-surface-container-lowest border-b border-surface-variant">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="p-8 md:p-12 bg-surface-container-low border border-surface-variant flex flex-col lg:flex-row gap-8 items-center justify-between">
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-primary text-on-primary text-xs font-bold uppercase">
                    Featured Insight
                  </span>
                  <span className="text-xs font-bold text-primary uppercase">{featuredPost.category}</span>
                  <span className="text-xs text-on-surface-variant">• {featuredPost.readTime}</span>
                </div>
                <h2 className="font-headline-lg text-2xl md:text-4xl font-extrabold text-on-background hover:text-primary transition-colors">
                  <Link href={`/blog/${featuredPost.slug}`}>{featuredPost.title}</Link>
                </h2>
                <p className="text-base text-on-surface-variant leading-relaxed">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center gap-4 text-xs text-on-surface-variant pt-2">
                  <span className="font-bold text-on-background">{featuredPost.author.name}</span>
                  <span>{featuredPost.publishedAt}</span>
                </div>
              </div>

              <Link
                href={`/blog/${featuredPost.slug}`}
                className="px-8 py-3.5 bg-primary text-on-primary font-bold text-sm whitespace-nowrap hover:bg-primary-container transition-colors shadow-sm self-start lg:self-center"
              >
                Read Full Article
              </Link>
            </div>
          </div>
        </section>

        {/* Grid of Articles */}
        <section className="py-20 bg-background">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <h2 className="font-headline-lg text-2xl font-bold text-on-background mb-10">
              Recent Articles
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {regularPosts.map((post) => (
                <article
                  key={post.slug}
                  className="bg-surface-container-lowest border border-surface-variant p-8 flex flex-col justify-between hover:border-primary/40 transition-all"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-primary uppercase">{post.category}</span>
                      <span className="text-on-surface-variant">{post.readTime}</span>
                    </div>
                    <h3 className="font-headline-md text-xl font-bold text-on-background hover:text-primary transition-colors">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-surface-variant flex items-center justify-between text-xs text-on-surface-variant">
                    <span>{post.author.name}</span>
                    <span>{post.publishedAt}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
