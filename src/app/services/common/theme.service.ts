import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly storageKey = 'kc-theme-mode';

  readonly mode = signal<ThemeMode>(this.resolveInitialMode());

  constructor() {
    this.syncThemeToDom(this.mode());
  }

  initializeTheme(): void {
    this.syncThemeToDom(this.mode());
  }

  toggleTheme(): void {
    this.applyTheme(this.mode() === 'dark' ? 'light' : 'dark');
  }

  private applyTheme(mode: ThemeMode): void {
    this.mode.set(mode);
    this.syncThemeToDom(mode);
    this.document.defaultView?.localStorage.setItem(this.storageKey, mode);
  }

  private syncThemeToDom(mode: ThemeMode): void {
    const body = this.document.body;
    const html = this.document.documentElement;

    body?.classList.toggle('dark-mode', mode === 'dark');
    body?.setAttribute('data-bs-theme', mode);
    html.setAttribute('data-bs-theme', mode);
  }

  private resolveInitialMode(): ThemeMode {
    return this.readStoredMode() ?? this.getSystemPreference();
  }

  private readStoredMode(): ThemeMode | null {
    const storedValue = this.document.defaultView?.localStorage.getItem(this.storageKey);
    return storedValue === 'dark' || storedValue === 'light' ? storedValue : null;
  }

  private getSystemPreference(): ThemeMode {
    return this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
