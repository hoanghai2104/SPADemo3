// src/types/documentation.ts
// Types for the Documentation table (cr56a_documentation).

/**
 * Raw OData entity — matches Dataverse column logical names exactly.
 *
 * Note: `cr56a_id` is the table's *primary name* column, not its key. It holds a
 * human-readable slug (e.g. "getting-started"). The actual GUID key is
 * `cr56a_documentationid`.
 */
export interface DocumentationEntity {
  cr56a_documentationid: string;
  cr56a_id?: string;
  cr56a_description?: string;
  createdon?: string;
  modifiedon?: string;
  // Index signature for OData formatted value annotations
  [key: string]: unknown;
}

/** Clean domain type for UI consumption. */
export interface DocumentationRecord {
  /** GUID primary key (cr56a_documentationid) */
  id: string;
  /** Human-readable slug from the primary name column (cr56a_id) */
  slug: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentationInput {
  /** Required — cr56a_id is the primary name column and is application-required. */
  slug: string;
  description?: string;
}

export interface UpdateDocumentationInput {
  slug?: string;
  description?: string;
}

export const mapDocumentationEntity = (entity: DocumentationEntity): DocumentationRecord => ({
  id: entity.cr56a_documentationid,
  slug: entity.cr56a_id ?? '',
  description: entity.cr56a_description ?? '',
  createdAt: entity.createdon ?? '',
  updatedAt: entity.modifiedon ?? entity.createdon ?? '',
});
