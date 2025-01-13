'use client';

import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';
import { createFortnigh, checkFortnighExists } from '@/services/fortNightService';
export default function AdminPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const cookieValue = Cookies.get('userName');

    if (!cookieValue) {
      // Si no hay cookie, redirige al login
      router.push('/');
    } else {
      // Establece el nombre del usuario desde la cookie
      setUserName(cookieValue);
    }
  }, [router]);

  const iniciarNuevaQuincena = async () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth(); // Mes actual (0-indexed)
    const day = today.getDate();

    // Nombres de los meses
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    let startDate, endDate;

    if (day <= 15) {
      // Primera quincena
      startDate = new Date(year, month, 1);
      endDate = new Date(year, month, 15);
    } else {
      // Segunda quincena
      startDate = new Date(year, month, 16);
      endDate = new Date(year, month + 1, 0); // Último día del mes
    }

    const quincenaName = `Quincena ${day <= 15 ? '1ra' : '2da'} de ${monthNames[month]} ${year}`;

    try {
      // Verificar si la quincena ya existe
      const exists = await checkFortnighExists(quincenaName);
      if (exists) {
        setError('La quincena ya ha sido iniciada');
        setSuccess('');
        return;
      }

      // Crear la quincena con los días correspondientes
      await createFortnigh({ name: quincenaName, startDate, endDate });
      setSuccess('Nueva iniciada exitosamente');
      setError('');
    } catch (err) {
      setError(err.message);
      setSuccess('');
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Bienvenido, {userName}</h1>
      <button
        onClick={iniciarNuevaQuincena}
        style={{
          padding: '10px 15px',
          marginTop: '20px',
          backgroundColor: '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Iniciar Nueva Quincena
      </button>
      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      {success && <p style={{ color: 'green', marginTop: '10px' }}>{success}</p>}
    </div>
  );
}