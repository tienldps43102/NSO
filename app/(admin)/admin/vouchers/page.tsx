"use client";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Power, Loader2 } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { client,
orpcQuery } from "@/lib/orpc.client";
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const ITEMS_PER_PAGE = 20;
type GetVouchersResponse = Outputs["voucherRoutes"]["getVouchers"];
type Voucher = GetVouchersResponse["items"][number];

// Zod schema for voucher form
const createVoucherSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(1, "Mã voucher không được để trống")
      .transform((val) => val.toUpperCase()),
    discount: z.coerce.number({
      error: "Giá trị giảm giá không được để trống",
    }).min(0, "Giá trị giảm giá phải lớn hơn hoặc bằng 0"),
    description: z.string().optional(),
    type: z.enum(["PERCENTAGE", "FIXED"]),
    validFrom: z.string().min(1, "Ngày bắt đầu không được để trống"),
    validTo: z.string().min(1, "Ngày kết thúc không được để trống"),
    maxUsage: z
      .union([z.coerce.number().positive(), z.literal("")])
      .optional()
      .transform((val) => (val === "" || val === undefined ? undefined : val)),
    isActive: z.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    // Validate discount based on type
    if (data.type === "PERCENTAGE") {
      if (data.discount > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Phần trăm giảm giá không được vượt quá 100%",
          path: ["discount"],
        });
      }
    } else if (data.type === "FIXED") {
      if (data.discount <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Số tiền giảm giá phải lớn hơn 0",
          path: ["discount"],
        });
      }
    }

    // Validate date range
    if (data.validFrom && data.validTo) {
      const from = new Date(data.validFrom);
      const to = new Date(data.validTo);
      if (to < from) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ngày kết thúc phải sau hoặc bằng ngày bắt đầu",
          path: ["validTo"],
        });
      }
    }
  });

const editVoucherSchema = createVoucherSchema;

type VoucherFormData = z.infer<typeof createVoucherSchema>;

export default function AdminVouchers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [isCheckingCode, setIsCheckingCode] = useState(false);

  // React Hook Form for Create
  const createForm = useForm<VoucherFormData>({
    resolver: zodResolver(createVoucherSchema) as any,
    defaultValues: {
      code: "",
      discount: 0,
      description: "",
      type: "PERCENTAGE",
      validFrom: "",
      validTo: "",
      isActive: true,
      maxUsage: undefined,
    },
  });

  // React Hook Form for Edit
  const editForm = useForm<VoucherFormData>({
    resolver: zodResolver(editVoucherSchema) as any,
    defaultValues: {
      code: "",
      discount: 0,
      description: "",
      type: "PERCENTAGE",
      validFrom: "",
      validTo: "",
      maxUsage: undefined,
      isActive: true,
    },
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isLoading, refetch } = useQuery<GetVouchersResponse>(
    orpcQuery.voucherRoutes.getVouchers.queryOptions({
      input: {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        ...(debouncedSearch ? { q: debouncedSearch } : {}),
        ...(activeFilter !== undefined ? { isActive: activeFilter } : {}),
      },
    }),
  );

  const { mutate: createVoucher, isPending: isCreating } = useMutation(
    orpcQuery.voucherRoutes.createVoucher.mutationOptions({
      onSuccess: () => {
        toast.success("Tạo voucher thành công");
        refetch();
        setIsCreateOpen(false);
        createForm.reset();
      },
      onError: (error) => {
        toast.error("Lỗi khi tạo voucher: " + error.message);
      },
    }),
  );

  const { mutate: updateVoucher, isPending: isUpdating } = useMutation(
    orpcQuery.voucherRoutes.updateVoucher.mutationOptions({
      onSuccess: () => {
        toast.success("Cập nhật voucher thành công");
        refetch();
        setIsEditOpen(false);
        setSelectedVoucher(null);
        editForm.reset();
      },
      onError: (error) => {
        toast.error("Lỗi khi cập nhật voucher: " + error.message);
      },
    }),
  );

  const { mutate: deleteVoucher, isPending: isDeleting } = useMutation(
    orpcQuery.voucherRoutes.deleteVoucher.mutationOptions({
      onSuccess: () => {
        toast.success("Xóa voucher thành công");
        refetch();
        setIsDeleteOpen(false);
        setSelectedVoucher(null);
      },
      onError: (error) => {
        toast.error("Lỗi khi xóa voucher: " + error.message);
      },
    }),
  );

  const { mutate: toggleVoucher } = useMutation(
    orpcQuery.voucherRoutes.toggleVoucher.mutationOptions({
      onSuccess: (data) => {
        toast.success(data.isActive ? "Đã kích hoạt voucher" : "Đã vô hiệu hóa voucher");
        refetch();
      },
      onError: (error) => {
        toast.error("Lỗi khi thay đổi trạng thái: " + error.message);
      },
    }),
  );

  // Async validation for code uniqueness
  const checkCodeUniqueness = async (code: string, excludeId?: string): Promise<boolean> => {
    if (!code.trim()) return true;

    // Skip check if editing and code hasn't changed
    if (excludeId && selectedVoucher?.code === code.toUpperCase()) {
      return true;
    }

    try {
      const result = await client.voucherRoutes.checkCodeUniqueness({
        code: code.trim().toUpperCase(),
      });
      return result;
    } catch (error) {
      console.error("Error checking code uniqueness:", error);
      return false;
    }
  };

  // Handle code blur validation (async)
  const handleCodeBlur = async (
    value: string,
    form: typeof createForm | typeof editForm,
    isEdit: boolean
  ) => {
    if (!value.trim()) return;

    setIsCheckingCode(true);
    const isUnique = await checkCodeUniqueness(value, isEdit ? selectedVoucher?.id : undefined);
    setIsCheckingCode(false);

    if (!isUnique) {
      form.setError("code", {
        type: "manual",
        message: "Mã voucher đã tồn tại trong hệ thống",
      });
    }
  };

  // Define columns for TanStack Table
  const columns = useMemo<ColumnDef<Voucher>[]>(
    () => [
      {
        accessorKey: "code",
        header: "Mã voucher",
        cell: ({ row }) => <div className="font-mono font-semibold">{row.original.code}</div>,
      },
      {
        accessorKey: "discount",
        header: "Giảm giá",
        cell: ({ row }) => (
          <div className="font-medium">
            {row.original.type === "PERCENTAGE"
              ? `${row.original.discount}%`
              : `${row.original.discount.toLocaleString("vi-VN")}đ`}
          </div>
        ),
      },
      {
        accessorKey: "type",
        header: "Loại",
        cell: ({ row }) => (
          <Badge variant={row.original.type === "PERCENTAGE" ? "default" : "secondary"}>
            {row.original.type === "PERCENTAGE" ? "Phần trăm" : "Cố định"}
          </Badge>
        ),
      },
      {
        accessorKey: "validFrom",
        header: "Thời gian",
        cell: ({ row }) => (
          <div className="text-sm">
            <div>{format(new Date(row.original.validFrom), "dd/MM/yyyy", { locale: vi })}</div>
            <div className="text-muted-foreground">
              đến {format(new Date(row.original.validTo), "dd/MM/yyyy", { locale: vi })}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "maxUsage",
        header: "Sử dụng",
        cell: ({ row }) => (
          <div className="text-sm">
            {row.original.usageCount} / {row.original.maxUsage || "∞"}
          </div>
        ),
      },
      {
        accessorKey: "isActive",
        header: "Trạng thái",
        cell: ({ row }) => (
          <Badge variant={row.original.isActive ? "default" : "secondary"}>
            {row.original.isActive ? "Hoạt động" : "Vô hiệu"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Thao tác</div>,
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleVoucher({ id: row.original.id })}
              title={row.original.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
            >
              <Power className={`h-4 w-4 ${row.original.isActive ? "text-green-600" : "text-gray-400"}`} />
            </Button>
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: data?.pagination.totalPages ?? 0,
  });

  const handleCreate = async (formData: VoucherFormData) => {
    // Final check for code uniqueness before submission
    const isUnique = await checkCodeUniqueness(formData.code);
    if (!isUnique) {
      createForm.setError("code", {
        type: "manual",
        message: "Mã voucher đã tồn tại trong hệ thống",
      });
      return;
    }

    createVoucher({
      code: formData.code,
      discount: formData.discount,
      description: formData.description || undefined,
      type: formData.type,
      validFrom: new Date(formData.validFrom),
      validTo: new Date(formData.validTo),
      maxUsage: typeof formData.maxUsage === "number" ? formData.maxUsage : undefined,
      isActive: formData.isActive,
    });
  };

  const handleEdit = async (formData: VoucherFormData) => {
    if (!selectedVoucher) return;

    // Check code uniqueness only if code changed
    if (formData.code !== selectedVoucher.code) {
      const isUnique = await checkCodeUniqueness(formData.code, selectedVoucher.id);
      if (!isUnique) {
        editForm.setError("code", {
          type: "manual",
          message: "Mã voucher đã tồn tại trong hệ thống",
        });
        return;
      }
    }

    updateVoucher({
      id: selectedVoucher.id,
      code: formData.code,
      discount: formData.discount,
      description: formData.description || undefined,
      type: formData.type,
      validFrom: new Date(formData.validFrom),
      validTo: new Date(formData.validTo),
      maxUsage: typeof formData.maxUsage === "number" ? formData.maxUsage : undefined,
      isActive: formData.isActive,
    });
  };

  const handleDelete = () => {
    if (!selectedVoucher) return;
    deleteVoucher({ id: selectedVoucher.id });
  };

  const openEditModal = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    editForm.reset({
      code: voucher.code,
      discount: voucher.discount,
      description: voucher.description || "",
      type: voucher.type,
      validFrom: format(new Date(voucher.validFrom), "yyyy-MM-dd"),
      validTo: format(new Date(voucher.validTo), "yyyy-MM-dd"),
      maxUsage: voucher.maxUsage || ("" as any),
      isActive: voucher.isActive,
    });
    setIsEditOpen(true);
  };

  const openDeleteModal = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setIsDeleteOpen(true);
  };

  const handleOpenCreateModal = () => {
    createForm.reset();
    setIsCreateOpen(true);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Quản lý voucher</h1>
            <p className="text-muted-foreground">Quản lý mã giảm giá và khuyến mãi</p>
          </div>
          <Button onClick={handleOpenCreateModal} className="gap-2">
            <Plus className="h-4 w-4" />
            Thêm voucher
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-end">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm mã voucher..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>
          <Select
            value={activeFilter === undefined ? "all" : activeFilter ? "active" : "inactive"}
            onValueChange={(value) => {
              setActiveFilter(value === "all" ? undefined : value === "active");
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="active">Hoạt động</SelectItem>
              <SelectItem value="inactive">Vô hiệu</SelectItem>
            </SelectContent>
          </Select>
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
                    Không tìm thấy voucher nào
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {(data?.pagination.totalPages ?? 0) > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Hiển thị {data?.items.length ?? 0} / {data?.pagination.total ?? 0} voucher
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
                Trang {currentPage} / {data?.pagination.totalPages ?? 1}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage >= (data?.pagination.totalPages ?? 1) || isLoading}
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Thêm voucher mới</DialogTitle>
            <DialogDescription>Nhập thông tin voucher mới</DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Mã voucher <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            placeholder="VD: SUMMER2024"
                            className="font-mono uppercase"
                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                            onBlur={(e) => {
                              field.onBlur();
                              handleCodeBlur(e.target.value, createForm, false);
                            }}
                          />
                          {isCheckingCode && (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Loại voucher <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn loại" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PERCENTAGE">Phần trăm (%)</SelectItem>
                          <SelectItem value="FIXED">Số tiền cố định (đ)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={createForm.control}
                name="discount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Giá trị giảm giá <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={
                          createForm.watch("type") === "PERCENTAGE" ? "VD: 10" : "VD: 50000"
                        }
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      {createForm.watch("type") === "PERCENTAGE"
                        ? "Nhập phần trăm giảm giá (0-100)"
                        : "Nhập số tiền giảm giá (VNĐ)"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Mô tả về voucher..." rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="validFrom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Ngày bắt đầu <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="validTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Ngày kết thúc <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={createForm.control}
                name="maxUsage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giới hạn số lần sử dụng</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Để trống = không giới hạn"
                        min="1"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>Để trống nếu không muốn giới hạn</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer mt-0!">Kích hoạt ngay</FormLabel>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={isCreating || isCheckingCode}>
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    "Tạo voucher"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa voucher</DialogTitle>
            <DialogDescription>Cập nhật thông tin voucher</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEdit)} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mã voucher</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            placeholder="VD: SUMMER2024"
                            className="font-mono uppercase"
                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                            onBlur={(e) => {
                              field.onBlur();
                              handleCodeBlur(e.target.value, editForm, true);
                            }}
                          />
                          {isCheckingCode && (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loại voucher</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn loại" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PERCENTAGE">Phần trăm (%)</SelectItem>
                          <SelectItem value="FIXED">Số tiền cố định (đ)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="discount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá trị giảm giá</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={
                          editForm.watch("type") === "PERCENTAGE" ? "VD: 10" : "VD: 50000"
                        }
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      {editForm.watch("type") === "PERCENTAGE"
                        ? "Nhập phần trăm giảm giá (0-100)"
                        : "Nhập số tiền giảm giá (VNĐ)"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Mô tả về voucher..." rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="validFrom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày bắt đầu</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="validTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày kết thúc</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="maxUsage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giới hạn số lần sử dụng</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Để trống = không giới hạn"
                        min="1"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>Để trống nếu không muốn giới hạn</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer mt-0!">Kích hoạt</FormLabel>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditOpen(false)}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={isUpdating || isCheckingCode}>
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    "Lưu thay đổi"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Modal */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa voucher</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa voucher <strong>{selectedVoucher?.code}</strong>? Hành động này không thể hoàn tác.
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
