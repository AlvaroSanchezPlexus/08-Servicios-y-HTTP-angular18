import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GaleriaService {

  progreso = signal(0);
  galeria = signal<string[]>([]);

  subirArchivo(nombre: string) {
    this.progreso.set(0);

    // Simulamos subida con un intervalo
    const intervalo = setInterval(() => {
      this.progreso.update(p => p + 10);

      if (this.progreso() >= 100) {
        clearInterval(intervalo);
        this.galeria.update(g => [...g, nombre]);
      }
    }, 200);
  }
}
