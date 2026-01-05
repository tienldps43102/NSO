import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import EditProductPage from "./component";



const AdminProductEdit = async ({params}: {params: Promise<{ id: string }>}) => {
  const { id } = await params;

  const productData = await $client?.bookRoutes.getBookById({ id ,withInActive: true});
  
  if (!productData) {
    return (
        <div className="flex flex-col items-center justify-center py-12">
          <h2 className="text-xl font-semibold">Không tìm thấy sản phẩm</h2>
          <p className="mt-2 text-muted-foreground">
            Sản phẩm với ID &quot;{id}&quot; không tồn tại
          </p>
          <Button
            variant="outline"
            className="mt-4"
            asChild
          >
          <Link href="/admin/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách  </Link>
          </Button>
        
        </div>
    );
  }

  return <EditProductPage productData={productData} />
};

export default AdminProductEdit;
