import { Component } from '@angular/core';
import { TareasComponent } from "./components/tareas/tareas.component";
import { ConfiguracionComponent } from "./components/configuracion/configuracion.component";
import { NotificacionesComponent } from "./components/notificaciones/notificaciones.component";
import { UserStatusComponent } from "./components/user-status/user-status.component";
import { GaleriaComponent } from "./components/galeria/galeria.component";
import { ClimaComponent } from "./components/clima/clima.component";
import { NoticiasComponent } from "./components/noticias/noticias.component";
import { TraductorComponent } from "./components/traductor/traductor.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TareasComponent, ConfiguracionComponent, NotificacionesComponent, UserStatusComponent, GaleriaComponent, ClimaComponent, NoticiasComponent, TraductorComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Servicios-y-HTTP-angular18';
}
