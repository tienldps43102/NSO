"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Upload, Save, RotateCcw } from "lucide-react";
import Image from "next/image";

interface ProductImage {
  id: string;
  url: string;
  alt: string;
}

interface ImagesTabProps {
  initialImages?: ProductImage[];
}

export function ImagesTab({ initialImages = [] }: ImagesTabProps) {
  const [images, setImages] = useState<ProductImage[]>(initialImages);
  
  // Track changes
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<ProductImage[]>([]);
  const [updatedImages, setUpdatedImages] = useState<Map<string, ProductImage>>(new Map());

  const isExistingImage = (id: string) => {
    return initialImages.some((img) => img.id === id);
  };

  const addImage = () => {
    const newImg = { id: `new_${Date.now()}`, url: "", alt: "" };
    setImages([...images, newImg]);
    setNewImages([...newImages, newImg]);
  };

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

  const updateImage = (imgId: string, field: "url" | "alt", value: string) => {
    const updatedImagesList = images.map((img) =>
      img.id === imgId ? { ...img, [field]: value } : img
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
      setNewImages(
        newImages.map((img) => (img.id === imgId ? { ...img, [field]: value } : img))
      );
    }
  };
  
  const handleSave = () => {
    console.log("=== IMAGES SAVE ===");
    console.log("Removed Images:", removedImages);
    console.log("New Images:", newImages);
    console.log("Updated Images:", Array.from(updatedImages.values()));
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
        {images.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-12">
            <Upload className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">
              Chưa có hình ảnh nào. Nhấn &quot;Thêm hình ảnh&quot; để bắt đầu.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {images.map((img) => (
              <div key={img.id} className="relative rounded-lg border border-border p-4">
                <div className="mb-4 aspect-3/4 overflow-hidden rounded-md bg-muted">
                  {img.url ? (
                    <Image
                      src={img.url}
                      alt={img.alt}
                      className="h-full w-full object-cover"
                      width={300}
                      height={400}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Input
                    placeholder="URL hình ảnh"
                    value={img.url}
                    onChange={(e) => updateImage(img.id, "url", e.target.value)}
                  />
                  <Input
                    placeholder="Mô tả hình ảnh (alt)"
                    value={img.alt}
                    onChange={(e) => updateImage(img.id, "alt", e.target.value)}
                  />
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
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
