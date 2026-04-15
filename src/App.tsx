import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/features/auth/auth-context";
import { ProjectProvider } from "@/features/projects/project-context";
import { AppRouter } from "@/app/router";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ProjectProvider>
          <AppRouter />
          <Toaster richColors />
        </ProjectProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
