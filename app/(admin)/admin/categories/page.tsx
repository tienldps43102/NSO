"use client";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Search, Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { orpcQuery } from "@/lib/orpc.client";
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 20;
type GetAllCategoriesResponse = Outputs["categoryRoutes"]["getAllCategories"];
type Category = GetAllCategoriesResponse["categories"][number];

export default function AdminCategories() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isLoading, refetch } = useQuery<GetAllCategoriesResponse>(
    orpcQuery.categoryRoutes.getAllCategories.queryOptions({
      input: {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        ...(debouncedSearch ? { q: debouncedSearch } : {}),
      },
    }),
  );

  const { mutate: createCategory, isPending: isCreating } = useMutation(
    orpcQuery.categoryRoutes.createCategory.mutationOptions({
      onSuccess: () => {
        toast.success("Tạo danh mục thành công");
        refetch();
        setIsCreateOpen(false);
        setFormData({ name: "", description: "" });
      },
      onError: (error) => {
        toast.error("Lỗi khi tạo danh mục: " + error.message);
      },
    }),
  );

  const { mutate: updateCategory, isPending: isUpdating } = useMutation(
    orpcQuery.categoryRoutes.updateCategory.mutationOptions({
      onSuccess: () => {
        toast.success("Cập nhật danh mục thành công");
        refetch();
        setIsEditOpen(false);
        setSelectedCategory(null);
        setFormData({ name: "", description: "" });
      },
      onError: (error) => {
        toast.error("Lỗi khi cập nhật danh mục: " + error.message);
      },
    }),
  );

  const { mutate: deleteCategory, isPending: isDeleting } = useMutation(
    orpcQuery.categoryRoutes.deleteCategory.mutationOptions({
      onSuccess: () => {
        toast.success("Xóa danh mục thành công");
        refetch();
        setIsDeleteOpen(false);
        setSelectedCategory(null);
      },
      onError: (error) => {
        toast.error("Lỗi khi xóa danh mục: " + error.message);
      },
    }),
  );
  // Define columns for TanStack Table
  const columns = useMemo<ColumnDef<Category>[]>(
    () => [
      {
        accessorKey: "id",
        header: "#ID",
        cell: ({ row }) => <div className="font-medium">{row.original.id}</div>,
      },
      {
        accessorKey: "name",
        header: "Tên danh mục",
        cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
      },
      {
        accessorKey: "description",
        header: "Mô tả",
        cell: ({ row }) => (
          <div className="text-muted-foreground line-clamp-2">
            {row.original.description || "—"}
          </div>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Thao tác</div>,
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="icon" onClick={() => openEditModal(row.original)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
              onClick={() => openDeleteModal(row.original)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: data?.categories ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: data?.totalPages ?? 0,
  });

  const handleCreate = () => {
    if (!formData.name.trim()) return;
    createCategory({
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
    });
  };

  const handleEdit = () => {
    if (!selectedCategory || !formData.name.trim()) return;
    updateCategory({
      id: selectedCategory.id,
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
    });
  };

  const handleDelete = () => {
    if (!selectedCategory) return;
    deleteCategory({
      id: selectedCategory.id,
    });
  };

  const openEditModal = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
    });
    setIsEditOpen(true);
  };

  const openDeleteModal = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteOpen(true);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Quản lý danh mục</h1>
            <p className="text-muted-foreground">Quản lý các danh mục sản phẩm</p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Thêm danh mục
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm danh mục..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10"
          />
        </div>

        {/* Table */}
        <div className="rounded-lg border bg-card">
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
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Không tìm thấy danh mục nào
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {(data?.totalPages ?? 0) > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Hiển thị {data?.categories.length ?? 0} / {data?.totalCount ?? 0} danh mục
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
                Trước
              </Button>
              <div className="text-sm">
                Trang {currentPage} / {data?.totalPages ?? 1}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage >= (data?.totalPages ?? 1) || isLoading}
              >
                Sau
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm danh mục mới</DialogTitle>
            <DialogDescription>Nhập thông tin danh mục sản phẩm mới</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-name">Tên danh mục</Label>
              <Input
                id="create-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="VD: Manga"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-desc">Mô tả</Label>
              <Textarea
                id="create-desc"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả ngắn về danh mục..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreate} disabled={!formData.name.trim() || isCreating}>
              {isCreating ? "Đang tạo..." : "Tạo danh mục"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa danh mục</DialogTitle>
            <DialogDescription>Cập nhật thông tin danh mục</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Tên danh mục</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-desc">Mô tả</Label>
              <Textarea
                id="edit-desc"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleEdit} disabled={!formData.name.trim() || isUpdating}>
              {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Modal */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa danh mục</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa danh mục {selectedCategory?.name}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
