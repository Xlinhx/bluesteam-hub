import { apiFetch } from './client';

export interface ArtworkItemDto {
  id: string;
  participantAlias: string;
  participantAvatarKey: string;
  kind: 'drawing' | 'habitat';
  title: string;
  sourceMediaId: string;
  previewMediaId: string;
  previewUrl: string;
  sourceUrl: string;
  mediaUrl?: string;
  scenePayload: Record<string, unknown> | null;
  version: number;
  teacherNote: string | null;
  createdAt: string;
}

export async function listTeacherArtworks(params?: {
  kind?: 'drawing' | 'habitat';
  q?: string;
  limit?: number;
  offset?: number;
}): Promise<{ items: ArtworkItemDto[]; total: number }> {
  try {
    const qs = new URLSearchParams();
    if (params?.kind) qs.set('kind', params.kind);
    if (params?.q) qs.set('q', params.q);
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.offset) qs.set('offset', String(params.offset));

    const res = await apiFetch<{ items: ArtworkItemDto[]; total: number }>(
      `/teacher/artworks${qs.toString() ? `?${qs.toString()}` : ''}`,
    );
    if (res.ok && Array.isArray(res.data?.items)) {
      return {
        items: res.data.items,
        total: Number(res.data.total ?? res.data.items.length),
      };
    }
    throw new Error(res.error?.message || 'Không tải được danh sách tác phẩm');
  } catch (error) {
    throw error instanceof Error ? error : new Error('Không tải được danh sách tác phẩm');
  }
}

export async function updateTeacherArtworkNote(
  artworkId: string,
  note: string,
): Promise<{ ok: boolean; item?: ArtworkItemDto; errorMessage?: string }> {
  try {
    const res = await apiFetch<{ item: ArtworkItemDto }>(
      `/teacher/artworks/${artworkId}/note`,
      {
        method: 'PUT',
        body: JSON.stringify({ note }),
      },
    );
    if (res.ok && res.data?.item) {
      return { ok: true, item: res.data.item };
    }
    return {
      ok: false,
      errorMessage: res.error?.message || 'Không thể lưu ghi chú tác phẩm',
    };
  } catch {
    return {
      ok: false,
      errorMessage: 'Lỗi kết nối khi lưu ghi chú tác phẩm',
    };
  }
}

export function getTeacherArtworkDownloadUrl(artworkId: string): string {
  return `/api/v1/teacher/artworks/${encodeURIComponent(artworkId)}/download`;
}
