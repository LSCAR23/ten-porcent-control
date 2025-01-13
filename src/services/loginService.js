import api from './api';

export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/login', credentials);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.error || 'Error al iniciar sesión');
    }
    throw new Error('Error de red o servidor');
  }
};
