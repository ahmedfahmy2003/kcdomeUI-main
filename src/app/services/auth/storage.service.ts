import { inject, Injectable } from '@angular/core';
import { LogoutService } from './logout.service';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly EXPIRY_MINUTES = 240;
  private readonly TIMESTAMP_KEY = 'appDataTimestamp';
  logout: LogoutService = inject(LogoutService);

  constructor() {
    // Run expiry check immediately when the service is created (i.e. app load)
    this.checkExpiry();
  }

  /** Retrieve data and also validate expiry */
  getItem<T>(key: string): T | null {
    this.checkExpiry();
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) as T : null;
  }

  /** Optional: manually clear */
  clear(): void {
    localStorage.clear();
  }

  /** Check if stored data expired (runs once at startup) */
    checkExpiry() {
    const saved = localStorage.getItem(this.TIMESTAMP_KEY);
    if (!saved){
        this.logout.logout();
        return;
    } 

    const storedTime = Number(saved);
    const now = Date.now();
    const diffMinutes = (now - storedTime) / (1000 * 60);

    if (diffMinutes >= this.EXPIRY_MINUTES || !this.isToday(storedTime)) {
      //console.warn('⚠️ LocalStorage expired — clearing all data.');
       this.logout.logout();
    }
  }

  
private isToday(timestamp: number): boolean {
  const date = new Date(timestamp);
  const now = new Date();

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}
}
