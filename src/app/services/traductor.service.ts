/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TraductorService {

  private http = inject(HttpClient);

  resultado = signal('');
  historial = signal<string[]>([]);

  traducir(texto: string) {
    return this.http.post<any>('https://libretranslate.de/translate', {
      q: texto, source: "es", target: "en"
    }).pipe(
      tap(res => {
        this.resultado.set(res.translatedText);
        this.historial.update(h => [texto + ' -> ' + res.translatedText, ...h]);
      })
    );
  }
}
