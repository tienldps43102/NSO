import { Hero } from "@/components/home/Hero";
import { FeaturedSection } from "@/components/home/FeaturedSection";
// import { PromoBanner } from "@/components/home/PromoBanner";
import { HorizontalProductRow } from "@/components/home/HorizontalProductRow";
import { RankedBestSellers } from "@/components/home/RankedBestSellers";

const Index = async () => {
  const latestProducts = await $client?.productRoutes.getLatestProducts({ limit: 10 });
  console.log("Latest Products:", latestProducts);
  return (
    <>
      <Hero />
      <FeaturedSection />
      <HorizontalProductRow />
      <RankedBestSellers />
    </>
  );
};

export default Index;
