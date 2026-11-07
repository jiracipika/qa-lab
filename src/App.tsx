import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { EmptyState } from "./components/ui";
import { Link } from "react-router-dom";

// Route-level code splitting: every page - including the dashboard - loads as its
// own chunk, so the entry bundle carries only the shell (layout, theme, onboarding).
const Dashboard = lazy(() => import("./pages/Dashboard").then((m) => ({ default: m.Dashboard })));
const ModulesList = lazy(() => import("./pages/Modules").then((m) => ({ default: m.ModulesList })));
const ModulePage = lazy(() => import("./pages/Modules").then((m) => ({ default: m.ModulePage })));
const LessonPage = lazy(() => import("./pages/Lesson").then((m) => ({ default: m.LessonPage })));
const QuizPage = lazy(() => import("./pages/Quiz").then((m) => ({ default: m.QuizPage })));
const QuizzesHub = lazy(() => import("./pages/Quiz").then((m) => ({ default: m.QuizzesHub })));
const ChallengesList = lazy(() => import("./pages/Challenges").then((m) => ({ default: m.ChallengesList })));
const ChallengePage = lazy(() => import("./pages/Challenges").then((m) => ({ default: m.ChallengePage })));
const ReviewPage = lazy(() => import("./pages/Review").then((m) => ({ default: m.ReviewPage })));
const GamesPage = lazy(() => import("./pages/Games").then((m) => ({ default: m.GamesPage })));
const SandboxPage = lazy(() => import("./pages/Sandbox").then((m) => ({ default: m.SandboxPage })));
const GlossaryPage = lazy(() => import("./pages/Glossary").then((m) => ({ default: m.GlossaryPage })));
const ToolsPage = lazy(() => import("./pages/Tools").then((m) => ({ default: m.ToolsPage })));
const RoadmapPage = lazy(() => import("./pages/Roadmap").then((m) => ({ default: m.RoadmapPage })));
const SettingsPage = lazy(() => import("./pages/Settings").then((m) => ({ default: m.SettingsPage })));

function RouteFallback() {
  return (
    <div className="route-fallback" role="status" aria-live="polite">
      <span className="spinner" aria-hidden /> Loading...
    </div>
  );
}

export default function App() {
  return (
    <Layout>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/modules" element={<ModulesList />} />
          <Route path="/modules/:moduleId" element={<ModulePage />} />
          <Route path="/modules/:moduleId/lessons/:lessonId" element={<LessonPage />} />
          <Route path="/modules/:moduleId/quiz" element={<QuizPage />} />
          <Route path="/quizzes" element={<QuizzesHub />} />
          <Route path="/challenges" element={<ChallengesList />} />
          <Route path="/challenges/:challengeId" element={<ChallengePage />} />
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/games" element={<GamesPage />} />
          <Route path="/games/:gameId" element={<GamesPage />} />
          <Route path="/sandbox" element={<SandboxPage />} />
          <Route path="/glossary" element={<GlossaryPage />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route
            path="*"
            element={
              <EmptyState title="Page not found">
                Head back to the <Link to="/">dashboard</Link>.
              </EmptyState>
            }
          />
        </Routes>
      </Suspense>
    </Layout>
  );
}
