import { redirect } from 'next/navigation';

export default function Home() {
  // Redirigir a dashboard (el middleware manejará la autenticación)
  redirect('/dashboard');
}
