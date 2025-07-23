import { useCurrentUser } from "./hooks/useCurrentUser"
import { Suspense } from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { Toaster } from "@/components/ui/sonner"
import HomePage from '@/pages/home'
import SignInPage from '@/pages/sign-in';
import SignUpPage from '@/pages/sign-up'

function Loading() {
  return <div>loading...</div>
}

function ProfilePage() {
  return <div>profile</div>
}

function AuthRoute() {
  const { isUserLoggedIn } = useCurrentUser();
  const location = useLocation();

  return isUserLoggedIn ? <Outlet /> : <Navigate to="/sign-in" state={{ from: location }} replace />
}

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />

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
