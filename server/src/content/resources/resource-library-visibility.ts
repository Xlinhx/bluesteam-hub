// These retired demo materials remain addressable from their existing lessons.
// Authored replacements and edited copies participate in the library normally.
export const visibleInResourceLibrary = `NOT EXISTS (
  SELECT 1 FROM seed_mappings mapping
  WHERE mapping.target_type='resource' AND mapping.target_id=r.id
    AND r.version=1
    AND mapping.source_key IN (
      'resource:crab-image','resource:crab-coloring','resource:clownfish-coloring',
      'resource:turtle-coloring','resource:mangrove-poster','resource:depth-worksheet'
    )
)`;

// A linked flashcard is the entry point for its variants within the same group.
export const visibleAsGroupEntry = (groupIdSql: string) => `NOT EXISTS (
  SELECT 1 FROM resource_links rl
  JOIN resources main ON main.id=rl.source_resource_id
  JOIN resource_group_members member ON member.resource_id=main.id AND member.group_id=${groupIdSql}
  WHERE rl.target_resource_id=r.id AND main.kind='flashcard'
    AND main.visibility='published' AND r.kind<>'flashcard'
)`;
