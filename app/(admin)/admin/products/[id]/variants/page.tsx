import AdminVariantsClientPage from "./page.client";

const AdminVariants = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const variants = await $client!.productRoutes.getVariantsByProductId({
    id,
  });
  return <AdminVariantsClientPage variants={variants} productId={id} />;
};

export default AdminVariants;
