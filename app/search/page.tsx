"use client";
import { useState } from "react";
import { Search as SearchIcon, SlidersHorizontal, X, ChevronDown, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";
import { BookCard } from "@/components/home/BookCard";
import { featuredManga, lightNovels, bestSellers } from "@/lib/data";

const allBooks = [...featuredManga, ...lightNovels, ...bestSellers];

const genres = [
  "Isekai", "Romance", "Shonen", "Slice of Life", "School Life", 
  "Horror", "Comedy", "Detective", "Fantasy", "Action", "Drama"
];

const formats = ["Manga", "Light Novel", "Comic Việt"];
const publishers = ["Kim Đồng", "Trẻ", "IPM", "Skycomics", "AMAK"];

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [selectedPublishers, setSelectedPublishers] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("newest");
  const [isFilterOpen, setIsFilterOpen] = useState(false);


  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  const toggleFormat = (format: string) => {
    setSelectedFormats(prev => 
      prev.includes(format) ? prev.filter(f => f !== format) : [...prev, format]
    );
  };

  const togglePublisher = (publisher: string) => {
    setSelectedPublishers(prev => 
      prev.includes(publisher) ? prev.filter(p => p !== publisher) : [...prev, publisher]
    );
  };

  const clearAllFilters = () => {
    setSelectedGenres([]);
    setSelectedFormats([]);
    setSelectedPublishers([]);
    setPriceRange([0, 500000]);
    setSearchQuery("");
  };

  const activeFiltersCount = selectedGenres.length + selectedFormats.length + selectedPublishers.length + 
    (priceRange[0] > 0 || priceRange[1] < 500000 ? 1 : 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ";
  };

  const FilterSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <Collapsible defaultOpen className="border-b border-border pb-4">
      <CollapsibleTrigger className="flex w-full items-center justify-between py-2 font-medium text-foreground hover:text-primary transition-colors">
        {title}
        <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2 space-y-2">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );

  const FilterContent = () => (
    <div className="space-y-4">
      {/* Price Range */}
      <FilterSection title="Khoảng giá">
        <div className="px-2 pt-2">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={500000}
            min={0}
            step={10000}
            className="w-full"
          />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>{formatPrice(priceRange[0])}</span>
            <span>{formatPrice(priceRange[1])}</span>
          </div>
        </div>
      </FilterSection>

      {/* Genres */}
      <FilterSection title="Thể loại">
        <div className="space-y-2">
          {genres.map(genre => (
            <label key={genre} className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
              <Checkbox 
                checked={selectedGenres.includes(genre)}
                onCheckedChange={() => toggleGenre(genre)}
              />
              <span className="text-sm">{genre}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Format */}
      <FilterSection title="Định dạng">
        <div className="space-y-2">
          {formats.map(format => (
            <label key={format} className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
              <Checkbox 
                checked={selectedFormats.includes(format)}
                onCheckedChange={() => toggleFormat(format)}
              />
              <span className="text-sm">{format}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Publishers */}
      <FilterSection title="Nhà xuất bản">
        <div className="space-y-2">
          {publishers.map(publisher => (
            <label key={publisher} className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
              <Checkbox 
                checked={selectedPublishers.includes(publisher)}
                onCheckedChange={() => togglePublisher(publisher)}
              />
              <span className="text-sm">{publisher}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <Button 
          variant="outline" 
          className="w-full mt-4"
          onClick={clearAllFilters}
        >
          <X className="h-4 w-4 mr-2" />
          Xóa tất cả bộ lọc
        </Button>
      )}
    </div>
  );

  return (
      <div className="container mx-auto px-4 py-6 lg:py-8">
        {/* Search Header */}
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">Tìm kiếm sách</h1>
          
          {/* Search Bar */}
          <div className="flex gap-3 flex-col sm:flex-row">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Tìm theo tên sách, tác giả..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 rounded-full bg-card/70 backdrop-blur-md border-border/40"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {/* Mobile Filter Button */}
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden h-12 gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Bộ lọc
                  {activeFiltersCount > 0 && (
                    <Badge variant="default" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Bộ lọc nâng cao</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Active Filters Tags */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedGenres.map(genre => (
              <Badge key={genre} variant="secondary" className="gap-1 pr-1">
                {genre}
                <button onClick={() => toggleGenre(genre)} className="ml-1 hover:bg-muted rounded-full p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {selectedFormats.map(format => (
              <Badge key={format} variant="secondary" className="gap-1 pr-1">
                {format}
                <button onClick={() => toggleFormat(format)} className="ml-1 hover:bg-muted rounded-full p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {selectedPublishers.map(publisher => (
              <Badge key={publisher} variant="secondary" className="gap-1 pr-1">
                {publisher}
                <button onClick={() => togglePublisher(publisher)} className="ml-1 hover:bg-muted rounded-full p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {(priceRange[0] > 0 || priceRange[1] < 500000) && (
              <Badge variant="secondary" className="gap-1 pr-1">
                {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                <button onClick={() => setPriceRange([0, 500000])} className="ml-1 hover:bg-muted rounded-full p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}

        <div className="flex gap-8">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-card/70 backdrop-blur-md rounded-2xl border border-border/40 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5" />
                  Bộ lọc
                </h2>
                {activeFiltersCount > 0 && (
                  <Badge variant="default" className="h-6 w-6 p-0 flex items-center justify-center">
                    {activeFiltersCount}
                  </Badge>
                )}
              </div>
              <FilterContent />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-4 bg-card/70 backdrop-blur-md rounded-2xl border border-border/40">
              <p className="text-sm text-muted-foreground">
                Hiển thị <span className="font-medium text-foreground">{allBooks.length}</span> kết quả
              </p>
              
              <div className="flex items-center gap-3">
                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px] h-10 bg-background/50">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Sắp xếp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Mới nhất</SelectItem>
                    <SelectItem value="oldest">Cũ nhất</SelectItem>
                    <SelectItem value="price-asc">Giá: Thấp → Cao</SelectItem>
                    <SelectItem value="price-desc">Giá: Cao → Thấp</SelectItem>
                    <SelectItem value="name-asc">Tên: A → Z</SelectItem>
                    <SelectItem value="name-desc">Tên: Z → A</SelectItem>
                    <SelectItem value="bestseller">Bán chạy nhất</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode */}
                <div className="hidden sm:flex items-center border border-border/40 rounded-lg overflow-hidden">
                  
                  
                </div>
              </div>
            </div>

            {/* Results Grid/List */}
           <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                {allBooks.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            {/* Pagination */}
            <div className="mt-8 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); setCurrentPage(Math.max(1, currentPage - 1)); }}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {[1, 2, 3].map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => { e.preventDefault(); setCurrentPage(page); }}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                  
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      onClick={(e) => { e.preventDefault(); setCurrentPage(10); }}
                      isActive={currentPage === 10}
                    >
                      10
                    </PaginationLink>
                  </PaginationItem>
                  
                  <PaginationItem>
                    <PaginationNext 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); setCurrentPage(Math.min(10, currentPage + 1)); }}
                      className={currentPage === 10 ? "pointer-events-none opacity-50" : ""}
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
