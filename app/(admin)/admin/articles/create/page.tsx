"use client";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { articleFormSchema, type ArticleFormSchema } from "../schema";
import { orpcQuery } from "@/lib/orpc.client";
import { useController, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileDropzone } from "@/components/ui/file/dropzone";
import { FileList } from "@/components/ui/file/file-list";
import { useMutation } from "@tanstack/react-query";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";

const AdminArticleCreate = () => {
  const router = useRouter();
  const form = useForm<ArticleFormSchema>({
    resolver: zodResolver(articleFormSchema) as any,
    defaultValues: {
      title: "",
      content: "",
      thumbnailUrl: "",
      isActive: true,
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

  const { mutateAsync: createArticle } = useMutation(
    orpcQuery.articleRoutes.createArticle.mutationOptions({
      onSuccess: () => {
        toast.success("Tạo bài viết thành công");
        router.push("/admin/articles");
      },
      onError: (error: Error) => {
        toast.error(error.message);
      },
    }),
  );

  const handleSubmit = async (data: ArticleFormSchema) => {
    await createArticle({
      title: data.title,
      content: data.content,
      thumbnailUrl: data.thumbnailUrl,
      isActive: data.isActive,
    });
  };

  const {
    field: { onChange, value },
  } = useController({
    name: "content",
    control: form.control,
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
              onClick={() => router.push("/admin/articles")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Thêm bài viết mới</h1>
              <p className="text-muted-foreground">Tạo bài viết mới cho cửa hàng</p>
            </div>
          </div>
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            Lưu bài viết
          </Button>
        </div>

        <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Thông tin bài viết</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiêu đề *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tiêu đề bài viết" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="thumbnailUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ảnh đại diện *</FormLabel>
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
            </div>

            <FileList
              uploadedFiles={uploadedFiles ? [uploadedFiles] : []}
              fileProgresses={fileProgresses}
              removeFile={removeFile}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Xuất bản</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Bài viết sẽ được hiển thị công khai
                    </div>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={() => (
                <FormItem>
                  <FormLabel>Nội dung *</FormLabel>
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

export default AdminArticleCreate;
