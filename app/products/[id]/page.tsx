import { Home } from "lucide-react";
import { ProductGallery } from "@/components/book-detail/ProductGallery";
import { ProductInfo } from "@/components/book-detail/ProductInfo";
import { ProductDetails } from "@/components/book-detail/ProductDetails";
import { RelatedProducts, RelatedProductsSkeleton } from "@/components/book-detail/RelatedProducts";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { toPlain } from "@/lib/toPlain";



//  get id from params and fetch book detail data from api
export default async function BookDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Fetch book detail data from API
  const bookDetail = await $client?.bookRoutes.getBookById({ id });
  if (!bookDetail) {
    notFound();
  }



  return (

    <div className="container mx-auto px-4 py-6 space-y-8" >
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
              <Link href={`/search?categories=${bookDetail.category?.id}`}>
                {bookDetail.category?.name || "Truyện tranh"}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{bookDetail.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Main Product Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Left Column - Gallery */}
        <ProductGallery
          images={bookDetail.images.map((img) => img.url)!}
          title={bookDetail.title}
          className="lg:col-span-1"
        />

        {/* Right Column - Info */}
        <ProductInfo
          className="lg:col-span-2"
          bookDetail={toPlain(bookDetail)}
        />
      </section>

      {/* Divider */}
      <hr className="border-border" />

      {/* Product Details */}
      <ProductDetails
        description={bookDetail.description || ""}
      />

      {/* Divider */}
      <hr className="border-border" />

      {
        bookDetail.seriesId && (
          <Suspense fallback={<RelatedProductsSkeleton title="Cùng bộ" itemCount={5} />}>
            <RelatedProducts title="Cùng bộ" 
            moreHref={`/series/${bookDetail.seriesId}`}
            fetchFunction={async () => {
              const seriesBooks = await $client?.bookRoutes.getBookBySeriesId({ seriesId: bookDetail.seriesId!,excludeBookId: bookDetail.id, limit: 20 });
              return toPlain(seriesBooks || []);
            }}
            />
          </Suspense>
        )
      }
      {/* Related Products */}
      <Suspense fallback={<RelatedProductsSkeleton title="Sản phẩm liên quan" itemCount={5} />}>
        <RelatedProducts title="Sản phẩm liên quan"  
          fetchFunction={async () => {
            const relatedBooks = await $client?.bookRoutes.getRelatedBooks({ bookId: bookDetail.id });
            return toPlain(relatedBooks || []);
          }}
        />
      </Suspense>
    </div>

  );
}
