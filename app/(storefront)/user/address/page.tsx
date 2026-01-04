"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Plus, MapPin, Pencil, Trash2, Phone, User } from "lucide-react";
import Link from "next/link";

interface Address {
  id: string;
  fullName: string;
  phone: string;
  province: string;
  ward: string;
  streetAddress: string;
}

const mockAddresses: Address[] = [
  {
    id: "1",
    fullName: "Nguyễn Văn A",
    phone: "0901234567",
    province: "TP. Hồ Chí Minh",
    ward: "Phường Bến Nghé",
    streetAddress: "123 Đường Lê Lợi",
  },
  {
    id: "2",
    fullName: "Nguyễn Văn A",
    phone: "0901234567",
    province: "TP. Hồ Chí Minh",
    ward: "Phường 7",
    streetAddress: "456 Đường Võ Văn Tần, Tòa nhà ABC, Tầng 5",
  },
];

const emptyAddress: Omit<Address, "id"> = {
  fullName: "",
  phone: "",
  province: "",
  ward: "",
  streetAddress: "",
};

export default function UserAddress() {
  const [addresses, setAddresses] = useState<Address[]>(mockAddresses);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState<Omit<Address, "id">>(emptyAddress);

  const handleOpenCreate = () => {
    setEditingAddress(null);
    setFormData(emptyAddress);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      fullName: address.fullName,
      phone: address.phone,
      province: address.province,
      ward: address.ward,
      streetAddress: address.streetAddress,
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (editingAddress) {
      // Update existing address
      setAddresses((prev) =>
        prev.map((addr) => {
          if (addr.id === editingAddress.id) {
            return { ...formData, id: addr.id };
          }
          // If the new address is set as default, remove default from others
          return addr;
        }),
      );
    } else {
      // Create new address
      const newAddress: Address = {
        ...formData,
        id: Date.now().toString(),
      };
      setAddresses((prev) => {
        return [...prev, newAddress];
      });
    }
    setIsDialogOpen(false);
    setFormData(emptyAddress);
    setEditingAddress(null);
  };

  const handleDelete = (id: string) => {
    setAddresses((prev) => prev.filter((addr) => addr.id !== id));
  };

  const handleSetDefault = (id: string) => {
    setAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      })),
    );
  };

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
              <DialogTitle>{editingAddress ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}</DialogTitle>
              <DialogDescription>
                {editingAddress
                  ? "Chỉnh sửa thông tin địa chỉ giao hàng"
                  : "Thêm địa chỉ giao hàng mới vào sổ địa chỉ của bạn"}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName">Họ và tên người nhận</Label>
                <Input
                  id="fullName"
                  placeholder="Nguyễn Văn A"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  placeholder="0901234567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="province">Tỉnh/Thành phố</Label>
                <Select
                  value={formData.province}
                  onValueChange={(value) => setFormData({ ...formData, province: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn tỉnh/thành phố" className="w-full" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</SelectItem>
                    <SelectItem value="Hà Nội">Hà Nội</SelectItem>
                    <SelectItem value="Đà Nẵng">Đà Nẵng</SelectItem>
                    <SelectItem value="Cần Thơ">Cần Thơ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="ward">Phường/Xã</Label>
                <Select
                  value={formData.ward}
                  onValueChange={(value) => setFormData({ ...formData, ward: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn phường/xã" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Phường Bến Nghé">Phường Bến Nghé</SelectItem>
                    <SelectItem value="Phường Bến Thành">Phường Bến Thành</SelectItem>
                    <SelectItem value="Phường 7">Phường 7</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="streetAddress">Địa chỉ cụ thể</Label>
                <Input
                  id="streetAddress"
                  placeholder="Số nhà, tên đường, tòa nhà..."
                  value={formData.streetAddress}
                  onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleSave}>{editingAddress ? "Cập nhật" : "Thêm địa chỉ"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Address List */}
      {addresses.length === 0 ? (
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
            <Card key={address.id} className={`relative transition-all`}>
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
                    {address.streetAddress}, {address.ward}, {address.province}
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
