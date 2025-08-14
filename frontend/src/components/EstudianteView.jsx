import React, { useState, useEffect } from 'react';
import { socket } from '../socket';

function EstudianteView({ equipos }) {
  const [nombreEstudiante, setNombreEstudiante] = useState('');
  const [equipoSeleccionado, setEquipoSeleccionado] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState('');

  useEffect(() => {
    // Escuchar respuestas del servidor
    socket.on('registro:exitoso', (data) => {
      mostrarMensaje(data.mensaje, 'success');
      setNombreEstudiante('');
      setEquipoSeleccionado('');
    });

    socket.on('registro:error', (data) => {
      mostrarMensaje(data.mensaje, 'error');
    });

    return () => {
      socket.off('registro:exitoso');
      socket.off('registro:error');
    };
  }, []);

  const mostrarMensaje = (texto, tipo) => {
    setMensaje(texto);
    setTipoMensaje(tipo);
    setTimeout(() => {
      setMensaje('');
      setTipoMensaje('');
    }, 3000);
  };

  const handleRegistrarEquipo = () => {
    if (!nombreEstudiante || !equipoSeleccionado) {
      mostrarMensaje('Por favor complete todos los campos', 'error');
      return;
    }

    socket.emit('equipo:registrado', {
      nombreEstudiante,
      equipo: equipoSeleccionado
    });
  };

  const equiposDisponibles = equipos.filter(e => !e.ocupado);

  return (
    <div className="estudiante-view">
      <h2>Panel del Estudiante</h2>

      {mensaje && (
        <div className={`mensaje ${tipoMensaje}`}>
          {mensaje}
        </div>
      )}

      <div className="formulario">
        <div className="campo">
          <label>Nombre del Estudiante:</label>
          <input
            type="text"
            value={nombreEstudiante}
            onChange={(e) => setNombreEstudiante(e.target.value)}
            placeholder="Ingrese su nombre"
          />
        </div>

        <div className="campo">
          <label>Seleccionar Equipo:</label>
          <select
            value={equipoSeleccionado}
            onChange={(e) => setEquipoSeleccionado(e.target.value)}
          >
            <option value="">-- Seleccione un equipo --</option>
            {equiposDisponibles.map(equipo => (
              <option key={equipo.id} value={equipo.id}>
                {equipo.id}
              </option>
            ))}
          </select>
        </div>

        <button 
          onClick={handleRegistrarEquipo}
          className="btn btn-primary"
          disabled={!nombreEstudiante || !equipoSeleccionado}
        >
          Registrar Equipo
        </button>
      </div>

      <div className="estado-equipos">
        <h3>Estado de Equipos</h3>
        <div className="equipos-grid">
          {equipos.map(equipo => (
            <div 
              key={equipo.id} 
              className={`equipo-card ${equipo.ocupado ? 'ocupado' : 'disponible'}`}
            >
              <div className="equipo-id">{equipo.id}</div>
              <div className="equipo-estado">
                {equipo.ocupado ? '🔴 Ocupado' : '🟢 Disponible'}
              </div>
              {equipo.ocupado && (
                <div className="estudiante-info">
                  Por: {equipo.estudiante}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default EstudianteView;