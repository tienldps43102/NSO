import React, { useState, useEffect, useRef } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface AutocompleteOption {
  value: string;
  label: string;
}

interface AutocompleteSelectProps {
  defaultValue?: AutocompleteOption;
  placeholder?: string;
  onChange?: (value: AutocompleteOption | null) => void;
  onSearch?: (query: string, limit: number) => Promise<AutocompleteOption[]>;
  debounceMs?: number;
}

export function AutocompleteSelect({
  defaultValue,
  placeholder = "Chọn...",
  onChange,
  onSearch,
  debounceMs = 300,
}: AutocompleteSelectProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<AutocompleteOption | null>(defaultValue || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<AutocompleteOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (onSearch && searchQuery) {
      setIsSearching(true);

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(async () => {
        try {
          const results = await onSearch(searchQuery, 10);
          setSearchResults(results);
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setIsSearching(false);
        }
      }, debounceMs);
    } else {
      setSearchResults([]);
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchQuery, onSearch, debounceMs]);

  const handleSelect = (option: AutocompleteOption) => {
    setSelected(option);
    onChange?.(option);
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected(null);
    onChange?.(null);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <span className={cn(!selected && "text-muted-foreground")}>
            {selected ? selected.label : placeholder}
          </span>
          <div className="flex items-center gap-2">
            {selected && (
              <X className="h-4 w-4 shrink-0 opacity-50 hover:opacity-100" onClick={handleClear} />
            )}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Tìm kiếm..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandEmpty>
            {isSearching ? "Đang tìm kiếm..." : "Không tìm thấy kết quả."}
          </CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {searchResults.map((option) => {
              const isSelected = selected?.value === option.value;
              return (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleSelect(option)}
                >
                  <Check className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100" : "opacity-0")} />
                  {option.label}
                </CommandItem>
              );
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Demo component
export default function Demo() {
  const [value, setValue] = useState<AutocompleteOption | null>(null);

  const sampleOptions: AutocompleteOption[] = [
    { value: "react", label: "React" },
    { value: "vue", label: "Vue" },
    { value: "angular", label: "Angular" },
    { value: "svelte", label: "Svelte" },
    { value: "next", label: "Next.js" },
    { value: "nuxt", label: "Nuxt.js" },
  ];

  const handleSearch = async (query: string): Promise<AutocompleteOption[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return sampleOptions.filter((opt) => opt.label.toLowerCase().includes(query.toLowerCase()));
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Autocomplete Select (Single)</h2>
        <p className="text-sm text-muted-foreground">Chọn một framework từ danh sách</p>
      </div>

      <AutocompleteSelect
        placeholder="Chọn framework..."
        onChange={(val) => setValue(val)}
        onSearch={handleSearch}
        debounceMs={300}
      />

      {value && (
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm font-medium">Giá trị đã chọn:</p>
          <p className="text-sm text-muted-foreground mt-1">
            Value: {value.value} | Label: {value.label}
          </p>
        </div>
      )}
    </div>
  );
}
