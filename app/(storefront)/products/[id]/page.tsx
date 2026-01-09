import { Home } from "lucide-react";
import { ProductGallery } from "@/components/product-detail/ProductGallery";
import { ProductInfo } from "@/components/product-detail/ProductInfo";
import { ProductDetails } from "@/components/product-detail/ProductDetails";
import {
  RelatedProducts,
  RelatedProductsSkeleton,
} from "@/components/product-detail/RelatedProducts";
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

//  get id from params and fetch product detail data from api
export default async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Fetch product detail data from API
  const productDetail = await $client?.productRoutes.getProductById({ id });
  if (!productDetail) {
    notFound();
  }

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
              <Link href={`/search?categories=${productDetail.category?.id}`}>
                {productDetail.category?.name || "Truyện tranh"}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{productDetail.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Main Product Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Left Column - Gallery */}
        <ProductGallery
          images={productDetail.images.map((img) => img.url)!}
          title={productDetail.title}
          className="lg:col-span-1"
        />

        {/* Right Column - Info */}
        <ProductInfo className="lg:col-span-2" productDetail={toPlain(productDetail)} />
      </section>

      {/* Divider */}
      <hr className="border-border" />

      {/* Product Details */}
      <ProductDetails description={productDetail.description || ""} />

      {/* Divider */}
      <hr className="border-border" />

      {productDetail.brandId && (
        <Suspense fallback={<RelatedProductsSkeleton title="Cùng bộ" itemCount={5} />}>
          <RelatedProducts
            title="Cùng hãng"
            moreHref={`/brand/${productDetail.brandId}`}
            fetchFunction={async () => {
              const brandProducts = await $client?.productRoutes.getProductByBrandId({
                brandId: productDetail.brandId!,
              });
              return toPlain(brandProducts || []);
            }}
          />
        </Suspense>
      )}
      {/* Related Products */}
      <Suspense fallback={<RelatedProductsSkeleton title="Sản phẩm liên quan" itemCount={5} />}>
        <RelatedProducts
          title="Sản phẩm liên quan"
          fetchFunction={async () => {
            const relatedProducts = await $client?.productRoutes.getRelatedProducts({
              productId: productDetail.id,
            });
            return toPlain(relatedProducts || []);
          }}
        />
      </Suspense>
    </div>
  );
}
