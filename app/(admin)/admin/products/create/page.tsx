"use client";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AutocompleteSelect } from "@/components/ui/autocomplete";
import { createFromSchema, type CreateFromSchema } from "../schema";
import { client, orpcQuery } from "@/lib/orpc.client";
import { MultiSelectOption } from "@/components/ui/select-pills";
import { useController,
useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileDropzone } from "@/components/ui/file/dropzone";
import { FileList } from "@/components/ui/file/file-list";
import { useMutation } from "@tanstack/react-query";
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const AdminProductCreate = () => {
  const router = useRouter();
  // Product Info State
  const form = useForm<CreateFromSchema>({
    resolver: zodResolver(createFromSchema),
    defaultValues: {
      title: "",
      description: "",
      thumbnailUrl: "",
      categoryId: "",
      brandId: "",
      displayPrice: 0,
    },
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File>();
  const [fileProgresses, setFileProgresses] = useState<Record<string, number>>({});

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

  // Product Attributes State

  const { mutateAsync: createProduct } = useMutation(
    orpcQuery.productAdminRoutes.createProduct.mutationOptions({
      onSuccess: (data) => {
        toast.success("Tạo sản phẩm thành công");
        router.push(`/admin/products/${data.id}/edit`);
      },
      onError: (error: Error) => {
        toast.error(error.message);
      },
    }),
  );

  const handleSubmit = async (data: CreateFromSchema) => {
    console.log(data);
    await createProduct({
      brandId: data.brandId,
      categoryId: data.categoryId,
      displayPrice: data.displayPrice,
      thumbnailUrl: data.thumbnailUrl,
      title: data.title,
      description: data.description || undefined,
    });
  };
  const searchBrand = async (q: string, limit: number = 10): Promise<MultiSelectOption[]> => {
    const res = await client.brandRoutes.getAllBrands({
      q,
      limit,
      page: 1,
    });
    return (
      res?.brands?.map((brand) => ({
        value: brand.id,
        label: brand.name,
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
  const {
    field: { onChange, value, ref },
  } = useController({
    name: "description",
    rules: { required: true },
    control: form.control,
    defaultValue: "",
    
  });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
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
              <h1 className="text-2xl font-bold">Thêm sản phẩm mới</h1>
              <p className="text-muted-foreground">Tạo sản phẩm mới cho cửa hàng</p>
            </div>
          </div>
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            Lưu sản phẩm
          </Button>
        </div>

        {/* Tabs */}

        <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
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
                name="displayPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá gốc *</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="brandId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hãng *</FormLabel>
                    <FormControl>
                      <AutocompleteSelect
                        debounceMs={300}
                        onChange={(value) => field.onChange(value?.value)}
                        onSearch={searchBrand}
                        placeholder="Tìm kiếm hãng"
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
                    <SimpleEditor initialContent={value} onChange={onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      </form>
    </Form>
  );
};

export default AdminProductCreate;
