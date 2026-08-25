import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { RequestCancelService } from './services/common/request-cancel.service';

export const cancelInterceptor: HttpInterceptorFn = (req, next) => {
  const cancelService = inject(RequestCancelService);

  // All outgoing requests will be unsubscribed when cancelService.cancel$ emits
  return next(req).pipe(
    takeUntil(cancelService.cancel$)
  );
};
