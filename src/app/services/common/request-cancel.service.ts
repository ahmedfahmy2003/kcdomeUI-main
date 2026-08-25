import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RequestCancelService {
  private cancelSubject = new Subject<void>();

  // expose observable for interceptors to use
  get cancel$() {
    return this.cancelSubject.asObservable();
  }

  // fire this on signout to cancel all pending requests
  cancelAll() {
    this.cancelSubject.next();
    // reset subject so future requests can be canceled again
    this.cancelSubject = new Subject<void>();
  }
}
