'use client';

import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import ToastMessage from '../components/ToastMessage';
import { createFortnigh,getAllFortnights,getDaysByFortnightId , checkFortnighExists, getLastFortnigh, getDayAttendanceList } from '@/services/fortNightService';
import { getHoursReport } from '@/services/shiftService';
export default function AdminPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [fortnights, setFortnights] = useState([]);
  const [selectedFortnight, setSelectedFortnight] = useState(null);
  const [days, setDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [breakfastList, setBreakfastList] = useState([]);
  const [dinnerList, setDinnerList] = useState([]);
  const [loadingFortnights, setLoadingFortnights] = useState(false);
  const [loadingDays, setLoadingDays] = useState(false);
  const [loadingLists, setLoadingLists] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [loadingReport, setLoadingReport] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchReport = async () => {
    try {
      setLoadingReport(true);
      const report = await getHoursReport(selectedFortnight);
      setReportData(report);
    } catch (error) {
      showToast('Error al obtener el reporte de horas', 'error');
    } finally {
      setLoadingReport(false);
    }
  };

  const handleReportClick = async () => {
    setShowReportModal(true);
    await fetchReport();
  };

  const closeReportModal = () => {
    setShowReportModal(false);
    setReportData([]);
  };

  const fetchAllFortnights = async () => {
    try {
      setLoadingFortnights(true);
      const fortnightsData = await getAllFortnights();
      setFortnights(fortnightsData);

      // Seleccionar la quincena más reciente por defecto
      if (fortnightsData.length > 0) {
        const mostRecentFortnight = fortnightsData[0];
        setSelectedFortnight(mostRecentFortnight.id);
        await fetchDaysByFortnight(mostRecentFortnight.id);
      }
    } catch (err) {
      showToast('Error al cargar las quincenas', 'error');
    } finally {
      setLoadingFortnights(false);
    }
  };

  const fetchDaysByFortnight = async (fortnightId) => {
    try {
      setLoadingDays(true);
      const daysData = await getDaysByFortnightId(fortnightId);
      setDays(daysData);
    } catch (err) {
      showToast('Error al cargar los días de la quincena', 'error');
    } finally {
      setLoadingDays(false);
    }
  };

 /* const fetchLastFortnigh = async () => {
    try {
      setLoadingDays(true);
      const fortnigh = await getLastFortnigh();
      setFortnighId(fortnigh.id);
      setDays(fortnigh.days || []);
    } catch (err) {
      showToast('Error al cargar los días de la última quincena', 'error');
    } finally {
      setLoadingDays(false);
    }
  };*/
  useEffect(() => {
    const cookieValue = Cookies.get('userName');
    if (!cookieValue) {
      router.push('/'); // Redirigir al login si no hay cookie
    } else {
      setUserName(cookieValue);
    }

    fetchAllFortnights();
  }, [router]);

  const handleFortnightChange = async (e) => {
    const selectedId = e.target.value;
    setSelectedFortnight(selectedId);
    await fetchDaysByFortnight(selectedId);
  };

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
      fetchAllFortnights();
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
      const breakfast = attendanceData.filter((shift) => shift.turn === 'BREAKFAST');
      const dinner = attendanceData.filter((shift) => shift.turn === 'DINNER');

      setBreakfastList(breakfast);
      setDinnerList(dinner);
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

       {/* Selector de Quincenas */}
       <div className="mb-6">
        <label htmlFor="fortnightSelector" className="block text-white font-bold mb-2">
          Seleccionar Quincena
        </label>
        {loadingFortnights ? (
          <Spinner label="Cargando quincenas..." />
        ) : (
          <select
            id="fortnightSelector"
            value={selectedFortnight || ''}
            onChange={handleFortnightChange}
            className="w-full p-2 bg-gray-800 text-white rounded-md"
          >
            {fortnights.map((fortnight) => (
              <option key={fortnight.id} value={fortnight.id}>
                {fortnight.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <button
        onClick={iniciarNuevaQuincena}
        className="w-full bg-violet-500 text-white py-2 rounded-md hover:bg-violet-600 transition duration-300"
      >
        Iniciar Nueva Quincena
      </button>
      <button
        onClick={handleReportClick}
        className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-300 mt-4"
      >
        Reporte de Horas
      </button>

      {/* Modal de Reporte */}
      {showReportModal && (
        <Modal onClose={closeReportModal}>
          {loadingReport ? (
            <Spinner label="Cargando reporte de horas..." />
          ) : (
            <div className="p-6 bg-black rounded-lg shadow-lg w-full max-w-4xl overflow-auto max-h-[80vh]">
              <h2 className="text-2xl font-bold mb-4 text-white">Reporte de Horas</h2>
              {reportData.length > 0 ? (
                <ul className="text-gray-300 list-none space-y-2">
                  {reportData.map((item, index) => (
                    <li key={index}>
                      {item.user}: {item.totalHours.toFixed(2)} horas
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No hay datos disponibles para el reporte.</p>
              )}
              <button
                onClick={closeReportModal}
                className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition duration-300 mt-4"
              >
                Cerrar
              </button>
            </div>
          )}
        </Modal>
      )}

      <div className="mt-10">
        <h2 className="text-2xl font-bold">Días de la quincena</h2>
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
                  <ul className="text-gray-300 list-none space-y-2">
                    {breakfastList.map((item, index) => (
                      <li key={index}>
                        {item.user} entrada: {
                          `${new Date(item.startTime).getUTCHours().toString().padStart(2, '0')}:${new Date(item.startTime).getUTCMinutes().toString().padStart(2, '0')}`
                        }
                        {" "}salida: {
                          `${new Date(item.endTime).getUTCHours().toString().padStart(2, '0')}:${new Date(item.endTime).getUTCMinutes().toString().padStart(2, '0')}`
                        }
                        {" "}Total de horas: {item.totalHours}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No hay saloneros registrados aún.</p>
                )}
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white">Cena</h3>
                {dinnerList.length > 0 ? (
                  <ul className="text-gray-300 list-none space-y-2">
                    {dinnerList.map((item, index) => (
                      <li key={index}>
                        {item.user} entrada: {
                          `${new Date(item.startTime).getUTCHours().toString().padStart(2, '0')}:${new Date(item.startTime).getUTCMinutes().toString().padStart(2, '0')}`
                        }{" "}
                        salida: {
                          `${new Date(item.endTime).getUTCHours().toString().padStart(2, '0')}:${new Date(item.endTime).getUTCMinutes().toString().padStart(2, '0')}`
                        }

                        {" "}Total de horas: {item.totalHours}
                      </li>
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
