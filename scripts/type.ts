export interface DetailCrawlData {
  page: Page
  product: Product
}

export interface Page {
  pageType: string
  resourceType: string
  resourceId: number
}

export interface Product {
  id: number
  type: string
  title: string
  price: number
  selected_or_first_available_variant: SelectedOrFirstAvailableVariant
  vendor: string
  imageUrl: string
  available: boolean
  handle: string
  not_allow_promotion: boolean
  variants: Variant[]
}

export interface SelectedOrFirstAvailableVariant {
  id: number
  price: number
  title: string
  sku: string
  variant_title: string
}

export interface Variant {
  id: number
  price: number
  title: string
  sku: string
  variant_title: string
}
