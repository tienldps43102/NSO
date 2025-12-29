"use client";
import { Home } from "lucide-react";
import { ProductGallery } from "@/components/book-detail/ProductGallery";
import { ProductInfo } from "@/components/book-detail/ProductInfo";
import { ProductDetails } from "@/components/book-detail/ProductDetails";
import { RelatedProducts } from "@/components/book-detail/RelatedProducts";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { featuredManga } from "@/lib/data";
import { useParams } from "next/navigation";
import Link from "next/link";

// Mock data for the book detail
const mockBook = {
  id: "1",
  title: "Spy x Family - Tập 10: Gia Đình Điệp Viên",
  author: "Tatsuya Endo",
  authorId: "tatsuya-endo",
  productCode: "SPY-FAM-10",
  images: [
    "/covers/spy-family.jpg",
    "/covers/spy-family.jpg",
    "/covers/spy-family.jpg",
    "/covers/spy-family.jpg",
    "/covers/spy-family.jpg",
    "/covers/spy-family.jpg",
  ],
  discount: 20,
  rating: 4.8,
  reviewCount: 156,
  isNewRelease: true,
  inStock: true,
  variants: [
    { id: "normal", name: "Bản thường", price: 25000, originalPrice: 31250, inStock: true },
    { id: "special", name: "Bản đặc biệt", price: 85000, originalPrice: 100000, inStock: true },
    { id: "limited", name: "Bản giới hạn", price: 250000, inStock: false },
  ],
  description: `SPY×FAMILY là bộ manga shounen do Tatsuya Endo sáng tác, được đăng trên tạp chí nhảy online Shonen Jump+ từ tháng 3 năm 2019.

Câu chuyện xoay quanh một điệp viên tài ba phải "xây dựng một gia đình" để thực hiện nhiệm vụ, không ngờ rằng cô con gái nhận nuôi của anh ta là một nhà ngoại cảm, còn người vợ anh ta chọn lại là một sát thủ.

Tập 10 tiếp tục những câu chuyện hài hước và cảm động về gia đình Forger với nhiều tình tiết bất ngờ và gay cấn. Anya tiếp tục gây ra những tình huống dở khóc dở cười trong khi Loid phải đối mặt với những nhiệm vụ nguy hiểm mới.`,
  details: [
    { label: "Nhà xuất bản", value: "NXB Kim Đồng" },
    { label: "Ngày xuất bản", value: "15/03/2024" },
    { label: "Số trang", value: "192" },
    { label: "Kích thước", value: "13 x 18 cm" },
    { label: "Loại bìa", value: "Bìa mềm" },
    { label: "Ngôn ngữ", value: "Tiếng Việt" },
    { label: "Thể loại", value: "Manga, Hành động, Hài hước" },
    { label: "Đối tượng", value: "Từ 13 tuổi trở lên" },
  ],
};

const mockReviews = {
  averageRating: 4.8,
  totalReviews: 156,
  ratingBreakdown: [
    { stars: 5, count: 120 },
    { stars: 4, count: 25 },
    { stars: 3, count: 8 },
    { stars: 2, count: 2 },
    { stars: 1, count: 1 },
  ],
  reviews: [
    {
      id: "1",
      author: "Minh Anh",
      rating: 5,
      date: "20/03/2024",
      content:
        "Manga rất hay, nội dung hấp dẫn và hình vẽ đẹp. Đóng gói cẩn thận, giao hàng nhanh. Sẽ ủng hộ tiếp!",
      helpful: 24,
    },
    {
      id: "2",
      author: "Hoàng Long",
      rating: 5,
      date: "18/03/2024",
      content:
        "Tập 10 quá đỉnh! Nhiều tình tiết bất ngờ và cảm động. Anya vẫn cute như mọi khi. Highly recommend cho fan của series.",
      helpful: 18,
    },
    {
      id: "3",
      author: "Thu Hà",
      rating: 4,
      date: "15/03/2024",
      content:
        "Sách chất lượng tốt, in ấn rõ nét. Chỉ tiếc là hơi mỏng so với giá tiền. Nhưng vẫn rất đáng để sưu tầm.",
      helpful: 12,
    },
  ],
};

export default function BookDetail() {
  const { id } = useParams();

 

 

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
                <Link href="/search?category=manga">Manga</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{mockBook.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Main Product Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Left Column - Gallery */}
          <ProductGallery
            images={mockBook.images}
            title={mockBook.title}
            discount={mockBook.discount}
            className="lg:col-span-1"
          />

          {/* Right Column - Info */}
          <ProductInfo
            className="lg:col-span-2" 
            details={mockBook.details}

            title={mockBook.title}
            author={mockBook.author}
            authorId={mockBook.authorId}
            productCode={mockBook.productCode}
            rating={mockBook.rating}
            reviewCount={mockBook.reviewCount}
            variants={mockBook.variants}
            isNewRelease={mockBook.isNewRelease}
            inStock={mockBook.inStock}
          />
        </section>

        {/* Divider */}
        <hr className="border-border" />

        {/* Product Details */}
        <ProductDetails
          description={mockBook.description}
          details={mockBook.details}
        />

        {/* Divider */}
        <hr className="border-border" />

        {/* Customer Reviews */}
   

        {/* Related Products */}
        <RelatedProducts title="Sản phẩm liên quan" products={featuredManga} />
      </div>

  );
}
