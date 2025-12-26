import { SiteHeader } from "@/components/home/SiteHeader";
import { Hero } from "@/components/home/Hero";
import { CategoryChips } from "@/components/home/CategoryChips";
import { FeaturedSection } from "@/components/home/FeaturedSection";
import { PromoBanner } from "@/components/home/PromoBanner";
import { HorizontalBookRow } from "@/components/home/HorizontalBookRow";
import { RankedBestSellers } from "@/components/home/RankedBestSellers";
import { SiteFooter } from "@/components/home/SiteFooter";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <Hero />
        <CategoryChips />
        <FeaturedSection />
        <PromoBanner />
        <HorizontalBookRow />
        <RankedBestSellers />
      </main>
      <SiteFooter />
    </div>
  );
};

export default Index;
