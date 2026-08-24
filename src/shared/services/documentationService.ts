// src/shared/services/documentationService.ts
// CRUD service layer for the Documentation table (cr56a_documentation).

import {
  buildODataUrl,
  escapeODataString,
  extractRecordId,
  parseResponseBody,
  powerPagesFetch,
  powerPagesFetchResponse,
  type ODataCollectionResponse,
  type PaginatedResult,
} from '../powerPagesApi';
import {
  mapDocumentationEntity,
  type CreateDocumentationInput,
  type DocumentationEntity,
  type DocumentationRecord,
  type UpdateDocumentationInput,
} from '../../types/documentation';

const ENTITY_SET = 'cr56a_documentations';

const DOCUMENTATION_SELECT = [
  'cr56a_documentationid',
  'cr56a_id',
  'cr56a_description',
  'createdon',
  'modifiedon',
].join(',');

export interface ListDocumentationParams {
  pageSize?: number;
  /** @odata.nextLink cursor from a previous response */
  nextLink?: string;
  filter?: string;
  orderBy?: string;
  /** Free-text match against the slug and description columns */
  search?: string;
}

const buildSearchFilter = (search: string): string => {
  const term = escapeODataString(search);
  return `(contains(cr56a_id,'${term}') or contains(cr56a_description,'${term}'))`;
};

const combineFilters = (...filters: (string | undefined)[]): string | undefined => {
  const present = filters.filter((f): f is string => !!f && f.trim() !== '');
  if (present.length === 0) return undefined;
  return present.map((f) => `(${f})`).join(' and ');
};

export const listDocumentation = async (
  params?: ListDocumentationParams
): Promise<PaginatedResult<DocumentationRecord>> => {
  const pageSize = params?.pageSize ?? 20;

  // Power Pages does NOT support $skip — paging uses @odata.nextLink cursors.
  // Page size is controlled by Prefer: odata.maxpagesize, never by $top.
  const url =
    params?.nextLink ??
    buildODataUrl(ENTITY_SET, {
      $select: DOCUMENTATION_SELECT,
      $orderby: params?.orderBy ?? 'cr56a_id asc',
      $count: 'true',
      $filter: combineFilters(
        params?.filter,
        params?.search ? buildSearchFilter(params.search) : undefined
      ),
    });

  const response = await powerPagesFetch<ODataCollectionResponse<DocumentationEntity>>(url, {
    headers: {
      Prefer: `odata.include-annotations="OData.Community.Display.V1.FormattedValue",odata.maxpagesize=${pageSize}`,
    },
  });

  return {
    items: (response?.value ?? []).map(mapDocumentationEntity),
    totalCount: response?.['@odata.count'] ?? response?.value?.length ?? 0,
    nextLink: response?.['@odata.nextLink'],
  };
};

export const getDocumentationById = async (id: string): Promise<DocumentationRecord | null> => {
  const url = buildODataUrl(`${ENTITY_SET}(${id})`, {
    $select: DOCUMENTATION_SELECT,
  });

  try {
    const entity = await powerPagesFetch<DocumentationEntity>(url);
    return entity ? mapDocumentationEntity(entity) : null;
  } catch {
    return null;
  }
};

export const createDocumentation = async (
  payload: CreateDocumentationInput
): Promise<DocumentationRecord> => {
  const body: Record<string, unknown> = {
    cr56a_id: payload.slug,
    cr56a_description: payload.description ?? '',
  };

  const response = await powerPagesFetchResponse(`/_api/${ENTITY_SET}`, {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(body),
  });

  const entity = await parseResponseBody<DocumentationEntity>(response);
  if (entity) return mapDocumentationEntity(entity);

  // No body — extract the ID from the Location header and fetch the record
  const createdId = extractRecordId(response);
  if (createdId) {
    const created = await getDocumentationById(createdId);
    if (created) return created;
  }

  throw new Error('Failed to retrieve created record — no response body or Location header');
};

export const updateDocumentation = async (
  id: string,
  payload: UpdateDocumentationInput
): Promise<DocumentationRecord> => {
  const body: Record<string, unknown> = {};

  if (payload.slug !== undefined) body.cr56a_id = payload.slug;
  if (payload.description !== undefined) body.cr56a_description = payload.description;

  await powerPagesFetch(`/_api/${ENTITY_SET}(${id})`, {
    method: 'PATCH',
    headers: { 'If-Match': '*' },
    body: JSON.stringify(body),
  });

  const updated = await getDocumentationById(id);
  if (!updated) throw new Error('Failed to fetch updated record');
  return updated;
};

export const deleteDocumentation = async (id: string): Promise<void> => {
  await powerPagesFetch(`/_api/${ENTITY_SET}(${id})`, {
    method: 'DELETE',
  });
};
