import { CommonModule } from '@angular/common';
import { Component, computed, effect, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

type PaginationItem = number | 'ellipsis';

@Component({
  selector: 'app-pagination-controls',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pagination-controls.html',
  styleUrl: './pagination-controls.scss'
})
export class PaginationControls {
  currentPage = input<number>(1);
  totalPages = input<number>(0);
  totalItems = input<number>(0);
  pageSize = input<number>(10);
  currentItemCount = input<number>(0);
  showMobile = input<boolean>(true);
  showPageNumbers = input<boolean>(false);
  showSummary = input<boolean>(true);
  showGoto = input<boolean>(true);
  compactSummary = input<boolean>(false);
  recordsLabel = input<string>('Records');
  gotoSeparator = input<string>('/');

  pageSelected = output<number>();

  readonly gotoPage = signal<number>(1);

  readonly paginationItems = computed<PaginationItem[]>(() => {
    if (!this.showPageNumbers()) {
      return ['ellipsis'];
    }

    const totalPages = this.totalPages();
    const currentPage = this.currentPage();
    const items: PaginationItem[] = [];

    for (const page of [1, 2]) {
      if (page <= totalPages) {
        items.push(page);
      }
    }

    if (currentPage > 4) {
      items.push('ellipsis');
    }

    for (const page of [currentPage - 1, currentPage, currentPage + 1]) {
      if (page > 2 && page < totalPages - 1 && !items.includes(page)) {
        items.push(page);
      }
    }

    if (currentPage < totalPages - 3) {
      items.push('ellipsis');
    }

    for (const page of [totalPages - 1, totalPages]) {
      if (page > 2 && page <= totalPages && !items.includes(page)) {
        items.push(page);
      }
    }

    return items.length ? items : ['ellipsis'];
  });

  constructor() {
    effect(() => {
      this.gotoPage.set(this.currentPage() || 1);
    });
  }

  get displayStart(): number {
    if (!this.totalItems() || !this.currentItemCount()) {
      return 0;
    }

    return ((this.currentPage() - 1) * this.pageSize()) + 1;
  }

  get displayEnd(): number {
    if (!this.totalItems() || !this.currentItemCount()) {
      return 0;
    }

    return ((this.currentPage() - 1) * this.pageSize()) + this.currentItemCount();
  }

  goToPrevious(): void {
    this.selectPage(this.currentPage() - 1);
  }

  goToNext(): void {
    this.selectPage(this.currentPage() + 1);
  }

  selectPage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) {
      return;
    }

    this.pageSelected.emit(page);
  }

  sanitizeGoto(): void {
    let page = Number(this.gotoPage());

    if (!Number.isFinite(page) || !page) {
      this.gotoPage.set(1);
      return;
    }

    page = Math.trunc(page);
    page = Math.max(1, page);
    page = Math.min(page, this.totalPages() || 1);
    this.gotoPage.set(page);
  }

  updateGoto(value: string | number): void {
    this.gotoPage.set(Number(value));
    this.sanitizeGoto();
  }

  submitGoto(): void {
    this.sanitizeGoto();
    this.selectPage(this.gotoPage());
  }

  isPageItem(item: PaginationItem): item is number {
    return item !== 'ellipsis';
  }
}
