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
  DropdownMenuLabel,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Truck,
  Package,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { orpcQuery } from "@/lib/orpc.client";
import { formatPrice } from "@/lib/utils";
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import dayjs from "dayjs";

type Order = {
  id: string;
  orderCode: string;
  userId: string;
  status: string;
  subtotalAmount: bigint;
  shippingFee: bigint;
  discountTotal: bigint;
  totalAmount: bigint;
  note: string | null;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: Date;
  paymentAt: Date | null;
  addressId: string;
};

const sortOptions = [
  { value: "newest", label: "Mới nhất" },
  { value: "oldest", label: "Cũ nhất" },
  { value: "totalAmount_asc", label: "Giá trị tăng dần" },
  { value: "totalAmount_desc", label: "Giá trị giảm dần" },
] as const;

const statusOptions = [
  { value: "PENDING", label: "Chờ xác nhận", color: "bg-yellow-500" },
  { value: "CONFIRMED", label: "Đã xác nhận", color: "bg-blue-500" },
  { value: "SHIPPING", label: "Đang giao", color: "bg-purple-500" },
  { value: "DELIVERED", label: "Đã giao", color: "bg-green-500" },
  { value: "CANCELED", label: "Đã hủy", color: "bg-red-500" },
  { value: "CANCELLED", label: "Đã hủy", color: "bg-red-500" },
] as const;

const paymentStatusOptions = [
  { value: "PENDING", label: "Chờ thanh toán", variant: "secondary" as const },
  { value: "SUCCESS", label: "Đã thanh toán", variant: "default" as const },
  { value: "FAILED", label: "Thất bại", variant: "destructive" as const },
];

const paymentMethodLabels: Record<string, string> = {
  COD: "Tiền mặt",
  VNPAY: "VNPay",
  MOMO: "MoMo",
};

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"PENDING" | "CONFIRMED" | "SHIPPING" | "DELIVERED" | "CANCELED" | "all">("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<"PENDING" | "SUCCESS" | "FAILED" | "all">("all");
  const [sort, setSort] = useState<"newest" | "oldest" | "totalAmount_asc" | "totalAmount_desc">("newest");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: orders, isLoading, refetch } = useQuery(
    orpcQuery.orderRoutes.getAllOrders.queryOptions({
      input: {
        page,
        limit,
        sort,
        status: statusFilter !== "all" ? statusFilter : undefined,
        q: debouncedSearch || undefined,
        dateRange: undefined,
      },
    }),
  );

  const setStatusMutation = useMutation(
    orpcQuery.orderRoutes.setStatus.mutationOptions({
      onSuccess: () => {
        refetch();
        toast.success("Cập nhật trạng thái đơn hàng thành công");
      },
      onError: () => {
        toast.error("Cập nhật trạng thái thất bại");
      },
    }),
  );

  const updatePaymentStatusMutation = useMutation(
    orpcQuery.orderRoutes.updatePaymentStatus.mutationOptions({
      onSuccess: () => {
        refetch();
        toast.success("Cập nhật trạng thái thanh toán thành công");
      },
      onError: () => {
        toast.error("Cập nhật trạng thái thanh toán thất bại");
      },
    }),
  );

  const handleStatusChange = useCallback(
    (orderId: string, newStatus: string) => {
      setStatusMutation.mutate({ id: orderId, status: newStatus as "PENDING" | "CONFIRMED" | "SHIPPING" | "DELIVERED" | "CANCELLED" });
    },
    [setStatusMutation],
  );

  const handlePaymentStatusChange = useCallback(
    (orderId: string, newStatus: string) => {
      updatePaymentStatusMutation.mutate({ id: orderId, status: newStatus as "PENDING" | "SUCCESS" | "FAILED" });
    },
    [updatePaymentStatusMutation],
  );

  const getStatusBadge = (status: string) => {
    const option = statusOptions.find((s) => s.value === status);
    return (
      <Badge className={`${option?.color} text-white`}>
        {option?.label || status}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const option = paymentStatusOptions.find((s) => s.value === status);
    return (
      <Badge variant={option?.variant || "secondary"}>
        {option?.label || status}
      </Badge>
    );
  };

  const columns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        accessorKey: "orderCode",
        header: "Mã đơn",
        cell: ({ row }) => (
          <div className="font-mono font-semibold text-sm">
            {row.original.orderCode}
          </div>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Ngày đặt",
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground">
            {dayjs(row.original.createdAt).format("DD/MM/YYYY HH:mm")}
          </div>
        ),
      },
      {
        accessorKey: "paymentMethod",
        header: "Thanh toán",
        cell: ({ row }) => (
          <div className="text-sm">
            {paymentMethodLabels[row.original.paymentMethod] || row.original.paymentMethod}
          </div>
        ),
      },
      {
        accessorKey: "totalAmount",
        header: "Tổng tiền",
        cell: ({ row }) => (
          <div className="text-right font-semibold">
            {formatPrice(Number(row.original.totalAmount))}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Trạng thái",
        cell: ({ row }) => (
          <div className="flex justify-center">
            {getStatusBadge(row.original.status)}
          </div>
        ),
      },
      {
        accessorKey: "paymentStatus",
        header: "TT Thanh toán",
        cell: ({ row }) => (
          <div className="flex justify-center">
            {getPaymentStatusBadge(row.original.paymentStatus)}
          </div>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const order = row.original;
          
          // Xác định các actions hợp lệ dựa trên state machine
          const getAvailableStatusActions = () => {
            const status = order.status;
            switch (status) {
              case "PENDING":
                return [
                  { value: "CONFIRMED", label: "Xác nhận", icon: CheckCircle },
                  { value: "CANCELLED", label: "Hủy đơn", icon: XCircle },
                ];
              case "CONFIRMED":
                return [
                  { value: "SHIPPING", label: "Vận chuyển", icon: Truck },
                  { value: "CANCELLED", label: "Hủy đơn", icon: XCircle },
                ];
              case "SHIPPING":
                return [
                  { value: "DELIVERED", label: "Đã giao hàng", icon: Package },
                ];
              case "DELIVERED":
              case "CANCELED":
              case "CANCELLED":
                return [];
              default:
                return [];
            }
          };

          const getAvailablePaymentActions = () => {
            const status = order.paymentStatus;
            switch (status) {
              case "PENDING":
                return [
                  { value: "SUCCESS", label: "Đã thanh toán" },
                  { value: "FAILED", label: "Thanh toán thất bại" },
                ];
              case "FAILED":
                return [
                  { value: "SUCCESS", label: "Đã thanh toán" },
                ];
              case "SUCCESS":
                return [];
              default:
                return [];
            }
          };

          const statusActions = getAvailableStatusActions();
          const paymentActions = getAvailablePaymentActions();
          const hasActions = statusActions.length > 0 || paymentActions.length > 0;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedOrder(order);
                    setDetailsOpen(true);
                  }}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Xem chi tiết
                </DropdownMenuItem>
                
                {hasActions && <DropdownMenuSeparator />}
                
                {statusActions.length > 0 && (
                  <>
                    <DropdownMenuLabel>Cập nhật đơn hàng</DropdownMenuLabel>
                    {statusActions.map((action) => {
                      const Icon = action.icon;
                      return (
                        <DropdownMenuItem
                          key={action.value}
                          onClick={() => handleStatusChange(order.id, action.value)}
                        >
                          <Icon className="mr-2 h-4 w-4" />
                          {action.label}
                        </DropdownMenuItem>
                      );
                    })}
                  </>
                )}
                
                {paymentActions.length > 0 && (
                  <>
                    {statusActions.length > 0 && <DropdownMenuSeparator />}
                    <DropdownMenuLabel>Cập nhật thanh toán</DropdownMenuLabel>
                    {paymentActions.map((action) => (
                      <DropdownMenuItem
                        key={action.value}
                        onClick={() => handlePaymentStatusChange(order.id, action.value)}
                      >
                        {action.label}
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [handleStatusChange, handlePaymentStatusChange],
  );

  const table = useReactTable({
    data: orders ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  // Filter client-side for payment status since API doesn't support it
  const filteredData = useMemo(() => {
    if (!orders) return [];
    if (paymentStatusFilter === "all") return orders;
    return orders.filter((order) => order.paymentStatus === paymentStatusFilter);
  }, [orders, paymentStatusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>
          <p className="text-muted-foreground">Quản lý và theo dõi đơn hàng của khách hàng</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-xl border border-border/40 bg-card/50 p-4 backdrop-blur-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm mã đơn hàng hoặc tên khách hàng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select
            value={sort}
            onValueChange={(value) => {
              setSort(value as typeof sort);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[160px]">
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
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value as typeof statusFilter);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={paymentStatusFilter}
            onValueChange={(value) => {
              setPaymentStatusFilter(value as typeof paymentStatusFilter);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="TT Thanh toán" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {paymentStatusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Orders Table */}
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
            ) : filteredData.length > 0 ? (
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
                  Không tìm thấy đơn hàng nào
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Hiển thị {filteredData.length} đơn hàng
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
            disabled={isLoading || filteredData.length < limit}
          >
            Sau
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Order Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn hàng</DialogTitle>
            <DialogDescription>
              Mã đơn: {selectedOrder?.orderCode}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Ngày đặt</div>
                  <div className="text-sm">
                    {dayjs(selectedOrder.createdAt).format("DD/MM/YYYY HH:mm")}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Trạng thái</div>
                  <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Phương thức thanh toán</div>
                  <div className="text-sm">
                    {paymentMethodLabels[selectedOrder.paymentMethod]}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Trạng thái thanh toán</div>
                  <div className="mt-1">{getPaymentStatusBadge(selectedOrder.paymentStatus)}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Chi tiết giá</div>
                <div className="rounded-lg border p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tạm tính:</span>
                    <span>{formatPrice(Number(selectedOrder.subtotalAmount))}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Phí vận chuyển:</span>
                    <span>{formatPrice(Number(selectedOrder.shippingFee))}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Giảm giá:</span>
                    <span className="text-red-500">
                      -{formatPrice(Number(selectedOrder.discountTotal))}
                    </span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Tổng cộng:</span>
                    <span className="text-primary">
                      {formatPrice(Number(selectedOrder.totalAmount))}
                    </span>
                  </div>
                </div>
              </div>

              {selectedOrder.note && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Ghi chú</div>
                  <div className="text-sm rounded-lg border p-3 bg-muted/50">
                    {selectedOrder.note}
                  </div>
                </div>
              )}

              {selectedOrder.paymentAt && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Thời gian thanh toán</div>
                  <div className="text-sm">
                    {dayjs(selectedOrder.paymentAt).format("DD/MM/YYYY HH:mm")}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
