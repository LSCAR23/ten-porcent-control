import api from './api';

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

export const checkFortnighExists = async (name) => {
    try {
        const response = await api.get(`/fortnighs?name=${encodeURIComponent(name)}`);
        return response.data.exists;
    } catch (error) {
        throw new Error('Error al verificar la quincena');
    }
};

export const getLastFortnigh = async () => {
    const response = await api.get('/fortnighs/last');
    return response.data;
};


export const updateDayAttendance = async (dayId, attendance) => {
    await api.patch(`/days/${dayId}/attendance`, attendance);
};

export const getDayAttendance = async (dayId, userName) => {
    const response = await api.get(`/days/${dayId}/attendance?user=${encodeURIComponent(userName)}`);
    return response.data;
  };

  export const getDayAttendanceList = async (dayId) => {
    const response = await api.get(`/days/${dayId}/attendance`);
    return response.data;
  };