"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Save, RotateCcw } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { orpcQuery } from "@/lib/orpc.client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ProductAttribute {
  id: string;
  key: string;
  value: string;
}

interface AttributesTabProps {
  initialAttributes?: ProductAttribute[];
  productId: string;
}

export function AttributesTab({ initialAttributes = [], productId }: AttributesTabProps) {
  const [attributes, setAttributes] = useState<ProductAttribute[]>(
    initialAttributes.length > 0 ? initialAttributes : [{ id: "1", key: "", value: "" }],
  );

  // Track changes
  const [removedAttributes, setRemovedAttributes] = useState<string[]>([]);
  const [newAttributes, setNewAttributes] = useState<ProductAttribute[]>([]);
  const [updatedAttributes, setUpdatedAttributes] = useState<Map<string, ProductAttribute>>(
    new Map(),
  );

  const isExistingAttribute = (id: string) => {
    return initialAttributes.some((attr) => attr.id === id);
  };

  const addAttribute = () => {
    const newAttr = { id: `new_${Date.now()}`, key: "", value: "" };
    setAttributes([...attributes, newAttr]);
    setNewAttributes([...newAttributes, newAttr]);
  };

  const removeAttribute = (attrId: string) => {
    setAttributes(attributes.filter((attr) => attr.id !== attrId));

    // If it's an existing attribute, track it for removal
    if (isExistingAttribute(attrId)) {
      setRemovedAttributes([...removedAttributes, attrId]);
    } else {
      // If it's a new attribute, remove it from newAttributes
      setNewAttributes(newAttributes.filter((attr) => attr.id !== attrId));
    }

    // Remove from updated list if it was there
    const newUpdated = new Map(updatedAttributes);
    newUpdated.delete(attrId);
    setUpdatedAttributes(newUpdated);
  };

  const updateAttribute = (attrId: string, field: "key" | "value", value: string) => {
    const updatedList = attributes.map((attr) =>
      attr.id === attrId ? { ...attr, [field]: value } : attr,
    );
    setAttributes(updatedList);

    // Track update for existing attributes only
    if (isExistingAttribute(attrId)) {
      const updatedAttr = updatedList.find((attr) => attr.id === attrId);
      if (updatedAttr) {
        const newUpdated = new Map(updatedAttributes);
        newUpdated.set(attrId, updatedAttr);
        setUpdatedAttributes(newUpdated);
      }
    } else {
      // Update in newAttributes list
      setNewAttributes(
        newAttributes.map((attr) => (attr.id === attrId ? { ...attr, [field]: value } : attr)),
      );
    }
  };
  const router = useRouter();

  const bulkUpdateAttributesMutation = useMutation(
    orpcQuery.bookAdminRoutes.bulkUpdateAttributes.mutationOptions({
      onSuccess: () => {
        toast.success("Cập nhật thuộc tính thành công");
        router.refresh();
      },
      onError: (error: Error) => {
        toast.error(error.message);
      },
    }),
  );
  const handleSave = () => {
    bulkUpdateAttributesMutation.mutate({
      id: productId,
      newAttributes: newAttributes.map((attr) => ({ name: attr.key, value: attr.value })),
      removedAttributes: removedAttributes,
      updatedAttributes: Array.from(updatedAttributes.values()).map((attr) => ({
        id: attr.id,
        name: attr.key,
        value: attr.value,
      })),
    });
  };

  const handleReset = () => {
    setAttributes(
      initialAttributes.length > 0 ? initialAttributes : [{ id: "1", key: "", value: "" }],
    );
    setRemovedAttributes([]);
    setNewAttributes([]);
    setUpdatedAttributes(new Map());
  };

  return (
    <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Thuộc tính sản phẩm</CardTitle>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={addAttribute}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm thuộc tính
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
        {attributes.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            Chưa có thuộc tính nào. Nhấn &quot;Thêm thuộc tính&quot; để bắt đầu.
          </div>
        ) : (
          attributes.map((attr, index) => (
            <div key={attr.id} className="flex items-center gap-4">
              <span className="w-8 text-sm text-muted-foreground">{index + 1}.</span>
              <Input
                placeholder="Tên thuộc tính (VD: Số trang)"
                value={attr.key}
                onChange={(e) => updateAttribute(attr.id, "key", e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="Giá trị (VD: 200)"
                value={attr.value}
                onChange={(e) => updateAttribute(attr.id, "value", e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeAttribute(attr.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
