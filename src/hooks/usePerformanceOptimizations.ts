// Performance Optimization Hooks

import { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import { debounce, throttle } from '@/lib/utils';

// Debounced value hook for search inputs
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Throttled function hook
export function useThrottle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T {
  const lastRun = useRef(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback((...args: Parameters<T>) => {
    if (Date.now() - lastRun.current >= limit) {
      func(...args);
      lastRun.current = Date.now();
    } else {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        func(...args);
        lastRun.current = Date.now();
      }, limit - (Date.now() - lastRun.current));
    }
  }, [func, limit]) as T;
}

// Intersection Observer for lazy loading
export function useIntersectionObserver<T extends Element>(
  ref: React.RefObject<T | null>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
      if (entry.isIntersecting && !hasIntersected) {
        setHasIntersected(true);
      }
    }, options);

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, options, hasIntersected]);

  return { isIntersecting, hasIntersected };
}

// Infinite scroll hook
export function useInfiniteScroll(
  fetchMore: () => Promise<void>,
  hasMore: boolean
) {
  const [loading, setLoading] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { isIntersecting } = useIntersectionObserver<HTMLDivElement>(loadMoreRef, {
    threshold: 0.1,
    rootMargin: '100px'
  });

  useEffect(() => {
    if (isIntersecting && hasMore && !loading) {
      setLoading(true);
      fetchMore().finally(() => setLoading(false));
    }
  }, [isIntersecting, hasMore, loading, fetchMore]);

  return { loadMoreRef, loading };
}

// Optimized pagination hook
export function usePagination<T>(
  fetchData: (page: number, limit: number) => Promise<{ data: T[]; total: number }>,
  initialLimit: number = 10
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const loadData = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    setLoading(true);
    try {
      const result = await fetchData(pageNum, initialLimit);
      
      if (append) {
        setData(prev => [...prev, ...result.data]);
      } else {
        setData(result.data);
      }
      
      setTotal(result.total);
      setHasMore(pageNum * initialLimit < result.total);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchData, initialLimit]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadData(page + 1, true);
    }
  }, [loading, hasMore, page, loadData]);

  const refresh = useCallback(() => {
    loadData(1, false);
  }, [loadData]);

  useEffect(() => {
    loadData(1, false);
  }, [loadData]);

  return {
    data,
    loading,
    page,
    hasMore,
    total,
    loadMore,
    refresh
  };
}

// Image lazy loading hook
export function useLazyImage(src: string, placeholder?: string) {
  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const { hasIntersected } = useIntersectionObserver<HTMLImageElement>(imgRef, {
    threshold: 0.1,
    rootMargin: '50px'
  });

  useEffect(() => {
    if (hasIntersected && src && !imageSrc) {
      setLoading(true);
      setError(false);
      
      const img = new Image();
      img.onload = () => {
        setImageSrc(src);
        setLoading(false);
      };
      img.onerror = () => {
        setError(true);
        setLoading(false);
      };
      img.src = src;
    }
  }, [hasIntersected, src, imageSrc]);

  return {
    imgRef,
    imageSrc,
    loading,
    error
  };
}

// Memoized component wrapper
export function useMemoizedComponent<T extends React.ComponentType<any>>(
  Component: T,
  areEqual?: (prevProps: any, nextProps: any) => boolean
) {
  return useMemo(() => Component, [Component, areEqual]);
}

// Performance monitoring hook
export function usePerformanceMonitor(componentName: string) {
  const renderCount = useRef(0);
  const renderTimes = useRef<number[]>([]);
  const lastRenderTime = useRef<number>(0);

  useEffect(() => {
    renderCount.current++;
    const now = performance.now();
    
    if (lastRenderTime.current > 0) {
      const renderTime = now - lastRenderTime.current;
      renderTimes.current.push(renderTime);
      
      // Keep only last 10 render times
      if (renderTimes.current.length > 10) {
        renderTimes.current = renderTimes.current.slice(-10);
      }
      
      // Log performance warnings
      const avgRenderTime = renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length;
      if (avgRenderTime > 16) { // 16ms = 60fps
        console.warn(`⚠️ ${componentName} slow render: ${avgRenderTime.toFixed(2)}ms average`);
      }
    }
    
    lastRenderTime.current = now;
  });

  const getStats = useCallback(() => ({
    renders: renderCount.current,
    averageRenderTime: renderTimes.current.length > 0 
      ? renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length 
      : 0,
    lastRenderTime: lastRenderTime.current
  }), [renderTimes, lastRenderTime]);

  return { getStats };
}
