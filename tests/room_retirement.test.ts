import fs from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('Room retirement preserves standalone features', () => {
  it('removes room, join, live and result entry points from the dispatcher', () => {
    const app = fs.readFileSync('src/app/App.tsx', 'utf8');
    for (const component of ['TeacherRoomsPage', 'TeacherRoomControlPage', 'LearnerRoomPage', 'JoinSessionPage', 'TeacherLiveConsolePage', 'TeacherSessionResultsPage', 'StudentLivePage', 'TeacherClassPage']) expect(app).not.toContain(component);
    for (const component of ['LearnerProfilePage', 'CreativeDrawingPage', 'HabitatStudioPage', 'TeacherCreativePage', 'TeacherResourceLibraryPage', 'TeacherLessonBuilderPage', 'PresentationPage']) expect(app).toContain(component);
  });
  it('does not register room or results services in the backend', () => {
    const source = fs.readFileSync('server/src/app.module.ts', 'utf8');
    expect(source).not.toContain('RoomsModule');
    expect(source).not.toContain('ResultsModule');
    expect(source).toContain('ArtworksModule');
    expect(source).toContain('ContentModule');
  });
  it('keeps creative workspaces independent of room APIs', () => {
    for (const file of ['useCreativeDraft.ts', 'useCreativeWorkspace.ts', 'CreativeDrawingSurface.tsx', 'CreativeHabitatSurface.tsx']) {
      const source = fs.readFileSync('src/shared/creative/' + file, 'utf8');
      expect(source).not.toContain('api/rooms');
      expect(source).not.toContain('submitRoomArtwork');
    }
  });
});
