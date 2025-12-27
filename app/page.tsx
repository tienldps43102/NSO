import { Hero } from "@/components/home/Hero";
import { CategoryChips } from "@/components/home/CategoryChips";
import { FeaturedSection } from "@/components/home/FeaturedSection";
import { PromoBanner } from "@/components/home/PromoBanner";
import { HorizontalBookRow } from "@/components/home/HorizontalBookRow";
import { RankedBestSellers } from "@/components/home/RankedBestSellers";

const  Index = () => {

  return (
   <>
        <Hero />
        <CategoryChips />
        <FeaturedSection />
        <PromoBanner />
        <HorizontalBookRow />
        <RankedBestSellers />
  
   </>
  );
};

export default Index;
