import { HealthStatus } from "@/components/health-status";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-background">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center gap-8 py-16 px-8">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            Excepio
          </h1>
          <p className="text-lg text-muted-foreground">
            Sistema de Registro de Excepciones
          </p>
        </div>

        <div className="w-full max-w-md">
          <h2 className="text-sm font-medium text-muted-foreground mb-2">
            Estado de la API
          </h2>
          <HealthStatus />
        </div>
      </main>
    </div>
  );
}
