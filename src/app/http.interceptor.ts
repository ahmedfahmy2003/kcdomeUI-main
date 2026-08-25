import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { catchError, map, throwError } from "rxjs";
import { LogoutService } from "./services/auth/logout.service";
import { RequestCancelService } from "./services/common/request-cancel.service";

export const httpInterceptor: HttpInterceptorFn = (req, next)=>{
    const toastr = inject(ToastrService);
    const auth = inject(LogoutService);
    const cancelService = inject(RequestCancelService);

    return next(req).pipe(
        catchError((error) => {
            if(error.status === 401){
                cancelService.cancelAll();
                toastr.error("User session expired. Please login again!")
                auth.logout();
            }
            else if(error.status !== 200){
                toastr.error(error.message);
            }
        
            return throwError(() => error);

        }), map((response) => response)
    );
}