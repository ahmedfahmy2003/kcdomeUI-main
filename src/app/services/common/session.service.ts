import { inject, Injectable, OnDestroy } from '@angular/core';
import { fromEvent, merge, Subject, interval } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { LogoutService } from '../auth/logout.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class SessionService implements OnDestroy {

  private destroy$ = new Subject<void>();

  private toastr = inject(ToastrService);

  private SESSION_DURATION = 240 * 60 * 1000; // 240 min
  private WARNING_BEFORE = 1 * 60 * 1000;     // 1 min before expiry

  private lastActivityTime = Date.now();
  private expiryTime = 0;

  private hasChecked239 = false;
  
  private logout = inject(LogoutService);

  constructor() {}

  //Initialize session (call on login)
  startSession() {
    this.setExpiry();
    this.trackUserActivity();
    this.startWatcher();
  }

  //Set expiry in localStorage
  private setExpiry() {
    const now = Date.now();
    this.expiryTime = now + this.SESSION_DURATION;
    localStorage.setItem('expiryTime', this.expiryTime.toString());
    this.hasChecked239 = false;
  }

  //Track user activity using RxJS
  private trackUserActivity() {
    merge(
      fromEvent(document, 'click'),
      fromEvent(document, 'mousemove'),
      fromEvent(document, 'keydown')
    )
      .pipe(
        debounceTime(500),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.lastActivityTime = Date.now();
      });
  }

  //Watch timer
  private startWatcher() {
    interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const now = Date.now();

        const storedExpiry = Number(localStorage.getItem('expiryTime'));
        if (storedExpiry) {
          this.expiryTime = storedExpiry;
        }

        const alertTime = this.expiryTime - this.WARNING_BEFORE;

        // 239th minute check (only once)
        if (!this.hasChecked239 && now >= alertTime && now < this.expiryTime) {
          this.hasChecked239 = true;

          const inactiveDuration = now - this.lastActivityTime;
          const isActive = inactiveDuration < 60 * 1000; // active in last 1 min

          if (isActive) {
            console.log('User active → resetting session');
            this.setExpiry();
          } else {
            this.showWarning();
          }
        }

        if (now >= this.expiryTime) {
          this.logout.logout();
        }
      });
  }
  private showWarning() {
    this.toastr.warning('Session will expire in 1 minute due to inactivity');
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}