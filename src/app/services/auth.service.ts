import { effect, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _router = inject(Router);

  isAuthenticated = signal<boolean>(false);
  user = signal<{ name: string; token: string } | null>(null);

  constructor() {
    // 1. Hidratación: Recuperar datos al arrancar
    const savedAuth = localStorage.getItem('auth_session');
    if (savedAuth) {
      this.user.set(JSON.parse(savedAuth));
      this.isAuthenticated.set(true);
    }

    // 2. Efecto Secundario: Si el estado cambia, sincronizar localStorage
    effect(() => {
      const currentUser = this.user();
      if (currentUser) {
        localStorage.setItem('auth_session', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('auth_session');
      }
    });
  }

  login(name: string) {
    this.user.set({ name, token: 'ABC-123' });
    this.isAuthenticated.set(true);
  }

  logout() {
    this.user.set(null);
    this.isAuthenticated.set(false);
    this._router.navigate(['/login']);
  }
}
