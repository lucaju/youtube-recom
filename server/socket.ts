import { Express } from 'express';
import http from 'http';
import { Server } from 'socket.io';

export let io: Server;

export const createIo = (app: Express) => {
  const server = http.createServer(app);
  io = new Server(server);

  io.on('connection', (socket) => {
    console.log('a user connected');

    io.emit('FIRE', {
      msg: 'some value',
      otherProperty: 'other value',
    });

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });

  return server;
};

export const emitIo = <T>(event: string, payload: T) => {
  if (!io) return;
  io.emit(event, payload);
};
