"use client";
import { CreditCard, Truck, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import z from "zod";
import { Controller, useFormContext } from "react-hook-form";
import Link from "next/link";
import Image from "next/image";
export const checkoutFormSchema = z.object({
  fullName: z.string().min(1, {
    error: "Họ và tên không được để trống",
  }),
  phone: z.string().min(1, {
    error: "Số điện thoại không được để trống",
  }),
  province: z.string().min(1, {
    error: "Tỉnh/Thành phố không được để trống",
  }),

  ward: z.string().min(1, {
    error: "Phường/Xã không được để trống",
  }),
  address: z.string().min(1, {
    error: "Địa chỉ không được để trống",
  }),
  orderNote: z
    .string()
    .max(1000, {
      error: "Ghi chú đơn hàng không được vượt quá 1000 ký tự",
    })
    .optional(),
  paymentMethod: z.enum(["COD", "VNPAY", "MOMO"], {
    error: "Phương thức thanh toán không hợp lệ",
  }),
});
export type CheckoutFormSchema = z.infer<typeof checkoutFormSchema>;
interface CheckoutFormProps {
  selectedItems: Outputs["cartRoutes"]["getMyCartItemsByIds"];
}
export default function CheckoutForm({ selectedItems }: CheckoutFormProps) {
  const form = useFormContext<CheckoutFormSchema>();

  return (
    <div className="lg:col-span-2 space-y-6">
      {/* Shipping Information */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Truck className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Thông tin giao hàng</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">
              Họ và tên <span className="text-destructive">*</span>
            </Label>
            <Input id="fullName" placeholder="Nhập họ và tên" {...form.register("fullName")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              Số điện thoại <span className="text-destructive">*</span>
            </Label>
            <Input id="phone" placeholder="Nhập số điện thoại" {...form.register("phone")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="province">
              Tỉnh/Thành phố <span className="text-destructive">*</span>
            </Label>
            <Input id="province" placeholder="Chọn tỉnh/thành phố" {...form.register("province")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ward">
              Phường/Xã <span className="text-destructive">*</span>
            </Label>
            <Input id="ward" placeholder="Chọn phường/xã" {...form.register("ward")} />
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
          </div>
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
          render={({ field, fieldState, formState }) => (
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
