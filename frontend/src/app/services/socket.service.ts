import { Injectable, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SocketService implements OnDestroy {
  private socket: Socket;

  constructor() {
    this.socket = io('http://localhost:5000', { autoConnect: false });
  }

  connect() { this.socket.connect(); }
  disconnect() { this.socket.disconnect(); }

  joinTechnicianRoom(technicianId: string) {
    this.socket.emit('join-technician', technicianId);
  }

  joinAdminRoom() {
    this.socket.emit('join-admin');
  }

  onNewAppointment(): Observable<any> {
    return new Observable(obs => {
      this.socket.on('new-appointment', data => obs.next(data));
    });
  }

  onAppointmentUpdated(): Observable<any> {
    return new Observable(obs => {
      this.socket.on('appointment-updated', data => obs.next(data));
    });
  }

  ngOnDestroy() { this.socket.disconnect(); }
}
