import { describe,it,expect,vi } from 'vitest';
import { ArtworksService } from './artworks.service';
describe('Teacher artwork deep links',()=>{
  it('loads a specific owned artwork and keeps its private note',async()=>{
    const artwork={id:'12345678-1234-4123-8123-123456789012',teacherNote:'Riêng của cô'};
    const repo={findByIdWithOwnership:vi.fn().mockResolvedValue({artwork,teacherId:'owner'})};
    const service=new ArtworksService({} as any,repo as any);
    expect(await service.getTeacherArtwork('owner',artwork.id)).toEqual(artwork);
    await expect(service.getTeacherArtwork('another',artwork.id)).rejects.toMatchObject({status:403});
    repo.findByIdWithOwnership.mockResolvedValue(null);
    await expect(service.getTeacherArtwork('owner',artwork.id)).rejects.toMatchObject({status:404});
  });
});
