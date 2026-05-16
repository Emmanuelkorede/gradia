import {  Navigate , Routes , Route } from "react-router";
import SplashPage from "./pages/SplashPage";
import CBTHubPage from "./pages/CBTHubPage";
import CBTSessionPage from "./pages/CBTSessionPage";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage"
import OnboardingPage from "./pages/OnboardingPage"
import LeaderboardPage from "./pages/LeaderboardPage"
import ProfilePage from "./pages/ProfilePage"
import ResultPage from "./pages/ResultPage"
import NotificationPage from "./pages/NotificationPage";

export default function App() {
  return (

          <Routes>
            
            <Route path="/" element={<SplashPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/cbt" element={<CBTHubPage />} />
            <Route path="/cbt/session" element={<CBTSessionPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/cbt/result" element={<ResultPage />} />
            <Route path="/notifications" element={<NotificationPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
          </Routes>

  );
}