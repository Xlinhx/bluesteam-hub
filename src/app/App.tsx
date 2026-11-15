import {CreativeSeaPage} from '../domains/learner/creative-studio/scanning/CreativeSeaPage';
import {ScanCapturePage} from '../domains/learner/creative-studio/scanning/ScanCapturePage';
import { useRouter, matchRoute } from './router';
import { useTheme } from '../shared/theme/ThemeProvider';
import { ShowcaseToolbar } from '../domains/showcase/ShowcaseToolbar';
import { ShowcaseIndexPage } from '../domains/showcase/ShowcaseIndexPage';

// Canonical Pages
import { LandingPage } from '../domains/public/concepts-preview/LegacyLandingPage';
import { LivingOceanLandingPage } from '../domains/public/landing/LivingOceanLandingPage';
import { StudentJourneyPage } from '../domains/learner/legacy-journey/StudentJourneyPage';
import { StudentUnitPage } from '../domains/learner/legacy-journey/StudentUnitPage';
import { StudentSimulationPage } from '../domains/learner/legacy-journey/StudentSimulationPage';
import { StudentProgressPage } from '../domains/learner/legacy-journey/StudentProgressPage';
import { TeacherDashboardPage } from '../domains/teacher/dashboard/TeacherDashboardPage';
import { TeacherProfilePage } from '../domains/teacher/account/TeacherProfilePage';
import { TeacherResourceLibraryPage } from '../domains/teacher/resources/TeacherResourceLibraryPage';
import { TeacherInteractivePage } from '../domains/teacher/interactive/TeacherInteractivePage';
import { TeacherCreativePage } from '../domains/teacher/creative/TeacherCreativePage';
import { CreativeEditorPage } from '../domains/teacher/creative/CreativeEditorPage';
import { TeacherLessonBuilderPage } from '../domains/teacher/lesson-builder/TeacherLessonBuilderPage';
import { PresentationPage } from '../domains/teacher/presentation/PresentationPage';
import { AccountAuthPage } from '../domains/public/auth/AccountAuthPage';
import { SessionGate } from '../shared/auth/SessionGate';
import { routeAccountRole } from '../shared/auth/routeAccess';
import { NotFoundPage } from '../domains/public/not-found/NotFoundPage';

// BlueSTEAM Learner Pages
import { LearnerHomePage } from '../domains/learner/home/LearnerHomePage';
import { LearningPage } from '../domains/learner/learning/LearningPage';
import { OceanCreatureViewerPage } from '../domains/learner/creature-viewer/OceanCreatureViewerPage';
import { GameLabPage } from '../domains/learner/game-lab/GameLabPage';
import { ActivityPlayPage } from '../domains/learner/game-lab/ActivityPlayPage';
import { LearnerProfilePage } from '../domains/learner/profile/LearnerProfilePage';
import { ResourcesLibraryPage } from '../domains/learner/resources/ResourcesLibraryPage';
import { ResourceDetailPage } from '../domains/learner/resources/ResourceDetailPage';
import { SourceResourcePage } from '../domains/learner/resources/SourceResourcePage';
import { FlashcardDetailPage } from '../domains/learner/resources/FlashcardDetailPage';
import { PrintPreviewPage } from '../domains/learner/resources/PrintPreviewPage';
import { VideoPlayerPage } from '../domains/learner/resources/VideoPlayerPage';
import { CreativeStudioPage } from '../domains/learner/creative-studio/CreativeStudioPage';
import { CreativeDrawingPage } from '../domains/learner/creative-studio/CreativeDrawingPage';
import { HabitatStudioPage } from '../domains/learner/creative-studio/HabitatStudioPage';

// Auxiliary Pages
import { RoleGatewayPage } from '../domains/public/onboarding/RoleGatewayPage';
import { StudentExplorePage } from '../domains/learner/legacy-journey/StudentExplorePage';

export function App() {
  const { currentPath, query } = useRouter();
  useTheme();
  const cleanPath = (currentPath || '/').split('?')[0];

  const renderRoute = () => {
    if (cleanPath === '/teacher/profile') return <TeacherProfilePage />;
    // Showcase Hub / Overview
    if (cleanPath === '/showcase' || cleanPath === '/showcase/index') {
      return <ShowcaseIndexPage />;
    }

    if (cleanPath === '/showcase/compare') return <ShowcaseIndexPage />;

    // Presentation views (clean, whole class screen)
    if (
      cleanPath === '/presentation' ||
      cleanPath === '/teacher/present' ||
      matchRoute('/present/:experienceId', cleanPath).matches
    ) {
      return <PresentationPage />;
    }
    if (cleanPath === '/login') return <AccountAuthPage />;
    if (cleanPath === '/register') return <AccountAuthPage mode="register" />;
    if (cleanPath === '/entry') return <RoleGatewayPage />;
    if (cleanPath === '/') return <LivingOceanLandingPage />;
    if (cleanPath === '/legacy-landing') return <LandingPage />;

    // Canonical Learner Routes (r2 + v2 aliases)
    if (cleanPath === '/home' || cleanPath === '/student') return <LearnerHomePage />;
    if (cleanPath === '/learning') return <LearningPage />;
    if (cleanPath === '/learn/atlas') return <LearningPage legacy />;
    if (cleanPath === '/learn') return <GameLabPage />;
    if (
      cleanPath.startsWith('/3dmodel') ||
      matchRoute('/3dmodel/:creature', cleanPath).matches
    ) {
      return <OceanCreatureViewerPage />;
    }
    if (cleanPath === '/learn/turtle') {
      if (typeof window !== 'undefined' && window.history) {
        window.history.replaceState({}, '', '/3dmodel/turtle');
      }
      return <OceanCreatureViewerPage />;
    }
    if (
      cleanPath === '/interactive/habitat-placement' ||
      cleanPath === '/interactive/sort'
    ) {
      return <ActivityPlayPage id="home-sorting" />;
    }
    if (
      cleanPath === '/interactive/my-action' ||
      cleanPath === '/interactive/action'
    ) {
      return <ActivityPlayPage id="sim-my-action" />;
    }
    if (cleanPath === '/interactive/plastic-journey') {
      return <ActivityPlayPage id="sim-plastic-journey" />;
    }
    if (cleanPath === '/interactive/rescue-mission') {
      return <ActivityPlayPage id="sim-rescue-mission" />;
    }
    if (cleanPath === '/interactive/simulations') {
      return <GameLabPage />;
    }
    if (
      cleanPath === '/interactive/3d' ||
      cleanPath === '/interactive/explore-3d' ||
      cleanPath === '/3d'
    ) {
      return <GameLabPage />;
    }
    if (cleanPath === '/interactive') return <GameLabPage />;
    const playMatch = matchRoute('/interactive/activities/:activityId', cleanPath);
    if (playMatch.matches) return <ActivityPlayPage id={playMatch.params.activityId} />;
    const modelPlayMatch = matchRoute('/interactive/models/:modelId', cleanPath);
    if (modelPlayMatch.matches) return <ActivityPlayPage id={modelPlayMatch.params.modelId} isModel />;

    if (
      matchRoute('/resources/flashcard/:cardId', cleanPath).matches ||
      cleanPath === '/resources/flashcard'
    ) {
      return <FlashcardDetailPage />;
    }
    if (
      matchRoute('/resources/print/:printId', cleanPath).matches ||
      cleanPath === '/resources/print'
    ) {
      return <PrintPreviewPage />;
    }
    if (
      matchRoute('/resources/media/:mediaId', cleanPath).matches ||
      matchRoute('/resources/video/:mediaId', cleanPath).matches ||
      cleanPath === '/resources/media' ||
      cleanPath === '/resources/video'
    ) {
      return <VideoPlayerPage />;
    }
    if (cleanPath === '/resources' || cleanPath === '/creative/coloring') return <ResourcesLibraryPage />;
    if (matchRoute('/creative/coloring/:resourceId', cleanPath).matches) return <ResourceDetailPage />;
    const resourceMatch = matchRoute('/resources/:resourceId', cleanPath);
    if (resourceMatch.matches) return query.source === '1' && !/^flashcards-\d+$/.test(resourceMatch.params.resourceId)
      ? <SourceResourcePage id={resourceMatch.params.resourceId}/>
      : <ResourceDetailPage />;

    if (
      cleanPath === '/studio/paint' ||
      cleanPath === '/creative/drawing' ||
      cleanPath === '/creative/draw' ||
      cleanPath === '/create/drawing'
    ) {
      return <CreativeDrawingPage />;
    }
    if (
      cleanPath === '/studio/habitat' ||
      cleanPath === '/creative/habitat' ||
      cleanPath === '/create/habitat'
    ) {
      return <HabitatStudioPage />;
    }
    if (cleanPath === '/creative/sea') return <CreativeSeaPage/>;
    if (cleanPath === '/creative/scan') return <ScanCapturePage/>;
    if (cleanPath === '/studio' || cleanPath === '/creative' || cleanPath === '/create') {
      return <CreativeStudioPage />;
    }
    if (cleanPath === '/profile') return <LearnerProfilePage />;

    // Learner Room (M05 & M06) & Legacy Student Surfaces
    if (cleanPath === '/student/journey') return <StudentJourneyPage />;
    if (
      cleanPath === '/student/unit' ||
      matchRoute('/student/unit/:unitId', cleanPath).matches
    ) {
      return <StudentUnitPage />;
    }
    if (
      cleanPath === '/student/simulation' ||
      matchRoute('/student/experience/:experienceId', cleanPath).matches
    ) {
      return <StudentSimulationPage />;
    }
    if (cleanPath === '/student/progress') return <StudentProgressPage />;
    if (cleanPath === '/student/explore') return <StudentExplorePage />;

    // Canonical Teacher Routes (r2 + v2 aliases)
    if (
      cleanPath === '/teacher/resources' ||
      cleanPath === '/teacher/library' ||
      matchRoute('/teacher/unit/:unitId', cleanPath).matches
    ) {
      return <TeacherResourceLibraryPage />;
    }
    if (cleanPath === '/teacher/interactive') {
      return <TeacherInteractivePage />;
    }
    if (cleanPath.startsWith('/teacher/interactive/')) return <TeacherInteractivePage />;
    if (
      cleanPath === '/teacher/plan' ||
      cleanPath === '/teacher/builder' ||
      matchRoute('/teacher/lesson/:lessonId', cleanPath).matches
    ) {
      return <TeacherLessonBuilderPage />;
    }
    if (cleanPath === '/teacher/creative') {
      return <TeacherCreativePage />;
    }
    if (cleanPath === '/teacher/creative/editor') return <CreativeEditorPage />;
    if (cleanPath === '/teacher') return <TeacherDashboardPage />;

    // True 404 Not Found Page for unknown routes
    return <NotFoundPage />;
  };

  const showShowcaseToolbar =
    cleanPath.startsWith('/showcase') || currentPath.includes('showcase=1');

  const page = renderRoute();
  const role = page.type === NotFoundPage ? null : routeAccountRole(cleanPath);
  return (
    <>
      {role ? <SessionGate role={role}>{page}</SessionGate> : page}
      {showShowcaseToolbar && <ShowcaseToolbar />}
    </>
  );
}

export default App;
