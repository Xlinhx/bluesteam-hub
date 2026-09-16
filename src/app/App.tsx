import { useRouter, matchRoute } from './router';
import { useTheme } from '../themes/ThemeProvider';
import { ShowcaseToolbar } from '../showcase/ShowcaseToolbar';
import { ShowcaseIndexPage } from '../showcase/ShowcaseIndexPage';
import { CompareMatrix } from '../showcase/CompareMatrix';

// Canonical Pages (14 Screens)
import { LandingPage } from '../pages/public/LandingPage';
import { LivingOceanLandingPage } from '../pages/public/LivingOceanLandingPage';
import { StudentJourneyPage } from '../pages/student/StudentJourneyPage';
import { StudentUnitPage } from '../pages/student/StudentUnitPage';
import { StudentSimulationPage } from '../pages/student/StudentSimulationPage';
import { StudentProgressPage } from '../pages/student/StudentProgressPage';
import { TeacherDashboardPage } from '../pages/teacher/TeacherDashboardPage';
import { TeacherResourceLibraryPage } from '../pages/teacher/TeacherResourceLibraryPage';
import { TeacherLessonBuilderPage } from '../pages/teacher/TeacherLessonBuilderPage';
import { TeacherLiveConsolePage } from '../pages/teacher/TeacherLiveConsolePage';
import { PresentationPage } from '../pages/teacher/PresentationPage';
import { TeacherSessionResultsPage } from '../pages/teacher/TeacherSessionResultsPage';
import { JoinSessionPage } from '../pages/public/JoinSessionPage';
import { TeacherLoginPage } from '../pages/public/TeacherLoginPage';

// BlueSTEAM v2 Learner Pages
import { LearnerHomePage } from '../pages/learner/LearnerHomePage';
import { OceanCreatureViewerPage } from '../pages/learner/OceanCreatureViewerPage';
import { HabitatPlacementGamePage } from '../pages/learner/HabitatPlacementGamePage';
import { GameLabPage } from '../pages/learner/GameLabPage';
import { LearnerProfilePage } from '../pages/learner/LearnerProfilePage';
import { ResourcesLibraryPage } from '../pages/learner/ResourcesLibraryPage';
import { FlashcardDetailPage } from '../pages/learner/FlashcardDetailPage';
import { PrintPreviewPage } from '../pages/learner/PrintPreviewPage';
import { VideoPlayerPage } from '../pages/learner/VideoPlayerPage';
import { SimulationsCatalogPage } from '../pages/learner/SimulationsCatalogPage';
import { MyActionSimulationPage } from '../pages/learner/MyActionSimulationPage';
import { PlasticJourneySimulationPage } from '../pages/learner/PlasticJourneySimulationPage';
import { RescueMissionSimulationPage } from '../pages/learner/RescueMissionSimulationPage';
import { CreativeStudioPage } from '../pages/learner/CreativeStudioPage';
import { CreativeDrawingPage } from '../pages/learner/CreativeDrawingPage';
import { HabitatStudioPage } from '../pages/learner/HabitatStudioPage';
import { Ocean3DExplorePage } from '../pages/learner/Ocean3DExplorePage';

// Auxiliary Pages
import { RoleGatewayPage } from '../pages/public/RoleGatewayPage';
import { StudentExplorePage } from '../pages/student/StudentExplorePage';
import { StudentLivePage } from '../pages/student/StudentLivePage';
import { TeacherClassPage } from '../pages/teacher/TeacherClassPage';

export function App() {
  const { currentPath } = useRouter();
  useTheme();
  const cleanPath = (currentPath || '/').split('?')[0];

  // Dispatch active page
  const renderRoute = () => {
    // Showcase Hub / Overview
    if (cleanPath === '/showcase' || cleanPath === '/showcase/index') {
      return <ShowcaseIndexPage />;
    }

    // Showcase 6-Variant Matrix
    if (cleanPath === '/showcase/compare') {
      return <CompareMatrix />;
    }

    // 11. Presentation views (clean, whole class screen)
    if (
      cleanPath === '/presentation' ||
      matchRoute('/session/:sessionId/present', cleanPath).matches ||
      matchRoute('/present/:experienceId', cleanPath).matches
    ) {
      return <PresentationPage />;
    }

    // 13. Join Class
    if (cleanPath === '/join') return <JoinSessionPage />;

    // 14. Teacher Login
    if (cleanPath === '/login') return <TeacherLoginPage />;

    // Role Gateways & Auxiliaries
    if (cleanPath === '/entry') return <RoleGatewayPage />;

    // BlueSTEAM v2 Canonical Learner Routes
    if (cleanPath === '/home') return <LearnerHomePage />;
    if (cleanPath === '/learn/atlas' || cleanPath === '/learn') return <GameLabPage />;
    if (cleanPath.startsWith('/3dmodel') || matchRoute('/3dmodel/:creature', cleanPath).matches) return <OceanCreatureViewerPage />;
    if (cleanPath === '/learn/turtle') {
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, '', '/3dmodel/turtle');
      }
      return <OceanCreatureViewerPage />;
    }
    if (cleanPath === '/interactive/habitat-placement') return <HabitatPlacementGamePage />;
    if (cleanPath === '/interactive/my-action') return <MyActionSimulationPage />;
    if (cleanPath === '/interactive/plastic-journey') return <PlasticJourneySimulationPage />;
    if (cleanPath === '/interactive/rescue-mission') return <RescueMissionSimulationPage />;
    if (cleanPath === '/interactive/simulations') return <SimulationsCatalogPage />;
    if (cleanPath === '/interactive/3d' || cleanPath === '/interactive/explore-3d' || cleanPath === '/3d') return <Ocean3DExplorePage />;
    if (cleanPath === '/interactive') return <GameLabPage />;
    if (matchRoute('/resources/flashcard/:cardId', cleanPath).matches || cleanPath === '/resources/flashcard') return <FlashcardDetailPage />;
    if (matchRoute('/resources/print/:printId', cleanPath).matches || cleanPath === '/resources/print') return <PrintPreviewPage />;
    if (matchRoute('/resources/media/:mediaId', cleanPath).matches || cleanPath === '/resources/media') return <VideoPlayerPage />;
    if (cleanPath === '/resources') return <ResourcesLibraryPage />;
    if (cleanPath === '/creative/drawing' || cleanPath === '/creative/draw') return <CreativeDrawingPage />;
    if (cleanPath === '/creative/habitat') return <HabitatStudioPage />;
    if (cleanPath === '/creative') return <CreativeStudioPage />;
    if (cleanPath === '/profile') return <LearnerProfilePage />;

    // Student Surfaces
    // 03. Student Journey
    if (cleanPath === '/student/journey') return <StudentJourneyPage />;

    // 04. Student Unit
    if (cleanPath === '/student/unit' || matchRoute('/student/unit/:unitId', cleanPath).matches) {
      return <StudentUnitPage />;
    }

    // 05. Ocean Current Simulation
    if (
      cleanPath === '/student/simulation' ||
      matchRoute('/student/experience/:experienceId', cleanPath).matches
    ) {
      return <StudentSimulationPage />;
    }

    // 06. Student Progress & Memory
    if (cleanPath === '/student/progress') return <StudentProgressPage />;

    // Student Live or Explore
    if (matchRoute('/session/:sessionId/student', cleanPath).matches || cleanPath === '/student/live') {
      return <StudentLivePage />;
    }
    if (cleanPath === '/student/explore') return <StudentExplorePage />;

    // 02. Student Home (Redirect / Map to LearnerHomePage)
    if (cleanPath === '/student') return <LearnerHomePage />;

    // Teacher Surfaces
    // 08. Teacher Library
    if (cleanPath === '/teacher/library' || matchRoute('/teacher/unit/:unitId', cleanPath).matches) {
      return <TeacherResourceLibraryPage />;
    }

    // 09. Teacher Lesson Builder & Plan
    if (
      cleanPath === '/teacher/plan' ||
      cleanPath === '/teacher/builder' ||
      matchRoute('/teacher/lesson/:lessonId', cleanPath).matches
    ) {
      return <TeacherLessonBuilderPage />;
    }

    // 10. Teacher Live Console
    if (cleanPath === '/teacher/live' || matchRoute('/teacher/session/:sessionId', cleanPath).matches) {
      return <TeacherLiveConsolePage />;
    }

    // 12. Session Results
    if (cleanPath === '/teacher/results') return <TeacherSessionResultsPage />;

    // Teacher Class Details
    if (matchRoute('/teacher/class/:classId', cleanPath).matches) {
      return <TeacherClassPage />;
    }

    // 07. Teacher Dashboard
    if (cleanPath === '/teacher') return <TeacherDashboardPage />;

    // Legacy Landing Page (for showcase tests)
    if (cleanPath === '/legacy-landing') return <LandingPage />;

    // 01. BlueSTEAM v2 Living Ocean Landing (Default)
    return <LivingOceanLandingPage />;
  };

  return (
    <div className="w-full min-h-screen font-sans selection:bg-sky-500 selection:text-white">
      {/* 1. Core Application System (Pure, natural viewport scrolling, unconstrained) */}
      <div className="w-full min-h-screen">
        {renderRoute()}
      </div>

      {/* 2. Isolated Showcase Outer Layer (Only visible on /showcase routes) */}
      {cleanPath.startsWith('/showcase') && <ShowcaseToolbar />}
    </div>
  );
}
