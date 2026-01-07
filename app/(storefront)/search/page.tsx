import { Search as SearchIcon, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectWithNavigation,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ProductCard } from "@/components/home/ProductCard";
import { toPlain } from "@/lib/toPlain";
import { FilterContent } from "./filter";
import { searchSchema } from "./schema";
import qs from "qs";

export default async function Search({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const valitatedParams = searchSchema.safeParse(params);
  const searchResult = await $client?.productRoutes.listProducts({
    q: valitatedParams.data?.q as string,
    page: valitatedParams.data?.page as number,
    limit: valitatedParams.data?.limit as number,
    sort: valitatedParams.data?.sort as
      | "newest"
      | "price_asc"
      | "price_desc"
      | "title_asc"
      | "title_desc",
    inStockOnly: valitatedParams.data?.inStockOnly as boolean,
    categoryIds: valitatedParams.data?.categoryIds as string[],
    brandIds: valitatedParams.data?.brandIds as string[],
    maxPrice: valitatedParams.data?.maxPrice as number,
    minPrice: valitatedParams.data?.minPrice as number,
  });
  const allProducts = toPlain(searchResult?.items);
  const pagination = searchResult?.pagination;
  const currentSort = valitatedParams.data?.sort as
    | "newest"
    | "price_asc"
    | "price_desc"
    | "title_asc"
    | "title_desc";
  function getSortLink(sort: "newest" | "price_asc" | "price_desc" | "title_asc" | "title_desc") {
    const queryString = qs
      .stringify(
        { ...valitatedParams, sort },
        {
          arrayFormat: "repeat",
        },
      )
      .toString();
    return `/search?${queryString}`;
  }
  const sortItems = [
    { value: "newest", label: "Mới nhất", href: getSortLink("newest") },
    { value: "price_asc", label: "Giá: Thấp → Cao", href: getSortLink("price_asc") },
    { value: "price_desc", label: "Giá: Cao → Thấp", href: getSortLink("price_desc") },
    { value: "title_asc", label: "Tên: A → Z", href: getSortLink("title_asc") },
    { value: "title_desc", label: "Tên: Z → A", href: getSortLink("title_desc") },
  ];
  const currentSortDisplay = sortItems.find((item) => item.value === currentSort)?.label;
  return (
    <div className="container mx-auto px-4 py-6 lg:py-8">
      {/* Search Header */}
      <div className="mb-6">
        {/* Search Bar */}
        <div className="flex gap-3 flex-col sm:flex-row">
          <form className="relative flex-1" action="/search">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Tìm theo tên sách, tác giả..."
              defaultValue={params.q as string}
              className="pl-12 h-12 rounded-full bg-card/70 backdrop-blur-md border-border/40"
              name="q"
            />
          </form>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden h-12 gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Bộ lọc
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Bộ lọc nâng cao</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterContent currentParams={params} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <div className="flex gap-8">
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24 bg-card/70 backdrop-blur-md rounded-2xl border border-border/40 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5" />
                Bộ lọc
              </h2>
            </div>
            <FilterContent currentParams={params} />
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-4 bg-card/70 backdrop-blur-md rounded-2xl border border-border/40">
            <p className="text-sm text-muted-foreground">
              Hiển thị <span className="font-medium text-foreground">{allProducts?.length}</span> kết
              quả
            </p>

            <div className="flex items-center gap-3">
              {/* Sort */}
              <SelectWithNavigation
                items={sortItems}
                placeholder={currentSortDisplay}
                defaultValue={currentSort}
              >
                <SelectTrigger className="w-[180px] h-10 bg-background/50">
                  <ArrowUpDown className="h-4 w-4 mr-1" />
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>

                <SelectContent>
                  {sortItems.map((item) => (
                    <SelectItem key={item.value} value={item.value} href={item.href}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectWithNavigation>

              {/* View Mode */}
              <div className="hidden sm:flex items-center border border-border/40 rounded-lg overflow-hidden"></div>
            </div>
          </div>

          {/* Results Grid/List */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {allProducts?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {/* Pagination */}
          <div className="mt-8 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href={`/search?page=${(pagination?.page ?? 1) - 1}`}
                    isActive={pagination?.page === 1}
                  />
                </PaginationItem>
                {Array.from({ length: pagination?.totalPages ?? 0 }, (_, index) => (
                  <PaginationItem key={index}>
                    <PaginationLink
                      href={`/search?page=${index + 1}`}
                      isActive={pagination?.page === index + 1}
                    >
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href={`/search?page=${(pagination?.page ?? 1) + 1}`}
                    isActive={pagination?.page === (pagination?.totalPages ?? 1)}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>
    </div>
  );
}
