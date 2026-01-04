"use client";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Slider } from "@/components/ui/slider";
import { ChevronDown, X } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { SearchSchema, searchSchema } from "./schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
const genres = [
  "Isekai",
  "Romance",
  "Shonen",
  "Slice of Life",
  "School Life",
  "Horror",
  "Comedy",
  "Detective",
  "Fantasy",
  "Action",
  "Drama",
];

const formats = ["Manga", "Light Novel", "Comic Việt"];
const publishers = ["Kim Đồng", "Trẻ", "IPM", "Skycomics", "AMAK"];
export const FilterSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <Collapsible defaultOpen className="border-b border-border pb-4">
    <CollapsibleTrigger className="flex w-full items-center justify-between py-2 font-medium text-foreground hover:text-primary transition-colors">
      {title}
      <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
    </CollapsibleTrigger>
    <CollapsibleContent className="pt-2 space-y-2">{children}</CollapsibleContent>
  </Collapsible>
);
import qs from "qs";
import z from "zod";
import { MultiSelectOption, MultiSelectPills } from "@/components/ui/select-pills";
import { client } from "@/lib/orpc.client";
import { Button } from "@/components/ui/button";
import { SearchParams } from "next/dist/server/request/search-params";
const formSchema = searchSchema.safeExtend({
  price: z.tuple([z.number().nonnegative().default(0), z.number().nonnegative().default(1000000)]),
});
type FormSchema = z.infer<typeof formSchema>;
export const FilterContent = ({ currentParams }: { currentParams: SearchParams }) => {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      price: [0, 1000000],
    },
  });
  const router = useRouter();
  const onSubmit = (data: FormSchema) => {
    const search: SearchSchema = {
      ...currentParams,
      authorIds: data.authorIds || [],
      categoryIds: data.categoryIds || [],
      publisherIds: data.publisherIds || [],
      maxPrice: data.price[1],
      minPrice: data.price[0],
      sort: data.sort || "newest",
      inStockOnly: data.inStockOnly || true,
      seriesIds: data.seriesIds || [],
    } as any;
    const queryString = qs.stringify(search, {
      arrayFormat: "repeat",
    });
    router.push(`/search?${queryString}`);
  };
  const searchCategories = async (query: string): Promise<MultiSelectOption[]> => {
    console.log(query);
    const res = await client.categoryRoutes.getAllCategories({
      q: query,
      page: 1,
      limit: 10,
    });
    return (
      res?.categories.map((category) => ({
        value: category.id,
        label: category.name,
      })) || []
    );
  };
  const searchPublishers = async (query: string): Promise<MultiSelectOption[]> => {
    const res = await client.publisherRoutes.getAllPublishers({
      q: query,
      page: 1,
      limit: 10,
    });
    return (
      res?.publishers.map((publisher) => ({
        value: publisher.id,
        label: publisher.name,
      })) || []
    );
  };
  const searchAuthors = async (query: string): Promise<MultiSelectOption[]> => {
    const res = await client.authorRoutes.getAllAuthors({
      q: query,
      page: 1,
      limit: 10,
    });
    return (
      res?.authors.map((author) => ({
        value: author.id,
        label: author.name,
      })) || []
    );
  };

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      {/* Price Range */}
      <FilterSection title="Khoảng giá">
        <Controller
          control={form.control}
          name="price"
          render={({ field }) => (
            <div className="px-2 pt-2">
              <Slider
                id="price-slider"
                max={1000000}
                min={0}
                step={20000}
                className="w-full"
                value={field.value}
                onValueChange={field.onChange}
              />
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>{field.value[0].toLocaleString()}đ</span>
                <span>{field.value[1].toLocaleString()}đ</span>
              </div>
            </div>
          )}
        />
      </FilterSection>

      {/* Genres */}
      <FilterSection title="Thể loại">
        <Controller
          control={form.control}
          name="categoryIds"
          render={({ field }) => (
            <MultiSelectPills
              defaultValue={field.value}
              placeholder="Tìm kiếm thể loại"
              onChange={field.onChange}
              onSearch={searchCategories}
              debounceMs={300}
            />
          )}
        />
      </FilterSection>

      {/* Publishers */}
      <FilterSection title="Nhà xuất bản">
        <Controller
          control={form.control}
          name="publisherIds"
          render={({ field }) => (
            <MultiSelectPills
              defaultValue={field.value}
              placeholder="Tìm kiếm nhà xuất bản"
              onChange={field.onChange}
              onSearch={searchPublishers}
              debounceMs={300}
            />
          )}
        />
      </FilterSection>

      {/* Authors */}
      <FilterSection title="Tác giả">
        <Controller
          control={form.control}
          name="authorIds"
          render={({ field }) => (
            <MultiSelectPills
              defaultValue={field.value}
              placeholder="Tìm kiếm tác giả"
              onChange={field.onChange}
              onSearch={searchAuthors}
              debounceMs={300}
            />
          )}
        />
      </FilterSection>

      <div className="flex  flex-col gap-2">
        <Button type="submit" className="w-full ">
          Áp dụng bộ lọc
        </Button>
        <Button variant="outline" className="w-full" onClick={() => form.reset()}>
          <X className="h-4 w-4 mr-2" />
          Xóa tất cả bộ lọc
        </Button>
      </div>
    </form>
  );
};
