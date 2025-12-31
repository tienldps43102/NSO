import React, { useState, useRef, useEffect } from 'react';
import { X, Check, Loader2 } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectPillsProps {
  options?: MultiSelectOption[];
  defaultValue?: string[];
  placeholder?: string;
  onChange?: (values: string[]) => void;
  className?: string;
  onSearch?: (query: string) => Promise<MultiSelectOption[]>;
  debounceMs?: number;
}

export const MultiSelectPills: React.FC<MultiSelectPillsProps> = ({
  options = [],
  defaultValue = [],
  placeholder = 'Search...',
  onChange,
  className,
  onSearch,
  debounceMs = 300
}) => {
  const [selected, setSelected] = useState<string[]>(defaultValue);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<MultiSelectOption[]>(options);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOptionsMap, setSelectedOptionsMap] = useState<Map<string, MultiSelectOption>>(
    new Map(options.filter(opt => defaultValue.includes(opt.value)).map(opt => [opt.value, opt]))
  );
  
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const onSearchRef = useRef(onSearch);
  const optionsRef = useRef(options);

  // Keep refs updated
  useEffect(() => {
    onSearchRef.current = onSearch;
    optionsRef.current = options;
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const currentOnSearch = onSearchRef.current;
    const currentOptions = optionsRef.current;

    // If no search query, show default options
    if (!search.trim()) {
      const filtered = currentOptions.filter((opt) => !selected.includes(opt.value));
      setSearchResults(filtered);
      setIsLoading(false);
      return;
    }

    // If onSearch is provided, use it for async search
    if (currentOnSearch) {
      // Clear previous timeout
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      setIsLoading(true);

      debounceTimerRef.current = setTimeout(async () => {
        try {
          const results = await currentOnSearch(search);
          setSearchResults(results);
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
        } finally {
          setIsLoading(false);
        }
      }, debounceMs);

      return () => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
      };
    } else {
      // Fallback: client-side filter if no onSearch provided
      const filtered = currentOptions.filter((opt) =>
        opt.label.toLowerCase().includes(search.toLowerCase()) &&
        !selected.includes(opt.value)
      );
      setSearchResults(filtered);
    }
  }, [search, selected, debounceMs]);

  const handleSelect = (option: MultiSelectOption) => {
    const newSelected = [...selected, option.value];
    setSelected(newSelected);
    
    // Store the full option data
    setSelectedOptionsMap(prev => new Map(prev).set(option.value, option));
    
    onChange?.(newSelected);
    setSearch('');
  };

  const handleRemove = (value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelected = selected.filter((item) => item !== value);
    setSelected(newSelected);
    
    setSelectedOptionsMap(prev => {
      const newMap = new Map(prev);
      newMap.delete(value);
      return newMap;
    });
    
    onChange?.(newSelected);
  };

  const selectedOptions = Array.from(selectedOptionsMap.values());

  return (
    <div ref={containerRef} className={cn('w-full', className)}>
      <div className="space-y-4">
        {/* Selected Pills */}
        {selectedOptions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedOptions.map((option) => (
              <Badge
                key={option.value}
                variant="secondary"
                
                className="px-2 py-1 text-sm font-normal bg-gray-100 hover:bg-gray-200 text-gray-900 text-xs "
              >
                {option.label}
                <button
                  onClick={(e) => handleRemove(option.value, e)}
                  className="ml-1 hover:text-white cursor-pointer hover:bg-red-500 rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Search Input with Dropdown */}
        <div className="relative">
          <Command className="border rounded-md" shouldFilter={false}>
            <div className="flex items-center">
              <CommandInput
                placeholder={placeholder}
                value={search}
                onValueChange={setSearch}
                onFocus={() => setOpen(true)}
                className="h-11"
              />
              {isLoading && (
                <div className="pr-3">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                </div>
              )}
            </div>
            {open && (
              <CommandList className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border bg-white shadow-md">
                {isLoading ? (
                  <div className="py-6 text-center text-sm text-gray-500">
                    Đang tìm kiếm...
                  </div>
                ) : searchResults.length === 0 ? (
                  <CommandEmpty>Không tìm thấy kết quả.</CommandEmpty>
                ) : (
                  <CommandGroup>
                    {searchResults.map((option) => (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        onSelect={() => handleSelect(option)}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{option.label}</span>
                          {selected.includes(option.value) && (
                            <Check className="h-4 w-4" />
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            )}
          </Command>
        </div>
      </div>
    </div>
  );
};
