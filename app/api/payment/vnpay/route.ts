// app/api/payment/vnpay/route.ts
import { verifyPayment } from '@/lib/payment'
import { updatePaymentStatus } from '@/services/payment'
import { NextResponse } from 'next/server'



export async function POST(request: Request) {
    const { searchParams } = new URL(request.url)

    const queryMap: Record<string, string> = {}

    searchParams.forEach((value, key) => {
        queryMap[key] = value
    })

    const result = verifyPayment({ args: queryMap, method: "VNPAY" })
    if (result.success) {
        await updatePaymentStatus(result.id, "SUCCESS")
        return NextResponse.redirect(new URL('/order-success', request.url), { status: 302 })
    } else {
        await updatePaymentStatus(result.id, "FAILED")
        return NextResponse.redirect(new URL('/order-failed', request.url), { status: 302 })
    }
}
