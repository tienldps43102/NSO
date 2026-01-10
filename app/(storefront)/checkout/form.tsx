"use client";
import { CreditCard, Truck, ArrowLeft, MapPin, User, Phone, Tag, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import z from "zod";
import { Controller, useFormContext } from "react-hook-form";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { orpcQuery } from "@/lib/orpc.client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export const checkoutFormSchema = z.object({
  fullName: z.string().optional(),
  phone: z.string().optional(),
  province: z.string().optional(),
  ward: z.string().optional(),
  address: z.string().optional(),
  orderNote: z
    .string()
    .max(1000, {
      error: "Ghi chú đơn hàng không được vượt quá 1000 ký tự",
    })
    .optional(),
  paymentMethod: z.enum(["COD", "VNPAY", "MOMO"], {
    error: "Phương thức thanh toán không hợp lệ",
  }),
  selectedAddressId: z.string().optional(),
  useExistingAddress: z.boolean().optional(),
  voucherCode: z.string().optional(),
}).refine((data) => {
  if (data.useExistingAddress) {
    return !!data.selectedAddressId;
  } else {
    return (
      !!data.fullName &&
      !!data.phone &&
      !!data.province &&
      !!data.ward &&
      !!data.address
    );
  }
}, {
  message: "Vui lòng nhập đầy đủ thông tin giao hàng hoặc chọn địa chỉ có sẵn",
  path: ["fullName"],
});

export type CheckoutFormSchema = z.infer<typeof checkoutFormSchema>;

export default function CheckoutForm() {
  const form = useFormContext<CheckoutFormSchema>();
  const [useExistingAddress, setUseExistingAddress] = useState(false);
  const [voucherInput, setVoucherInput] = useState("");
  const [voucherStatus, setVoucherStatus] = useState<{
    status: "idle" | "success" | "error";
    message?: string;
  }>({ status: "idle" });

  // Fetch saved addresses
  const { data: addresses = [], isLoading: isLoadingAddresses } = useQuery(
    orpcQuery!.addressRoutes.getMyAddress.queryOptions({}),
  );

  // Check voucher mutation
  const checkVoucherMutation = useMutation(
    orpcQuery!.voucherRoutes.checkUseVoucher.mutationOptions({
      onSuccess: (data) => {
        if (data.success) {
          form.setValue("voucherCode", voucherInput);
          setVoucherStatus({ status: "success", message: data.message });
          toast.success("Áp dụng voucher thành công!");
        } else {
          form.setValue("voucherCode", "");
          setVoucherStatus({ status: "error", message: data.message });
          toast.error(data.message);
        }
      },
      onError: () => {
        form.setValue("voucherCode", "");
        setVoucherStatus({ status: "error", message: "Có lỗi xảy ra khi kiểm tra voucher" });
        toast.error("Có lỗi xảy ra khi kiểm tra voucher");
      },
    }),
  );

  const handleCheckVoucher = () => {
    if (!voucherInput.trim()) {
      toast.error("Vui lòng nhập mã voucher");
      return;
    }
    checkVoucherMutation.mutate({ code: voucherInput.trim() });
  };

  const handleRemoveVoucher = () => {
    setVoucherInput("");
    form.setValue("voucherCode", "");
    setVoucherStatus({ status: "idle" });
  };

  const handleToggleAddressMode = (checked: boolean) => {
    setUseExistingAddress(checked);
    form.setValue("useExistingAddress", checked);
    
    if (checked) {
      // Clear form fields when switching to existing address
      form.setValue("fullName", "");
      form.setValue("phone", "");
      form.setValue("province", "");
      form.setValue("ward", "");
      form.setValue("address", "");
    } else {
      // Clear selected address when switching to new address
      form.setValue("selectedAddressId", "");
    }
  };

  const handleSelectAddress = (addressId: string) => {
    form.setValue("selectedAddressId", addressId);
  };

  return (
    <div className="lg:col-span-2 space-y-6">
      {/* Shipping Information */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Thông tin giao hàng</h2>
          </div>
          
          <div className="flex items-center gap-2">
            <Label htmlFor="use-existing" className="text-sm font-normal cursor-pointer">
              Sử dụng địa chỉ của tôi
            </Label>
            <Switch
              id="use-existing"
              checked={useExistingAddress}
              onCheckedChange={handleToggleAddressMode}
            />
          </div>
        </div>

        {useExistingAddress ? (
          // Show saved addresses
          <div className="space-y-4">
            {isLoadingAddresses ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">Bạn chưa có địa chỉ nào được lưu</p>
                <p className="text-sm text-muted-foreground">
                  Tắt &quot;Sử dụng địa chỉ của tôi&quot; để nhập địa chỉ mới
                </p>
              </div>
            ) : (
              <Controller
                control={form.control}
                name="selectedAddressId"
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleSelectAddress(value);
                    }}
                    className="space-y-3"
                  >
                    {addresses.map((address) => (
                      <label
                        key={address.id}
                        htmlFor={`address-${address.id}`}
                        className={`flex gap-4 p-4 border rounded-lg cursor-pointer transition-all ${
                          field.value === address.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-muted-foreground/50"
                        }`}
                      >
                        <RadioGroupItem value={address.id} id={`address-${address.id}`} />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 text-foreground">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{address.fullName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <Phone className="h-4 w-4" />
                            <span>{address.phone}</span>
                          </div>
                          <div className="flex gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                            <span>
                              {address.detail}, {address.ward}, {address.province}
                            </span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </RadioGroup>
                )}
              />
            )}
            
            <div className="pt-2">
              <Link 
                href="/user/address" 
                target="_blank"
                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
              >
                Quản lý địa chỉ của tôi
                <ArrowLeft className="h-3 w-3 rotate-180" />
              </Link>
            </div>
          </div>
        ) : (
          // Show address input form
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">
                Họ và tên <span className="text-destructive">*</span>
              </Label>
              <Input id="fullName" placeholder="Nhập họ và tên" {...form.register("fullName")} />
              {form.formState.errors.fullName && (
                <p className="text-sm text-destructive">{form.formState.errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                Số điện thoại <span className="text-destructive">*</span>
              </Label>
              <Input id="phone" placeholder="Nhập số điện thoại" {...form.register("phone")} />
              {form.formState.errors.phone && (
                <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="province">
                Tỉnh/Thành phố <span className="text-destructive">*</span>
              </Label>
              <Input id="province" placeholder="TP. Hồ Chí Minh, Hà Nội..." {...form.register("province")} />
              {form.formState.errors.province && (
                <p className="text-sm text-destructive">{form.formState.errors.province.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ward">
                Phường/Xã <span className="text-destructive">*</span>
              </Label>
              <Input id="ward" placeholder="Phường Bến Nghé, Phường 1..." {...form.register("ward")} />
              {form.formState.errors.ward && (
                <p className="text-sm text-destructive">{form.formState.errors.ward.message}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">
                Địa chỉ cụ thể <span className="text-destructive">*</span>
              </Label>
              <Input
                id="address"
                placeholder="Số nhà, tên đường..."
                className="w-full"
                {...form.register("address")}
              />
              {form.formState.errors.address && (
                <p className="text-sm text-destructive">{form.formState.errors.address.message}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Voucher Section */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Tag className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Mã giảm giá</h2>
        </div>
        
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                placeholder="Nhập mã giảm giá"
                value={voucherInput}
                onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                disabled={voucherStatus.status === "success"}
                className={`pr-10 ${
                  voucherStatus.status === "success"
                    ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                    : voucherStatus.status === "error"
                      ? "border-red-500"
                      : ""
                }`}
              />
              {voucherStatus.status === "success" && (
                <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-600" />
              )}
              {voucherStatus.status === "error" && (
                <X className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-600" />
              )}
            </div>
            
            {voucherStatus.status === "success" ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleRemoveVoucher}
                className="shrink-0"
              >
                Hủy
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleCheckVoucher}
                disabled={checkVoucherMutation.isPending || !voucherInput.trim()}
                className="shrink-0"
              >
                {checkVoucherMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Áp dụng"
                )}
              </Button>
            )}
          </div>
          
          {voucherStatus.message && (
            <p
              className={`text-sm ${
                voucherStatus.status === "success" ? "text-green-600" : "text-red-600"
              }`}
            >
              {voucherStatus.message}
            </p>
          )}
        </div>
      </div>

      {/* Order Note */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Ghi chú đơn hàng</h2>
        <Textarea
          {...form.register("orderNote")}
          placeholder="Nhập ghi chú cho đơn hàng (ví dụ: thời gian nhận hàng, hướng dẫn giao hàng...)"
          className="min-h-[100px] resize-none"
        />
      </div>

      {/* Payment Method */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <CreditCard className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Phương thức thanh toán</h2>
        </div>

        <Controller
          control={form.control}
          name="paymentMethod"
          render={({ field, formState }) => (
            <RadioGroup
              className="space-y-3"
              value={field.value}
              onValueChange={field.onChange}
              disabled={formState.isSubmitting}
            >
              <label
                htmlFor="COD"
                className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all ${
                  field.value === "COD"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/50"
                }`}
              >
                <RadioGroupItem value="COD" id="COD" />
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                    <Truck className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Thanh toán khi nhận hàng (COD)</p>
                    <p className="text-sm text-muted-foreground">
                      Thanh toán bằng tiền mặt khi nhận hàng
                    </p>
                  </div>
                </div>
              </label>

              <label
                htmlFor="VNPAY"
                className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all ${
                  field.value === "VNPAY"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/50"
                }`}
              >
                <RadioGroupItem value="VNPAY" id="VNPAY" />
                <div className="flex items-center gap-3 flex-1">
                  <Image src="/VNPAY.jpg" alt="VNPAY" width={48} height={48} />
                  <div>
                    <p className="font-medium text-foreground">VNPAY</p>
                    <p className="text-sm text-muted-foreground">
                      Thanh toán qua ví VNPAY, thẻ ATM, Visa, Mastercard
                    </p>
                  </div>
                </div>
              </label>

              <label
                htmlFor="MOMO"
                className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all ${
                  field.value === "MOMO"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/50"
                }`}
              >
                <RadioGroupItem value="MOMO" id="MOMO" />
                <div className="flex items-center gap-3 flex-1">
                  <Image src="/MOMO.webp" alt="MOMO" width={48} height={48} />
                  <div>
                    <p className="font-medium text-foreground">MOMO</p>
                    <p className="text-sm text-muted-foreground">
                      Thanh toán qua ví MOMO, thẻ ATM, Visa, Mastercard
                    </p>
                  </div>
                </div>
              </label>
            </RadioGroup>
          )}
        />
      </div>

      {/* Back to Cart */}
      <Link href="/cart" className="inline-flex items-center gap-2 text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Quay lại giỏ hàng
      </Link>
    </div>
  );
}
