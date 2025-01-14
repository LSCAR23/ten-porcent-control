'use client';

import { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import ToastMessage from '../components/ToastMessage';
import { getLastFortnigh, getDayAttendance, updateDayAttendance } from '@/services/fortNightService';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { getTotalHoursWorked } from '@/services/shiftService';
export default function SaloneroPage() {
  const router = useRouter();
  const [days, setDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [attendance, setAttendance] = useState({
    breakfast: false,
    breakfastStart: '',
    breakfastEnd: '',
    dinner: false,
    dinnerStart: '',
    dinnerEnd: '',
  });
  const [hoursWorked, setHoursWorked] = useState({ breakfast: 0, dinner: 0 });
  const [totalHoursWorked, setTotalHoursWorked] = useState(0);
  const [userName, setUserName] = useState('');
  const [loadingDays, setLoadingDays] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [toast, setToast] = useState(null);
  const [fortnighId, setFortnighId] = useState(null);

  useEffect(() => {
    const cookieValue = Cookies.get('userName');
    if (!cookieValue) {
      router.push('/');
    } else {
      setUserName(cookieValue);
    }

    const fetchLastFortnigh = async () => {
      try {
        setLoadingDays(true);
        const fortnigh = await getLastFortnigh();
        setDays(fortnigh.days || []);
        setFortnighId(fortnigh.id); // Guardar el ID de la quincena
        await calculateTotalHoursWorked(Cookies.get('userName'),fortnigh.id);
      } catch (err) {
        showToast('Error al cargar los días de la última quincena', 'error');
      } finally {
        setLoadingDays(false);
      }
    };

    fetchLastFortnigh();
  }, []);

  const calculateTotalHoursWorked = async (userN, fortnightId) => {
    try {
      const totalHours = await getTotalHoursWorked(userN, fortnightId);
      setTotalHoursWorked(totalHours);
    } catch (error) {
      showToast('Error al calcular las horas totales trabajadas', 'error');
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
  };

 const handleDayClick = async (day) => {
  setSelectedDay(day);
  setLoadingModal(true);

  try {
    const attendanceData = await getDayAttendance(day.id, userName); // Llama al servicio

    setAttendance({
      breakfast: attendanceData.breakfast || false,
      breakfastStart: attendanceData.breakfastStart
        ? new Date(attendanceData.breakfastStart).toLocaleTimeString('en-US', { hour12: false }).slice(0, 5) // Convertir a formato HH:mm
        : '',
      breakfastEnd: attendanceData.breakfastEnd
        ? new Date(attendanceData.breakfastEnd).toLocaleTimeString('en-US', { hour12: false }).slice(0, 5)
        : '',
      dinner: attendanceData.dinner || false,
      dinnerStart: attendanceData.dinnerStart
        ? new Date(attendanceData.dinnerStart).toLocaleTimeString('en-US', { hour12: false }).slice(0, 5)
        : '',
      dinnerEnd: attendanceData.dinnerEnd
        ? new Date(attendanceData.dinnerEnd).toLocaleTimeString('en-US', { hour12: false }).slice(0, 5)
        : '',
    });

    // Calcular horas trabajadas directamente con los datos obtenidos
    setHoursWorked({
      breakfast: attendanceData.breakfastHours || 0,
      dinner: attendanceData.dinnerHours || 0,
    });
  } catch (err) {
    showToast('Error al obtener asistencia', 'error');
  } finally {
    setLoadingModal(false);
  }
};

  

  const closeModal = () => {
    setSelectedDay(null);
    setAttendance({
      breakfast: false,
      breakfastStart: '',
      breakfastEnd: '',
      dinner: false,
      dinnerStart: '',
      dinnerEnd: '',
    });
    setHoursWorked({ breakfast: 0, dinner: 0 });
  };

  const handleAttendanceChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAttendance((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const calculateHours = (start, end) => {
    const startTime = new Date(`1970-01-01T${start}:00`);
    const endTime = new Date(`1970-01-01T${end}:00`);
    if (endTime > startTime) {
      const diff = (endTime - startTime) / 3600000; // Convert milliseconds to hours
      return diff.toFixed(2);
    }
    return 0;
  };

  useEffect(() => {
    const breakfastHours = attendance.breakfastStart && attendance.breakfastEnd
      ? calculateHours(attendance.breakfastStart, attendance.breakfastEnd)
      : 0;

    const dinnerHours = attendance.dinnerStart && attendance.dinnerEnd
      ? calculateHours(attendance.dinnerStart, attendance.dinnerEnd)
      : 0;

    setHoursWorked({ breakfast: breakfastHours, dinner: dinnerHours });
  }, [attendance.breakfastStart, attendance.breakfastEnd, attendance.dinnerStart, attendance.dinnerEnd]);

  const saveAttendance = async () => {
    if (!selectedDay) return;
  
    // Validar los valores de las horas
    if (
      (attendance.breakfast && (!attendance.breakfastStart || !attendance.breakfastEnd)) ||
      (attendance.dinner && (!attendance.dinnerStart || !attendance.dinnerEnd))
    ) {
      showToast('Por favor, completa todos los campos de horas antes de guardar.', 'error');
      return;
    }
  
    setSavingAttendance(true);
  
    try {
      await updateDayAttendance(selectedDay.id, {
        userName,
        ...attendance, // Envía los datos directamente desde el estado
        breakfastHours: hoursWorked.breakfast, // Horas calculadas
        dinnerHours: hoursWorked.dinner, // Horas calculadas
      });
      await calculateTotalHoursWorked(userName, fortnighId);
      showToast('Asistencia actualizada exitosamente', 'success');
      closeModal();
    } catch (err) {
      showToast('Error al guardar asistencia', 'error');
    } finally {
      setSavingAttendance(false);
    }
  };
  
  

  return (
    <div
      className="container mx-auto p-4"
      style={{ color: 'var(--foreground)', backgroundColor: 'var(--background)' }}
    >
      <h1 className="text-3xl font-bold mb-6 text-center text-white">Bienvenido {userName}</h1>
      <h2 className="text-xl text-center text-white mb-6">
        Horas totales trabajadas de la quincena: <span className="text-violet-400">{totalHoursWorked.toFixed(2)}</span>
      </h2>

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
              <h2 className="text-2xl font-bold mb-4 text-white">
                Día: {new Date(selectedDay.date).toLocaleDateString()}
              </h2>
              <form>
                {/* Desayuno */}
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
                  {attendance.breakfast && (
                    <div className="mt-4 p-4 bg-gray-800 rounded-lg shadow-md">
                      <div className="mb-4">
                        <label className="text-white block mb-1">Hora de entrada</label>
                        <input
                          type="time"
                          name="breakfastStart"
                          value={attendance.breakfastStart}
                          onChange={handleAttendanceChange}
                          className="w-full px-3 py-2 bg-black text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                          required={true}
                        />
                      </div>
                      <div className="mb-4">
                        <label className="text-white block mb-1">Hora de salida</label>
                        <input
                          type="time"
                          name="breakfastEnd"
                          value={attendance.breakfastEnd}
                          onChange={handleAttendanceChange}
                          className="w-full px-3 py-2 bg-black text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                          required={true}
                        />
                      </div>
                      <p className="text-white font-bold">
                        Total horas: <span className="text-violet-400">{hoursWorked.breakfast}</span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Cena */}
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
                  {attendance.dinner && (
                    <div className="mt-4 p-4 bg-gray-800 rounded-lg shadow-md">
                      <div className="mb-4">
                        <label className="text-white block mb-1">Hora de entrada</label>
                        <input
                          type="time"
                          name="dinnerStart"
                          value={attendance.dinnerStart}
                          onChange={handleAttendanceChange}
                          className="w-full px-3 py-2 bg-black text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      </div>
                      <div className="mb-4">
                        <label className="text-white block mb-1">Hora de salida</label>
                        <input
                          type="time"
                          name="dinnerEnd"
                          value={attendance.dinnerEnd}
                          onChange={handleAttendanceChange}
                          className="w-full px-3 py-2 bg-black text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      </div>
                      <p className="text-white font-bold">
                        Total horas: <span className="text-violet-400">{hoursWorked.dinner}</span>
                      </p>
                    </div>
                  )}
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
