"use client";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Power,
  PowerOff,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { orpcQuery } from "@/lib/orpc.client";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";

type ListBooksResponse = Outputs['bookRoutes']['listBooks'];
type BookItem = ListBooksResponse['items'][number];

const sortOptions = [
  { value: "newest", label: "Mới nhất" },
  { value: "price_asc", label: "Giá tăng dần" },
  { value: "price_desc", label: "Giá giảm dần" },
  { value: "title_asc", label: "Tên A-Z" },
  { value: "title_desc", label: "Tên Z-A" },
] as const;

const AdminProducts = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>();
  const [sort, setSort] = useState<"newest" | "price_asc" | "price_desc" | "title_asc" | "title_desc">("newest");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to page 1 on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isLoading } = useQuery<ListBooksResponse>(
    orpcQuery.bookRoutes.listBooks.queryOptions({
      input: {
        page,
        limit,
        withInActive: true,
        sort,
        ...(debouncedSearch ? { q: debouncedSearch } : {}),
      },
    })
  );

  // Filter by status client-side since API doesn't have this filter
  const filteredItems = useMemo(() => {
    if (!data?.items) return [];
    if (statusFilter === undefined) return data.items;
    return data.items.filter((item: BookItem) => item.isActive === statusFilter);
  }, [data, statusFilter]);


  // Define columns
  const columns = useMemo<ColumnDef<BookItem>[]>(
    () => [
      {
        accessorKey: "thumbnailUrl",
        header: "Ảnh",
        cell: ({ row }) => (
          <Image
            src={row.original.thumbnailUrl ?? ""}
            alt={row.original.title}
            className="h-12 w-9 rounded object-cover"
            width={36}
            height={48}
          />
        ),
      },
      {
        accessorKey: "title",
        header: "Tên sản phẩm",
        cell: ({ row }) => (
          <div className="font-medium line-clamp-2">{row.original.title}</div>
        ),
      },
      {
        accessorKey: "publisher.name",
        header: "Nhà xuất bản",
        cell: ({ row }) => (
          <div className="text-muted-foreground">
            {row.original.publisher?.name}
          </div>
        ),
      },
      {
        accessorKey: "category.name",
        header: "Danh mục",
        cell: ({ row }) => (
          <Badge variant="outline">{row.original.category.name}</Badge>
        ),
      },
      {
        accessorKey: "displayPrice",
        header: "Giá",
        cell: ({ row }) => (
          <div className="text-right">
            {formatPrice(Number(row.original.displayPrice))}
          </div>
        ),
      },
      {
        accessorKey: "isActive",
        header: "Trạng thái",
        cell: ({ row }) => (
          <div className="text-center">
            <Badge
              variant={row.original.isActive ? "default" : "secondary"}
            >
              {row.original.isActive ? "Đang bán" : "Ngừng bán"}
            </Badge>
          </div>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/admin/products/${row.original.id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Chỉnh sửa
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                {row.original.isActive ? (
                  <>
                    <PowerOff className="mr-2 h-4 w-4" />
                    Ngừng bán
                  </>
                ) : (
                  <>
                    <Power className="mr-2 h-4 w-4" />
                    Kích hoạt
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredItems,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: data?.pagination.totalPages ?? 0,
  });


  return (
    <div className="space-y-6">
    {/* Header */}
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold">Quản lý sản phẩm</h1>
        <p className="text-muted-foreground">
          Quản lý danh sách sản phẩm của cửa hàng
        </p>
      </div>
      <Button asChild>
        <Link href="/admin/products/create">
          <Plus className="mr-2 h-4 w-4" />
          Thêm sản phẩm
        </Link>
      </Button>
    </div>

    {/* Filters */}
    <div className="flex flex-col gap-4 rounded-xl border border-border/40 bg-card/50 p-4 backdrop-blur-sm sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm sản phẩm..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="flex gap-2">
        <Select
          value={sort}
          onValueChange={(value) => {
            setSort(value as typeof sort);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Sắp xếp" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={statusFilter === undefined ? "all" : statusFilter ? "active" : "inactive"}
          onValueChange={(value) => {
            setStatusFilter(value === "all" ? undefined : value === "active");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="active">Đang bán</SelectItem>
            <SelectItem value="inactive">Ngừng bán</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    {/* Products Table */}
    <div className="rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Đang tải...
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Không tìm thấy sản phẩm nào
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>

    {/* Pagination */}
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        Hiển thị {filteredItems.length} / {data?.pagination.total ?? 0} sản phẩm
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1 || isLoading}
        >
          <ChevronLeft className="h-4 w-4" />
          Trước
        </Button>
        <div className="text-sm">
          Trang {page} / {data?.pagination.totalPages ?? 1}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => p + 1)}
          disabled={page >= (data?.pagination.totalPages ?? 1) || isLoading}
        >
          Sau
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
  );
};

export default AdminProducts;