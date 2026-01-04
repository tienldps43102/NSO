import React from "react";
import { useLocalStorage } from "usehooks-ts";

export default function useCartSelection() {
  const [value, setValue, removeValue] = useLocalStorage("cart-selection-ids", [] as string[], {
    serializer: (value) => JSON.stringify(value),
    deserializer: (value) => JSON.parse(value),
  });
  const addItemToSelection = React.useCallback(
    (itemId: string) => {
      setValue((prev) => [...prev, itemId]);
    },
    [setValue],
  );
  const removeItemFromSelection = React.useCallback(
    (itemId: string) => {
      setValue((prev) => prev.filter((id) => id !== itemId));
    },
    [setValue],
  );
  const clearSelection = React.useCallback(() => {
    removeValue();
  }, [removeValue]);
  const setSelection = React.useCallback(
    (itemIds: string[]) => {
      setValue(itemIds);
    },
    [setValue],
  );
  return {
    value,
    addItemToSelection,
    removeItemFromSelection,
    clearSelection,
    setSelection,
  };
}
