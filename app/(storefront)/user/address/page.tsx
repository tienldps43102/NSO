"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Plus, MapPin, Pencil, Trash2, Phone, User, Loader2 } from "lucide-react";
import Link from "next/link";
import { useQuery, useMutation } from "@tanstack/react-query";
import { orpcQuery } from "@/lib/orpc.client";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Zod schema for address form validation
const addressFormSchema = z.object({
  fullName: z.string().min(1, "Họ và tên không được để trống").max(200, "Họ và tên quá dài"),
  phone: z.string().min(1, "Số điện thoại không được để trống").max(20, "Số điện thoại không hợp lệ"),
  province: z.string().min(1, "Vui lòng chọn tỉnh/thành phố"),
  ward: z.string().min(1, "Vui lòng chọn phường/xã"),
  detail: z.string().min(1, "Địa chỉ cụ thể không được để trống").max(500, "Địa chỉ quá dài"),
});

type AddressFormData = z.infer<typeof addressFormSchema>;

export default function UserAddress() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  // Form setup with zod validation
  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      province: "",
      ward: "",
      detail: "",
    },
  });

  // Fetch addresses using orpc query
  const { data: addresses = [], isLoading, refetch } = useQuery(
    orpcQuery!.addressRoutes.getMyAddress.queryOptions({}),
  );

  // Create address mutation
  const createAddressMutation = useMutation(
    orpcQuery!.addressRoutes.addAddress.mutationOptions({
      onSuccess: () => {
        toast.success("Thêm địa chỉ thành công");
        refetch();
        setIsDialogOpen(false);
        form.reset();
      },
      onError: (error) => {
        toast.error("Lỗi khi thêm địa chỉ", {
          description: error.message,
        });
      },
    }),
  );

  // Edit address mutation
  const editAddressMutation = useMutation(
    orpcQuery!.addressRoutes.editAddress.mutationOptions({
      onSuccess: () => {
        toast.success("Cập nhật địa chỉ thành công");
        refetch();
        setIsDialogOpen(false);
        form.reset();
        setEditingAddressId(null);
      },
      onError: (error) => {
        toast.error("Lỗi khi cập nhật địa chỉ", {
          description: error.message,
        });
      },
    }),
  );

  // Delete address mutation (soft delete - set hidden to true)
  const deleteAddressMutation = useMutation(
    orpcQuery!.addressRoutes.deleteAddress.mutationOptions({
      onSuccess: () => {
        toast.success("Xóa địa chỉ thành công");
        refetch();
      },
      onError: (error) => {
        toast.error("Lỗi khi xóa địa chỉ", {
          description: error.message,
        });
      },
    }),
  );

  const handleOpenCreate = () => {
    setEditingAddressId(null);
    form.reset({
      fullName: "",
      phone: "",
      province: "",
      ward: "",
      detail: "",
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (address: (typeof addresses)[0]) => {
    setEditingAddressId(address.id);
    form.reset({
      fullName: address.fullName,
      phone: address.phone,
      province: address.province,
      ward: address.ward,
      detail: address.detail,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (data: AddressFormData) => {
    if (editingAddressId) {
      // Update existing address
      editAddressMutation.mutate({
        id: editingAddressId,
        ...data,
      });
    } else {
      // Create new address
      createAddressMutation.mutate({
        ...data,
        hidden: false,
      });
    }
  };

  const handleDelete = (id: string) => {
    deleteAddressMutation.mutate({ id });
  };

  const isPending = createAddressMutation.isPending || editAddressMutation.isPending;

  return (
    <div className="flex-1 container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Trang chủ</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Sổ địa chỉ</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sổ địa chỉ</h1>
          <p className="text-muted-foreground mt-1">Quản lý địa chỉ giao hàng của bạn</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Thêm địa chỉ mới
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingAddressId ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
              </DialogTitle>
              <DialogDescription>
                {editingAddressId
                  ? "Chỉnh sửa thông tin địa chỉ giao hàng"
                  : "Thêm địa chỉ giao hàng mới vào sổ địa chỉ của bạn"}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Họ và tên người nhận</FormLabel>
                      <FormControl>
                        <Input placeholder="Nguyễn Văn A" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số điện thoại</FormLabel>
                      <FormControl>
                        <Input placeholder="0901234567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="province"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tỉnh/Thành phố</FormLabel>
                      <FormControl>
                        <Input placeholder="TP. Hồ Chí Minh, Hà Nội, Đà Nẵng..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ward"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phường/Xã</FormLabel>
                      <FormControl>
                        <Input placeholder="Phường Bến Nghé, Phường 1..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="detail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Địa chỉ cụ thể</FormLabel>
                      <FormControl>
                        <Input placeholder="Số nhà, tên đường, tòa nhà..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      form.reset();
                      setEditingAddressId(null);
                    }}
                  >
                    Hủy
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingAddressId ? "Cập nhật" : "Thêm địa chỉ"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Address List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : addresses.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Chưa có địa chỉ nào</h3>
            <p className="text-muted-foreground text-center mb-4">
              Thêm địa chỉ giao hàng để đặt hàng nhanh hơn
            </p>
            <Button onClick={handleOpenCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Thêm địa chỉ đầu tiên
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <Card key={address.id} className="relative transition-all">
              <CardContent className="p-5 relative">
                {/* Header */}
                <div className="flex items-start justify-between mb-3 absolute top-2 right-2">
                  <div className="flex items-center gap-2"></div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleOpenEdit(address)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          disabled={deleteAddressMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Xóa địa chỉ này?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa địa chỉ này khỏi sổ địa chỉ? Hành động này
                            không thể hoàn tác.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(address.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Xóa
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-foreground">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{address.fullName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{address.phone}</span>
                  </div>
                </div>

                {/* Address */}
                <div className="flex gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    {address.detail}, {address.ward}, {address.province}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
