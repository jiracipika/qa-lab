import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { ModulePage, ModulesList } from "./pages/Modules";
import { LessonPage } from "./pages/Lesson";
import { QuizPage, QuizzesHub } from "./pages/Quiz";
import { ChallengePage, ChallengesList } from "./pages/Challenges";
import { ReviewPage } from "./pages/Review";
import { GamesPage } from "./pages/Games";
import { SandboxPage } from "./pages/Sandbox";
import { GlossaryPage } from "./pages/Glossary";
import { ToolsPage } from "./pages/Tools";
import { RoadmapPage } from "./pages/Roadmap";
import { SettingsPage } from "./pages/Settings";
import { EmptyState } from "./components/ui";
import { Link } from "react-router-dom";

export default function App() {
  return (
    <Layout>
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
    </Layout>
  );
}
