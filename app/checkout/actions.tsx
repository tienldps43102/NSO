"use server"
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export async function getSelectedItems() {
    const cookieStore = await cookies()
    const selectedItems = cookieStore.get('selected_variant_ids')?.value
    return selectedItems ? selectedItems.split(',') : []
}