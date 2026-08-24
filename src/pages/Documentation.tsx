import { useDocumentation } from '../shared/hooks/useDocumentation';

const documentationCSS = `
.docs-page { max-width: 860px; margin: 0 auto; padding: 64px 24px 80px; font-family: 'DM Sans', sans-serif; color: var(--pp-text, #2D1B4E); }
.docs-header { margin-bottom: 40px; }
.docs-eyebrow { font-family: 'Outfit', sans-serif; font-size: 12px; letter-spacing: 3px; text-transform: uppercase; color: var(--pp-violet, #7B5EA7); margin-bottom: 10px; }
.docs-title { font-family: 'Outfit', sans-serif; font-weight: 600; font-size: 34px; line-height: 1.25; margin-bottom: 10px; }
.docs-subtitle { font-size: 15px; color: var(--pp-text-secondary, #6B5A82); }
.docs-list { display: flex; flex-direction: column; gap: 14px; list-style: none; }
.docs-item { background: var(--pp-surface, #FFFFFF); border: 1px solid rgba(139, 111, 192, 0.14); border-radius: 14px; padding: 20px 22px; transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease; }
.docs-item:hover { border-color: rgba(139, 111, 192, 0.3); box-shadow: 0 4px 20px rgba(139, 111, 192, 0.1); transform: translateY(-1px); }
.docs-item-slug { font-family: 'Outfit', sans-serif; font-weight: 500; font-size: 17px; margin-bottom: 6px; }
.docs-item-description { font-size: 14px; line-height: 1.6; color: var(--pp-text-secondary, #6B5A82); }
.docs-state { padding: 28px 22px; border-radius: 14px; font-size: 14px; line-height: 1.6; }
.docs-state.loading { background: rgba(139, 111, 192, 0.06); color: var(--pp-text-secondary, #6B5A82); }
.docs-state.error { background: rgba(200, 60, 60, 0.07); border: 1px solid rgba(200, 60, 60, 0.2); color: #9B2C2C; }
.docs-state.empty { background: rgba(139, 111, 192, 0.06); color: var(--pp-text-secondary, #6B5A82); }
.docs-retry { margin-top: 14px; padding: 8px 16px; border: 1px solid rgba(139, 111, 192, 0.3); border-radius: 999px; background: transparent; color: var(--pp-violet, #7B5EA7); font-family: 'Outfit', sans-serif; font-size: 13px; cursor: pointer; transition: background 0.2s ease; }
.docs-retry:hover { background: rgba(139, 111, 192, 0.08); }
.docs-footer { margin-top: 28px; display: flex; align-items: center; gap: 16px; }
.docs-count { font-size: 13px; color: var(--pp-text-muted, #9B8FB5); }
.docs-more { padding: 9px 20px; border: none; border-radius: 999px; background: var(--pp-violet, #7B5EA7); color: #fff; font-family: 'Outfit', sans-serif; font-size: 13px; cursor: pointer; transition: opacity 0.2s ease; }
.docs-more:hover { opacity: 0.9; }
.docs-more:disabled { opacity: 0.5; cursor: default; }
@media (max-width: 600px) { .docs-page { padding: 40px 18px 60px; } .docs-title { font-size: 26px; } }
`;

const Documentation: React.FC = () => {
  const { items, totalCount, nextLink, isLoading, error, refetch, fetchNextPage } =
    useDocumentation();

  return (
    <>
      <style>{documentationCSS}</style>
      <div className="docs-page">
        <header className="docs-header">
          <div className="docs-eyebrow">Documentation</div>
          <h1 className="docs-title">Guides and reference</h1>
          <p className="docs-subtitle">
            Everything you need to build, secure, and ship your Power Pages site.
          </p>
        </header>

        {error ? (
          <div className="docs-state error" role="alert">
            <div>Could not load documentation: {error}</div>
            <button type="button" className="docs-retry" onClick={() => refetch()}>
              Try again
            </button>
          </div>
        ) : isLoading && items.length === 0 ? (
          <div className="docs-state loading">Loading documentation…</div>
        ) : items.length === 0 ? (
          <div className="docs-state empty">No documentation articles have been published yet.</div>
        ) : (
          <>
            <ul className="docs-list">
              {items.map((item) => (
                <li key={item.id} className="docs-item">
                  <div className="docs-item-slug">{item.slug}</div>
                  {item.description ? (
                    <p className="docs-item-description">{item.description}</p>
                  ) : null}
                </li>
              ))}
            </ul>

            <div className="docs-footer">
              <span className="docs-count">
                Showing {items.length} of {totalCount}
              </span>
              {nextLink ? (
                <button
                  type="button"
                  className="docs-more"
                  onClick={fetchNextPage}
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading…' : 'Load more'}
                </button>
              ) : null}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export { Documentation };
