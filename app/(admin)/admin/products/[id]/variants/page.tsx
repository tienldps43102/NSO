import AdminVariantsClientPage from "./page.client";

interface Variant {
  id: string;
  skuCode: string;
  name: string;
  price: number;
  stock: number;
  status: "active" | "inactive";
}

const AdminVariants = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const variants = await $client!.bookRoutes.getVariantsByProductId({
    id,
  });
  return <AdminVariantsClientPage variants={variants} productId={id} />;
};

export default AdminVariants;
