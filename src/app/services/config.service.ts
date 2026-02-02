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

  public config = signal<AppConfig>(this.default);

  constructor() {
    const saved = localStorage.getItem('app_settings');
    if (saved) this.config.set(JSON.parse(saved));

    effect(() => {
      const config = this.config();
      if (config) {
        localStorage.setItem('app_settings', JSON.stringify(config));
      }
    });
  }

  public updateConfig(newPart: Partial<AppConfig>) {
    this.config.update(old => ({ ...old, ...newPart }));
  }

  public reset() {
    this.config.set(this.default);
  }
}
