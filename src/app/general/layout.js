'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import React from 'react';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname(); // Obtener la ruta actual

  const handleLogout = () => {
    Cookies.remove('userName'); // Eliminar la cookie del usuario
    router.push('/'); // Redirigir al login
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="bg-black py-4 px-6 flex justify-end shadow-sm shadow-violet-500">
        <div className="flex space-x-6 items-center">
          <Link
            href="/general/users"
            className={`text-xl font-bold transition duration-300 ${
              pathname === '/general/users' ? 'text-violet-500' : 'hover:text-violet-400'
            }`}
          >
            Usuarios
          </Link>
          <Link
            href="/general"
            className={`text-xl font-bold transition duration-300 ${
              pathname === '/general' ? 'text-violet-500' : 'hover:text-violet-400'
            }`}
          >
            General
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-violet-500 text-white rounded-md hover:bg-violet-600 transition duration-300"
          >
            Cerrar Sesión
          </button>
        </div>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  );
}
