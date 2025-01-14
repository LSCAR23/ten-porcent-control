'use client';

import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import ToastMessage from '../components/ToastMessage';
import { createFortnigh, checkFortnighExists, getLastFortnigh, getDayAttendanceList } from '@/services/fortNightService';

export default function AdminPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [days, setDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [breakfastList, setBreakfastList] = useState([]);
  const [dinnerList, setDinnerList] = useState([]);
  const [loadingDays, setLoadingDays] = useState(false);
  const [loadingLists, setLoadingLists] = useState(false);

  const [toast, setToast] = useState(null); // Estado para mensajes de Toast

  useEffect(() => {
    const cookieValue = Cookies.get('userName');

    if (!cookieValue) {
      router.push('/'); // Redirigir al login si no hay cookie
    } else {
      setUserName(cookieValue);
    }

    const fetchLastFortnigh = async () => {
      try {
        setLoadingDays(true);
        const fortnigh = await getLastFortnigh();
        setDays(fortnigh.days || []);
      } catch (err) {
        showToast('Error al cargar los días de la última quincena', 'error');
      } finally {
        setLoadingDays(false);
      }
    };

    fetchLastFortnigh();
  }, [router]);

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  const iniciarNuevaQuincena = async () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();

    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ];

    let startDate, endDate;

    if (day <= 15) {
      startDate = new Date(year, month, 1);
      endDate = new Date(year, month, 15);
    } else {
      startDate = new Date(year, month, 16);
      endDate = new Date(year, month + 1, 0);
    }

    const quincenaName = `Quincena ${day <= 15 ? '1ra' : '2da'} de ${monthNames[month]} ${year}`;

    try {
      const exists = await checkFortnighExists(quincenaName);
      if (exists) {
        showToast('La quincena ya ha sido iniciada', 'error');
        return;
      }

      await createFortnigh({ name: quincenaName, startDate, endDate });
      showToast('Nueva quincena iniciada exitosamente', 'success');
    } catch (err) {
      showToast('Error al iniciar la quincena', 'error');
    }
  };

  const handleDayClick = async (day) => {
    setSelectedDay(day);
    setLoadingLists(true);

    try {
      const attendanceData = await getDayAttendanceList(day.id);
      setBreakfastList(attendanceData.breakfast || []);
      setDinnerList(attendanceData.dinner || []);
    } catch (err) {
      showToast('Error al obtener las listas de asistencia', 'error');
    } finally {
      setLoadingLists(false);
    }
  };

  const closeModal = () => {
    setSelectedDay(null);
    setBreakfastList([]);
    setDinnerList([]);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-black rounded-lg border-violet-500 shadow-md shadow-violet-500 text-white text-center mt-12">
      <h1 className="text-3xl font-bold mb-6">Bienvenido {userName}</h1>
      <button
        onClick={iniciarNuevaQuincena}
        className="w-full bg-violet-500 text-white py-2 rounded-md hover:bg-violet-600 transition duration-300"
      >
        Iniciar Nueva Quincena
      </button>

      <div className="mt-10">
        <h2 className="text-2xl font-bold">Días de la última quincena</h2>
        {loadingDays ? (
          <Spinner label="Cargando días..." />
        ) : days.length === 0 ? (
          <p className="text-gray-500">No hay días disponibles.</p>
        ) : (
          <ul className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {days.map((day) => (
              <li
                key={day.id}
                className="bg-black text-white p-4 rounded-lg shadow-lg shadow-violet-500 hover:bg-gray-700 transition duration-300 cursor-pointer"
                onClick={() => handleDayClick(day)}
              >
                <h2 className="text-xl font-bold text-violet-500 hover:underline">
                  {new Date(day.date).toLocaleDateString()}
                </h2>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedDay && (
        <Modal onClose={closeModal}>
          {loadingLists ? (
            <Spinner label="Cargando listas de asistencia..." />
          ) : (
            <div className="p-6 bg-black rounded-lg shadow-lg w-full max-w-4xl overflow-auto max-h-[80vh]">
              <h2 className="text-2xl font-bold mb-2 text-white">
                Día: {new Date(selectedDay.date).toLocaleDateString()}
              </h2>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white">Desayuno</h3>
                {breakfastList.length > 0 ? (
                  <ul className="text-gray-300 list-disc list-inside">
                    {breakfastList.map((user, index) => (
                      <li key={index}>{user.name}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No hay saloneros registrados aún.</p>
                )}
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white">Cena</h3>
                {dinnerList.length > 0 ? (
                  <ul className="text-gray-300 list-disc list-inside">
                    {dinnerList.map((user, index) => (
                      <li key={index}>{user.name}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No hay saloneros registrados aún.</p>
                )}
              </div>
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition duration-300 mt-4"
              >
                Cerrar
              </button>
            </div>
          )}
        </Modal>

      )}

      {toast && (
        <ToastMessage
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
