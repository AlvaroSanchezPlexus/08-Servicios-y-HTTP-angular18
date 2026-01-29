import { effect, Injectable, signal } from '@angular/core';
export interface AppConfig {
  language: 'es' | 'en';
  autoSave: boolean;
  fontSize: 'small' | 'medium' | 'large';
}
@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private default: AppConfig = { language: 'es', autoSave: true, fontSize: 'medium' };

  config = signal<AppConfig>(this.default);

  constructor() {
    const saved = localStorage.getItem('app_settings');
    if (saved) this.config.set(JSON.parse(saved));

    effect(() => {
      localStorage.setItem('app_settings', JSON.stringify(this.config()));
    });
  }

  updateConfig(newPart: Partial<AppConfig>) {
    this.config.update(old => ({ ...old, ...newPart }));
  }

  reset() {
    this.config.set(this.default);
  }
}
