import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

export async function RecentArticles() {
  const articles = await $client?.articleRoutes.getLatestArticles({
    page: 1,
    limit: 4,
  });

  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <section className="py-10 md:py-14">
      <div className="container">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Bài Viết Gần Đây</h2>
            <p className="text-muted-foreground mt-1">
              Cập nhật tin tức và câu chuyện mới nhất
            </p>
          </div>
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href="/articles">
              Xem tất cả
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {articles?.map((article, index) => (
            <Link
              key={article.id}
              href={`/articles/${article.id}`}
              className="group animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Card className="overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm transition-all hover:shadow-hover hover:-translate-y-1">
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={article.thumbnailUrl ?? "/placeholder.jpg"}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    {new Date(article.createdAt).toLocaleDateString("vi-VN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="mt-6 sm:hidden">
          <Button asChild variant="outline" className="w-full rounded-full">
            <Link href="/articles">
              Xem tất cả bài viết
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
