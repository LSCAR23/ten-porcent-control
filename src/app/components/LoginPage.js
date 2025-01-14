'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/services/loginService';

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const userData = await loginUser({ name, password });
      setError('');
      // Redirigir según el tipo de usuario
      if (userData.userType === 'SALONERO') {
        router.push(`/generalS?name=${encodeURIComponent(userData.name)}`);
      } else if (userData.userType === 'ADMIN') {
        router.push(`/general`);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-black rounded-lg border-violet-500 shadow-md shadow-violet-500 text-white">
      <h1 className="text-3xl font-bold text-center mb-6">Iniciar Sesión</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre"
          required
          className="p-2 w-full bg-gray-700 border border-gray-600 rounded-md text-white"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          required
          className="p-2 w-full bg-gray-700 border border-gray-600 rounded-md text-white"
        />
        <button
          type="submit"
          className="w-full bg-violet-500 text-white py-2 rounded-md hover:bg-violet-600 transition duration-300"
        >
          Iniciar Sesión
        </button>
      </form>
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
}
