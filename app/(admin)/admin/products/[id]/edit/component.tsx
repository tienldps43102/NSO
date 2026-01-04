"use client";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AutocompleteSelect } from "@/components/ui/autocomplete";
import { createFromSchema, type CreateFromSchema } from "../../schema";
import { client, orpcQuery } from "@/lib/orpc.client";
import { MultiSelectOption, MultiSelectPills } from "@/components/ui/select-pills";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileDropzone } from "@/components/ui/file/dropzone";
import { FileList } from "@/components/ui/file/file-list";
import { useMutation } from "@tanstack/react-query";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AttributesTab } from "./AttributesTab";
import { ImagesTab } from "./ImagesTab";

type Product = Outputs["bookRoutes"]["getBookById"];

interface ProductAttribute {
  id: string;
  key: string;
  value: string;
}

interface ProductImage {
  id: string;
  url: string;
  alt: string;
}

export default function EditProductPage({ productData }: { productData: Product }) {
  const router = useRouter();
  
  // Book Info State
  const form = useForm<CreateFromSchema>({
    resolver: zodResolver(createFromSchema),
    defaultValues: {
      title: productData.title || "",
      description: productData?.description || "",
      isbn10: productData?.isbn10 || "",
      isbn13: productData?.isbn13 || "",
      authors: productData?.authors.map((author) => author.id) || [],
      categoryId: productData?.categoryId || "",
      displayPrice: Number(productData?.displayPrice) || 0,
      publisherId: productData?.publisherId || "",
      seriesId: productData?.seriesId || "",
      thumbnailUrl: productData?.thumbnailUrl || "",
      pageCount: productData?.pageCount || undefined,
      publicationDate: productData?.publicationDate || "",
    },
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File>();
  const [fileProgresses, setFileProgresses] = useState<Record<string, number>>({});

  // Product Attributes State
  const initialAttributes: ProductAttribute[] =
    productData?.attributes.map((attr) => ({ id: attr.id, key: attr.name, value: attr.value })) ||
    [];

  // Product Images State
  const initialImages: ProductImage[] =
    productData?.images.map((img) => ({ id: img.id, url: img.url, alt: "" })) || [];

  const startFakeProgress = (fileName: string) => {
    let progress = 0;

    const interval = setInterval(() => {
      progress += Math.random() * 10;

      setFileProgresses((prev) => ({
        ...prev,
        [fileName]: Math.min(progress, 90),
      }));

      if (progress >= 90) {
        clearInterval(interval);
      }
    }, 300);

    return interval;
  };

  const uploadFileMutation = useMutation(
    orpcQuery.fileRoutes.uploadFile.mutationOptions({
      onSuccess: (data, file) => {
        setFileProgresses((prev) => ({
          ...prev,
          [file.name]: 100,
        }));
        form.setValue("thumbnailUrl", data.url);
      },
    }),
  );

  const deleteFileMutation = useMutation(
    orpcQuery.fileRoutes.deleteFile.mutationOptions({
      onSuccess: () => {
        setUploadedFiles(undefined);
        form.setValue("thumbnailUrl", "");
      },
    }),
  );

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files);
    setUploadedFiles(newFiles[0]);
    const file = newFiles[0];

    const interval = startFakeProgress(file.name);

    uploadFileMutation.mutate(file, {
      onSettled: () => {
        clearInterval(interval);
      },
    });
  };

  const handleBoxClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (filename: string) => {
    setUploadedFiles(undefined);
    deleteFileMutation.mutate({ url: form.getValues("thumbnailUrl") || "" });
    form.setValue("thumbnailUrl", "");
    setFileProgresses((prev) => {
      const newProgresses = { ...prev };
      delete newProgresses[filename];
      return newProgresses;
    });
  };

  const { mutateAsync: updateBook } = useMutation(
    orpcQuery.bookAdminRoutes.updateBook.mutationOptions({
      onSuccess: () => {
        toast.success("Cập nhật sản phẩm thành công");
        router.push("/admin/products");
      },
      onError: (error: Error) => {
        toast.error(error.message);
      },
    }),
  );

  const handleSubmit = async (data: CreateFromSchema) => {
    console.log("=== BASIC INFO SAVE ===");
    console.log(data);
    
    // Calculate which authors to add/remove
    const currentAuthorIds = productData?.authors.map((author) => author.id) || [];
    const newAuthorIds = data.authors;
    
    const addAuthors = newAuthorIds.filter((id) => !currentAuthorIds.includes(id));
    const removeAuthors = currentAuthorIds.filter((id) => !newAuthorIds.includes(id));
    
    await updateBook({
      id: productData.id,
      addAuthors: addAuthors.length > 0 ? addAuthors : undefined,
      removeAuthors: removeAuthors.length > 0 ? removeAuthors : undefined,
      categoryId: data.categoryId,
      displayPrice: data.displayPrice,
      publisherId: data.publisherId,
      seriesId: data.seriesId,
      thumbnailUrl: data.thumbnailUrl,
      title: data.title,
      description: data.description,
      isbn10: data.isbn13,
      isbn13: data.isbn13,
      pageCount: data.pageCount,
      publicationDate: data.publicationDate,
    });
  };

  const handleReset = () => {
    form.reset({
      title: productData.title || "",
      description: productData?.description || "",
      isbn10: productData?.isbn10 || "",
      isbn13: productData?.isbn13 || "",
      authors: productData?.authors.map((author) => author.id) || [],
      categoryId: productData?.categoryId || "",
      displayPrice: Number(productData?.displayPrice) || 0,
      publisherId: productData?.publisherId || "",
      seriesId: productData?.seriesId || "",
      thumbnailUrl: productData?.thumbnailUrl || "",
      pageCount: productData?.pageCount || undefined,
      publicationDate: productData?.publicationDate || "",
    });
  };

  const searchPublisher = async (q: string, limit: number = 10): Promise<MultiSelectOption[]> => {
    const res = await client.publisherRoutes.getAllPublishers({
      q,
      limit,
      page: 1,
    });
    return (
      res?.publishers?.map((publisher) => ({
        value: publisher.id,
        label: publisher.name,
      })) || []
    );
  };

  const searchAuthor = async (q: string, limit: number = 10): Promise<MultiSelectOption[]> => {
    const res = await client.authorRoutes.getAllAuthors({
      q,
      limit,
      page: 1,
    });
    return (
      res?.authors?.map((author) => ({
        value: author.id,
        label: author.name,
      })) || []
    );
  };

  const searchCategory = async (q: string, limit: number = 10): Promise<MultiSelectOption[]> => {
    const res = await client.categoryRoutes.getAllCategories({
      q,
      limit,
      page: 1,
    });
    return (
      res?.categories?.map((category) => ({
        value: category.id,
        label: category.name,
      })) || []
    );
  };

  const searchSeries = async (q: string, limit: number = 10): Promise<MultiSelectOption[]> => {
    const res = await client.seriesRoutes.getAllSeries({
      q,
      limit,
      page: 1,
    });
    return (
      res?.series?.map((series) => ({
        value: series.id,
        label: series.name,
      })) || []
    );
  };

  if (!productData) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-xl font-semibold">Không tìm thấy sản phẩm</h2>
        <p className="mt-2 text-muted-foreground">Sản phẩm không tồn tại</p>
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/admin/products")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin/products")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Chỉnh sửa sản phẩm</h1>
            <p className="text-muted-foreground">ID: {productData.id}</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="info" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[500px]">
            <TabsTrigger value="info">Thông tin sách</TabsTrigger>
            <TabsTrigger value="attributes">Thuộc tính</TabsTrigger>
            <TabsTrigger value="media">Hình ảnh</TabsTrigger>
          </TabsList>

          {/* Book Info Tab */}
          <TabsContent value="info" className="space-y-6">
            <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Thông tin cơ bản</CardTitle>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={handleReset}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset
                  </Button>
                  <Button type="submit" size="sm">
                    <Save className="mr-2 h-4 w-4" />
                    Lưu
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên sản phẩm *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập tên sản phẩm" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="authors"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tác giả *</FormLabel>
                        <FormControl>
                          <MultiSelectPills
                            defaultValue={productData?.authors.map((author) => ({
                              value: author.id,
                              label: author.name,
                            })) || []}
                            placeholder="Tìm kiếm tác giả"
                            onChange={field.onChange}
                            onSearch={searchAuthor}
                            debounceMs={300}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="publisherId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nhà xuất bản *</FormLabel>
                        <FormControl>
                          <AutocompleteSelect
                            debounceMs={300}
                            onChange={(value) => field.onChange(value?.value)}
                            onSearch={searchPublisher}
                            placeholder="Tìm kiếm nhà xuất bản"
                            defaultValue={{
                              label: productData?.publisher?.name || "",
                              value: productData?.publisherId || "",
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Danh mục *</FormLabel>
                        <FormControl>
                          <AutocompleteSelect
                            debounceMs={300}
                            onChange={(value) => field.onChange(value?.value)}
                            onSearch={searchCategory}
                            placeholder="Tìm kiếm danh mục"
                            defaultValue={{
                              label: productData?.category?.name || "",
                              value: productData?.categoryId || "",
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="seriesId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Series</FormLabel>
                        <FormControl>
                          <AutocompleteSelect
                            debounceMs={300}
                            onChange={(value) => field.onChange(value?.value)}
                            onSearch={searchSeries}
                            placeholder="Tìm kiếm series"
                            defaultValue={{
                              label: productData?.series?.name || "",
                              value: productData?.seriesId || "",
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="displayPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giá gốc *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="publicationDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ngày xuất bản</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Nhập ngày xuất bản"
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isbn13"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ISBN</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập mã ISBN" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="thumbnailUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ảnh đại diện</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập URL hình ảnh" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FileDropzone
                    fileInputRef={fileInputRef}
                    handleBoxClick={handleBoxClick}
                    handleDragOver={handleDragOver}
                    handleDrop={handleDrop}
                    handleFileSelect={handleFileSelect}
                  />
                  <FileList
                    uploadedFiles={uploadedFiles ? [uploadedFiles] : []}
                    fileProgresses={fileProgresses}
                    removeFile={removeFile}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả chi tiết</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Nhập mô tả chi tiết cho sản phẩm"
                          rows={5}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attributes Tab */}
          <TabsContent value="attributes" className="space-y-6">
            <AttributesTab initialAttributes={initialAttributes} />
          </TabsContent>

          {/* Media Tab */}
          <TabsContent value="media" className="space-y-6">
            <ImagesTab initialImages={initialImages} />
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
}
