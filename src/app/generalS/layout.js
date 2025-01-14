'use client';

import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import React from 'react';

export default function SaloneroLayout({ children }) {
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove('userName'); // Eliminar la cookie del usuario
    router.push('/'); // Redirigir al login
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="bg-black py-4 px-6 flex justify-end shadow-sm shadow-violet-500">
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-violet-500 text-white rounded-md hover:bg-violet-600 transition duration-300"
        >
          Cerrar Sesión
        </button>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  );
}
