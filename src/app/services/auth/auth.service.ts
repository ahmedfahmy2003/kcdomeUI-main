import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AuthResponse } from "../../models/authresponse";
import { Observable, catchError, firstValueFrom, throwError } from "rxjs";
import { tap } from 'rxjs/operators';
import { User } from "../../models/user";
import { LogoutService } from "./logout.service";
import { AppService } from "../common/common.service";
import { StorageService } from "./storage.service";
import { SessionService } from "../common/session.service";

@Injectable({
    providedIn: 'root'
})

export class AuthService{
    isLogged: boolean = false;
    private http = inject(HttpClient);
    private logout = inject(LogoutService);
    private app = inject(AppService);
    private readonly TIMESTAMP_KEY = 'appDataTimestamp';
    private storage = inject(StorageService);
    private sessionService = inject(SessionService);

    login(username: string, password: string){
        const data = {
            "id": 0,
            "companyId": 0,
            "status": "",
            "userId": 0,
            "userName": username,
            "applicationSource": "",
            "appId": 0,
            "appVersion": "",
            "browserName": "",
            "browserVersion": "",
            "logInTime": new Date(),
            "logInNote": "",
            "logOutTime": new Date(),
            "ipaddress": "",
            "machineName": "",
            "triedPassword": password,
            "blockIpaddress": true,
            "blockMachine": true,
            "killedBy": 0,
            "killedTime": new Date(),
            "killNote": "",
            "applicationID": 0
          };
        return this.http.put<AuthResponse>(
            this.app.geturl() + 'UserValidate/ValidateUser?Resources=Browser', data
        ).pipe(catchError(this.handleError), tap((res) => {
            this.handleCreateUser(res);
        }))
    }

    autoLogin(){
        const user = JSON.parse(localStorage.getItem('user')!);

        if(!user){
            this.logout.logout();
            return;
        }

        const loggedUser = new User(user._token, user._lang, user.userName, user.id, user.empID, user.errorMessage, user.applicationID, user.userLogId)

        if(!loggedUser.token){
            this.logout.logout();
            return;
        }
        this.storage.checkExpiry()
    }

    autoLogout(){
        this.logout.logout();
    }

    private handleCreateUser(res: AuthResponse){
        if(res && res.token){
            localStorage.setItem(this.TIMESTAMP_KEY, Date.now().toString());
            const user = new User(res.token, res.languageID, res.userName, res.id, res.empID, res.erroMessage, res.applicationID, res.userLogId);
            localStorage.setItem('lang', JSON.stringify(res.languageID))
            localStorage.setItem('user', JSON.stringify(user));
            this.sessionService.startSession();
        }
    }

    private handleError(err: { error: { error: { message: any; }; }; }){
        let errorMessage = 'An unknown error has occured';
        return throwError(() => errorMessage);
    }

}