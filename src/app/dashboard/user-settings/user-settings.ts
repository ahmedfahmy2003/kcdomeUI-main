import { Component, DestroyRef, EventEmitter, Input, OnInit, Output, signal } from "@angular/core";
import { AppService } from "../../services/common/common.service";
import { AuthService } from "../../services/auth/auth.service";
import { ToastrService } from "ngx-toastr";
import { FormsModule } from "@angular/forms";
import { ModalService } from "../../services/common/modal.service";
import { LogoutService } from "../../services/auth/logout.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ApiResponse } from "../../shared/interface";

@Component({
    selector: 'user-settings',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './user-settings.html',
    styleUrl: './user-settings.scss'
})

export class UserSettings implements OnInit {
  @Input() page: any;
  @Output() closeSettingsPage = new EventEmitter;
  userData = signal<any>({});
  currentPwd = signal<string>('');
  newPwd = signal<string>('');
  confirmPwd = signal<string>('');
  changeclick = signal<boolean>(false);
  pwdMismatch = signal<boolean>(false);
  pwdErrosMsg = signal<string>('');
  samePwd = signal<boolean>(false);

  constructor(private destroyRef: DestroyRef, public _http: AppService, private auth: AuthService, private toastr: ToastrService, public modal: ModalService, private logout: LogoutService){

  }

  ngOnInit() {
    let user = JSON.parse(localStorage.getItem('user') || '');
    let url = "Users/GetAllDataSysUser?filter=id="+user.id
    this._http.getClient<ApiResponse>(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res)=>{
        let response = res;
        if(response.dataModel && response.dataModel.length > 0){
          if(response.dataModel[0]['languageId'] === null){
            response.dataModel[0]['languageId'] = 1;
          }
          this.userData.set(response.dataModel[0]);
        }
      },
      error: (_e)=>{

      }
    })
  }

  pwdModal(){
    this.modal.show('pwdmodal');  
  }

  closeModal(){
    this.modal.hide();
  }

  pwdInput(_e: any){
    this.changeclick.set(false);
    this.pwdMismatch.set(false);
    this.pwdErrosMsg.set('');
    this.samePwd.set(false);
  }

  changePwd(){
    this.changeclick.set(true);
    if(this.currentPwd() && this.newPwd() && this.confirmPwd()){
      if(this.newPwd() === this.currentPwd()){
        this.samePwd.set(true);
      }
      else if(this.newPwd() === this.confirmPwd()){
        let user = JSON.parse(localStorage.getItem('user') || '');
        let url = 'UserValidation/ChangePassword?userid='+user.id+'&CurrentPassword='+this.currentPwd()+'&NewPassword='+this.newPwd();
        this._http.getClient<ApiResponse>(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next:(response)=>{
            if(response.erroMessage){
              this.pwdErrosMsg.set(response.erroMessage);
            }else{
              this.modal.hide();
              this.logout.logout();
            }
          },
          error: (_e)=>{
          }
        })
      }
      else{
        this.pwdMismatch.set(true);
      }
    }
  }

  closeSettings(){
    this.closeSettingsPage.emit(true);
  }

  saveSettings(){
    let user = JSON.parse(localStorage.getItem('user') || '');
    let url = 'Users/UpdateSysUserRecord';

    let params = {
      "id": user.id,
      "companyId": this.userData().companyId,
      "userGroupId": this.userData().userGroupId,
      "fullInquiriesFlag": this.userData().fullInquiriesFlag,
      "settingAdminFlag": this.userData().settingAdminFlag,
      "fullAdminFlag": this.userData().fullAdminFlag,
      "developerFlag": this.userData().developerFlag,
      "languageId": this.userData().languageId,
      "userCode": this.userData().userCode,
      "userName": this.userData().userName,
      "email": this.userData().email,
      "mobile": this.userData().mobile,
      "address": this.userData().address,
      "showCloseMessage": this.userData().showCloseMessage,
      "doubleClick": this.userData().doubleClick,
      "userImage": this.userData().userImage,
      "note": this.userData().note,
      "localIpaddress": this.userData().localIpaddress,
      "globalIpaddress": this.userData().globalIpaddress,
      "machineName": this.userData().machineName,
      "secondAuthentication": this.userData().secondAuthentication,
      "emailCodeFlag": this.userData().emailCodeFlag,
      "mobileSn": this.userData().mobileSn,
      "startDate": this.userData().startDate,
      "endDate": this.userData().endDate,
      "startTime": this.userData().startTime,
      "endTime": this.userData().endTime,
      "mobileAccess": this.userData().mobileAccess,
      "allowChangeSetting": this.userData().allowChangeSetting,
      "fontSize": this.userData().fontSize,
      "gridFontSize": this.userData().gridFontSize,
      "active": this.userData().active,
      "userType": this.userData().userType,
      "selfRegistered": this.userData().selfRegistered,
      "secondAuthByEmail": this.userData().secondAuthByEmail,
      "userTimeZone": this.userData().userTimeZone,
      "createdSource": this.userData().createdSource,
      "tempPassword": this.userData().tempPassword,
      "emailSignature": this.userData().emailSignature,
      "allowLabelEditing": this.userData().allowLabelEditing
    }

    this._http.putClient<any, ApiResponse>(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response)=>{
        if(response.successMessage){
          this.toastr.success(response.successMessage);
        }
      }
    })
  }
}
