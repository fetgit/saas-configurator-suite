import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useListOptimization } from '@/hooks/usePerformance';
import { cn } from '@/lib/utils';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  onScroll?: (scrollTop: number) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 5,
  renderItem,
  className,
  onScroll,
  loading = false,
  emptyMessage = "Aucun élément à afficher"
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);
  
  const {
    visibleItems,
    offsetY,
    totalHeight,
    updateVisibleRange,
    visibleRange
  } = useListOptimization(items, {
    itemHeight,
    containerHeight,
    overscan
  });

  // Mettre à jour la plage visible lors du scroll
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = event.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    updateVisibleRange(newScrollTop);
    onScroll?.(newScrollTop);
  }, [updateVisibleRange, onScroll]);

  // Effet pour mettre à jour la plage visible
  useEffect(() => {
    updateVisibleRange(scrollTop);
  }, [scrollTop, updateVisibleRange]);

  // Calculer les styles
  const containerStyle = useMemo(() => ({
    height: containerHeight,
    overflow: 'auto'
  }), [containerHeight]);

  const innerStyle = useMemo(() => ({
    height: totalHeight,
    position: 'relative' as const
  }), [totalHeight]);

  const itemsStyle = useMemo(() => ({
    transform: `translateY(${offsetY}px)`,
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0
  }), [offsetY]);

  // Rendu des éléments visibles
  const renderedItems = useMemo(() => {
    return visibleItems.map((item, index) => {
      const actualIndex = visibleRange.start + index;
      return (
        <div
          key={actualIndex}
          style={{ height: itemHeight }}
          className="flex items-center"
        >
          {renderItem(item, actualIndex)}
        </div>
      );
    });
  }, [visibleItems, visibleRange.start, itemHeight, renderItem]);

  // Rendu du loading
  if (loading) {
    return (
      <div className={cn("flex items-center justify-center", className)} style={containerStyle}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Rendu vide
  if (items.length === 0) {
    return (
      <div className={cn("flex items-center justify-center text-muted-foreground", className)} style={containerStyle}>
        <div className="text-center">
          <div className="text-2xl mb-2">📋</div>
          <div>{emptyMessage}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollElementRef}
      className={cn("virtualized-list", className)}
      style={containerStyle}
      onScroll={handleScroll}
    >
      <div style={innerStyle}>
        <div style={itemsStyle}>
          {renderedItems}
        </div>
      </div>
    </div>
  );
}

// Composant pour les listes avec recherche
interface SearchableVirtualizedListProps<T> extends VirtualizedListProps<T> {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  searchPlaceholder?: string;
  filterItems: (items: T[], searchTerm: string) => T[];
}

export function SearchableVirtualizedList<T>({
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Rechercher...",
  filterItems,
  items,
  ...props
}: SearchableVirtualizedListProps<T>) {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  
  // Debounce de la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filtrer les éléments
  const filteredItems = useMemo(() => {
    return filterItems(items, debouncedSearchTerm);
  }, [items, debouncedSearchTerm, filterItems]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          🔍
        </div>
      </div>
      
      <VirtualizedList
        {...props}
        items={filteredItems}
      />
    </div>
  );
}

// Composant pour les listes avec pagination
interface PaginatedVirtualizedListProps<T> extends VirtualizedListProps<T> {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
}

export function PaginatedVirtualizedList<T>({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage = 50,
  items,
  ...props
}: PaginatedVirtualizedListProps<T>) {
  // Calculer les éléments de la page actuelle
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  }, [items, currentPage, itemsPerPage]);

  // Rendu de la pagination
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={cn(
            "px-3 py-1 rounded-md text-sm font-medium transition-colors",
            i === currentPage
              ? "bg-primary text-primary-foreground"
              : "bg-background text-foreground hover:bg-muted"
          )}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-4">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded-md text-sm font-medium bg-background text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Précédent
        </button>
        
        {pages}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded-md text-sm font-medium bg-background text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Suivant
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <VirtualizedList
        {...props}
        items={paginatedItems}
      />
      {renderPagination()}
    </div>
  );
}

// Composant pour les listes avec tri
interface SortableVirtualizedListProps<T> extends VirtualizedListProps<T> {
  sortKey: keyof T;
  sortDirection: 'asc' | 'desc';
  onSortChange: (key: keyof T, direction: 'asc' | 'desc') => void;
  sortableColumns: Array<{
    key: keyof T;
    label: string;
  }>;
}

export function SortableVirtualizedList<T>({
  sortKey,
  sortDirection,
  onSortChange,
  sortableColumns,
  items,
  ...props
}: SortableVirtualizedListProps<T>) {
  // Trier les éléments
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [items, sortKey, sortDirection]);

  // Rendu de l'en-tête de tri
  const renderSortHeader = () => {
    return (
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm font-medium text-muted-foreground">Trier par:</span>
        {sortableColumns.map((column) => (
          <button
            key={String(column.key)}
            onClick={() => {
              const newDirection = sortKey === column.key && sortDirection === 'asc' ? 'desc' : 'asc';
              onSortChange(column.key, newDirection);
            }}
            className={cn(
              "px-3 py-1 rounded-md text-sm font-medium transition-colors",
              sortKey === column.key
                ? "bg-primary text-primary-foreground"
                : "bg-background text-foreground hover:bg-muted"
            )}
          >
            {column.label}
            {sortKey === column.key && (
              <span className="ml-1">
                {sortDirection === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {renderSortHeader()}
      <VirtualizedList
        {...props}
        items={sortedItems}
      />
    </div>
  );
}
