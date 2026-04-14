import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "@/app/AppShell";
import { ProtectedRoute } from "@/app/ProtectedRoute";
import { ProjectSelector } from "@/app/ProjectSelector";
import { LoginPage } from "@/features/auth/components/LoginPage";

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="py-8">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-2 text-muted-foreground">Coming soon in a future story.</p>
    </div>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<ProjectSelector />} />
          <Route path="dashboard" element={<PlaceholderPage title="Dashboard" />} />
          <Route path="my-work" element={<PlaceholderPage title="My Work" />} />
          <Route path="supports" element={<PlaceholderPage title="Support Register" />} />
          <Route path="assignment" element={<PlaceholderPage title="Assignment" />} />
          <Route path="review" element={<PlaceholderPage title="Review Queue" />} />
          <Route path="rejected-pool" element={<PlaceholderPage title="Rejected Pool" />} />
          <Route path="send-to-client" element={<PlaceholderPage title="Send to Client" />} />
          <Route path="analytics" element={<PlaceholderPage title="Analytics" />} />
          <Route path="batches" element={<PlaceholderPage title="Batch Management" />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
