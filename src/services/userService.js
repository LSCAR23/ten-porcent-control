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

export const fetchUsers = async () => {
  try {
    const response = await api.get('/users');
    return response.data; // Suponiendo que el backend devuelve un array de usuarios.
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.error || 'Error al obtener la lista de usuarios.');
    }
    throw new Error('Error de red o servidor');
  }
};


export const deleteUser = async (userId) => {
  try {
    await api.delete(`/users/${userId}`);
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.error || 'Error al eliminar el usuario.');
    }
    throw new Error('Error de red o servidor');
  }
};
