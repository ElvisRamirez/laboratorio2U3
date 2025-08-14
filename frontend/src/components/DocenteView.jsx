import React, { useState, useEffect } from 'react';
import { socket } from '../socket';

function DocenteView({ equipos }) {
  const [notificaciones, setNotificaciones] = useState([]);

  useEffect(() => {
    // Escuchar notificaciones de equipos ocupados
    socket.on('notificacion:equipoOcupado', (data) => {
      const nuevaNotificacion = {
        id: Date.now(),
        tipo: 'ocupado',
        mensaje: `${data.nombreEstudiante} ha ocupado el equipo ${data.equipo}`,
        timestamp: data.timestamp
      };

      setNotificaciones(prev => [nuevaNotificacion, ...prev.slice(0, 9)]);

      // Mostrar notificación toast
      mostrarToast(nuevaNotificacion.mensaje, 'info');
    });

    // Escuchar notificaciones de equipos liberados
    socket.on('notificacion:equipoLiberado', (data) => {
      const nuevaNotificacion = {
        id: Date.now(),
        tipo: 'liberado',
        mensaje: `El equipo ${data.equipo} ha sido liberado`,
        timestamp: data.timestamp
      };

      setNotificaciones(prev => [nuevaNotificacion, ...prev.slice(0, 9)]);
      mostrarToast(nuevaNotificacion.mensaje, 'success');
    });

    return () => {
      socket.off('notificacion:equipoOcupado');
      socket.off('notificacion:equipoLiberado');
    };
  }, []);

  const mostrarToast = (mensaje, tipo) => {
    // Crear elemento toast
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.textContent = mensaje;
    
    document.body.appendChild(toast);
    
    // Animar entrada
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Remover después de 4 segundos
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 4000);
  };

  const liberarEquipo = (equipoId) => {
    socket.emit('equipo:liberado', { equipo: equipoId });
  };

  const equiposOcupados = equipos.filter(e => e.ocupado);
  const equiposDisponibles = equipos.filter(e => !e.ocupado);

  return (
    <div className="docente-view">
      <h2>Panel del Docente</h2>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>{equiposOcupados.length}</h3>
          <p>Equipos Ocupados</p>
        </div>
        <div className="stat-card">
          <h3>{equiposDisponibles.length}</h3>
          <p>Equipos Disponibles</p>
        </div>
        <div className="stat-card">
          <h3>{equipos.length}</h3>
          <p>Total Equipos</p>
        </div>
      </div>

      <div className="contenido-dashboard">
        <div className="equipos-section">
          <h3>Estado de Equipos en Tiempo Real</h3>
          <div className="equipos-grid">
            {equipos.map(equipo => (
              <div 
                key={equipo.id} 
                className={`equipo-card ${equipo.ocupado ? 'ocupado' : 'disponible'}`}
              >
                <div className="equipo-header">
                  <div className="equipo-id">{equipo.id}</div>
                  <div className={`status-indicator ${equipo.ocupado ? 'red' : 'green'}`}></div>
                </div>
                <div className="equipo-estado">
                  {equipo.ocupado ? '🔴 Ocupado' : '🟢 Disponible'}
                </div>
                {equipo.ocupado && (
                  <>
                    <div className="estudiante-info">
                      <strong>Estudiante:</strong><br />
                      {equipo.estudiante}
                    </div>
                    <button 
                      onClick={() => liberarEquipo(equipo.id)}
                      className="btn btn-danger btn-sm"
                    >
                      Liberar Equipo
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="notificaciones-section">
          <h3>Notificaciones Recientes</h3>
          <div className="notificaciones-lista">
            {notificaciones.length === 0 ? (
              <p className="no-notificaciones">No hay notificaciones recientes</p>
            ) : (
              notificaciones.map(notif => (
                <div key={notif.id} className={`notificacion ${notif.tipo}`}>
                  <div className="notif-mensaje">{notif.mensaje}</div>
                  <div className="notif-tiempo">
                    {new Date(notif.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocenteView;