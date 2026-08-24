// src/shared/hooks/useDocumentation.ts
// React hooks for the Documentation table (cr56a_documentation).

import { useCallback, useEffect, useState } from 'react';
import {
  createDocumentation,
  deleteDocumentation,
  listDocumentation,
  updateDocumentation,
  type ListDocumentationParams,
} from '../services/documentationService';
import type { PaginatedResult } from '../powerPagesApi';
import type {
  CreateDocumentationInput,
  DocumentationRecord,
  UpdateDocumentationInput,
} from '../../types/documentation';

/** Read hook — paginated list of Documentation records. */
export function useDocumentation(params?: ListDocumentationParams) {
  const [data, setData] = useState<PaginatedResult<DocumentationRecord>>({
    items: [],
    totalCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pageSize = params?.pageSize;
  const filter = params?.filter;
  const orderBy = params?.orderBy;
  const search = params?.search;

  const fetchData = useCallback(
    async (overrides?: Partial<ListDocumentationParams>) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await listDocumentation({
          pageSize,
          filter,
          orderBy,
          search,
          ...overrides,
        });
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch documentation');
      } finally {
        setIsLoading(false);
      }
    },
    [pageSize, filter, orderBy, search]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchNextPage = useCallback(() => {
    if (data.nextLink) fetchData({ nextLink: data.nextLink });
  }, [data.nextLink, fetchData]);

  return { ...data, isLoading, error, refetch: fetchData, fetchNextPage };
}

/** Write hook — create, update, and delete Documentation records. */
export function useDocumentationMutations() {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async <T>(operation: () => Promise<T>): Promise<T | null> => {
    setIsSaving(true);
    setError(null);
    try {
      return await operation();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
      return null;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const create = useCallback(
    (payload: CreateDocumentationInput) => run(() => createDocumentation(payload)),
    [run]
  );

  const update = useCallback(
    (id: string, payload: UpdateDocumentationInput) => run(() => updateDocumentation(id, payload)),
    [run]
  );

  const remove = useCallback((id: string) => run(() => deleteDocumentation(id)), [run]);

  return { create, update, remove, isSaving, error };
}
