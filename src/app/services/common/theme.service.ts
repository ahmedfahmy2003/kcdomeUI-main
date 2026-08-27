import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly storageKey = 'kc-theme-mode';

  readonly mode = signal<ThemeMode>('light');

  initializeTheme(): void {
    const storedMode = this.readStoredMode();
    const preferredMode = storedMode ?? this.getSystemPreference();
    this.applyTheme(preferredMode);
  }

  toggleTheme(): void {
    this.applyTheme(this.mode() === 'dark' ? 'light' : 'dark');
  }

  private applyTheme(mode: ThemeMode): void {
    const body = this.document.body;
    const html = this.document.documentElement;

    this.mode.set(mode);
    body.classList.toggle('dark-mode', mode === 'dark');
    body.setAttribute('data-bs-theme', mode);
    html.setAttribute('data-bs-theme', mode);
    this.document.defaultView?.localStorage.setItem(this.storageKey, mode);
  }

  private readStoredMode(): ThemeMode | null {
    const storedValue = this.document.defaultView?.localStorage.getItem(this.storageKey);
    return storedValue === 'dark' || storedValue === 'light' ? storedValue : null;
  }

  private getSystemPreference(): ThemeMode {
    return this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
