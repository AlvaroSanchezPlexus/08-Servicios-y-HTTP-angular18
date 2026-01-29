import { Component, inject } from '@angular/core';
import { TareasService } from '../../services/tareas.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tareas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tareas.component.html',
  styleUrl: './tareas.component.scss'
})
export class TareasComponent {
  tareasService = inject(TareasService);

  nuevoTitulo = '';
  nuevaCategoria: 'trabajo' | 'personal' = 'trabajo';

  agregar() {
    if (this.nuevoTitulo.trim()) {
      this.tareasService.agregarTarea(this.nuevoTitulo, this.nuevaCategoria);
      this.nuevoTitulo = ''; 
    }
  }
}
