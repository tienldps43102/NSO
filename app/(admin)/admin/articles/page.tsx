"use client";
import { useCallback, useState, useMemo, useEffect } from "react";
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
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import { orpcQuery } from "@/lib/orpc.client";
import Image from "next/image";
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ArticleItem = Outputs["articleRoutes"]["getAllArticles"][number];

const AdminArticles = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to page 1 on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isLoading, refetch } = useQuery(
    orpcQuery.articleRoutes.getAllArticles.queryOptions({
      input: {
        page,
        limit,
        ...(debouncedSearch ? { q: debouncedSearch } : {}),
        ...(statusFilter !== undefined ? { isActive: statusFilter } : {}),
      },
    }),
  );

  const mutateToggleActive = useMutation(
    orpcQuery.articleRoutes.updateArticle.mutationOptions({
      onSuccess: () => {
        refetch();
        toast.success("Cập nhật trạng thái thành công");
      },
      onError: () => {
        toast.error("Có lỗi xảy ra");
      },
    }),
  );

  const mutateDeleteArticle = useMutation(
    orpcQuery.articleRoutes.deleteArticle.mutationOptions({
      onSuccess: () => {
        refetch();
        toast.success("Xóa bài viết thành công");
        setDeleteDialogOpen(false);
        setArticleToDelete(null);
      },
      onError: () => {
        toast.error("Có lỗi xảy ra khi xóa bài viết");
      },
    }),
  );

  const toggleActiveArticle = useCallback(
    (id: string, isActive: boolean) => {
      mutateToggleActive.mutate({ id, isActive: !isActive });
    },
    [mutateToggleActive],
  );

  const handleDeleteClick = useCallback((id: string) => {
    setArticleToDelete(id);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (articleToDelete) {
      mutateDeleteArticle.mutate({ id: articleToDelete });
    }
  }, [articleToDelete, mutateDeleteArticle]);

  // Define columns
  const columns = useMemo<ColumnDef<ArticleItem>[]>(
    () => [
      {
        accessorKey: "thumbnailUrl",
        header: "Ảnh",
        cell: ({ row }) => (
          <Image
            src={row.original.thumbnailUrl ?? ""}
            alt={row.original.title}
            className="h-12 w-16 rounded object-cover"
            width={64}
            height={48}
          />
        ),
      },
      {
        accessorKey: "title",
        header: "Tiêu đề",
        cell: ({ row }) => <div className="font-medium line-clamp-2 max-w-md">{row.original.title}</div>,
      },
      {
        accessorKey: "createdAt",
        header: "Ngày tạo",
        cell: ({ row }) => (
          <div className="text-muted-foreground">
            {new Date(row.original.createdAt).toLocaleDateString("vi-VN")}
          </div>
        ),
      },
      {
        accessorKey: "isActive",
        header: "Trạng thái",
        cell: ({ row }) => (
          <div className="text-center">
            <Badge variant={row.original.isActive ? "default" : "secondary"}>
              {row.original.isActive ? "Xuất bản" : "Nháp"}
            </Badge>
          </div>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/admin/articles/${row.original.id}/edit`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Chỉnh sửa
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => toggleActiveArticle(row.original.id, row.original.isActive)}
                >
                  {row.original.isActive ? (
                    <>
                      <PowerOff className="mr-2 h-4 w-4" />
                      Chuyển thành nháp
                    </>
                  ) : (
                    <>
                      <Power className="mr-2 h-4 w-4" />
                      Xuất bản
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDeleteClick(row.original.id)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa bài viết
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [toggleActiveArticle, handleDeleteClick],
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Quản lý bài viết</h1>
            <p className="text-muted-foreground">Quản lý danh sách bài viết của cửa hàng</p>
          </div>
          <Button asChild>
            <Link href="/admin/articles/create">
              <Plus className="mr-2 h-4 w-4" />
              Thêm bài viết
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 rounded-xl border border-border/40 bg-card/50 p-4 backdrop-blur-sm sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm bài viết..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
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
                <SelectItem value="active">Xuất bản</SelectItem>
                <SelectItem value="inactive">Nháp</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Articles Table */}
        <div className="rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
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
                    Không tìm thấy bài viết nào
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Hiển thị {data?.length ?? 0} bài viết
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
            <div className="text-sm">Trang {page}</div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={!data || data.length < limit || isLoading}
            >
              Sau
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa bài viết</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AdminArticles;
