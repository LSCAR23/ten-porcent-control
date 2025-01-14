import api from './api';

// Crear una quincena
export const createFortnigh = async ({ name, startDate, endDate }) => {
  try {
    const response = await api.post('/fortnighs', {
      name,
      startDate,
      endDate,
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.error || 'Error al crear la quincena');
    }
    throw new Error('Error de red o servidor');
  }
};

// Verificar si una quincena existe
export const checkFortnighExists = async (name) => {
  try {
    const response = await api.get(`/fortnighs?name=${encodeURIComponent(name)}`);
    return response.data.exists;
  } catch (error) {
    throw new Error('Error al verificar la quincena');
  }
};

// Obtener la última quincena
export const getLastFortnigh = async () => {
  const response = await api.get('/fortnighs/last');
  return response.data;
};

// Actualizar la asistencia de un día
export const updateDayAttendance = async (dayId, attendance) => {
  try {
    const payload = {
      userName: attendance.userName,
      breakfast: attendance.breakfast,
      dinner: attendance.dinner,
      breakfastStart: attendance.breakfastStart,
      breakfastEnd: attendance.breakfastEnd,
      breakfastHours: attendance.breakfastHours,
      dinnerStart: attendance.dinnerStart,
      dinnerEnd: attendance.dinnerEnd,
      dinnerHours: attendance.dinnerHours,
    };
    await api.patch(`/days/${dayId}/attendance`, payload);
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.error || 'Error al actualizar la asistencia');
    }
    throw new Error('Error de red o servidor');
  }
};

// Obtener asistencia de un usuario para un día específico
export const getDayAttendance = async (dayId, userName) => {
  try {
    const response = await api.get(`/days/${dayId}/attendance?user=${encodeURIComponent(userName)}`);
    return {
      breakfast: response.data.breakfast,
      breakfastStart: response.data.breakfastStart,
      breakfastEnd: response.data.breakfastEnd,
      breakfastHours: response.data.breakfastHours,
      dinner: response.data.dinner,
      dinnerStart: response.data.dinnerStart,
      dinnerEnd: response.data.dinnerEnd,
      dinnerHours: response.data.dinnerHours,
    };
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.error || 'Error al obtener la asistencia');
    }
    throw new Error('Error de red o servidor');
  }
};

// Obtener la lista de asistencia completa de un día
// Obtener la lista de asistencia completa de un día
export const getDayAttendanceList = async (dayId) => {
    try {
      const response = await api.get(`/days/${dayId}/attendance`);
  
      // Verificar si la respuesta incluye la lista de turnos
      if (response.data.shifts) {
        return response.data.shifts.map((shift) => ({
          user: shift.user, // Nombre del usuario
          turn: shift.turn, // Turno (BREAKFAST o DINNER)
          startTime: shift.startTime, // Hora de inicio
          endTime: shift.endTime, // Hora de fin
          totalHours: shift.totalHours, // Horas totales trabajadas
        }));
      }
  
      throw new Error('Formato de respuesta inesperado');
    } catch (error) {
      if (error.response) {
        throw new Error(
          error.response.data.error || 'Error al obtener la lista de asistencia'
        );
      }
      throw new Error('Error de red o servidor');
    }
  };
  
