import { Component, inject } from '@angular/core';
import { ConfigService } from '../../services/config.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './configuracion.component.html',
  styleUrl: './configuracion.component.scss'
})
export class ConfiguracionComponent {
  configService = inject(ConfigService);

  cambiarAjuste(cambio: Record<string, unknown>) {
    this.configService.updateConfig(cambio);
  }
}
