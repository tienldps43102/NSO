import { Hero } from "@/components/home/Hero";
import { CategoryChips } from "@/components/home/CategoryChips";
import { FeaturedSection } from "@/components/home/FeaturedSection";
import { PromoBanner } from "@/components/home/PromoBanner";
import { HorizontalBookRow } from "@/components/home/HorizontalBookRow";
import { RankedBestSellers } from "@/components/home/RankedBestSellers";

const Index = async () => {
  const latestBooks = await $client?.bookRoutes.getLatestBooks({ limit: 10 });
  console.log("Latest Books:", latestBooks);
  return (
    <>
      <Hero />
      <CategoryChips />
      <FeaturedSection books={latestBooks || []} />
      <PromoBanner />
      <HorizontalBookRow />
      <RankedBestSellers />
    </>
  );
};

export default Index;
