/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClimaService {

  private http = inject(HttpClient);
  private apiKey = 'TU_API_KEY'; // Simulado

  // Estado
  climaActual = signal<any>(null);
  loading = signal(false);

  // Cache manual en un objeto
  private cache: Record<string, any> = {};

  buscarClima(ciudad: string) {
    const ciudadClean = ciudad.toLowerCase().trim();

    // Si ya esta en cache, lo usamos y salimos
    if (this.cache[ciudadClean]) {
      this.climaActual.set(this.cache[ciudadClean]);
      return of(this.cache[ciudadClean]);
    }

    this.loading.set(true);
    return this.http.get(`https://api.openweathermap.org/data/2.5/weather?q=${ciudadClean}&appid=${this.apiKey}`)
      .pipe(
        tap(data => {
          this.cache[ciudadClean] = data; // Guardar en cache
          this.climaActual.set(data);
          this.loading.set(false);
        })
      );
  }
}
