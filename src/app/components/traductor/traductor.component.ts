import { Component, inject, signal } from '@angular/core';
import { TraductorService } from '../../services/traductor.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-traductor',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './traductor.component.html',
  styleUrl: './traductor.component.scss'
})
export class TraductorComponent {
  tradService = inject(TraductorService);
  textoATraducir = signal('');

  procesarTraduccion() {
    if (this.textoATraducir()) {
      this.tradService.traducir(this.textoATraducir()).subscribe(() => {
        this.textoATraducir.set(''); // Limpiar tras traducir
      });
    }
  }
}
