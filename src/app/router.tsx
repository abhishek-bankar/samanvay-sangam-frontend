import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "@/app/AppShell";
import { ProtectedRoute } from "@/app/ProtectedRoute";
import { ProjectSelector } from "@/app/ProjectSelector";
import { LoginPage } from "@/features/auth/components/LoginPage";
import { CreateProjectPage } from "@/features/projects/components/CreateProjectPage";
import { ProjectListPage } from "@/features/projects/components/ProjectListPage";
import { CreateBatchPage } from "@/features/batches/components/CreateBatchPage";
import { BatchListPage } from "@/features/batches/components/BatchListPage";
import { BatchDetailPage } from "@/features/batches/components/BatchDetailPage";

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
          <Route path="projects" element={<ProjectListPage />} />
          <Route path="projects/new" element={<CreateProjectPage />} />
          <Route path="dashboard" element={<PlaceholderPage title="Dashboard" />} />
          <Route path="review" element={<PlaceholderPage title="Review Queue" />} />
          <Route path="rejected-pool" element={<PlaceholderPage title="Rejected Pool" />} />
          <Route path="send-to-client" element={<PlaceholderPage title="Send to Client" />} />
          <Route path="analytics" element={<PlaceholderPage title="Analytics" />} />
          <Route path="batches" element={<BatchListPage />} />
          <Route path="batches/new" element={<CreateBatchPage />} />
          <Route path="batches/:batchId" element={<BatchDetailPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
