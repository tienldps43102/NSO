// app/api/payment/momo/route.ts
import { verifyPayment } from "@/lib/payment";
import { updatePaymentStatus } from "@/services/payment";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const queryMap: Record<string, string> = {};

  searchParams.forEach((value, key) => {
    queryMap[key] = value;
  });

  const result = verifyPayment({ args: queryMap, method: "MOMO" });
  const id = result.id.split("#")[0];
  const cookieStore = await cookies();
  if (result.success) {
    cookieStore.set("last_order_id", id, {
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 2,
    });
    await updatePaymentStatus(id, "SUCCESS");
    return NextResponse.redirect(new URL("/order-success", request.url), { status: 302 });
  } else {
    cookieStore.set("last_order_id", id, {
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 2,
    });
    await updatePaymentStatus(id, "FAILED");
    return NextResponse.redirect(new URL("/order-failed", request.url), { status: 302 });
  }
}
