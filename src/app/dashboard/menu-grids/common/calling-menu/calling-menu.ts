import { AfterViewInit, Component, EventEmitter, input, Input, Output, forwardRef, signal, output, DestroyRef } from '@angular/core';
import { DetailsPage } from '../details-page/details-page';
import { AppService } from '../../../../services/common/common.service';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import {Modal} from 'bootstrap';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiResponse } from '../../../../shared/interface';

@Component({
  selector: 'calling-menu',
  standalone: true,
  imports: [CommonModule, forwardRef(()=> DetailsPage)],
  templateUrl: './calling-menu.html',
  styleUrl: './calling-menu.scss'
})
export class CallingMenu implements AfterViewInit {
  @Input() callingMenuData: any;
  @Input() recordList: any;
  companyID = input<number>(0);
  @Input() page: any;
  readonly = input<boolean>(false);
  modalEmit = output<string>();
  deletedRecord = output<any>({});
  @Input() type: string;
  @Input() stringID: string;
  @Input() menuid: number;
  @Input() pmenuid: number;
  @Input() ids: string;
  mrEnabledStatus = input<boolean>();
  wfEnabledStatus = signal<boolean>(false);
  @Input() set _wfEnabledStatus(value: boolean){
    this.wfEnabledStatus.set(value);
  }
  get _wfEnabledStatus(): boolean{
    return this.wfEnabledStatus();
  }
  wfStatus: string;
  @Input() set _wfStatus(value: string){
    this.wfStatus = value;
  }
  get _wfStatus(): string{
    return this.wfStatus;
  }
  menuId = signal<number>(0);
  fieldVal: any;
  printBTN: any = [];
  actionBTN: any = [];
  menus = signal<any>('');
  recordId = signal<number>(0);
  modal: Modal;

  constructor(private _http: AppService, private toastr: ToastrService, private destroyRef: DestroyRef){
    
  }

  ngAfterViewInit(){
    if(this.type === 'callingMenu'){
      this.menuId.set(this.callingMenuData.calledMenuId);
      this.recordId.set(parseInt(this.stringID));
    }
    else if(this.type === 'addNew'){
      this.menuId.set(this.menuid);
    }
    this.getmenuFields();
    let m: any = document.getElementById(this.ids);
    this.modal = new Modal(m, {
      keyboard: false,
      backdrop: 'static'
    });

    this.modal.show();
  }

  closeNewRecordEvent(e: any){
    if(e.type === 'saveclose'){
      this.closeModal();
    }
  }

  closeModal(){
    this.modal.hide();
    this.modalEmit.emit('close')
  }

  getmenuFields() {
    const user = JSON.parse(localStorage.getItem("user") || '');
    const lang = localStorage.getItem("lang") || '';
    const url = 'SystemFields/GetsysFieldData?id=' + this.menuId() +"&languageid="+lang+'&userid='+user.id+'&companyid='+this.companyID()+'&applicationid='+user.applicationID;
    this._http.getClient<ApiResponse>(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        let response = res.dataModel;
        if(response){
          this.fieldVal = response.filter((x:any)=> x.Visible === true);
          this.fieldVal.forEach((x: any) => {
            if (x.FieldType === "BTN" && x.Visible) {
              if (x.ShowInPrint) {
                this.printBTN.push(x);
              } else {
                this.actionBTN.push(x);
              }
            }
          })
          this.menus.set(JSON.stringify(this.fieldVal));
        }else{
          if(res.erroMessage){
            this.toastr.error(res.erroMessage);
          }
        }
      },
      error: (_errMsg) => {

      }
    });
  }

  deletedRecordEvent(event: any){
    this.deletedRecord.emit(event)
  }

}
