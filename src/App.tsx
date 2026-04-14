import { config } from "@/lib/config";

function App() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
      <h1 className="text-4xl font-bold tracking-tight">Hello SANGAM</h1>
      <p className="mt-4 text-muted-foreground">
        Samanvay SANGAM Desktop — Tauri + React + TypeScript
      </p>
      <div className="mt-8 rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <p className="text-sm">
          <span className="font-medium">Drive Root:</span>{" "}
          {config.driveRoot || "Not configured"}
        </p>
        <p className="mt-2 text-sm">
          <span className="font-medium">Frappe URL:</span>{" "}
          {config.frappeUrl || "Not configured"}
        </p>
      </div>
    </main>
  );
}

export default App;
