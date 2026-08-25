import { Component, DestroyRef, ElementRef, EventEmitter, HostListener, input, Input, Output, signal } from '@angular/core';
import { AppService } from '../../services/common/common.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterInputFields } from '../filter-input-fields/filter-input-fields';
import { ToastrService } from 'ngx-toastr';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiResponse } from '../../shared/interface';

@Component({
  selector: 'filter-box',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterInputFields],
  templateUrl: './filter-box.html',
  styleUrl: './filter-box.scss'
})
export class FilterBox {
  @Output() closefilter = new EventEmitter;
  @Output() setFilterValue = new EventEmitter;
  @Output() subQueryEmit =  new EventEmitter;
  sysList = signal<any>([]);
  @Input() set _sysList(value: any){
    this.sysList.set(value)
  }
  get _syslList(): any{
    return this.sysList();
  }
  @Input() menuid: number;
  pageType = input<any>();
  companyID = input<number>(0);
  @Input() recordList: any;
  filterType = signal<any>([]);
  filterTypeVal: any;
  filterFieldList = signal<any>([]);
  queries: any;
  sysListModel: any = '';
  filterTypeList: any;
  addViewSection: boolean;
  isPrivate = signal<boolean>(false);
  viewName: string;
  viewID: any;
  private _toast: import("ngx-toastr").ActiveToast<any>;
  viewDate: any;
  viewEdit: boolean;
  viewDefault: any;
  viewCreator: any;
  duplication: boolean;
  userid: string;
  searchDetails: any = [];
  openSettingId = signal<string>('');
  subquery: any;
  constructor(private _http: AppService, private toastr: ToastrService, private eRef: ElementRef, private destroyRef: DestroyRef){

  }

  ngOnInit(){
    const user = JSON.parse(localStorage.getItem('user') || '');
    this.userid = user.id.toString();
    this.afterInit();
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.fsetting')) {
      this.openSettingId.set('');
    }
  }


  afterInit(){
    this.viewEdit = false;
    const user = JSON.parse(localStorage.getItem('user') || '');
    let url = "Sys/GetDataSysObjectSearch?menuid="+this.menuid+"&userID="+user.id;
    this._http.getClient<ApiResponse>(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next:(response)=>{
        if(response.dataModel && response.dataModel.length > 0){
          this.filterType.set(response.dataModel);
          this.filterTypeVal = this.filterType()[0].ID;
          this.filterType.update(arr => arr.map((x: any)=>{
            if(x.DefaultFlag === true){
              this.filterTypeVal = x.ID;
              this.viewID = x.ID;
              this.viewName = x.SearchName;
              this.isPrivate.set(x.PrivateFlag);
              this.viewDate = x.CreatedDate;
              this.viewDefault = x.DefaultFlag;
              this.viewCreator = x.CreatedBy;
            }
            return {...x}
          }))

          if(this.duplication){
            let a  = this.filterType().filter((x:any)=> x.SearchName === this.viewName);
            this.filterTypeVal = a[0].ID;
            this.addDuplicateRecords();
          }
          
        }
        if(this.filterTypeVal){
          this.getFilterList(this.filterTypeVal)
        }
      },
      error:(_error)=>{

      }
    })
  }

  toggle(e: string){
    this.openSettingId.set(this.openSettingId() === e ? '' : e);
  }

  closeFilter(){
    this.closefilter.emit(false)
  }

  getFilterList(list: any){
    this.filterTypeList = list;
    let a = this.filterType().filter((x:any)=> x.ID === parseInt(this.filterTypeVal));
    this.viewID = a[0].ID;
    this.viewName = a[0].SearchName;
    this.isPrivate.set(a[0].PrivateFlag);
    this.viewDate = a[0].CreatedDate;
    this.viewDefault = a[0].DefaultFlag;
    this.viewCreator = a[0].CreatedBy;

    let q = "searchid="+list+" and menuid="+this.menuid;
    let url = "Sys/GetDataSysObjectSearchDetails?FilterCondition="+q;
    this.searchDetails = [];
    this._http.getClient<ApiResponse>(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next:(response)=>{
        if(response.dataModel && response.dataModel.length > 0){
          this.queries = '';
          this.filterFieldList.set([]);
          let filterFieldList = response.dataModel;
          filterFieldList.forEach((x:any) => {
            this.sysList.update(arr => arr.map((y: any)=>{
              if(x.FieldName === y.FieldName){
                x.ListId = y.ListId;
                x.FieldCaption = y.FieldCaption;
                x.LinkedMenuId = y.LinkedMenuId;
                x.LinkedCalledMenuField = y.LinkedCalledMenuField;
                x.LabelId = y.LabelId;
              }
              return {...y}
            }))

            this.filterFieldList.set(filterFieldList.filter((x: any)=> x.FieldCaption));
            x.FieldVal = x.FilterValue;
            x.query = null;
            x.operator = x.Operater;
            this.searchDetails.push({
              "ID": x.ID,
              "Seq": x.Seq,
              "FieldID": x.FieldID,
              "FieldName": x.FieldName,
              "FieldType": x.FieldType,
              "FilterValue": x.FilterValue,
              "SearchID": x.SearchID,
              "SelectFlag": x.SelectFlag,
              "Operater": x.Operater
            })
          })
        }else{
          this.filterFieldList.set([]);
        }
      },
      error:(_error)=>{
        this.filterFieldList.set([]);
      }
    })

    if(this.viewEdit){
      this.editView();
    }
  }

  addField(e: any){
    let item = this.sysList()[e];
    let a;
    if(this.filterFieldList().length > 0){
      a = this.filterFieldList().filter((x:any)=> x.FieldName === item.FieldName);
    }
    if(this._toast){
      this.toastr.clear();
    }
    if(!a || a.length === 0){
      const user = JSON.parse(localStorage.getItem('user') || '');    
      const lang = JSON.parse(localStorage.getItem('lang') || '');
      let url = "Sys/CreateSysObjectSearchDetails?MenuId="+this.menuid+"&companyId="+this.companyID()+"&languageID="+lang;
      let params = {
        "id": 0,
        "companyId": this.companyID(),
        "searchId": this.filterTypeVal,
        "seq": item.Seq,
        "menuId": this.menuid,
        "selectFlag": item.SelectFlag,
        "andOr": "",
        "fieldId": item.Id,
        "fieldType": item.FieldType,
        "fieldName": item.FieldName,
        "aliaseName": item.AliaseName,
        "operater": "",
        "filterValue": item.ListId
      }
      this.sysListModel = '';
      this._http.postClient<any, ApiResponse>(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next:(response)=>{
          if(response.successMessage || !response.erroMessage){
            this.getFilterList(this.filterTypeVal);
          }
        },
        error:(_e)=>{
  
        }
      })
    }else{
      this._toast = this.toastr.error("Field Exists")
    }
  }

  deleteField(id: number, i: number){
    let url = "Sys/DeleteSysObjectSearchDetails?id="+id;
    this._http.deleteClient(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next:(response: any)=>{
        if(response.successMessage){
          this.getFilterList(this.filterTypeVal);
        }
      },
      error:(_e)=>{

      }
    })
    let a  = this.filterFieldList()[i].query;
    if(a && this.queries){
      this.queries = this.queries.replace(a, '').trim();
      this.replaceAND();
    }
  }

  saveCriteria(){
    if(this.searchDetails.length !== 0){
      this.searchDetails.forEach((e:any) => {
        let params = {
          "id": e.ID,
          "companyId": this.companyID(),
          "searchId": e.SearchID,
          "seq": e.Seq,
          "menuId": this.menuid,
          "selectFlag": e.SelectFlag,
          "andOr": "string",
          "fieldId": e.FieldID,
          "fieldType": e.FieldType,
          "fieldName": e.FieldName,
          "aliaseName": null,
          "operater": e.Operater,
          "filterValue": e.FilterValue
        }
        let url = "Sys/UpdateSysObjectSearchDetails";

        this._http.putClient(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next:(_r)=>{

          },
          error: (_e)=>{

          }
        })
      });
    }
  }
  
  getVal(e: any, list: any, i: number){  
    let name = list.FieldName; 
    this.filterFieldList()[i].query = e.query;
 
    let o = '';
    if(e.opr === "like"){
      o = "like '%___%'"
    }
    else if(o === "not like"){
      o = "not like '%___%'"
    }
    else if(o === "begins"){
      o = "like '___%'"
    }
    else if(o === "ends"){
      o = "like '%___'"
    }
    else if(o === "null"){
      o = "is null"
    }
    else if(o === "notnull"){
      o = "is not null"
    }
    else{
      o = e.opr;
    }
    if(this.searchDetails.length === 0 && (e.value || e.value === 0)){

      this.searchDetails.push({
        "ID": list.ID,
        "Seq": list.seq,
        "FieldID": list.FieldID,
        "FieldName": list.FieldName,
        "FieldType": list.FieldType,
        "FilterValue": e.value,
        "SearchID": list.SearchID,
        "SelectFlag": list.SelectFlag,
        "Operater": o
      })
    }else{
      if(e.value || e.value === 0){
        let a = this.searchDetails.findIndex((x:any) => x.ID === list.ID);
        if(a < 0){
          this.searchDetails.push({
            "ID": list.ID,
            "Seq": list.seq,
            "FieldName": list.FieldName,
            "FieldID": list.FieldID,
            "FieldType": list.FieldType,
            "FilterValue": e.value,
            "SearchID": list.SearchID,
            "SelectFlag": list.SelectFlag,
            "Operater": o
          })
        }
      }else{
        let a = this.searchDetails.findIndex((x:any) => x.ID === list.ID);
        this.searchDetails.splice(a, 1)
      }
    }
    
    if(e.value || e.value === 0){
      if(!this.queries){
        this.queries = e.query;
      }else{
        let a = this.queries.split(" ");
        if(a.includes(e.replace) ){
          this.queries = this.queries.replace(e.replace, e.query).trim();
        }
        else if(!a.includes(name) && !a.includes("CAST("+name)){
          this.queries =  this.queries + " and " + e.query;
        }else{
          this.queries = this.queries.replace(e.replace, e.query).trim();
        }
      }
    }else if(this.queries){
      let a = this.queries.split(" ");
      if(a.includes(name) || (a.includes(name + " IS NULL")) || (a.includes(name + " IS NOT NULL"))){
        this.queries = this.queries.replace(e.replace.trim(), '').trim();
        this.replaceAND();
      }
    }
  }

  replaceAND(){
    if(this.queries){
      if(this.queries[0] === 'a' && this.queries[1] === 'n' && this.queries[2] === 'd'){
        this.queries = this.queries.replace('and', '').trim();
      }

      let c = this.queries.length;
      if(this.queries[c-3] === 'a' && this.queries[c-2] === 'n' && this.queries[c-1] === 'd'){
        this.queries = this.queries.slice(0, -3).trim();
      }
      this.queries = this.queries.replaceAll("and  and", "and ");
    }
  }

  addDuplicateRecords(){
    this.duplication = false;
    if(this.filterFieldList().length > 0){
      this.filterFieldList.update(arr => arr.map((x: any)=>{
        let a = this.sysList().filter((y:any)=> x.FieldName === y.fieldName);
        if(a.length === 1){
          let item = a[0];
          const user = JSON.parse(localStorage.getItem('user') || '');    
          const lang = JSON.parse(localStorage.getItem('lang') || '');
          let url = "Sys/CreateSysObjectSearchDetails?MenuId="+this.menuid+"&companyId="+this.companyID()+"&languageID="+lang;
          let params = {
            "id": 0,
            "companyId": this.companyID(),
            "searchId": this.filterTypeVal,
            "seq": item.seq,
            "menuId": this.menuid,
            "selectFlag": item.SelectFlag,
            "andOr": "",
            "fieldId": item.id,
            "fieldType": item.fieldType,
            "fieldName": item.fieldName,
            "aliaseName": item.aliaseName,
            "operater": "",
            "filterValue": item.ListId
          }
          this.sysListModel = '';
          this._http.postClient(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next:(_response)=>{
            
            },
            error:(_e)=>{
      
            }
          })
        }
        return {...x}
      }))
    }
  }

  clearFilter(){
    this.getFilterList(this.filterTypeVal);
    this.subQueryEmit.emit('')
    this.setFilterValue.emit({query: null});
  }

  applyFilter(_e: any){
    this.setFilterValue.emit({query: this.queries})
    if(this.pageType() === 'submenu'){
      this.closeFilter();
    }
  }

  editView(){
    this.addViewSection = true;
    let a = this.filterType().filter((x:any)=> x.ID === parseInt(this.filterTypeVal));
    this.viewID = a[0].ID;
    this.viewName = a[0].SearchName;
    this.isPrivate.set(a[0].PrivateFlag);
    this.viewDate = a[0].CreatedDate;
    this.viewEdit = true;
    this.viewDefault = a[0].DefaultFlag;
    this.viewCreator = a[0].CreatedBy;
  }

  addView(){
    const user = JSON.parse(localStorage.getItem('user') || '');  
    this.viewName = '';
    this.viewID = '';
    this.isPrivate.set(false);
    this.viewDate = '';
    this.viewDefault = '';
    this.viewCreator = user.id;
    this.addViewSection = true;
  }

  cancelView(){
    this.viewEdit = false;
    this.addViewSection = false;
  }

  duplicateView(){   
    let a = this.filterType().filter((x:any)=> x.ID === parseInt(this.filterTypeVal));
    this.viewName = a[0].SearchName + ' duplicate';
    this.duplication = true;
    this.saveAddView();
  }

  saveAddView(){
    if(this.viewName){
      const user = JSON.parse(localStorage.getItem('user') || '');    
      const lang = JSON.parse(localStorage.getItem('lang') || '');
      let url = "Sys/CreateSysObjectSearch?MenuId="+this.menuid+"&companyId="+this.companyID()+"&languageID="+lang;
      let params = {
        "id": 0,
        "companyId": this.companyID(),
        "menuId": this.menuid,
        "searchName": this.viewName,
        "createdBy": this.viewCreator.toString(),
        "createdDate": new Date(),
        "privateFlag": this.isPrivate(),
        "defaultFlag": false
      }
      this._http.postClient(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (_response) =>{
          this.afterInit();
          this.addViewSection = false;
        },
        error: (_error)=>{

        }
      });
    }else{
      this.toastr.error("Provide view name");
    }
  }

  setAsPrivate(e: boolean) {
    this.isPrivate.set(e);
    this.saveEditView();
  }

  setAsDefault(e: boolean){
    this.viewDefault = e;
    this.saveEditView();
  }

  saveEditView(){
    const user = JSON.parse(localStorage.getItem('user') || '');   
    let url = "Sys/UpdateSysObjectSearch?MenuId="+this.menuid+"&userId="+user.id;
    let params = {
      "id": this.viewID,
      "companyId": this.companyID(),
      "menuId": this.menuid,
      "searchName": this.viewName,
      "createdBy": this.viewCreator,
      "createdDate": this.viewDate,
      "privateFlag": this.isPrivate(),
      "defaultFlag": this.viewDefault
    }

    this._http.putClient(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (_response) =>{
        this.afterInit();
        this.addViewSection = false;
      },
      error: (_error)=>{

      }
    });
  }

  deleteView(){
    let url = "Sys/DeleteSysObjectSearch?id="+this.filterTypeList;
    this._http.deleteClient(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (_response) =>{
        this.afterInit();
      },
      error: (_error)=>{

      }
    });
  }

  subQueryEmitEvt(e: any, list: any, i: number){ 
    let name = list.LabelId;
    let q = e.query;
    let r = e.replace;
    let b;
    if(r){
      b = r.split(" ");
    }
    if(!this.subquery){
      this.subquery = e.query;
      this.subQueryEmit.emit(this.subquery)
    }
    else{
      let a = this.subquery.split(" ");
      if(!a.includes(name)){
        if(b && b.includes(name)){
          this.subquery = this.subquery.replace(e.replace, e.query).trim();
        }else{
          this.subquery = this.subquery +' and ' + e.query;
        }
      }else{
        this.subquery = this.subquery.replace(e.replace, e.query).trim();
      }

      let condition = this.subquery;
      this.subquery = condition.trim().replace(/^and\s+/i, '');
      this.subQueryEmit.emit(this.subquery)
    }
  }

}
