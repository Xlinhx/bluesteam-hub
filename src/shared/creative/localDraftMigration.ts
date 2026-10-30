import type {
  CreativeArtwork,
  HabitatPlacedItem,
} from './creativeStorage';

export const R2_CREATIVE_SCHEMA_VERSION = 2;

export type LegacySubmissionState = 'local_only' | 'pending' | 'submitted' | 'failed';

export interface MigratedCreativeDraft extends CreativeArtwork {
  schemaVersion: number;
  updatedAt: number;
  clientSubmissionId: string;
  submissionState: LegacySubmissionState;
  submittedRoomId?: string | null;
  submittedRoundId?: string | null;
  submittedArtworkId?: string | null;
  lastSubmissionError?: string | null;
}

export interface CreativeExportBundle {
  bundleVersion: number;
  exportedAt: string;
  items: MigratedCreativeDraft[];
}

function deterministicSubmissionId(artworkId: string, createdAt: number): string {
  const cleanId = String(artworkId || 'draft')
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .slice(0, 64);
  return `sub-${cleanId}-${createdAt || 0}`;
}

function sanitizeHabitatItems(rawItems: unknown): HabitatPlacedItem[] {
  if (!Array.isArray(rawItems)) return [];
  const out: HabitatPlacedItem[] = [];
  for (const item of rawItems) {
    if (!item || typeof item !== 'object') continue;
    const rec = item as Record<string, unknown>;
    const rawType = String(rec.type || 'coral') as HabitatPlacedItem['type'];
    out.push({
      ...(rec as unknown as HabitatPlacedItem),
      id: String(rec.id || `item-${out.length + 1}`),
      type: rawType,
      x: Number.isFinite(Number(rec.x)) ? Number(rec.x) : 0,
      z: Number.isFinite(Number(rec.z)) ? Number(rec.z) : 0,
      rotation: Number.isFinite(Number(rec.rotation)) ? Number(rec.rotation) : 0,
      scale: Number.isFinite(Number(rec.scale)) && Number(rec.scale) > 0 ? Number(rec.scale) : 1,
    });
  }
  return out;
}

/**
 * Migrates a v1 or v2 CreativeArtwork record into a schemaVersion=2 MigratedCreativeDraft.
 * Idempotent: running migration multiple times on the same record yields identical data.
 */
export function migrateLegacyArtworkRecord(
  raw: CreativeArtwork | MigratedCreativeDraft,
): MigratedCreativeDraft {
  const rec = raw as Partial<MigratedCreativeDraft>;
  const createdAt =
    typeof rec.createdAt === 'number' && Number.isFinite(rec.createdAt)
      ? rec.createdAt
      : Date.now();
  const updatedAt =
    typeof rec.updatedAt === 'number' && Number.isFinite(rec.updatedAt)
      ? rec.updatedAt
      : createdAt;
  const id = String(rec.id || `art-${createdAt}`);
  const type = rec.type === 'scan'?'scan':rec.type === 'habitat' ? 'habitat' : 'drawing';
  const title = String(
    rec.title || (type === 'habitat' ? 'Sa bàn đại dương của em' : 'Bức tranh đại dương của em'),
  ).trim();
  const previewDataUrl = String(rec.previewDataUrl || '');

  const drawingData =
    type === 'drawing'
      ? {
          document:rec.drawingData?.document,
          template: rec.drawingData?.template ? String(rec.drawingData.template) : undefined,
          canvasDataUrl: String(rec.drawingData?.canvasDataUrl || previewDataUrl),
        }
      : undefined;

  const habitatData =
    type === 'habitat'
      ? {
          items: sanitizeHabitatItems(rec.habitatData?.items),
          ...(rec.habitatData?.project ? { project:rec.habitatData.project } : {}),
        }
      : undefined;

  const submissionState: LegacySubmissionState =
    rec.submissionState === 'submitted' || rec.submissionState === 'pending' || rec.submissionState === 'failed'
      ? rec.submissionState
      : 'local_only';

  return {
    sourceSnapshot:rec.sourceSnapshot,
    pendingDelivery:rec.pendingDelivery,
    habitatChallenge:rec.habitatChallenge,
    id,
    type,
    title,
    createdAt,
    updatedAt,
    previewDataUrl,
    isDraft: rec.isDraft,
    completedAt:rec.completedAt,
    sourceArtworkId:rec.sourceArtworkId,
    editVersion: rec.editVersion,
    submittedEditVersion: rec.submittedEditVersion,
    templateConfig: rec.templateConfig,
    drawingData,
    scanData:rec.scanData,
    habitatData,
    schemaVersion: R2_CREATIVE_SCHEMA_VERSION,
    clientSubmissionId:
      rec.clientSubmissionId || deterministicSubmissionId(id, createdAt),
    submissionState,
    submittedRoomId: rec.submittedRoomId ?? null,
    submittedRoundId: rec.submittedRoundId ?? null,
    submittedArtworkId: rec.submittedArtworkId ?? null,
    lastSubmissionError: rec.lastSubmissionError ?? null,
  };
}

/**
 * Safely migrates a list of stored records without deleting any source record
 * until the migrated version is verified readable.
 */
export async function migrateDraftCollection(
  records: Array<CreativeArtwork | MigratedCreativeDraft>,
  persistRecord?: (draft: MigratedCreativeDraft) => Promise<void>,
  verifyReadRecord?: (id: string) => Promise<CreativeArtwork | MigratedCreativeDraft | null>,
): Promise<{
  migrated: MigratedCreativeDraft[];
  upgradedCount: number;
}> {
  const migrated: MigratedCreativeDraft[] = [];
  let upgradedCount = 0;

  for (const raw of records) {
    const wasLegacy = (raw as Partial<MigratedCreativeDraft>).schemaVersion !== R2_CREATIVE_SCHEMA_VERSION;
    const next = migrateLegacyArtworkRecord(raw);

    if (persistRecord && wasLegacy) {
      await persistRecord(next);
      if (verifyReadRecord) {
        const verified = await verifyReadRecord(next.id);
        if (!verified || verified.id !== next.id) {
          throw new Error(`Không thể xác minh bản nháp sau khi nâng cấp: ${next.id}`);
        }
      }
      upgradedCount += 1;
    }

    migrated.push(next);
  }

  return { migrated, upgradedCount };
}

export function exportDraftsToJson(
  records: Array<CreativeArtwork | MigratedCreativeDraft>,
): string {
  const items = records.map((r) => migrateLegacyArtworkRecord(r));
  const bundle: CreativeExportBundle = {
    bundleVersion: R2_CREATIVE_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    items,
  };
  return JSON.stringify(bundle, null, 2);
}

export function importDraftsFromJson(serialized: string): MigratedCreativeDraft[] {
  const parsed = JSON.parse(serialized) as Partial<CreativeExportBundle> | Array<CreativeArtwork>;
  const rawList = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed?.items)
      ? parsed.items
      : [];

  return rawList.map((item) => migrateLegacyArtworkRecord(item));
}
