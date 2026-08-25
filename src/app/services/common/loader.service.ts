// loader.service.ts
import { computed, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoaderService {
  private _counter = signal(0);
  readonly isLoading = computed(() => this._counter() > 0);

  show() { this._counter.update(c => c + 1); }
  hide() { this._counter.update(c => Math.max(c - 1, 0)); }
}
