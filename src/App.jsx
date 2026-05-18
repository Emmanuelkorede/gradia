import { Navigate, Routes, Route } from "react-router";
import SplashPage from "./pages/SplashPage";
import CBTHubPage from "./pages/CBTHubPage";
import CBTSessionPage from "./pages/CBTSessionPage";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import OnboardingPage from "./pages/OnboardingPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import ProfilePage from "./pages/ProfilePage";
import ResultPage from "./pages/ResultPage";
import NotificationPage from "./pages/NotificationPage";
import PremiumPage from "./pages/PremiumPage";
import AdminRoute from "./components/admin/adminRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminNews from "./pages/admin/AdminNews";
import AdminPremium from "./pages/admin/adminpremuim";
import AdminUpload from "./pages/admin/AdminUpload";
import PrivacyPolicy from "./pages/Privacypolicypage";

import PWAInstallBanner from "./components/PWAInstallBanner";

export default function App() {
  return (
    <>
      {/* Core Application Page Routes */}
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
        <Route path="/premium" element={<PremiumPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />

        {/* Admin Section Tiers */}
        <Route 
          path="/admin" 
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } 
        />

        <Route 
          path="/admin/news" 
          element={
            <AdminRoute>
              <AdminNews />
            </AdminRoute>
          } 
        />

        <Route 
          path="/admin/premium" 
          element={
            <AdminRoute>
              <AdminPremium />
            </AdminRoute>
          } 
        />

        <Route 
          path="/admin/upload" 
          element={
            <AdminRoute>
              <AdminUpload />
            </AdminRoute>
          } 
        />
      </Routes>

      <PWAInstallBanner />
    </>
  );
}