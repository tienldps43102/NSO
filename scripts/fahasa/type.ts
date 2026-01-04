export interface FahasaListResponse {
    status: number
    message: string
    noofpages: number
    total_products: number
    product_list: ProductList[]
  }
  
  export interface ProductList {
    type_id: string
    product_id: string
    product_name: string
    product_finalprice: string
    product_price: string
    rating_html: string
    soon_release: string
    product_url: string
    image_src: string
    discount: number
    discount_label_html: string
    episode?: string
    label?: string
  }
  