import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TriviaTime - Juega y Aprende',
  description: 'Plataforma de trivia gamificada',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}

// Página de administración para admins disponible en /admin/dashboard
// Edita o elimina este comentario si cambias la estructura del frontend

