import React, { useState, useEffect } from 'react';
import { socket } from './socket';
import EstudianteView from './components/EstudianteView';
import DocenteView from './components/DocenteView';
import '../styles/App.css';

function App() {
  const [userType, setUserType] = useState('');
  const [equipos, setEquipos] = useState([]);
  const [conectado, setConectado] = useState(false);

  useEffect(() => {
    // Manejar conexión
    socket.on('connect', () => {
      setConectado(true);
    });

    socket.on('disconnect', () => {
      setConectado(false);
    });

    // Recibir estado de equipos
    socket.on('estadoEquipos', (equiposData) => {
      setEquipos(equiposData);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('estadoEquipos');
    };
  }, []);

  if (!userType) {
    return (
      <div className="login-container">
        <h1>Sistema de Laboratorio</h1>
        <div className="connection-status">
          Estado: {conectado ? '🟢 Conectado' : '🔴 Desconectado'}
        </div>
        <div className="user-selection">
          <button 
            onClick={() => setUserType('estudiante')}
            className="btn btn-primary"
          >
            Acceder como Estudiante
          </button>
          <button 
            onClick={() => setUserType('docente')}
            className="btn btn-secondary"
          >
            Acceder como Docente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header>
        <h1>Sistema de Laboratorio</h1>
        <div className="user-info">
          <span>Usuario: {userType}</span>
          <span className={`status ${conectado ? 'connected' : 'disconnected'}`}>
            {conectado ? '🟢 Conectado' : '🔴 Desconectado'}
          </span>
          <button onClick={() => setUserType('')} className="btn-logout">
            Cambiar Usuario
          </button>
        </div>
      </header>

      <main>
        {userType === 'estudiante' ? (
          <EstudianteView equipos={equipos} />
        ) : (
          <DocenteView equipos={equipos} />
        )}
      </main>
    </div>
  );
}

export default App;