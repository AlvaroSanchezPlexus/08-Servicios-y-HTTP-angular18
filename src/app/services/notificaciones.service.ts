import { computed, Injectable, signal } from '@angular/core';
export interface Notificacion {
  id: number;
  mensaje: string;
  tipo: 'success' | 'error' | 'info';
  leida: boolean;
}
@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {
  private _notificaciones = signal<Notificacion[]>([]);

  notificaciones = this._notificaciones.asReadonly();

  pendientes = computed(() =>
    this._notificaciones().filter(n => !n.leida).length
  );

  agregar(mensaje: string, tipo: Notificacion['tipo'] = 'info') {
    this._notificaciones.update(list => [
      ...list,
      { id: Date.now(), mensaje, tipo, leida: false }
    ]);
  }

  marcarLeida(id: number) {
    this._notificaciones.update(list =>
      list.map(n => n.id === id ? { ...n, leida: true } : n)
    );
  }

  eliminar(id: number) {
    this._notificaciones.update(list => list.filter(n => n.id !== id));
  }
}
