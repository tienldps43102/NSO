"use client";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Upload, Save, RotateCcw } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { orpcQuery } from "@/lib/orpc.client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductImage {
  id: string;
  url: string;
  variantId?: string | null | undefined;
}

interface ImagesTabProps {
  initialImages?: ProductImage[];
  productId: string;
}

export function ImagesTab({ initialImages = [], productId }: ImagesTabProps) {
  const [images, setImages] = useState<ProductImage[]>(initialImages);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImageId, setUploadingImageId] = useState<string | null>(null);

  // Track changes
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<ProductImage[]>([]);
  const [updatedImages, setUpdatedImages] = useState<Map<string, ProductImage>>(new Map());

  const isExistingImage = (id: string) => {
    return initialImages.some((img) => img.id === id);
  };

  const addImage = () => {
    const newImg = { id: `new_${Date.now()}`, url: "", variantId: "" };
    setImages([...images, newImg]);
    setNewImages([...newImages, newImg]);
  };
  const router = useRouter();
  const bulkUpdateImagesMutation = useMutation(
    orpcQuery.bookAdminRoutes.bulkUpdateImages.mutationOptions({
      onSuccess: () => {
        toast.success("Cập nhật hình ảnh thành công");
        router.refresh();
      },
      onError: (error: Error) => {
        toast.error(error.message);
      },
    }),
  );
  const uploadFileMutation = useMutation(
    orpcQuery.fileRoutes.uploadFile.mutationOptions({
      onSuccess: (data) => {
        // Update the image URL after successful upload
        if (uploadingImageId) {
          updateImage(uploadingImageId, "url", data.url);
        }
        setUploadingImageId(null);
        toast.success("Upload ảnh thành công");
      },
      onError: (error: Error) => {
        toast.error(`Upload thất bại: ${error.message}`);
        setUploadingImageId(null);
      },
    }),
  );

  const handleFileSelect = async (imageId: string, file: File) => {
    if (!file) return;
    
    // Only allow upload for new images
    if (!imageId.startsWith("new_")) {
      toast.error("Chỉ được upload ảnh mới");
      return;
    }

    setUploadingImageId(imageId);
    uploadFileMutation.mutate(file);
  };

  const triggerFileInput = (imageId: string) => {
    // Store the image ID in a data attribute
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute("data-image-id", imageId);
      fileInputRef.current.click();
    }
  };

  const { data: variantOptions } = useQuery(
    orpcQuery.bookRoutes.getVariantOptionsByProductId.queryOptions({
      input: {
        id: productId,
      },
    }),
  );
  const removeImage = (imgId: string) => {
    setImages(images.filter((img) => img.id !== imgId));

    // If it's an existing image, track it for removal
    if (isExistingImage(imgId)) {
      setRemovedImages([...removedImages, imgId]);
    } else {
      // If it's a new image, remove it from newImages
      setNewImages(newImages.filter((img) => img.id !== imgId));
    }

    // Remove from updated list if it was there
    const newUpdated = new Map(updatedImages);
    newUpdated.delete(imgId);
    setUpdatedImages(newUpdated);
  };

  const updateImage = (imgId: string, field: "url" | "variantId", value: string) => {
    const updatedImagesList = images.map((img) =>
      img.id === imgId ? { ...img, [field]: value } : img,
    );
    setImages(updatedImagesList);

    // Track update for existing images only
    if (isExistingImage(imgId)) {
      const updatedImg = updatedImagesList.find((img) => img.id === imgId);
      if (updatedImg) {
        const newUpdated = new Map(updatedImages);
        newUpdated.set(imgId, updatedImg);
        setUpdatedImages(newUpdated);
      }
    } else {
      // Update in newImages list
      setNewImages(newImages.map((img) => (img.id === imgId ? { ...img, [field]: value } : img)));
    }
  };

  const handleSave = () => {
    bulkUpdateImagesMutation.mutate({
      id: productId,
      newImages: newImages.map((img) => ({ image: img.url, variantId: img.variantId as string })),
      removedImages: removedImages,
      updatedImages: Array.from(updatedImages.values()).map((img) => ({
        id: img.id,
        image: img.url,
        variantId: img.variantId || undefined,
      })),
    });
  };

  const handleReset = () => {
    setImages(initialImages);
    setRemovedImages([]);
    setNewImages([]);
    setUpdatedImages(new Map());
  };

  return (
    <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Hình ảnh sản phẩm</CardTitle>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={addImage}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm hình ảnh
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button type="button" size="sm" onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Lưu
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            const imageId = e.target.getAttribute("data-image-id");
            if (file && imageId) {
              handleFileSelect(imageId, file);
            }
            // Reset input value to allow selecting the same file again
            e.target.value = "";
          }}
        />
        {images.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-12">
            <Upload className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">
              Chưa có hình ảnh nào. Nhấn &quot;Thêm hình ảnh&quot; để bắt đầu.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {images.map((img) => {
              const isNewImage = img.id.startsWith("new_");
              
              return (
              <div key={img.id} className="relative rounded-lg border border-border p-4">
                <div className="mb-4 aspect-3/4 overflow-hidden rounded-md bg-muted">
                  {img.url ? (
                    <Image
                      src={img.url}
                      alt={img.variantId || ""}
                      className="h-full w-full object-cover"
                      width={300}
                      height={400}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  {/* Upload button overlay - only for new images */}
                  {isNewImage && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity hover:opacity-100"
                      onClick={() => triggerFileInput(img.id)}
                      disabled={uploadingImageId === img.id}
                    >
                      {uploadingImageId === img.id ? (
                        <>Đang tải...</>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload
                        </>
                      )}
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="URL hình ảnh"
                      value={img.url}
                      onChange={(e) => updateImage(img.id, "url", e.target.value)}
                      className="flex-1"
                      disabled={!isNewImage}
                      readOnly={!isNewImage}
                    />
                    {isNewImage && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => triggerFileInput(img.id)}
                        disabled={uploadingImageId === img.id}
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <Select
                    value={img.variantId || ""}
                    onValueChange={(value) => updateImage(img.id, "variantId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn biến thể" />
                    </SelectTrigger>{" "}
                    <SelectContent>
                      {variantOptions?.map((variant) => (
                        <SelectItem key={variant.id} value={variant.id}>
                          {variant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeImage(img.id)}
                  className="absolute right-2 top-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
