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
    },
  });
  const createAddressMutation = useMutation(
    orpcQuery!.addressRoutes.addAddress.mutationOptions({}),
  );
  const createOrderMutaion = useMutation(
    orpcQuery!.orderRoutes.createOrder.mutationOptions({
      onSuccess: (data) => {
        if (data.success) {
          toast.success("Đặt hàng thành công");
          if (data.payURL) {
            window.location.href = data.payURL;
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
    // create address first
    const address = await createAddressMutation.mutateAsync({
      detail: data.address,
      fullName: data.fullName,
      phone: data.phone,
      province: data.province,
      ward: data.ward,
    });
    const id = address.id;
    await createOrderMutaion.mutateAsync({
      addressId: id,
      paymentMethod: data.paymentMethod,
      note: data.orderNote,
      variantIds: value,
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
