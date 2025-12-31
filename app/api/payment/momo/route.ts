// app/api/payment/momo/route.ts
import { verifyPayment } from '@/lib/payment'
import { updatePaymentStatus } from '@/services/payment'
import { NextResponse } from 'next/server'


export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)

    const queryMap: Record<string, string> = {}

    searchParams.forEach((value, key) => {
        queryMap[key] = value
    })

    const result = verifyPayment({ args: queryMap, method: "MOMO" })
    if (result.success) {
        await updatePaymentStatus(result.id, "SUCCESS")
        return NextResponse.redirect(new URL('/order-success', request.url), { status: 302 })
    } else {
        await updatePaymentStatus(result.id, "FAILED")
        return NextResponse.redirect(new URL('/order-failed', request.url), { status: 302 })
    }
}
