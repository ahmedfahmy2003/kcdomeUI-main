import { CommonModule } from '@angular/common';
import { Component, EventEmitter, input, Input, Output, output, inject, AfterViewInit, ElementRef, ViewChild, signal, effect, DestroyRef } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppService } from '../../services/common/common.service';
import { ToastrService } from 'ngx-toastr';
import { select, Store } from '@ngrx/store';
import * as StoreAction from "../../services/common/store/store.action";
import { CallingMenu } from '../../dashboard/menu-grids/common/calling-menu/calling-menu';
import { NumberDirective } from '../../directive/decimalNumberOnly';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { MatMenuModule } from '@angular/material/menu';
import { ModalService } from '../../services/common/modal.service';
import {MatTooltipModule} from '@angular/material/tooltip';
import { LoaderService } from '../../services/common/loader.service';
import { ApiResponse } from '../../shared/interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'input-fields',
  templateUrl: './input-fields.html',
  styleUrl: './input-fields.scss',
  standalone: true,
  imports: [CommonModule, FormsModule, NumberDirective, ReactiveFormsModule, CallingMenu, MatAutocompleteModule, MatMenuModule, MatTooltipModule]
})
export class InputFields {
  @Input() fieldname: string;
  field = signal<any>({});
  descEn: string;
  @Input() set _field (value: any){
    this.field.set(value);
    this.descEn = value.descEn;
  }
  get _field(): any{
    return this.field;
  }
  rreadonly = input<boolean>();
  @Input() precordid: number;
  setfieldVal = output<any>({});
  setUpdateList = output<any>({});
  @Output() callActionField = new EventEmitter;
  @Output() actionfieldVal = new EventEmitter;
  @Output() keypressevent = new EventEmitter;
  @Input() fieldActionBody: any;
  @Input() pageType: any;
  @Input() actionStop: boolean;
  @Input() recordId: any;
  companyID = input<number>(0);
  @Input() recordList: any;
  @Input() activeRecord: number;
  @Input() getlookupvalbool: boolean;
  @ViewChild('input') vc: ElementRef<HTMLInputElement>;
  @Input() ids: any;
  readOnly = input<boolean>();
  inlineEdit = input<boolean>();

  public columns:any = [];
  public dataSourceRaw: any;
  public dataSource = signal<any>([]);
  optionslist = signal<any>([]);
  autooptionslist = signal<any>([]);
  itemsOptions: any = [];
  modalRef: HTMLDivElement;
  pageSize = signal<number>(100);
  currentPage = signal<number>(1);
  noData = signal<boolean>(false);
  totalItems = signal<number>(0);
  totalPages = signal<number>(0);
  goTo: number = 0;
  modalShow: boolean = true;
  dataKeys: any;
  mulitSelectList = signal<any>([]);
  @Input() menuId: number;
  @Input() pmenuid: number;
  largeRow = signal<boolean>(false);
  query: string;
  search: string;
  private store = inject(Store);
  addNew = signal<boolean>(false);
  bgColor: string;
  initalValue: any = null;
  valChanged: boolean = false;
  file: File;
  fileName: string;
  fileSize: any;
  keyTab: boolean = false;
  @Input() set _keyTab(value: boolean){
    this.keyTab = value;
    if(this.keyTab){
      setTimeout(()=>{
        this.vc.nativeElement.focus();
      },10)
    }
  }
  get _keyTab(): boolean{
    return this.keyTab;
  }
  recordStamp = new Date().getTime();
  pageLoaded: boolean = false;
  dateFormat: any;
  constructor(private _http: AppService, private toastr: ToastrService, public modal: ModalService, public loader: LoaderService, private destroyRef: DestroyRef) {
  this.dateFormat = this._http.getDateFormat();
   effect(()=>{
   
    if(!this.pageLoaded){
      this.oninit();
    }
   })
  }
  
  oninit() {
    this.pageLoaded = true;
    if(this.field().FieldVal){
      this.initalValue = this.field().FieldVal
    }
    if(this.field().BackColor){
      const red = (this.field().BackColor >>> 16) & 0xFF;    // Shift right by 16 bits and mask to get the red component
      const green = (this.field().BackColor >>> 8) & 0xFF;   // Shift right by 8 bits and mask to get the green component
      const blue = this.field().BackColor & 0xFF;   

      this.bgColor = 'rgba('+red+','+green+','+blue+', 1)';
    }

    if(this.fieldActionBody && this.field().FieldType === "LookUp" && this.field().DefaultValue && (this.field().updateList || this.optionslist().length === 0)){ //"Editor"
      this.field.update(f => ({ ...f, updateList: false }));
      this.setUpdateList.emit({value: this.field().updateList});
      const lang = JSON.parse(localStorage.getItem('lang') || '');
      const user = JSON.parse(localStorage.getItem('user') || '');
      let size = 1000;
      let pid = 0;
      let prid = 0;
      if(this.recordList && this.recordList.parentPageID !== this.menuId){
        pid = this.pmenuid ? this.pmenuid : this.recordList.parentPageID
      }
      else{
        pid = this.menuId
      }

      if(this.precordid && this.precordid !== this.recordId){
        prid = this.precordid
      }else if(this.recordId){
        prid = this.recordId
      }
      let url = "SystemFields/GetDataFields?fieldID="+ this.field().Id+"&pMenuId="+pid+"&precordID="+prid+"&isFilterApply=true";
      //this.loader.show();
      
      let params = {
        "menuID": this.menuId,
        "userID": user.id,
        "companyID": this.companyID(),
        "languageID": lang,
        "applicationID": user.applicationID,
        "queryfields": this.fieldActionBody,
        "pageNumber": 1,
        "pageSize": size
      }
      this._http.putClient<any, ApiResponse>(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (response) => { 
         // this.loader.hide();
          if(response.erroMessage){
            this.toastr.error(response.erroMessage);
          }
          else if(response.dataModel && response.dataModel.length > 0){
              if(response.rowCount > 1000){
                this.largeRow.set(true);
              }else{
                this.largeRow.set(false);
              }
              if(!this.recordId && this.optionslist().length === 0 ){
                const arr = this.optionslist();
                arr.map((x: any)=>{
                  if(x.ID === "SR"){
                    this.field.update(f => ({ ...f, FieldVal: x.ID }));
                    this.setfieldVal.emit({value: this.field().FieldVal, type: this.field().FieldType});
                    if(this.field().IsActionField){
                      this.getActionFieldVal();
                    }
                  }
                })
            
              }
              
              this.optionslist.set(response.dataModel);
          }
        },
        error: (_e)=>{
          //this.loader.hide();
          //
        }
      })
    }
  
  }

  ngAfterViewInit() {   
    if(this.inlineEdit()){     
      setTimeout(()=>{
        this.vc.nativeElement.focus();
      },10)
    }
  }

  updateGoto(){
    this.goTo = this.currentPage() || 1;
    this.totalPages.set(Math.ceil(this.totalItems() / this.pageSize()))
  }

  sizeChange(){
    this.currentPage.set(1);
    this.openLookUp(this.currentPage(), this.pageSize());
  }

  goToPage(page: number){
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
    this.openLookUp(this.currentPage(), this.pageSize());
  }

  numbersOnly(event: any){
    const pattern = /[0-9\+\-\ ]/;

    let inputChar = String.fromCharCode(event.charCode);
    if (event.keyCode != 8 && !pattern.test(inputChar)) {
      event.preventDefault();
    }
    if(this.currentPage() < 1){
      setTimeout(()=>{
        this.currentPage.set(1);
      },50)
      
      event.preventDefault();
    }
    else if (this.currentPage() > this.totalPages()) {
      setTimeout(()=>{
        this.currentPage.set(this.totalPages());
      },50)
      event.preventDefault();
    }
  }

  openLookUp(currentPage: number, pageSize: number){
    const lang = JSON.parse(localStorage.getItem('lang') || '');
    const user = JSON.parse(localStorage.getItem('user') || '');

    let pid = 0;
    let prid = 0;
    
    if(this.recordList && this.recordList.parentPageID !== this.menuId){
      pid = this.pmenuid ? this.pmenuid : this.recordList.parentPageID
    }
    else{
      pid = this.menuId
    }

    if(this.precordid && this.precordid !== this.recordId){
      prid = this.precordid
    }else if(this.recordId){
      prid = this.recordId
    }
      let url = "SystemFields/GetDataFields?fieldID="+ this.field().Id+"&pMenuId="+pid+"&precordID="+prid+"&isFilterApply=true";
      this.loader.show();
   
      let params:any = {
        "menuID": this.menuId,
        "userID": user.id,
        "companyID": this.companyID(),
        "languageID": lang,
        "applicationID": user.applicationID,
        "queryfields": this.fieldActionBody,
        "pageNumber": currentPage,
        "pageSize": pageSize
      }
      if(this.query){
        params["filterCondition"] = this.query
      }
    this.noData.set(false);
    this._http.putClient<any, ApiResponse>(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => { 
        this.loader.hide();
        if(response.erroMessage){
          this.toastr.error(response.erroMessage);
        }
        else if(response.dataModel && response.dataModel.length > 0){
          this.dataSourceRaw = response.dataModel;
          this.dataSource.set(this.dataSourceRaw);
          this.totalItems.set(response.rowCount);
          this.optionslist.set(response.dataModel);
          this.updateGoto();
          this.columns = [];
          this.itemsOptions = [];
          this.itemsOptions = [10];
          if(this.totalItems() > 10){
            this.itemsOptions.push(30)
          }

          if(this.totalItems() > 30){
            this.itemsOptions.push(50)
          }

          if(this.totalItems() > 50){
            this.itemsOptions.push(100)
          }

          if(this.totalItems() > 100){
            this.itemsOptions.push(1000)
          }
          if(this.totalItems() > 1000){
            this.itemsOptions.push(this.totalItems)
          }

          this.dataKeys = Object.keys(this.dataSourceRaw[0]);
          this.dataSource.update(arr => arr.map((e: any, i: number)=>({
            ...e,
            sno: i+1
          })))
          
          this.dataKeys.forEach((e:any)=>{
              this.columns.push({
                header: e,
                name: e
              })
          })
          this.modal.show(this.field().FieldName+this.recordStamp);
        }else{
          if(this.query){
            this.noData.set(false);
          }else{
            this.noData.set(true);
            this.totalItems.set(response.rowCount);
          }
          this.dataSourceRaw = response.dataModel;
          this.dataSource.set(this.dataSourceRaw);
          this.modal.show(this.field().FieldName+this.recordStamp);
        }
      },
      error: (_errMsg) => {
         this.loader.hide();
      }
    })
  }

  clearLookUp(){
    this.field.update(f => ({ ...f, FieldVal: null, descEn: null }));
    this.descEn = '';
    this.setfieldVal.emit({value: null, type: this.field().FieldType, descEn: ''});
    if(this.field().IsActionField){
      this.getActionFieldVal();
    }
  }

  autoSelect(e: any){
    this.dataSourceRaw = this.autooptionslist();
    this.setVal(e);
    this.autooptionslist.set('');
  }

  setVal(i: number){
    let a = this.dataSourceRaw[i];
    let fieldVal = a[this.field().ListId];
    let descEn = this.dataSourceRaw[i].UserName ? this.dataSourceRaw[i].UserName : this.dataSourceRaw[i].DescriptionEn ? this.dataSourceRaw[i].DescriptionEn : this.dataSourceRaw[i].FullNameEn ? this.dataSourceRaw[i].FullNameEn : this.dataSourceRaw[i].Code ? this.dataSourceRaw[i].Code : this.dataSourceRaw[i].DeliveryLocation ? this.dataSourceRaw[i].DeliveryLocation :  this.dataSourceRaw[i].ID;
    let c = typeof descEn;
    if(descEn && c === 'string'){
      this.field.update(f => ({ ...f, FieldVal: fieldVal, descEn: descEn.trim() }));
    }else{
      this.field.update(f => ({ ...f, FieldVal: fieldVal, descEn: descEn }));
    }
    this.descEn = this.field().descEn;
    if(this.vc){
      this.vc.nativeElement.value  = this.field().descEn;
    }
    this.setfieldVal.emit({value: this.field().FieldVal, type: this.field().FieldType, descEn: this.descEn});

    if(this.field().IsActionField){
      this.getActionFieldVal();
    }
    if(this.modal){
      this.closeModal();
    }
  }

  setMultiSelect(i: number){
    if(this.mulitSelectList().length === 0){
      this.mulitSelectList.update(e=>[...e, this.dataSourceRaw[i]]);
    }
    else{
      const index = this.mulitSelectList().findIndex((x:any) => x.ID === this.dataSourceRaw[i].ID);
      if(index < 0){
        this.mulitSelectList.update(e=>[...e, this.dataSourceRaw[i]]);
      }
    }
  }

  removeBadge(i: number){
    this.mulitSelectList().splice(i, 1);
  }

  addBadge(){
    const list = this.mulitSelectList();
    let a = list.map((x: any) => x.ID);
    let b = list.map((x: any) => x.DescriptionEn);

    this.field.update(f => ({ ...f, FieldVal: a.toString().replaceAll(',',', '), descEn: b.toString().replaceAll(',',', ') }));
    this.descEn = this.field().descEn;
    this.setfieldVal.emit({value: this.field().FieldVal, type: this.field().FieldType, descEn: this.descEn});
    this.closeModal();
  }

  inputKeypress(e: any){
    this.keypressevent.emit(true);
  }

  inputVal(e: any){
    if(this.initalValue !== this.field().FieldVal){
      this.valChanged = true;
      if(!this.recordId){
        this.initalValue = e;
      }
      if(this.field().FieldType === "Number" && this.field().FieldVal){
        let fieldVal = parseFloat(this.field().FieldVal.replace(/[^0-9.]/g, ''));
        this.field.update(f => ({ ...f, FieldVal: fieldVal }));
      }

      this.setfieldVal.emit({value: this.field().FieldVal, type: this.field().FieldType});
      if(this.field().IsActionField && (this.field().FieldVal || this.field().FieldVal === false || this.field().FieldVal === 0 || this.field().FieldVal === '0')){
        this.callActionField.emit({action: true, id: this.field().Id});
      }
    } 
    else if(this.valChanged){
      this.valChanged = false;
      this.setfieldVal.emit({value: this.field().FieldVal, type: this.field().FieldType});
      if(this.field().IsActionField && (this.field().FieldVal || this.field().FieldVal === false || this.field().FieldVal === 0 || this.field().FieldVal === '0')){
        this.callActionField.emit({action: true, id: this.field().Id});
      }
    }
  }

  setInputVal(e: any){
    let v: any = e.target.value;
    this.keypressevent.emit(false);
    if(this.initalValue !== this.field().FieldVal){
      if(!this.recordId){
        this.initalValue = v;
      }
      if(this.field().FieldType === "Number" && (this.field().FieldVal || this.field().FieldVal === 0 || this.field().FieldVal === '0')){
        let fieldVal = Number(parseFloat(this.field().FieldVal).toFixed(6));
        this.field.update(f => ({ ...f, FieldVal: fieldVal }));
      }
      
      this.setfieldVal.emit({value: this.field().FieldVal, type: this.field().FieldType});
      if(this.field().IsActionField && (this.field().FieldVal || this.field().FieldVal === false || this.field().FieldVal === 0 || this.field().FieldVal === '0')){
        this.callActionField.emit({action: false, id: this.field().Id});
        this.initalValue = v;
        this.getActionFieldVal();
      }
    }
  }

  getActionFieldVal(){
    setTimeout(()=>{
      const lang = JSON.parse(localStorage.getItem('lang') || '');
      const user = JSON.parse(localStorage.getItem('user') || '');
      let url = "SystemFields/GetDataFieldsQueryExecutions";
      //this.loader.show();
      let params= {
        "menuID": this.menuId,
        "pMenuID": this.pmenuid ? this.pmenuid : this.recordList.parentPageID,
        "fieldID": this.field().Id,
        "userID": user.id,
        "languageID": lang,
        "companyID": this.companyID(),
        "recordID": this.recordId ? this.recordId : 0,
        "pRecordID": this.precordid,
        "applicationID": user.applicationID,
        "queryfields": this.fieldActionBody,
      }

      this._http.putClient<any, ApiResponse>(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: (response) => { 
           // this.loader.hide();
            if(response.erroMessage){
            this.toastr.error(response.erroMessage);
            }
            else if(response.dataModel && response.dataModel.length > 0){
              let model = response.dataModel;
              this.actionfieldVal.emit(model);
            }
          },
          error: (_e)=>{
            
          }
      })
    },500)
  }

  closeModal(){
    this.modal.hide();
    if(this.modal.iscOpen(this.ids)){
      const kcdome = document.getElementById('kcdome');
      kcdome?.classList.add('modal-open');
    }
    this.currentPage.set(1);
    this.query = '';
    this.dataSourceRaw = '';
    document.querySelectorAll(".filtertSearch").forEach((x:any) => x.value = '');
  }

  applyFilter(event: Event, field: string, type: string) {
    let a = (event.target as HTMLInputElement).value;
    const filterValue = a.trim();
    if(!this.query && filterValue){
      this.query = field +" like '%"+filterValue+"%'";
    }
    else if(this.query && filterValue){
      let a = this.query.split(" ");
      if(!a.includes(field)){
        this.query =  this.query + " and " + field +" like '%"+filterValue+"%'";
      }else{
        let i =  a.findIndex((x:any)=> (x === field))
        if(i === 0){
          let matches:any = this.query.match(/\%(.*?)\%/);
          this.query = this.query.replace(matches[i], "%"+filterValue+"%").trim();
        } else {   
          for(let j = i+3 ; j < a.length; j++){
            this.query = this.query.replace(a[j]," ").trim();
          }
          this.query = this.query.replace(a[i+2],"'%"+filterValue+"%'").trim();
        }
      }
    }
    else if(this.query && !filterValue){
      let a = this.query.split(" ");
      if(a.includes(field)){
        let i =  a.findIndex((x:any)=> (x === field));
        this.query = this.query.replace(a[i+2], "").trim();
        if(i !== 0){
          let b = ' and '+ a[i]+' like';
          this.query = this.query.replace(b, "").trim();
        } else {   
          this.query = this.query.replace(a[i]+' like', "").trim();
          if(a.length > 2){
            this.query = this.query.replace('and ', "").trim();
          }
        }
      }
    }else{
      this.query = '';
    }

    if(type === 'enter'){
      this.openLookUp(1, this.pageSize());
    }
  }

  autoFilter(_e: any){
    if(this.descEn.length > 2){
      const lang = JSON.parse(localStorage.getItem('lang') || '');
      const user = JSON.parse(localStorage.getItem('user') || '');
      let query;
      if(this.field().SearchQuery){
        query = this.field().SearchQuery.replaceAll("[v]", this.descEn);
      }else if(this.field().ListId){
        query = this.field().ListId + " like '%" +this.descEn+"%'";
      }
      let url = "SystemFields/GetDatafieldsSearchText";
      
        //this.loader.show();
        this.fieldActionBody['CompanyID'] = this.companyID();
        if(query){
          let params = {
            "menuID": this.menuId,
            "pMenuID": this.pmenuid ? this.pmenuid : this.recordList.parentPageID,
            "fieldID": this.field().Id,
            "userID": user.id,
            "languageID": lang,
            "companyID": this.companyID(),
            "recordID": this.recordId,
            "pRecordID": this.precordid,
            "applicationID": user.applicationID,
            "queryfields": this.fieldActionBody,
            "filterCondition": query
          }
          this._http.putClient<any, ApiResponse>(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (response) => { 
              //this.loader.hide();
              if(response.dataModel && response.dataModel.length > 0){
                this.autooptionslist.set(response.dataModel);
              }else{
                this.autooptionslist.set([]);
              }
            },
            error: (_e)=>{
              //this.loader.hide();
            }
          })
        }

    }
  }

  openPage(page: any){
    let u:any;
    this.store.pipe(select('list')).subscribe(data=>{
      let menulist = data.list;
      u = menulist.filter((x:any)=> x.ID === page.LinkedMenuId);
    });
    let items = {id: page.LinkedMenuId+'-m', dtid: '', pwfid: page, name: u[0].MenuName, pageType: 'mainmenu', menuType: page.menuType, record: '', isKeyManualInput: null, isJobEnable: page.isJobEnable, disableClose: false};
    this.store.dispatch(StoreAction.addPage({menu: items}))
    this.store.dispatch(StoreAction.activePage({active: page.LinkedMenuId+'-m'}))
  }

  openAdd(){
    this.addNew.set(true);
  }

  handleFileInput(event: any){
    this.file = event.target.files[0];
    event.target.value = '';
    this.fileName = this.file.name;

    let a = this.fileName.split('.');
    let ext = a[1].toLowerCase();
    let b = ['jpg','jpeg','gif','png','jfif'];
    let c = b.includes(ext)
    if(a.length > 2){
      this.toastr.error('Filename must have only one dot');
    }
    else if(!c){
      this.toastr.error('File type not allowed');
      this.fileName = '';
      this.fileSize = '';
    }else if(this.file.size > 9437184){
      this.toastr.error('Max file size 9mb');
      this.fileName = '';
      this.fileSize = '';
    }else{
      const reader: any = new FileReader();
      reader.readAsDataURL(this.file);
      reader.onload = () => {
        let a = reader.result.split('base64,');
        this.field.update(f => ({ ...f, FieldVal: a[1] }));
        this.setfieldVal.emit({value: this.field().FieldVal, type: this.field().FieldType});
      };
    }
  }

  modalEmitEvent(e: any){
    this.addNew.set(false);
  }
}