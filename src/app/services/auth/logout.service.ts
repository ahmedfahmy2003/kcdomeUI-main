import { Injectable } from '@angular/core';
import { Store } from "@ngrx/store";
import * as StoreAction from '../common/store/store.action';
import { Router } from "@angular/router";
import { RequestCancelService } from '../common/request-cancel.service';
import { AppService } from '../common/common.service';

@Injectable({ providedIn: 'root' })
export class LogoutService {
    isLogged: boolean = false;
    constructor(private store: Store, private router: Router, private cancelService: RequestCancelService, private _http: AppService){

    }

    logout(){
        if(localStorage.getItem('user')){
            this._http.putClient('UserValidation/LogOut','').subscribe({
                next: (_res)=>{
                    //this.logoff();
                },error: (_e)=>{
                    //this.logoff();
                }
            });
            this.logoff();
        }
    }

    logoff(){
        
                this.cancelService.cancelAll();
                const theme = document.getElementById('theme');
                theme?.setAttribute('href','css/dashlite.css');
                this.isLogged = false;
                this.store.dispatch(StoreAction.closeAll())
                this.store.dispatch(StoreAction.activePage({active: '0'}))
                this.router.navigate(['/login']);
                localStorage.clear();
    }

    
    IsAuthenticated(){
        return this.isLogged;
    }
}