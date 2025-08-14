const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Configurar CORS para Express
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST"]
}));

app.use(express.json());

// Configurar Socket.io con CORS
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Base de datos en memoria para los equipos
let equipos = [
  { id: 'PC-01', ocupado: false, estudiante: null },
  { id: 'PC-02', ocupado: false, estudiante: null },
  { id: 'PC-03', ocupado: false, estudiante: null },
  { id: 'PC-04', ocupado: false, estudiante: null },
  { id: 'PC-05', ocupado: false, estudiante: null }
];

// API REST para obtener estado de equipos
app.get('/api/equipos', (req, res) => {
  res.json(equipos);
});

// Manejo de conexiones Socket.io
io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);

  // Enviar estado actual de equipos al cliente que se conecta
  socket.emit('estadoEquipos', equipos);

  // Escuchar registro de equipo por estudiante
  socket.on('equipo:registrado', (data) => {
    console.log('Equipo registrado:', data);

    // Actualizar el estado del equipo
    const equipo = equipos.find(e => e.id === data.equipo);
    if (equipo && !equipo.ocupado) {
      equipo.ocupado = true;
      equipo.estudiante = data.nombreEstudiante;

      // Notificar a todos los clientes sobre el cambio
      io.emit('notificacion:equipoOcupado', {
        ...data,
        timestamp: new Date().toISOString()
      });

      // Enviar estado actualizado de equipos
      io.emit('estadoEquipos', equipos);

      socket.emit('registro:exitoso', { mensaje: 'Equipo registrado correctamente' });
    } else {
      socket.emit('registro:error', { mensaje: 'Equipo no disponible' });
    }
  });

  // Escuchar liberación de equipo
  socket.on('equipo:liberado', (data) => {
    console.log('Equipo liberado:', data);

    const equipo = equipos.find(e => e.id === data.equipo);
    if (equipo && equipo.ocupado) {
      equipo.ocupado = false;
      equipo.estudiante = null;

      // Notificar a todos los clientes
      io.emit('notificacion:equipoLiberado', {
        equipo: data.equipo,
        timestamp: new Date().toISOString()
      });

      // Enviar estado actualizado de equipos
      io.emit('estadoEquipos', equipos);
    }
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});