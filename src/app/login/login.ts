import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from '../services/common/common.service';
import { AuthService } from '../services/auth/auth.service';
import { Observable } from 'rxjs';
import { AuthResponse } from '../models/authresponse';
import { LogoutService } from '../services/auth/logout.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  show_password: boolean = false;
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  form = new FormGroup({
    username: new FormControl({value: '', disabled: this.isLoading()}, [Validators.required]),
    password: new FormControl({value: '', disabled: this.isLoading()}, [Validators.required]),
  });
  activeRoute: ActivatedRoute = inject(ActivatedRoute);
  authService: AuthService = inject(AuthService);
  logout: LogoutService = inject(LogoutService);
  router: Router = inject(Router);
  authObs: Observable<AuthResponse> | undefined;
  version = signal<string>('');
  copyright = signal<string>('');

  constructor(private _http: AppService){

  }

  get f() {
    return this.form.controls;
  }

    ngOnInit(){
      
    this.version.set(this._http.version);
    this.copyright.set(this._http.copyright)
    this.activeRoute.queryParamMap.subscribe((queries) => {
      const logout = Boolean(queries.get('logout'));
      if(logout){
        this.logout.logout();
      }else{
        if(localStorage.getItem('user')){
          const user = JSON.parse(localStorage.getItem('user') || '');
          if(user && user.id  && user._token){
            this.router.navigate(['/dashboard']);
          }
        }else{
            this._http.getSignalrURL('ping').subscribe({
                next:(_res: any)=>{
                }
            });
        }
      }
    })
  }

  loginFormSubmit(){
    const username = this.form.controls.username.value || '';
    const password = this.form.controls.password.value || '';
    this.isLoading.set(true);
    this.authObs = this.authService.login(username, password);
    
    this.authObs.subscribe({
      next: (res) => {      
        this.isLoading.set(false);
        if(res.token){
          this.router.navigate(['/dashboard']);
          this._http.setLanguage.next(res.languageID);
        }else{
          this.errorMessage.set(res.erroMessage);  
        }
      },
      error: (errMsg) => { 
        this.isLoading.set(false);
        this.errorMessage.set(errMsg);
      }
    })
  }

  pwdToggle(){
    this.show_password = !this.show_password
  }
}
