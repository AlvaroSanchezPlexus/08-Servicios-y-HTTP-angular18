 
import { Component, inject, signal } from '@angular/core';
import { ClimaService } from '../../services/clima.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-clima',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './clima.component.html',
  styleUrl: './clima.component.scss'
})
export class ClimaComponent {
  climaService = inject(ClimaService);
  ciudadBusqueda = signal(''); 

  ejecutarBusqueda() {
    const ciudad = this.ciudadBusqueda().trim();
    if (ciudad) {
      this.climaService.buscarClima(ciudad).subscribe({
        error: (err) => console.error('Error al buscar clima', err)
      });
    }
  }
}
