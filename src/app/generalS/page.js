'use client';

import { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import ToastMessage from '../components/ToastMessage';
import { getLastFortnigh, getDayAttendance, updateDayAttendance } from '@/services/fortNightService';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
export default function SaloneroPage() {
  const router = useRouter();
  const [days, setDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [attendance, setAttendance] = useState({ breakfast: false, dinner: false });
  const [userName, setUserName] = useState('');
  const [loadingDays, setLoadingDays] = useState(false); // Estado para cargar días
  const [loadingModal, setLoadingModal] = useState(false); // Estado para cargar listas del modal
  const [savingAttendance, setSavingAttendance] = useState(false); // Estado para guardar asistencia
  const [toast, setToast] = useState(null); // Estado para mensajes de Toast

  useEffect(() => {
    const cookieValue = Cookies.get('userName');
    if (!cookieValue) {
      router.push('/'); // Redirige al login si no hay cookie
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
  }, []);

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  const handleDayClick = async (day) => {
    setSelectedDay(day);
    setLoadingModal(true);

    try {
      const attendanceData = await getDayAttendance(day.id, userName);
      setAttendance({
        breakfast: attendanceData.breakfast || false,
        dinner: attendanceData.dinner || false,
      });
    } catch (err) {
      showToast('Error al obtener asistencia', 'error');
    } finally {
      setLoadingModal(false);
    }
  };

  const closeModal = () => {
    setSelectedDay(null);
    setAttendance({ breakfast: false, dinner: false });
  };

  const handleAttendanceChange = (e) => {
    const { name, checked } = e.target;
    setAttendance((prev) => ({ ...prev, [name]: checked }));
  };

  const saveAttendance = async () => {
    if (!selectedDay) return;

    setSavingAttendance(true); // Mostrar Spinner al guardar

    try {
      await updateDayAttendance(selectedDay.id, {
        userName,
        breakfast: attendance.breakfast,
        dinner: attendance.dinner,
      });
      showToast('Asistencia actualizada exitosamente', 'success');
      closeModal();
    } catch (err) {
      showToast('Error al guardar asistencia', 'error');
    } finally {
      setSavingAttendance(false); // Ocultar Spinner al finalizar
    }
  };

  return (
    <div
      className="container mx-auto p-4"
      style={{ color: 'var(--foreground)', backgroundColor: 'var(--background)' }}
    >
      <h1 className="text-3xl font-bold mb-6 text-center text-white">Bienvenido {userName}</h1>

      {loadingDays ? (
        <Spinner label="Cargando días..." />
      ) : days.length === 0 ? (
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
          {loadingModal ? (
            <Spinner label="Cargando asistencia..." />
          ) : (
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
              {savingAttendance ? (
                <Spinner label="Guardando asistencia..." />
              ) : (
                <button
                  onClick={saveAttendance}
                  className="px-4 py-2 bg-violet-500 text-white rounded-md hover:bg-violet-600 transition duration-300"
                >
                  Guardar
                </button>
              )}
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
