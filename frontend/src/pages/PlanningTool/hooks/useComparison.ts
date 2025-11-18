import { useEffect, useState } from 'react';
import {
  fetchPropertyComparison,
} from '../../../lib/Comparison';
import type {
  CollectionFrequencyComparison,
  ContainerSizeComparison,
  CostComparison,
  PropertyComparison,
  WasteAmountComparison,
} from '../../../lib/Comparison';

export type ComparisonState = {
  loading: boolean;
  error: string | null;
  data: PropertyComparison | null;
};

export function useComparison(propertyId?: number | null) {
  const [state, setState] = useState<ComparisonState>({
    loading: !!propertyId,
    error: null,
    data: null,
  });

  useEffect(() => {
    if (!propertyId) {
      setState({ loading: false, error: null, data: null });
      return;
    }

    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    fetchPropertyComparison(propertyId)
      .then((data) => {
        if (cancelled) return;
        setState({ loading: false, error: null, data });
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setState({ loading: false, error: err.message ?? 'Kunde inte hämta jämförelsedata', data: null });
      });

    return () => {
      cancelled = true;
    };
  }, [propertyId]);

  return state;
}

export type { PropertyComparison, CostComparison, ContainerSizeComparison, WasteAmountComparison, CollectionFrequencyComparison };
