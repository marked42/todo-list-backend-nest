import { useCurrentUser } from "./hooks/useCurrentUser"
import { Suspense } from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { Toaster } from "@/components/ui/sonner"
import HomePage from '@/pages/home'
import LoginPage from '@/pages/login';
import RegisterPage from '@/pages/register'

function Loading() {
  return <div>loading...</div>
}

function ProfilePage() {
  return <div>profile</div>
}

function AuthRoute() {
  const { isUserLoggedIn } = useCurrentUser();
  const location = useLocation();

  return isUserLoggedIn ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />
}

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<AuthRoute />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

      </Routes>

      <div className="flex min-h-svh flex-col items-center justify-center"> </div>
      <Toaster />
    </Suspense>
  )
}

export default App
