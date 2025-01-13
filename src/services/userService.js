import api from './api';

export const createUser = async (userData) => {
  try {
    const response = await api.post('/users', userData);
    return response.data; // Usuario creado exitosamente
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.error || 'Error al registrar usuario');
    }
    throw new Error('Error de red o servidor');
  }
};
