"use client";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowLeft, Plus, MoreHorizontal, Pencil, Package, Power } from "lucide-react";
import z from "zod";
import { formatPrice } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { orpcQuery } from "@/lib/orpc.client";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Variant = Outputs["bookRoutes"]["getVariantsByProductId"][number];

const variantSchema = z.object({
  id: z.string().optional(),
  sku: z.string().min(1, { message: "Mã SKU là bắt buộc" }),
  variantName: z.string().min(1, { message: "Tên biến thể là bắt buộc" }),
  price: z.number().min(0, { message: "Giá phải lớn hơn hoặc bằng 0" }),
  stockQuantity: z.number().min(0, { message: "Tồn kho phải lớn hơn hoặc bằng 0" }),
  isActive: z.boolean().optional(),
});
type VariantInput = z.infer<typeof variantSchema>;

const stockSchema = z.object({
  stockQuantity: z.number().min(1, { message: "Số lượng phải lớn hơn 0" }),
});
type StockInput = z.infer<typeof stockSchema>;

export default function AdminVariantsClientPage({
  variants,
  productId,
}: {
  variants: Variant[];
  productId: string;
}) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isStockOpen, setIsStockOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);

  const variantForm = useForm<VariantInput>({
    resolver: zodResolver(variantSchema),
    defaultValues: {
      sku: "",
      variantName: "",
      price: 0,
      stockQuantity: 0,
      isActive: true,
    },
  });

  const stockForm = useForm<StockInput>({
    resolver: zodResolver(stockSchema),
    defaultValues: {
      stockQuantity: 0,
    },
  });
  const router = useRouter();
  const addVariantMutation = useMutation(
    orpcQuery.bookAdminRoutes.addVariant.mutationOptions({
      onSuccess: () => {
        toast.success("Thêm biến thể thành công");
        setIsCreateOpen(false);
        variantForm.reset();
        router.refresh();
      },
      onError: (error: Error) => {
        toast.error(error.message);
      },
    }),
  );

  const updateVariantMutation = useMutation(
    orpcQuery.bookAdminRoutes.updateVariant.mutationOptions({
      onSuccess: () => {
        toast.success("Cập nhật biến thể thành công");
        setIsEditOpen(false);
        variantForm.reset();
        router.refresh();
      },
      onError: (error: Error) => {
        toast.error(error.message);
      },
    }),
  );
  const addStockMutation = useMutation(
    orpcQuery.bookAdminRoutes.addStock.mutationOptions({
      onSuccess: () => {
        toast.success("Thêm tồn kho thành công");
      },
      onError: (error: Error) => {
        toast.error(error.message);
      },
    }),
  );

  const handleCreate = (data: VariantInput) => {
    addVariantMutation.mutate({
      variantName: data.variantName,
      price: data.price,
      stockQuantity: data.stockQuantity,
      id: productId,
    });
  };

  const handleEdit = (data: VariantInput) => {
    if (!selectedVariant) return;
    updateVariantMutation.mutate({
      id: productId,
      variantId: selectedVariant.id!,
      variantName: data.variantName,
      price: data.price,
      stockQuantity: data.stockQuantity,
    });
  };
  const handleAddStock = (data: StockInput) => {
    if (!selectedVariant) return;
    addStockMutation.mutate({
      id: productId,
      variantId: selectedVariant.id!,
      stockQuantity: data.stockQuantity,
    });
    setIsStockOpen(false);
    stockForm.reset();
  };

  const toggleActiveMutation = useMutation(
    orpcQuery.bookAdminRoutes.toggleActiveVariant.mutationOptions({
      onSuccess: () => {
        toast.success("Cập nhật trạng thái thành công");
        router.refresh();
      },
      onError: (error: Error) => {
        toast.error(error.message);
      },
    }),
  );

  const handleToggleActive = (variant: Variant) => {
    toggleActiveMutation.mutate({
      id: productId,
      variantId: variant.id!,
    });
  };
  const openEditModal = (variant: Variant) => {
    setSelectedVariant(variant);
    variantForm.reset({
      id: variant.id,
      sku: variant.sku,
      variantName: variant.variantName,
      price: Number(variant.price),
      stockQuantity: variant.stockQuantity,
      isActive: variant.isActive,
    });
    setIsEditOpen(true);
  };

  const handleCloseCreate = () => {
    setIsCreateOpen(false);
    variantForm.reset();
  };

  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setSelectedVariant(null);
    variantForm.reset();
  };

  const handleOpenCreateModal = () => {
    setIsCreateOpen(true);
    variantForm.reset();
  };

  const openStockModal = (variant: Variant) => {
    setSelectedVariant(variant);
    stockForm.reset({ stockQuantity: 0 });
    setIsStockOpen(true);
  };

  const handleCloseStock = () => {
    setIsStockOpen(false);
    setSelectedVariant(null);
    stockForm.reset();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý biến thể</h1>
          <p className="text-muted-foreground">Quản lý các biến thể sản phẩm (SKU)</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/products`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Link>
          </Button>
          <Button onClick={handleOpenCreateModal}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm biến thể
          </Button>
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
            {variants.map((variant) => (
              <TableRow key={variant.id}>
                <TableCell className="font-mono text-sm">{variant.sku}</TableCell>
                <TableCell className="font-medium">{variant.variantName}</TableCell>
                <TableCell className="text-right">{formatPrice(Number(variant.price))}</TableCell>
                <TableCell className="text-right">{variant.stockQuantity}</TableCell>
                <TableCell>
                  <Badge variant={variant.isActive ? "default" : "secondary"}>
                    {variant.isActive ? "Đang bán" : "Ngừng bán"}
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
                      <DropdownMenuItem onClick={() => openStockModal(variant)}>
                        <Package className="mr-2 h-4 w-4" />
                        Nhập kho
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleActive(variant)}>
                        <Power className="mr-2 h-4 w-4" />
                        {variant.isActive ? "Tạm dừng bán" : "Kích hoạt"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {variants.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Không tìm thấy biến thể nào
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Modal */}
      <Dialog open={isCreateOpen} onOpenChange={handleCloseCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm biến thể mới</DialogTitle>
            <DialogDescription>Nhập thông tin biến thể sản phẩm mới</DialogDescription>
          </DialogHeader>
          <Form {...variantForm}>
            <form onSubmit={variantForm.handleSubmit(handleCreate)} className="space-y-4 py-4">
              <FormField
                control={variantForm.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã SKU *</FormLabel>
                    <FormControl>
                      <Input placeholder="VD: OP-VOL-01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={variantForm.control}
                name="variantName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên biến thể *</FormLabel>
                    <FormControl>
                      <Input placeholder="VD: One Piece - Tập 1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={variantForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giá (VNĐ) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={variantForm.control}
                  name="stockQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tồn kho *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseCreate}>
                  Hủy
                </Button>
                <Button type="submit">Tạo biến thể</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={handleCloseEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa biến thể</DialogTitle>
            <DialogDescription>Cập nhật thông tin biến thể sản phẩm</DialogDescription>
          </DialogHeader>
          <Form {...variantForm}>
            <form onSubmit={variantForm.handleSubmit(handleEdit)} className="space-y-4 py-4">
              <FormField
                control={variantForm.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã SKU *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={variantForm.control}
                name="variantName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên biến thể *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={variantForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giá (VNĐ) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={variantForm.control}
                  name="stockQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tồn kho *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseEdit}>
                  Hủy
                </Button>
                <Button type="submit">Lưu thay đổi</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Stock Modal */}
      <Dialog open={isStockOpen} onOpenChange={handleCloseStock}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nhập kho</DialogTitle>
            <DialogDescription>
              Thêm số lượng tồn kho cho biến thể: {selectedVariant?.variantName}
            </DialogDescription>
          </DialogHeader>
          <Form {...stockForm}>
            <form onSubmit={stockForm.handleSubmit(handleAddStock)} className="space-y-4 py-4">
              <div className="space-y-2">
                <div className="rounded-md bg-muted p-3">
                  <p className="text-sm text-muted-foreground">Tồn kho hiện tại</p>
                  <p className="text-2xl font-bold">{selectedVariant?.stockQuantity || 0}</p>
                </div>
              </div>
              <FormField
                control={stockForm.control}
                name="stockQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số lượng nhập *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        placeholder="Nhập số lượng"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="rounded-md bg-muted p-3">
                <p className="text-sm text-muted-foreground">Tồn kho sau khi nhập</p>
                <p className="text-2xl font-bold text-green-600">
                  {(selectedVariant?.stockQuantity || 0) + (stockForm.watch("stockQuantity") || 0)}
                </p>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseStock}>
                  Hủy
                </Button>
                <Button type="submit">Xác nhận nhập kho</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
