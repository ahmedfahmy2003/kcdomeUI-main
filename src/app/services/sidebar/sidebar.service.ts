// sidebar.service.ts
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SidebarService {
  isExpanded = signal(false); // default collapsed on mobile
  isExpandedm = signal(false);

  toggle() {
    this.isExpanded.update(v => !v);
    this.isExpandedm.set(false);
  }

  mtoggle() {
    this.isExpandedm.update(v => !v);
    this.isExpanded.set(false);
  }

  collapse() {
    this.isExpanded.set(false);
    this.isExpandedm.set(false);
  }
  expand() {
    this.isExpanded.set(true);
    this.isExpandedm.set(true);
  }
}
