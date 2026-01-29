import { computed, inject, Injectable, signal } from '@angular/core';
import { NotificacionesService } from './notificaciones.service';
export interface Tarea {
  id: number;
  titulo: string;
  categoria: 'trabajo' | 'personal';
  completada: boolean;
}
@Injectable({
  providedIn: 'root'
})
export class TareasService {
  private readonly _tareas = signal<Tarea[]>([]);

  private readonly _notifications = inject(NotificacionesService);

  public filtroActual = signal<'todas' | 'trabajo' | 'personal'>('todas');

  public tareasFiltradas = computed(() => {
    const t = this._tareas();
    const f = this.filtroActual();
    return f === 'todas' ? t : t.filter(item => item.categoria === f);
  });

  public stats = computed(() => ({
    total: this._tareas().length,
    completas: this._tareas().filter(t => t.completada).length
  }));

  public agregarTarea(titulo: string, categoria: Tarea['categoria']) {
    this._tareas.update(val => [...val, { id: Date.now(), titulo, categoria, completada: false }]);
    this._notifications.agregar(`Tarea "${titulo}" agregada.`, 'success');
  }

  public toggleTarea(id: number) {
    this._tareas.update(val => val.map(t => t.id === id ? { ...t, completada: !t.completada } : t));
  }
}
