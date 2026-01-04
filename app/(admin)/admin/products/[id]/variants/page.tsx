import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Plus, Search, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

interface Variant {
  id: string;
  skuCode: string;
  name: string;
  price: number;
  stock: number;
  status: "active" | "inactive";
}

const mockVariants: Variant[] = [
  {
    id: "1",
    skuCode: "OP-VOL-01",
    name: "One Piece - Tập 1",
    price: 35000,
    stock: 150,
    status: "active",
  },
  {
    id: "2",
    skuCode: "OP-VOL-02",
    name: "One Piece - Tập 2",
    price: 35000,
    stock: 120,
    status: "active",
  },
  {
    id: "3",
    skuCode: "OP-VOL-03",
    name: "One Piece - Tập 3",
    price: 35000,
    stock: 0,
    status: "inactive",
  },
  {
    id: "4",
    skuCode: "JJK-VOL-01",
    name: "Jujutsu Kaisen - Tập 1",
    price: 40000,
    stock: 200,
    status: "active",
  },
  {
    id: "5",
    skuCode: "JJK-VOL-02",
    name: "Jujutsu Kaisen - Tập 2",
    price: 40000,
    stock: 180,
    status: "active",
  },
  {
    id: "6",
    skuCode: "CSM-VOL-01",
    name: "Chainsaw Man - Tập 1",
    price: 45000,
    stock: 90,
    status: "active",
  },
  {
    id: "7",
    skuCode: "CSM-VOL-02",
    name: "Chainsaw Man - Tập 2",
    price: 45000,
    stock: 75,
    status: "active",
  },
  {
    id: "8",
    skuCode: "SPY-VOL-01",
    name: "Spy x Family - Tập 1",
    price: 38000,
    stock: 0,
    status: "inactive",
  },
  {
    id: "9",
    skuCode: "BL-VOL-01",
    name: "Blue Lock - Tập 1",
    price: 42000,
    stock: 60,
    status: "active",
  },
  {
    id: "10",
    skuCode: "BL-VOL-02",
    name: "Blue Lock - Tập 2",
    price: 42000,
    stock: 55,
    status: "active",
  },
  {
    id: "11",
    skuCode: "OVL-VOL-01",
    name: "Overlord - Tập 1",
    price: 95000,
    stock: 30,
    status: "active",
  },
  {
    id: "12",
    skuCode: "RZ-VOL-01",
    name: "Re:Zero - Tập 1",
    price: 90000,
    stock: 25,
    status: "active",
  },
];

const ITEMS_PER_PAGE = 8;

const AdminVariants = () => {
  const [variants, setVariants] = useState<Variant[]>(mockVariants);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [formData, setFormData] = useState({
    skuCode: "",
    name: "",
    price: 0,
    stock: 0,
    status: "active" as "active" | "inactive",
  });

  const filteredVariants = variants.filter(
    (variant) =>
      variant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      variant.skuCode.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredVariants.length / ITEMS_PER_PAGE);
  const paginatedVariants = filteredVariants.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const resetForm = () => {
    setFormData({ skuCode: "", name: "", price: 0, stock: 0, status: "active" });
  };

  const handleCreate = () => {
    const newVariant: Variant = {
      id: Date.now().toString(),
      ...formData,
    };
    setVariants([...variants, newVariant]);
    setIsCreateOpen(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!selectedVariant) return;
    setVariants(variants.map((v) => (v.id === selectedVariant.id ? { ...v, ...formData } : v)));
    setIsEditOpen(false);
    setSelectedVariant(null);
    resetForm();
  };

  const handleDelete = () => {
    if (!selectedVariant) return;
    setVariants(variants.filter((v) => v.id !== selectedVariant.id));
    setIsDeleteOpen(false);
    setSelectedVariant(null);
  };

  const openEditModal = (variant: Variant) => {
    setSelectedVariant(variant);
    setFormData({
      skuCode: variant.skuCode,
      name: variant.name,
      price: variant.price,
      stock: variant.stock,
      status: variant.status,
    });
    setIsEditOpen(true);
  };

  const openDeleteModal = (variant: Variant) => {
    setSelectedVariant(variant);
    setIsDeleteOpen(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý biến thể</h1>
          <p className="text-muted-foreground">Quản lý các biến thể sản phẩm (SKU)</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm biến thể
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm theo SKU hoặc tên..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10"
          />
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã SKU</TableHead>
              <TableHead>Tên biến thể</TableHead>
              <TableHead className="text-right">Giá</TableHead>
              <TableHead className="text-right">Tồn kho</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedVariants.map((variant) => (
              <TableRow key={variant.id}>
                <TableCell className="font-mono text-sm">{variant.skuCode}</TableCell>
                <TableCell className="font-medium">{variant.name}</TableCell>
                <TableCell className="text-right">{formatPrice(variant.price)}</TableCell>
                <TableCell className="text-right">{variant.stock}</TableCell>
                <TableCell>
                  <Badge variant={variant.status === "active" ? "default" : "secondary"}>
                    {variant.status === "active" ? "Đang bán" : "Ngừng bán"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditModal(variant)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => openDeleteModal(variant)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {paginatedVariants.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Không tìm thấy biến thể nào
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  onClick={() => setCurrentPage(page)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className={
                  currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Create Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm biến thể mới</DialogTitle>
            <DialogDescription>Nhập thông tin biến thể sản phẩm mới</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-sku">Mã SKU</Label>
              <Input
                id="create-sku"
                placeholder="VD: OP-VOL-01"
                value={formData.skuCode}
                onChange={(e) => setFormData({ ...formData, skuCode: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-name">Tên biến thể</Label>
              <Input
                id="create-name"
                placeholder="VD: One Piece - Tập 1"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-price">Giá (VNĐ)</Label>
                <Input
                  id="create-price"
                  type="number"
                  min={0}
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-stock">Tồn kho</Label>
                <Input
                  id="create-stock"
                  type="number"
                  min={0}
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreate}>Tạo biến thể</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa biến thể</DialogTitle>
            <DialogDescription>Cập nhật thông tin biến thể sản phẩm</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-sku">Mã SKU</Label>
              <Input
                id="edit-sku"
                value={formData.skuCode}
                onChange={(e) => setFormData({ ...formData, skuCode: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-name">Tên biến thể</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-price">Giá (VNĐ)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  min={0}
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-stock">Tồn kho</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  min={0}
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleEdit}>Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Modal */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa biến thể &quot;{selectedVariant?.name}&quot;? Hành động này không thể
              hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminVariants;
