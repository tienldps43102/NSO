import { Home, Calendar, ArrowLeft } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const article = await $client?.articleRoutes.getArticleById({ id });

  if (!article) {
    notFound();
  }

  // Get related articles
  const relatedArticles = await $client?.articleRoutes.getLatestArticles({
    page: 1,
    limit: 3,
  });

  const filteredRelatedArticles = relatedArticles?.filter((a) => a.id !== article.id).slice(0, 3);

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
            <BreadcrumbLink asChild>
              <Link href="/articles">Bài viết</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{article.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Back Button */}
      <Button asChild variant="ghost" size="sm">
        <Link href="/articles">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại danh sách
        </Link>
      </Button>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">{article.title}</h1>

          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <time dateTime={article.createdAt.toString()}>
                {new Date(article.createdAt).toLocaleDateString("vi-VN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        {article.thumbnailUrl && (
          <div className="relative aspect-video overflow-hidden rounded-xl">
            <Image
              src={article.thumbnailUrl}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Article Body */}
        <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6 md:p-8 prose prose-slate dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
          </CardContent>
        </Card>
      </article>

      {/* Divider */}
      <hr className="border-border my-12" />

      {/* Related Articles */}
      {filteredRelatedArticles && filteredRelatedArticles.length > 0 && (
        <section className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Bài viết liên quan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRelatedArticles.map((relatedArticle) => (
              <Link
                key={relatedArticle.id}
                href={`/articles/${relatedArticle.id}`}
                className="group"
              >
                <Card className="overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm transition-all hover:shadow-hover hover:-translate-y-1 h-full">
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={relatedArticle.thumbnailUrl ?? "/placeholder.jpg"}
                      alt={relatedArticle.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <CardContent className="p-4 space-y-2">
                    <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                      {relatedArticle.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(relatedArticle.createdAt).toLocaleDateString("vi-VN", {
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
        </section>
      )}
    </div>
  );
}
