"use client";
import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { CheckoutFormSchema, checkoutFormSchema } from "./form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { orpcQuery } from "@/lib/orpc.client";
import { toast } from "sonner";
import useCartSelection from "@/hooks/use-cart-selection";
import { useRouter } from "next/navigation";
export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  const { value, setSelection } = useCartSelection();
  const form = useForm<z.infer<typeof checkoutFormSchema>>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      province: "",
      ward: "",
      address: "",
      orderNote: "",
      paymentMethod: "COD",
      selectedAddressId: "",
      useExistingAddress: false,
      voucherCode: "",
    },
  });
  const createAddressMutation = useMutation(
    orpcQuery!.addressRoutes.addAddress.mutationOptions({}),
  );
  const router = useRouter();
  const createOrderMutaion = useMutation(
    orpcQuery!.orderRoutes.createOrder.mutationOptions({
      onSuccess: (data) => {
        if (data.success) {
          toast.success("Đặt hàng thành công");
          if (data.payURL) {
            window.location.assign(data.payURL);
          } else {
            router.push(`/user/order`);
          }
        } else {
          toast.error("Đặt hàng thất bại", {
            description: data?.message,
          });
        }
      },
      onError: (error) => {
        toast.error("Đặt hàng thất bại", {
          description: error.message,
        });
      },
    }),
  );
  const onSubmit = async (data: CheckoutFormSchema) => {
    console.log(value);

    let addressId: string;

    if (data.useExistingAddress && data.selectedAddressId) {
      // Use existing address
      addressId = data.selectedAddressId;
    } else {
      // Create new address
      if (!data.fullName || !data.phone || !data.province || !data.ward || !data.address) {
        toast.error("Vui lòng nhập đầy đủ thông tin giao hàng");
        return;
      }

      const address = await createAddressMutation.mutateAsync({
        detail: data.address,
        fullName: data.fullName,
        phone: data.phone,
        province: data.province,
        ward: data.ward,
        hidden: false,
      });
      addressId = address.id;
    }

    await createOrderMutaion.mutateAsync({
      addressId: addressId,
      paymentMethod: data.paymentMethod,
      note: data.orderNote,
      variantIds: value,
      voucherCode: data.voucherCode || undefined,
    });
    setSelection([]);
  };
  console.log(value, form.formState.errors);
  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>{children}</form>
    </FormProvider>
  );
}
