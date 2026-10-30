import { creativeStorage, type CreativeArtwork } from './creativeStorage';

interface SaveOptions { finish: boolean; requirePreview: boolean; editVersion: number; createdAt: number }

/** One serialized writer per workspace. A completed record is never overwritten. */
export class CreativeDraftWriter {
  private base: CreativeArtwork | null = null;
  private pending: Promise<unknown> = Promise.resolve();
  constructor(private readonly id: string) {}
  get completed() { return this.base !== null && this.base.isDraft !== true; }
  restore(art: CreativeArtwork) { this.base = art; }

  write(current: CreativeArtwork, options: SaveOptions): Promise<CreativeArtwork> {
    const working = structuredClone(current), requestedAt = Date.now();
    const task = this.pending.then(async () => {
      if (this.completed) return this.base!;
      const stored=await creativeStorage.getArtworkById(this.id);
      if(stored&&stored.isDraft!==true){this.base=stored;return stored;}
      if (options.requirePreview && !working.previewDataUrl) throw new Error('Ảnh tác phẩm chưa sẵn sàng. Tiến trình vẫn được giữ trong trang.');
      const next: CreativeArtwork = {
        ...this.base, ...stored, ...working, id: this.id, createdAt: options.createdAt,
        updatedAt: requestedAt, editVersion: options.editVersion,
        previewDataUrl: working.previewDataUrl || this.base?.previewDataUrl || '',
        submissionState:stored?.submittedEditVersion!==undefined&&stored.submittedEditVersion!==options.editVersion?'local_only':stored?.submissionState??this.base?.submissionState,
        isDraft: !options.finish, completedAt: options.finish ? requestedAt : undefined,
      };
      await creativeStorage.saveArtwork(next);
      this.base = next;
      return next;
    });
    this.pending = task.catch(() => {});
    return task;
  }
}
