import { io } from 'socket.io-client';

// Crear conexión socket
export const socket = io('http://localhost:3000');

// Eventos de conexión
socket.on('connect', () => {
  console.log('Conectado al servidor:', socket.id);
});

socket.on('disconnect', () => {
  console.log('Desconectado del servidor');
});