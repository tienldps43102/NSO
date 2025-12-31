"use server"
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';


export async function checkout(formData: FormData) {
    const selectedItems = formData.get('selected_variant_ids')?.toString()||''
    const cookieStore = await cookies()
    cookieStore.set('selected_variant_ids', selectedItems, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 5, // 5 minutes
    })
    redirect('/checkout')
}