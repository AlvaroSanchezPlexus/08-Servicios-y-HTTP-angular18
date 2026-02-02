/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NoticiasService {

  private http = inject(HttpClient);

  noticias = signal<any[]>([]);
  paginaActual = signal(1);
  loading = signal(false);

  cargarNoticias() {
    this.loading.set(true);
    const url = `https://newsapi.org/v2/everything?q=tech&page=${this.paginaActual()}&apiKey=API_KEY`;

    return this.http.get<any>(url).pipe(
      tap(res => {
        // Unimos las noticias viejas con las nuevas usando el spread operator
        this.noticias.update(prev => [...prev, ...res.articles]);
        this.paginaActual.update(p => p + 1);
        this.loading.set(false);
      })
    );
  }
}
