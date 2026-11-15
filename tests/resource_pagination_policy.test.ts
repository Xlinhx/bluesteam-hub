import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { CatalogPagination, RESOURCE_PAGE_SIZE } from '../src/shared/ui/catalog/CatalogPagination';

const render = (page: number, total: number) =>
  renderToStaticMarkup(createElement(CatalogPagination, {page, total, onPage: () => {}}));

it('uses five entries per page and hides pagination when every entry fits', () => {
  expect(RESOURCE_PAGE_SIZE).toBe(5);
  expect(render(1, 5)).toBe('');
  expect(render(1, 6)).toContain('aria-label="Trang 2"');
});

it('shows first, last and adjacent pages with gaps and a marked current page', () => {
  const html = render(5, 48);
  expect([...html.matchAll(/aria-label="Trang (\d+)"/g)].map(match => Number(match[1])))
    .toEqual([1, 4, 5, 6, 10]);
  expect(html.match(/catalog-pagination-gap/g)).toHaveLength(2);
  expect(html).toContain('aria-label="Trang 5" aria-current="page"');
});
