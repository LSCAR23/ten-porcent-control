'use client';

import { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import { getLastFortnigh, getDayAttendance, updateDayAttendance } from '@/services/fortNightService';
import Cookies from 'js-cookie';

export default function SaloneroPage() {
  const [days, setDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [attendance, setAttendance] = useState({ breakfast: false, dinner: false });
  const [userName, setUserName] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const cookieValue = Cookies.get('userName');
    if (!cookieValue) {
      window.location.href = '/'; // Redirige al login si no hay cookie
    } else {
      setUserName(cookieValue);
    }

    const fetchLastFortnigh = async () => {
      try {
        const fortnigh = await getLastFortnigh();
        setDays(fortnigh.days || []);
      } catch (err) {
        console.error('Error al cargar los días de la última quincena:', err);
      }
    };

    fetchLastFortnigh();
  }, []);

  const handleDayClick = async (day) => {
    setSelectedDay(day);

    try {
      // Obtener la asistencia actual del usuario para este día
      const attendanceData = await getDayAttendance(day.id, userName);
      setAttendance({
        breakfast: attendanceData.breakfast || false,
        dinner: attendanceData.dinner || false,
      });
    } catch (err) {
      console.error('Error al obtener asistencia:', err);
      setAttendance({ breakfast: false, dinner: false });
    }
  };

  const closeModal = () => {
    setSelectedDay(null);
    setSuccess('');
    setError('');
  };

  const handleAttendanceChange = (e) => {
    const { name, checked } = e.target;
    setAttendance((prev) => ({ ...prev, [name]: checked }));
  };

  const saveAttendance = async () => {
    if (!selectedDay) return;

    try {
      await updateDayAttendance(selectedDay.id, {
        userName,
        breakfast: attendance.breakfast, // Valor booleano
        dinner: attendance.dinner, // Valor booleano
      });

      setSuccess('Asistencia actualizada exitosamente.');
      closeModal();
    } catch (err) {
      console.error('Error al guardar asistencia:', err);
      setError('Hubo un error al guardar la asistencia.');
    }
  };

  return (
    <div
      className="container mx-auto p-4"
      style={{ color: 'var(--foreground)', backgroundColor: 'var(--background)' }}
    >
      <h1 className="text-3xl font-bold mb-6 text-center text-white">Bienvenido {userName}</h1>

      {days.length === 0 ? (
        <p className="text-center text-white">No hay días disponibles.</p>
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

      {selectedDay && (
        <Modal onClose={closeModal}>
          <div className="p-6 bg-black rounded-lg shadow-lg w-full max-w-4xl overflow-auto max-h-[80vh]">
            <h2 className="text-2xl font-bold mb-2 text-white">
              Día: {new Date(selectedDay.date).toLocaleDateString()}
            </h2>
            <form>
              <div className="mb-4">
                <label className="flex items-center text-white">
                  <input
                    type="checkbox"
                    name="breakfast"
                    checked={attendance.breakfast}
                    onChange={handleAttendanceChange}
                    className="mr-2"
                  />
                  Desayuno
                </label>
              </div>
              <div className="mb-4">
                <label className="flex items-center text-white">
                  <input
                    type="checkbox"
                    name="dinner"
                    checked={attendance.dinner}
                    onChange={handleAttendanceChange}
                    className="mr-2"
                  />
                  Cena
                </label>
              </div>
            </form>
            <button
              onClick={saveAttendance}
              className="px-4 py-2 bg-violet-500 text-white rounded-md hover:bg-violet-600 transition duration-300"
            >
              Guardar
            </button>
            {success && <p className="text-green-500 mt-4">{success}</p>}
            {error && <p className="text-red-500 mt-4">{error}</p>}
            <button
              onClick={closeModal}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition duration-300 mt-4"
            >
              Cerrar
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
