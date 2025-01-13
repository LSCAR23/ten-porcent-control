"use client";
import React, { useState } from 'react';
import { createUser } from '@/services/userService';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [userType, setUserType] = useState('ADMIN'); // Valor predeterminado
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
  
    const handleSubmit = async (e) => {
      e.preventDefault();
  
      try {
        await createUser({ name, password, userType });
        setSuccess('Usuario creado exitosamente');
        setError('');
        setName('');
        setPassword('');
        setUserType('ADMIN');
      } catch (err) {
        setError(err.message);
        setSuccess('');
      }
    };
  
    return (
      <div style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center' }}>
        <h1>Registrar Usuario</h1>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label htmlFor="name">Nombre:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                padding: '8px',
                width: '100%',
                marginTop: '5px',
              }}
            />
          </div>
          <div>
            <label htmlFor="password">Contraseña:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                padding: '8px',
                width: '100%',
                marginTop: '5px',
              }}
            />
          </div>
          <div>
            <p>Tipo de Usuario:</p>
            <label>
              <input
                type="radio"
                name="userType"
                value="ADMIN"
                checked={userType === 'ADMIN'}
                onChange={(e) => setUserType(e.target.value)}
              />
              Administrador
            </label>
            <label style={{ marginLeft: '15px' }}>
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
            style={{
              padding: '10px 15px',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Registrar
          </button>
        </form>
        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
        {success && <p style={{ color: 'green', marginTop: '10px' }}>{success}</p>}
      </div>
    );
  };
  
  export default RegisterPage;