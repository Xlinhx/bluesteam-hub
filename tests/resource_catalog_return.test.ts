import { describe, expect, it } from 'vitest';
import { rememberCatalog, peekCatalogReturn, takeCatalogReturn } from '../src/domains/learner/resources/catalogReturnState';

describe('Resource catalog return position', () => {
  const snapshot = {key:'reef|visual||',groups:[],focusedGroup:null,groupTotal:12,items:[],cursor:'next-page',total:28,scrollY:960};
  it('restores loaded pagination and position once for the same filters', () => {
    rememberCatalog(snapshot);
    expect(peekCatalogReturn(snapshot.key)).toEqual(snapshot);
    expect(peekCatalogReturn(snapshot.key)).toEqual(snapshot);
    expect(takeCatalogReturn(snapshot.key)).toEqual(snapshot);
    expect(takeCatalogReturn(snapshot.key)).toBeNull();
  });
  it('never restores a different group or filter', () => {
    rememberCatalog(snapshot);
    expect(takeCatalogReturn('shore|video||')).toBeNull();
  });
});
