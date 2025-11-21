"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils/form-helpers";
import { BlogPost } from "@prisma/client";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function BlogSection({ blogPosts }: { blogPosts: BlogPost[] }) {
  if (blogPosts.length == 0) {
    return null;
  }
  return (
    <section className="w-full mx-auto py-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col items-center justify-between">
          <h2 className="text-3xl font-bold text-foreground mb-2 text-center">
            Our Latest Blogs
          </h2>
          <p className="text-muted-foreground">
            Stay updated with the latest blog posts.
          </p>
        </div>
        <Link href={"/blog"}>
          <Button
            variant="ghost"
            className="hidden md:flex text-black font-medium text-sm tracking-wide transition-colors self-start border-none hover:underline hover:underline-offset-4">
            See All Articles <ArrowRight className="ml-2 my-auto h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-2 gap-y-6 mb-8">
        {blogPosts.map((post) => (
          <Card
            key={post.id}
            className="overflow-hidden border-0 shadow-sm bg-card">
            <div className="flex h-[200px]">
              <div className="w-1/2 relative h-full">
                <Image
                  src={post.featuredImage || "/placeholder.svg"}
                  alt={post.title}
                  fill
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="w-1/2 p-2 flex flex-col justify-between space-y-2">
                <p className="font-medium text-black uppercase tracking-wide">
                  {formatDate(post.createdAt)}
                </p>

                <h3 className="text-base font-semibold text-foreground mb-3 leading-tight">
                  {post.title}
                </h3>

                <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                  {post.excerpt}
                </p>
                <Link
                  className="text-xs bg-black text-white p-1 hover:text-black hover:bg-white tracking-wide transition-colors flex items-center gap-1 justify-between self-start border border-black"
                  href={`/blog/${post.slug}`}>
                  <span>Read More</span> <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-center md:hidden">
        <Link
          className="bg-black text-white hover:bg-white hover:text-black border border-black p-2"
          href={"/blog"}>
          See All Articles
        </Link>
      </div>
    </section>
  );
}
