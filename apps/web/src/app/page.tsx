import { HealthStatus } from "@/components/health-status";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center gap-8 py-16 px-8 bg-white dark:bg-black">
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-black dark:text-zinc-50">
            Excepio
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Sistema de Registro de Excepciones
          </p>
        </div>

        <div className="w-full max-w-md">
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">
            Estado de la API
          </h2>
          <HealthStatus />
        </div>
      </main>
    </div>
  );
}
