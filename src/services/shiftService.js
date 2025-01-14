import api from './api';

export const getTotalHoursWorked = async (userName, fortnighId) => {
    

  try {
    if (!userName || !fortnighId) {
      throw new Error('Faltan parámetros: userName o fortnighId');
    }

    const response = await api.get(
      `/shifts/total-hours?user=${encodeURIComponent(userName)}&fortnighId=${encodeURIComponent(fortnighId)}`
    );

    return response.data.totalHours || 0; // Retornar 0 si no hay horas
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.error || 'Error al obtener las horas totales');
    }
    throw new Error('Error de red o servidor');
  }
};
