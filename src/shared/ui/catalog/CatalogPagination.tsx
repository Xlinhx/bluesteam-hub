import { ChevronLeft, ChevronRight } from 'lucide-react';
import './catalog-pagination.css';

export const RESOURCE_PAGE_SIZE = 5;

function pageNumbers(page: number, last: number, compact: boolean) {
  if (last <= 5) return Array.from({ length: last }, (_, index) => index + 1);
  if (compact) return [...new Set([1, page === 1 ? 2 : page === last ? last - 1 : page, last])];
  if (page <= 3) return [1, 2, 3, 4, last];
  if (page >= last - 2) return [1, last - 3, last - 2, last - 1, last];
  return [1, page - 1, page, page + 1, last];
}

export function CatalogPagination({ page, total, onPage, label = 'Phân trang học liệu', loading, compact = false }: {
  page: number;
  total: number;
  onPage: (page: number) => void;
  label?: string;
  loading?: boolean;
  compact?: boolean;
}) {
  const last = Math.ceil(total / RESOURCE_PAGE_SIZE);
  if (last <= 1) return null;
  const current = Math.min(page, last);
  const numbers = pageNumbers(current, last, compact);
  return <nav className={`catalog-pagination${compact ? ' catalog-pagination-compact' : ''}`} aria-label={label}>
    <button type="button" aria-label="Trang trước" disabled={loading || current === 1} onClick={() => onPage(current - 1)}><ChevronLeft size={18} aria-hidden="true"/></button>
    {numbers.map((number, index) => <span className="catalog-pagination-slot" key={number}>
      {index > 0 && number - numbers[index - 1] > 1 && <span className="catalog-pagination-gap" aria-hidden="true">…</span>}
      <button type="button" aria-label={`Trang ${number}`} aria-current={number === current ? 'page' : undefined}
        aria-disabled={number === current || undefined} disabled={loading} onClick={() => { if (number !== current) onPage(number); }}>{number}</button>
    </span>)}
    <button type="button" aria-label="Trang sau" disabled={loading || current === last} onClick={() => onPage(current + 1)}><ChevronRight size={18} aria-hidden="true"/></button>
  </nav>;
}
