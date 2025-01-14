'use client';
import Cookies from 'js-cookie';
import React, { useState, useEffect } from 'react';
import { createUser, fetchUsers, deleteUser } from '@/services/userService';
import ToastMessage from '../../components/ToastMessage';
import Spinner from '../../components/Spinner';
import { useRouter } from 'next/navigation';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('ADMIN');
  const [users, setUsers] = useState([]);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(false); // Spinner al cargar usuarios
  const [loadingSubmit, setLoadingSubmit] = useState(false); // Spinner al registrar usuario
  const [toast, setToast] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const cookieValue = Cookies.get('userName');
    if (!cookieValue) {
      router.push('/'); // Redirigir al login si no hay cookie
    }

    const loadUsers = async () => {
      try {
        setLoadingUsers(true);
        const userList = await fetchUsers();
        setUsers(userList);
      } catch (err) {
        showToast('Error al cargar usuarios', 'error');
      } finally {
        setLoadingUsers(false);
      }
    };

    loadUsers();
  }, [router]);

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true);

    try {
      await createUser({ name, password, userType });
      showToast('Usuario creado exitosamente', 'success');
      setName('');
      setPassword('');
      setUserType('ADMIN');
      const updatedUsers = await fetchUsers();
      setUsers(updatedUsers);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleDelete = async (userId) => {
    setDeletingUserId(userId);

    try {
      await deleteUser(userId);
      showToast('Usuario eliminado exitosamente', 'success');
      const updatedUsers = await fetchUsers();
      setUsers(updatedUsers);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeletingUserId(null);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-black rounded-lg shadow-md text-white text-center mt-12">
      <h1 className="text-3xl font-bold mb-6">Registrar Usuario</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-6">
        <div>
          <label htmlFor="name" className="block text-left mb-1">Nombre:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-left mb-1">Contraseña:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
          />
        </div>
        <div className="text-left">
          <p>Tipo de Usuario:</p>
          <label className="mr-4">
            <input
              type="radio"
              name="userType"
              value="ADMIN"
              checked={userType === 'ADMIN'}
              onChange={(e) => setUserType(e.target.value)}
            />
            Administrador
          </label>
          <label>
            <input
              type="radio"
              name="userType"
              value="SALONERO"
              checked={userType === 'SALONERO'}
              onChange={(e) => setUserType(e.target.value)}
            />
            Salonero
          </label>
        </div>
        <button
          type="submit"
          className={`w-full p-2 rounded-md text-white ${loadingSubmit ? 'bg-gray-500 cursor-not-allowed' : 'bg-violet-500 hover:bg-violet-600 transition duration-300'}`}
          disabled={loadingSubmit}
        >
          {loadingSubmit ? 'Registrando...' : 'Registrar'}
        </button>
      </form>

      <h2 className="text-2xl font-bold mb-4">Usuarios Registrados</h2>
      {loadingUsers ? (
        <Spinner label="Cargando usuarios..." />
      ) : (
        <ul className="space-y-4">
          {users.map((user) => (
            <li
              key={user.id}
              className={`border border-violet-500 p-4 rounded-lg shadow-sm bg-black text-white transition-all duration-300 ${deletingUserId === user.id ? 'fade-out' : ''
                }`}
            >
              <h2 className="text-xl font-bold mb-2">{user.name}</h2>
              <p>Tipo: {user.userType}</p>
              <button
                onClick={() => handleDelete(user.id)}
                className="bg-red-500 text-white px-4 py-2 rounded mt-2 hover:bg-red-600 transition-colors duration-300"
                disabled={deletingUserId === user.id}
              >
                {deletingUserId === user.id ? 'Eliminando...' : 'Eliminar'}
              </button>
            </li>
          ))}
        </ul>
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
};

export default RegisterPage;
