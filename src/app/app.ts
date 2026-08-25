import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { AuthService } from './services/auth/auth.service';
import { RouterOutlet } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { RequestCancelService } from './services/common/request-cancel.service';
import { licenseKey } from '../devextreme-license';
import config from 'devextreme/core/config';
import { Loader } from './common/loader/loader';
import { AppService } from './services/common/common.service';
if (licenseKey) {
  config({ licenseKey });
}
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Loader],
  providers: [AuthService],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('kcdome');
  isOnline = signal(navigator.onLine);
  toastmsg: import("ngx-toastr").ActiveToast<any>;

  constructor(private auth: AuthService, private _http: AppService, private toastr: ToastrService, private cancelService: RequestCancelService){
    window.addEventListener('online', () => this.isOnline.set(true));
    window.addEventListener('offline', () => this.isOnline.set(false));

    // Reactively run side-effects
    effect(() => {
      if (!this.isOnline()) {
        if(this.toastmsg){
          this.toastr.clear();
        }
        this.cancelService.cancelAll();
        this.toastmsg  = this.toastr.error('Internet disconnected!');
      }else{
        if(this.toastmsg){
          this.toastr.clear();
        }
      }
    });
  }

  ngOnInit(): void {
    setInterval(()=>{
      this._http.getSignalrURL('ping').subscribe({
                next:(_res)=>{
                }
            });
    }, 60000)
    this.auth.autoLogin();
  }
}
