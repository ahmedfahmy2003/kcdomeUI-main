// modal.service.ts
import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class ModalService {
  private activeModalId = signal<string | null>(null);
  private cactiveModalId = signal<string | null>(null);

  readonly modalId = this.activeModalId.asReadonly();
  readonly cmodalId = this.cactiveModalId.asReadonly();

  show(id: string) {
    this.activeModalId.set(id);
    const kcdome = document.getElementById('kcdome');
    kcdome?.classList.add('modal-open');
  }

  cshow(id: string) {
    this.cactiveModalId.set(id);
    const kcdome = document.getElementById('kcdome');
    kcdome?.classList.add('modal-open');
  }

  hide() {
    this.activeModalId.set(null);
    const kcdome = document.getElementById('kcdome');
    kcdome?.classList.remove('modal-open');
  }

  chide() {
    this.cactiveModalId.set(null);
    const kcdome = document.getElementById('kcdome');
    kcdome?.classList.remove('modal-open');
  }

  isOpen(id: string) {
    return this.activeModalId() === id;
  }

  iscOpen(id: string) {
    return this.cactiveModalId() === id;
  }
}
