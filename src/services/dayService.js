import api from './api';

export const createDay = async (dayData) => {
  try {
    const response = await api.post('/days', dayData);
    return response.data;
  } catch (error) {
    console.error('Error creating day:', error);
    throw error;
  }
};
