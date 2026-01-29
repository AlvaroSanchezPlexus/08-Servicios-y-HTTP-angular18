import { computed, Injectable, signal } from '@angular/core';
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
  private _tareas = signal<Tarea[]>([]);
  filtroActual = signal<'todas' | 'trabajo' | 'personal'>('todas');

  tareasFiltradas = computed(() => {
    const t = this._tareas();
    const f = this.filtroActual();
    return f === 'todas' ? t : t.filter(item => item.categoria === f);
  });

  stats = computed(() => ({
    total: this._tareas().length,
    completas: this._tareas().filter(t => t.completada).length
  }));

  agregarTarea(titulo: string, categoria: Tarea['categoria']) {
    this._tareas.update(val => [...val, { id: Date.now(), titulo, categoria, completada: false }]);
  }

  toggleTarea(id: number) {
    this._tareas.update(val => val.map(t => t.id === id ? { ...t, completada: !t.completada } : t));
  }
}
