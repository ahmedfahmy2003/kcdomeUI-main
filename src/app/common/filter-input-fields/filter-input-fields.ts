import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy, ChangeDetectorRef, signal, Inject, input, forwardRef, ComponentRef, ViewChild, ViewContainerRef, DestroyRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppService } from '../../services/common/common.service';
import { ToastrService } from 'ngx-toastr';
import { FilterOperator } from './filter-operator/filter-operator';
import { MatSelectModule } from '@angular/material/select';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, provideMomentDateAdapter } from '@angular/material-moment-adapter';
import {MatDatepickerInputEvent, MatDatepickerModule} from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_LOCALE} from '@angular/material/core';
import {MatInputModule} from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ModalService } from '../../services/common/modal.service';
import { FilterBox } from '../filter-box/filter-box';
import { Modal } from 'bootstrap';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiResponse } from '../../shared/interface';

@Component({
  selector: 'filter-input-fields',
  standalone: true,
  providers: [{provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } } ,{provide: MAT_DATE_LOCALE, useValue: 'en-IN'}, provideMomentDateAdapter(undefined, {useUtc:true})],
  imports: [CommonModule, FormsModule, FilterOperator, forwardRef(() => FilterBox), MatSelectModule, MatDatepickerModule, MatIconModule, MatInputModule],
  templateUrl: './filter-input-fields.html',
  styleUrl: './filter-input-fields.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterInputFields {
  @ViewChild('filterBox', { read: ViewContainerRef }) filterBox!: ViewContainerRef;
  filterBoxSub = new Map<number, ComponentRef<FilterBox>>();
  field: any;
  @Output() setfieldVal = new EventEmitter;
  @Output() setEnterPress = new EventEmitter;
  @Output() subQueryEmit = new EventEmitter;
  companyID = input<number>(0);
  @Input() menuid : number;
  @Input() recordList: any;
  filterApply: boolean = false;
  filterValue: any;
  filterboxID: any;
  query: any;
  sysList: any;
  replace: any;
  fieldActionBody: any = {};
  largeRow: boolean = false;
  optionslist = signal<any>([]);
  optionslistRaw: any = [];
  mulitSelectList: any = [];
  modalRef: HTMLDivElement;
  pageSize = signal<number>(100);
  currentPage = signal<number>(1);
  noData = signal<boolean>(false);
  totalItems = signal<number>(0);
  totalPages = signal<number>(0);
  modalid = signal<any>('');
  subQuery = signal<string>('');
  sqReplace: any;
  filterQuery: any;
  goTo: number = 0;
  itemsOptions: any = [];
  public columns:any = [];
  public dataSourceRaw: any;
  public dataSource = signal<any>([]);
  dataKeys: any;
  filteroperator: string = "like";
  searchText = signal<string>('');
  filteredOptions: any = [];
  multiSelectOption = signal<boolean>(false);
  lookupSelected = signal<any[]>([]);
  recordStamp = new Date().getTime();
  fieldval: any;
  subid: any;
  bmodal: Modal;
  bmodalShow: boolean = true;
  @Input() set _field(value: any){
    this.field = value;
    if(this.field && (this.field.FieldType === "GridTab" || this.field.FieldType === "GridView")){
      this.subid = value.LinkedMenuId;
      this.modalid.set(value.ID);
      this.getsub(this.field);
    }
  }

  constructor(private destroyRef: DestroyRef, private changeDetectorRef: ChangeDetectorRef, private _http: AppService, private toastr: ToastrService, private _adapter: DateAdapter<any>, @Inject(MAT_DATE_LOCALE) private _locale: string, public modal: ModalService) {

  }

  ngOnInit() {
    if(this.field.FieldType === "LookUp"){
      const lang = JSON.parse(localStorage.getItem('lang') || '');
      const user = JSON.parse(localStorage.getItem('user') || '');
      let size = 1000;
      let pid = this.recordList && this.recordList.parentPageID ? this.recordList.parentPageID : this.menuid;
      let url = "SystemFields/GetDataFields?fieldID="+ this.field.FieldID +"&pMenuId="+pid+"&precordID=0&isFilterApply=false";

      this.fieldActionBody['CompanyID'] = this.companyID();
    
      let params = {
        "menuID": this.menuid,
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
          if(response.dataModel && response.dataModel.length > 0){
            this.optionslist.set(response.dataModel);
            this.optionslistRaw = response.dataModel;
            if(this.optionslist().length > 6){
              this.multiSelectOption.set(true);
              this.optionslistRaw.forEach((x: any)=>{
                x.isChecked = false;
              })
              this.optionslist.set(this.optionslistRaw)
            }
            else{
              this.multiSelectOption.set(false);
            }
            this.changeDetectorRef.detectChanges();
          }
        },
        error: (_e)=>{
          this.optionslist.set([]);
        }
      })
    }
  }

  setEnterKey(e: any){
    if(this.field.FieldVal === 0 || this.field.FieldVal){
      this.setInputVal(e);
      this.setEnterPress.emit(e);
    }
  }

  setInputVal(_e: any){
    let y = typeof this.field.FieldVal;
    if(this.field.FieldVal && y !== 'number'){
      this.field.FieldVal = this.field.FieldVal.trim()
    }
    if(this.query){
      this.replace = this.query;
    }
    if(this.filteroperator === "null"){
      this.query = this.field.FieldName + " IS NULL";
      let e = {value: 'null', query: this.query, replace: this.replace ? this.replace : ''}
      this.setfieldVal.emit(e);
    }
    else if(this.filteroperator === "notnull"){
      this.query = this.field.FieldName + " IS NOT NULL";
      let e = {value: 'notnull', query: this.query, replace: this.replace ? this.replace : ''}
      this.setfieldVal.emit(e);
    }
    else if(this.field.FieldVal || this.field.FieldVal === 0){
      if(this.field.FieldType === 'LookUp'){
        this.query = this.field.FieldName + " in ('"+ this.field.FieldVal +"')";
      }
      else if(this.field.FieldType === 'DateTime'){
        this.query = "CAST(" + this.field.FieldName + " AS DATE) "+this.filteroperator+" CAST('"+ this.field.FieldVal +"' AS DATE)";
      }
      else if(this.field.FieldType === 'CheckBox'){
        if(this.field.FieldVal === true || this.field.FieldVal === 'true'){
          this.query = this.field.FieldName + " = 'true'";
        }
        else {
          this.query = this.field.FieldName + " is " + this.field.FieldVal;
        }
      }
      else{
        if(this.filteroperator === 'like'){
          this.query = this.field.FieldName + " like '%"+ this.field.FieldVal +"%'";
        }
        else if(this.filteroperator === 'not like'){
          this.query = this.field.FieldName + " not like '%"+ this.field.FieldVal +"%'";
        }
        else if(this.filteroperator === 'end'){
          this.query = this.field.FieldName + " like '%"+ this.field.FieldVal+"'";
        }
        else if(this.filteroperator === 'begins'){
          this.query = this.field.FieldName + " like '"+ this.field.FieldVal+"%'";
        }
        else if(this.filteroperator === '='){
          this.query = this.field.FieldName + ""+ this.filteroperator +"'"+ this.field.FieldVal+"'";
        }
        else{
          this.query = this.field.FieldName + " "+ this.filteroperator +" '"+ this.field.FieldVal+"'";
        }
        
      }
      let e = {value: this.field.FieldVal, query: this.field.FieldVal || this.field.FieldVal === 0 ? this.query : "", opr: this.filteroperator, replace: this.replace ? this.replace : ''}
      this.setfieldVal.emit(e);
    }else{
      let e = {value: '', query: this.query, opr: this.filteroperator, replace: this.replace ? this.replace : this.query}
      this.setfieldVal.emit(e);
    }

  }

  clearDtLookUp(){
    let a: any = document.getElementById('mat-input-0');
    a.value = null;
    this.clearLookUp();
  }

  clearLookUp(){
    this.field.FieldVal = '';
    this.field.descEn = '';
    this.setInputVal('');
  }

  setMultiSelect(e: any, i: number){
 
    if(e.target.checked){
      this.mulitSelectList.push(this.optionslist()[i].ID)
    }
    else{
      const index = this.mulitSelectList.findIndex((x:any) => x === this.optionslist()[i].ID);
      if(index >=0){
        this.mulitSelectList.splice(index, 1);
      }
    }
    this.field.FieldVal = this.mulitSelectList.toString();
    this.field.FieldVal = this.field.FieldVal.toString().replaceAll(",","','");
    this.setInputVal(e);
  }

  setMatMultiSelect(){
    this.field.FieldVal = this.lookupSelected().toString();
    this.field.FieldVal = this.field.FieldVal.toString().replaceAll(",","','");
    console.log(this.lookupSelected())
    this.setInputVal('');
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

  sizeChange(){
    this.currentPage.set(1);
    this.openLookUp(this.currentPage(), this.pageSize(), this.query);
  }
  
  goToPage(page: number){
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
    this.openLookUp(this.currentPage(), this.pageSize(), this.query);
  }

  openLookUp(currentPage: number, pageSize: number, query: string){

    if(query){
      this.query = query;
    }
    const lang = JSON.parse(localStorage.getItem('lang') || '');
    const user = JSON.parse(localStorage.getItem('user') || '');

    let pid = this.recordList && this.recordList.parentPageID ? this.recordList.parentPageID : this.menuid;
    let url = "SystemFields/GetDataFields?fieldID="+ this.field.FieldID +"&pMenuId="+pid+"&precordID=0&isFilterApply="+this.filterApply;
    this.noData.set(false);
    this.totalItems.set(0);

    this.fieldActionBody['CompanyID'] = this.companyID();
    let params:any = {
      "menuID": this.menuid,
      "userID": user.id,
      "companyID": this.companyID(),
      "languageID": lang,
      "applicationID": user.applicationID,
      "queryfields": this.fieldActionBody,
      "pageNumber": currentPage,
      "pageSize": this.pageSize()
    }
    if(this.query){
      params["filterCondition"] = this.query
    }
    this._http.putClient<any, ApiResponse>(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => { 
        if(response.erroMessage){
          this.toastr.error(response.erroMessage);
        }
        else if(response.dataModel && response.dataModel.length > 0){

          if(this.field.FieldType === "LookUp"){
            this.optionslist.set(response.dataModel);
          }
          else{
            this.dataSourceRaw = response.dataModel;
            this.dataSource.set(this.dataSourceRaw);
            this.totalItems.set(response.rowCount);        
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
              this.itemsOptions.push(this.totalItems())
            }

            this.dataKeys = Object.keys(this.dataSourceRaw[0]);
            this.dataSource.update(arr => arr.map((e: any, i: number)=>({
              ...e, sno: i + 1
            })))
            
            this.dataKeys.forEach((e:any)=>{
              this.columns.push({
                header: e,
                name: e
              })
            })
            
        
              let m: any = document.getElementById(this.field.FieldName+this.recordStamp);
              if(this.bmodalShow){
                this.bmodal = new Modal(m, {
                  keyboard: false,
                  backdrop: 'static'
                });
                this.bmodal.show();
                this.bmodalShow = false;
              }
          }
          if(this.filterValue){
            setTimeout(()=>{
              (document.getElementById(this.filterboxID) as HTMLInputElement).value = this.filterValue;
            },300)
          }
        }else{
          this.dataSourceRaw = response.dataModel;
          this.dataSource.set(this.dataSourceRaw);
          this.totalItems.set(response.rowCount);
        
            this.noData.set(true);
            let m: any = document.getElementById(this.field.FieldName+this.recordStamp);
            if(this.bmodalShow){
              this.bmodal = new Modal(m, {
                keyboard: false,
                backdrop: 'static'
              });
              this.bmodal.show();
              this.bmodalShow = false;
            }
        }
      },
      error: (_errMsg) => {
        
      }
    })
  }

  closeModal(){
    this.bmodal.hide();
    this.bmodalShow = true;
    this.currentPage.set(1);
    this.query = '';
    document.querySelectorAll(".filterftSearch").forEach((x:any) => x.value = '');
    this.filterApply = false;
  }

  updateGoto(){
    this.goTo = this.currentPage() || 1;
    this.totalPages.set(Math.ceil(this.totalItems() / this.pageSize()));
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
      this.filterApply = false;
    }
    
    if(type === 'enter'){

      this.filterApply = true;
      this.filterValue = filterValue;
      this.filterboxID = field;
      this.openLookUp(1, this.pageSize(), this.query);
    }
  }

  setVal(i: number){
    let a = this.dataSourceRaw[i-1];
    this.field.FieldVal = a[this.field.ListId];
    this.field.descEn = this.dataSourceRaw[i-1].UserName ? this.dataSourceRaw[i-1].UserName : this.dataSourceRaw[i-1].DescriptionEn ? this.dataSourceRaw[i-1].DescriptionEn : this.dataSourceRaw[i-1].FullNameEn ? this.dataSourceRaw[i-1].FullNameEn : this.dataSourceRaw[i - 1].Code ? this.dataSourceRaw[i - 1].Code : this.dataSourceRaw[i - 1].DeliveryLocation ? this.dataSourceRaw[i - 1].DeliveryLocation :  this.dataSourceRaw[i - 1].ID;
    this.setInputVal('');
    
    if(this.modal){
      this.closeModal();
    }
  }

  addEvent(_type: string, event: MatDatepickerInputEvent<Date>) {
    let a:any = event.value;

    this.field.FieldVal = new Date(a);
    this._locale = "en-IN";
    this._adapter.setLocale(this._locale);
    this.setInputVal('');
  }

  operatorEvent(e: any){
    this.filteroperator = e.opr ? e.opr : 'like';
    if(this.field.FieldType === 'Memo'){
      this.filteroperator = 'like';
    }
    if(this.filteroperator === 'null' || this.filteroperator === 'notnull'){
      this.field.FieldVal = '';
      this.setfieldVal.emit('');
    }
    this.setInputVal('');
  }

  clearSearch(event: any) {
    event.stopPropagation();
    this.searchText.set('');
    this.optionslist.set(this.optionslistRaw);
  }

    getsub(e: any){
    const user = JSON.parse(localStorage.getItem('user') || '');
    const lang = localStorage.getItem("lang") || '';
    const url = 'SystemFields/GetsysFieldData?id=' + e.LinkedMenuId +"&languageid="+lang+'&userid='+user.id+'&companyid='+this.companyID()+'&applicationid='+user.applicationID;
 
    this._http.getClient<ApiResponse>(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        let response = res.dataModel;
        if(response){
            let sysList:any = []
            this.fieldval = response;
            sysList.push({
                    'FieldName': 'ID',
                    'FieldCaption': 'ID',
                    'FieldType': 'TextBox',
                    'ListId': null,
                    'Id': 0,
                    'Seq': 0,
            })
            if(this.fieldval && this.fieldval.length > 0){
              this.fieldval.forEach((x: any) => {
                sysList.push({
                  'FieldName': x.FieldName,
                  'FieldCaption': x.FieldCaption,
                  'FieldType': x.FieldType,
                  'ListId': x.ListId,
                  'Id': x.Id,
                  'Seq': x.VoucherSeq
                })
              });
            }
            
            let newSorted = sysList.sort((a: any, b: any)=>{
              let fa = a.FieldCaption.toLowerCase(),
              fb = b.FieldCaption.toLowerCase();

              if (fa < fb) {
                return -1;
              }
              if (fa > fb) {
                return 1;
              }
              return 0;
            });
          
            this.sysList = newSorted;
        }
      }
    })
  }


  filterSearch() {
     if(this.searchText().trim()){
      this.optionslist.set(this.optionslistRaw.filter((e: any)=> { return e.DescriptionEn.toLowerCase().search(this.searchText()) !== -1}));
    }else{
      this.optionslist.set(this.optionslistRaw);
    }
  }

  createBox(){
    const childRef = this.filterBox.createComponent(FilterBox);
    childRef.setInput('_sysList', this.sysList);
    childRef.setInput('recordList', this.recordList);
    childRef.setInput('menuid', this.subid);
    childRef.setInput('companyID', this.companyID);
    childRef.setInput('pageType', 'submenu')
    childRef.instance.closefilter.subscribe((e: any)=>{
      this.filterOff(e);
    })
    childRef.instance.setFilterValue.subscribe((e: any)=>{
      this.setFilterValueEvent(e);
    })
    this.filterBoxSub.set(0, childRef);
  }

  
  filterOff(_e: any){
    this.bmodal.hide();
    this.bmodalShow = true;
    let a: any = this.filterBoxSub.get(0);
    a.destroy();
    this.filterBoxSub.delete(0);
  }

  openSub(e: any){
    setTimeout(()=>{
      let m: any = document.getElementById('subfilter'+this.modalid());
      if(this.bmodalShow){
        this.bmodal = new Modal(m,{
            keyboard: false,
            backdrop: 'static'
        })
        this.bmodal.show();
        this.bmodalShow = false;
      }
      setTimeout(()=>{
          this.createBox();
      },500);
    },500);
  }
  
  setFilterValueEvent(e: any){
    if(this.subQuery()){
      this.sqReplace = this.subQuery(); 
    }

    if(e.query){
      this.filterQuery = e.query;
      let q = e.query;
      if(!this.subQuery){
        this.sqReplace = '';
      }
      this.subQuery.set("id in (select "+ this.field.LinkedCalledMenuField +" from "+ this.field.LabelId +" where "+q+")");
      this.subQueryEmit.emit({query: this.subQuery, replace: this.sqReplace ? this.sqReplace : ''});
    }else{
      this.subQuery.set('');
      this.subQueryEmit.emit({query: this.subQuery, replace: this.sqReplace ? this.sqReplace: ''});
      this.filterQuery = null;
    }
  }

}