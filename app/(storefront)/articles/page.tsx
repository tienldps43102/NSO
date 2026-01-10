import { Home, Search } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const searchQuery = params.q || "";

  const articles = await $client?.articleRoutes.getLatestArticles({
    page: currentPage,
    limit: 12,
  });

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/" className="flex items-center gap-1">
                <Home className="w-4 h-4" />
                Trang chủ
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Bài viết</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Bài Viết</h1>
          <p className="text-muted-foreground mt-2">
            Khám phá những câu chuyện và tin tức mới nhất
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm bài viết..."
            defaultValue={searchQuery}
            className="pl-9"
          />
        </div>
      </div>

      {/* Articles Grid */}
      {articles && articles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {articles.map((article, index) => (
            <Link
              key={article.id}
              href={`/articles/${article.id}`}
              className="group animate-fade-in"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <Card className="overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm transition-all hover:shadow-hover hover:-translate-y-1 h-full">
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={article.thumbnailUrl ?? "/placeholder.jpg"}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <CardContent className="p-4 space-y-2">
                  <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
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
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Không tìm thấy bài viết nào</p>
        </div>
      )}

      {/* Pagination - Simple implementation */}
      {articles && articles.length === 12 && (
        <div className="flex justify-center gap-2">
          {currentPage > 1 && (
            <Link
              href={`/articles?page=${currentPage - 1}${searchQuery ? `&q=${searchQuery}` : ""}`}
              className="px-4 py-2 border rounded-lg hover:bg-accent transition-colors"
            >
              Trang trước
            </Link>
          )}
          <span className="px-4 py-2 border rounded-lg bg-accent">Trang {currentPage}</span>
          <Link
            href={`/articles?page=${currentPage + 1}${searchQuery ? `&q=${searchQuery}` : ""}`}
            className="px-4 py-2 border rounded-lg hover:bg-accent transition-colors"
          >
            Trang sau
          </Link>
        </div>
      )}
    </div>
  );
}
