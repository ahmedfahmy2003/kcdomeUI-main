import { CommonModule } from '@angular/common';
import { Component, EventEmitter, forwardRef, inject, input, Input, OnInit, Output, HostListener, signal, effect, model, DestroyRef } from '@angular/core';
import { AppService } from '../../services/common/common.service';
import { FormsModule, NgModel } from "@angular/forms";
import { DxDataGridModule } from 'devextreme-angular';
import { DimensionsPage } from '../../dashboard/menu-grids/common/dimensions-page/dimensions-page';
import { FilterBox } from '../filter-box/filter-box';
import { DomSanitizer } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { select, Store } from '@ngrx/store';
import { DateInput } from '../date-input/date-input';
import { TimeInput } from '../time-input/time-input';
import { VisbilityGrids } from '../../dashboard/menu-grids/common/visbility-grids/visbility-grids';
import { CallingMenu } from '../../dashboard/menu-grids/common/calling-menu/calling-menu';
import * as StoreAction from "../../services/common/store/store.action";
import { ModalService } from '../../services/common/modal.service';
import { MatMenuModule } from '@angular/material/menu';
import { InputFields } from '../input-fields/input-fields';
import { LoaderService } from '../../services/common/loader.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiResponse } from '../../shared/interface';
import { HttpErrorResponse } from '@angular/common/http';
import { PaginationControls } from '../pagination-controls/pagination-controls';

@Component({
  selector: 'editable-grid-tabs',
  standalone: true,
  imports: [forwardRef(() => DimensionsPage), FilterBox, CallingMenu, DateInput, VisbilityGrids, InputFields, TimeInput, MatMenuModule, CommonModule, FormsModule, DxDataGridModule, PaginationControls],
  templateUrl: './editable-grid-tabs.html',
  styleUrl: './editable-grid-tabs.scss'
})
export class EditableGridTabs implements OnInit{
  subMenuId = signal<number>(0);
  @Input() set _subMenuId(value: number){
    this.subMenuId.set(value);
    if(this.subMenuId()){
      this.noData.set(false);
      this.menuAccess(this.subMenuId());
    }
  } 
  get _subMenuId(): number{
    return this.subMenuId();
  }

  @Input() page: any;
  @Input() pageType: string;
  @Input() filterKey: string;
  @Input() subRecordId: number;
  @Input() precordid: number;
  @Input() autoOpen: boolean;
  @Output() subRecordDetail = new EventEmitter;
  newRecordShow = model<boolean>();
  @Input() detailsPage: boolean;
  @Output() detailsPageChange = new EventEmitter;
  @Output() rowCount = new EventEmitter;
  @Output() resCompanyIDemit = new EventEmitter;
  @Input() recordList: any;
  @Input() detailsgridID: any;
  @Input() subeditablefielddetails: string;
  submrEnabledStatus = input<boolean>();
  _newRecordAdded: boolean;
  reportURL: any;
  colLayoutData: any;
  actionBTNDisabled = signal<boolean>(false);
  callFieldAction: boolean;
  fieldActionid: number = 0;
  actionFieldNumber: number;
  saveModelRecord: boolean;
  @Input() set newRecordAdded(value: boolean) {
    this._newRecordAdded = value;
  }

  get newRecordAdded(): boolean {
      return this._newRecordAdded;
  }
  
  _newRecordID: any;
  @Input() set newRecordID(value: any) {
    this._newRecordID = value;
    this.newRecordAddFn(this._newRecordAdded);
  }

  get newRecordID(): any {
      return this._newRecordID;
  }

  _recordDeleted: any;
  @Input() set recordDeleted(value: any) {
    this._recordDeleted = value;
    this.recDeleted(this._recordDeleted);
  }

  get recordDeleted(): any {
      return this._recordDeleted;
  }

  companyID = input<number>(0);

  @Input() fieldQuery: string;
  @Input() preReqIndex: any;
  @Input() queryData: any;
  _wfstatus = input<string>();
  wfstatus = signal<string>('');
  readOnly = signal<boolean>(false);
  @Input() set _readOnly(value: boolean){
    this.readOnly.set(value);
  }
  get _readOnly(): boolean{
    return this.readOnly();
  }
  wfStatus = input<string>();

  otherUser: boolean;
  @Input() set _otherUser(value: boolean){
    this.otherUser = value;
  }

  get _otherUser(): boolean{
    return this.otherUser;
  }

  mrEnabledStatus = input<boolean>();

  wfEnabledStatus =  signal<boolean>(false);
  @Input() set _wfEnabledStatus(value: boolean){
    this.wfEnabledStatus.set(value);
  }
  
  get _wfEnabledStatus(): boolean{
    return this.wfEnabledStatus();
  }
  pmenuid = signal<number>(0);
  @Input() set _pmenuid(value: number){
    this.pmenuid.set(value)
  }
  get _pmenuid():number{
    return this.pmenuid();
  }
  noData = signal<boolean>(false);
  public menus: any;
  @Output() menusChange = new EventEmitter;
  public resultsLength = signal<number>(0);
  public fixedColumns: any = [];
  public currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  public pageNumbers: number[] = [];
  public totalPages = signal<number>(0);
  public openRecords: any;
  public recordAdd: boolean = false;
  @Input() activeRecord: number = 0;
  @Output() activeRecordChange = new EventEmitter;
  public applyDimensions: boolean;
  public applyWorkflow: boolean;
  public modalMessage: string;
  _menuaccess = input<any>({});
  public menuaccess: any;
  public useraccess = signal<any>({});
  public applyDrillDown: boolean;
  public drillDown: any;
  public modalRef: HTMLDivElement;
  public memoNote: boolean;
  public modalTitle: string;
  public columns: any = [];
  public newcolumns: any = [];
  public dataSourceRaw: any = [];
  dataSourceRawVal: any = [];
  public dataSourceRawString: any = '';
  public dataSource = signal<any>([]);
  public isLoading = signal<boolean>(false);
  public recordId: number;
  public printBTN = signal<any>([]);
  public actionBTN = signal<any>([]);
  public tabname: string;
  @Output() tabnameChange = new EventEmitter;
  @Output() prerequisiteType = new EventEmitter;
  @Output() deletedSubRecord = new EventEmitter;
  public dataKeys: any;
  public fieldVal: any;
  vlist: any = [];
  sysList = signal<any>([]);
  subRecordID: number;
  subRecordData: any;
  cindex: number
  openDimension: boolean;
  closeDetailsSub: any;
  recordListSub: any;
  showFilter = signal<boolean>(false);
  menuid = signal<number>(0);
  applyFilter: boolean;
  filterQuery: any;
  modalShow: boolean = true;
  hideProceed = signal<boolean>(false);
  wfType: string;
  resCompanyID: any;
  requsitereport: boolean;
  menulist: any;
  menulistsub: any;
  private store = inject(Store);
  fieldValRaw: any;
  exportid: number;
  editMode = signal<boolean>(false);
  fieldAction = signal<any>([]);
  fieldActionBody: any = {};
  actionQueryField: any;
  actionStop: boolean;
  actionTypeValues: boolean;
  updateRecord: any= [];
  deleteRecordList: any= [];
  recordLength: number;
  drecordLength: number;
  editBTN: boolean;
  intialNewRecord: any = [];
  addNewRecords: boolean;
  newRowData: any = [];
  newRowCount: any = 0;
  newarrayCalls:any = [];
  updatearrayCalls:any = [];
  public reporturl = '';
  public baseurl = '';
  exportAll = signal<boolean>(false);
  getDataResposne: any;
  actionBtnType: string;
  actionrecordid: number;
  actionMenuList: any;
  actionresponsemodel: any;
  conpletedMessage: any;
  callingMenu = signal<boolean>(false);
  callingMenuData: any;
  callingMenuLinkedQuery: any;
  stringID: any;
  recordData: any  = '';
  keyEventSNO: number;
  keyEventI: number;
  openMenuId = signal<string>('');
  openSettingId = signal<string>('');
  menuPosition = signal<{ top: number }>({ top: 150});
  menuPositionS = signal<{ top: number, right: number }>({ top: 200, right: 200});
  public pageSizeOption: number[] = [10, 30, 100, 500];
  _sortOrder = signal<string>('desc');
  recordStamp = new Date().getTime();
  sorder = 'atob';
  dateFormat: any;
  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.trwrap') && !target.closest('.kc-dropdown-menu') && !target.closest('.kc-dropdown-wrap')) {
      this.openMenuId.set('');
      this.openSettingId.set('');
    }
  }

  @HostListener('document:keydown', ['$event']) onKeydownHandler(event: KeyboardEvent) {

    if(this.editMode()){
      if(event.shiftKey && event.key.toLowerCase() === 'escape' || (event.ctrlKey && (event.key.toLowerCase() === 's' || event.key.toLowerCase() === 'i'))){
        event.preventDefault();
      }

      if(event.key.toLowerCase() === 'tab'){

      }

      if(event.ctrlKey && event.key.toLowerCase() === 'arrowright'){
        let stop = false;
        this.fieldAction()[this.keyEventSNO].field.forEach((x: any, i: number)=>{
          if(i >= this.keyEventI && !stop){
            this.fieldAction.update(x => x.map((a: any, j: any) => j === this.keyEventSNO ? {...a, field: a.field.map((f: any, k: any) => k === i + 1 ? {...f, internalFieldEdit: true} : f)} : a));
            this.fieldAction.update(x => x.map((a: any, j: any) => j === this.keyEventSNO ? {...a, field: a.field.map((f: any, k: any) => k === i + 1 ? {...f, keyTab: false} : f)} : a));
            if(this.fieldAction()[this.keyEventSNO].field[i+1].Enabled){
              this.fieldAction.update(x => x.map((a: any, j: any) => j === this.keyEventSNO ? {...a, field: a.field.map((f: any, k: any) => k === i + 1 ? {...f, keyTab: true} : f)} : a));
              stop = true;
            }
          }
        })
      }

      if(event.ctrlKey && event.key.toLowerCase() === 'arrowleft'){
        let stop = false;
        this.fieldAction()[this.keyEventSNO].field.forEach((x: any, i: number)=>{
          this.fieldAction.update(x => x.map((a: any, j: any) => j === this.keyEventSNO ? {...a, field: a.field.map((f: any, k: any) => k === i + 1 ? {...f, keyTab: false} : f)} : a));
          if(i >= this.keyEventI && !stop){
            this.fieldAction.update(x => x.map((a: any, j: any) => j === this.keyEventSNO ? {...a, field: a.field.map((f: any, k: any) => k === i + 1 ? {...f, internalFieldEdit: true} : f)} : a));
            if(this.fieldAction()[this.keyEventSNO].field[i-1].Enabled){
              this.fieldAction.update(x => x.map((a: any, j: any) => j === this.keyEventSNO ? {...a, field: a.field.map((f: any, k: any) => k === i + 1 ? {...f, keyTab: true} : f)} : a));
              stop = true;
            }
          }
        })
      }

      if(event.ctrlKey && event.key.toLowerCase() === 'arrowdown'){
        let stop = false;
        this.fieldAction()[this.keyEventSNO].field.forEach((x: any, i: number)=>{
          this.fieldAction.update(x => x.map((a: any, j: any) => j === this.keyEventSNO ? {...a, field: a.field.map((f: any, k: any) => k === i + 1 ? {...f, keyTab: false} : f)} : a));
          if(i >= this.keyEventI && !stop && this.fieldAction()[this.keyEventSNO + 1]){
            this.fieldAction.update(x => x.map((a: any, j: any) => j === this.keyEventSNO ? {...a, field: a.field.map((f: any, k: any) => k === i + 1 ? {...f, internalFieldEdit: true} : f)} : a));
            this.fieldAction.update(x => x.map((a: any, j: any) => j === this.keyEventSNO ? {...a, field: a.field.map((f: any, k: any) => k === i + 1 ? {...f, keyTab: true} : f)} : a));
            if(this.fieldAction()[this.keyEventSNO+1].field[i].Enabled){
              stop = true;
            }
          }
        })
      }

      if(event.ctrlKey && event.key.toLowerCase() === 'arrowup'){
        let stop = false;
        this.fieldAction()[this.keyEventSNO].field.forEach((x: any, i: number)=>{
          this.fieldAction.update(x => x.map((a: any, j: any) => j === this.keyEventSNO ? {...a, field: a.field.map((f: any, k: any) => k === i + 1 ? {...f, keyTab: false} : f)} : a));
          if(i >= this.keyEventI && !stop && this.fieldAction()[this.keyEventSNO - 1]){
            this.fieldAction()[this.keyEventSNO - 1].field[i].internalFieldEdit = true;
            this.fieldAction.update(x => x.map((a: any, j: any) => j === this.keyEventSNO ? {...a, field: a.field.map((f: any, k: any) => k === i + 1 ? {...f, internalFieldEdit: true} : f)} : a));
            this.fieldAction.update(x => x.map((a: any, j: any) => j === this.keyEventSNO ? {...a, field: a.field.map((f: any, k: any) => k === i + 1 ? {...f, keyTab: true} : f)} : a));
            if(this.fieldAction()[this.keyEventSNO - 1].field[i].Enabled){
              stop = true;
            }
          }
        })
      }
    }

    if(event.shiftKey && event.key.toLowerCase() === 'escape' && this.editMode()){
      this.closeEdit('close');
    }

    if(event.ctrlKey && event.key.toLowerCase() === 's' && this.editMode()){
      this.closeEdit('save');
    }

    if(event.ctrlKey && event.key.toLowerCase() === 'i' && this.editMode()){
      this.addNew();
    }

    
}
  constructor(private destroyRef: DestroyRef, public modal: ModalService, private _http: AppService, public loader: LoaderService, public sanitizer: DomSanitizer, private toastr: ToastrService) {
    effect(()=>{
      this.wfstatus.set(this._wfstatus() || '');
    })
    this.baseurl = this._http.geturl();
    this.dateFormat = this._http.getDateFormat();
    if(this.closeDetailsSub){
      this.closeDetailsSub.unsubscribe();
    }

    this.closeDetailsSub = this._http.closeDetails.subscribe((res:any)=>{
      if(res){
        this.closeDetails(res)
      }
    })
 
    this.menulistsub = this.store.pipe(select('list')).subscribe(data=>{
      this.menulist = data.list;
    });
  }

  ngOnInit(): void {
    if(this.wfstatus() !== 'Approved' && this.wfstatus() !== 'Rejected' && !this.readOnly()){
      this.editBTN = true;
    }
  }

  newRecordAddFn(e: boolean){
    if(e === true){
      if(this._newRecordID && this._newRecordID.menuid){
        this.pageType = this._newRecordID.pageType;
        this.getMenuData(this._newRecordID.menuid, 1, this.pageSize())
      }
    }
  }

  recDeleted(e: any){
    if(e.deleted === true){
      this.getMenuData(e.id, 1, this.pageSize())
    }
  }

  sort_objects(order: any, unsortedArray: any){

    let newArray = Array();

    for(let i = 0; i < order.length; i++){

        for(let j = 0; j < unsortedArray.length; j++){

            if(unsortedArray[j].Id == order[i]){
                newArray.push(unsortedArray[j]);
                break;
            }
        }

    }
    return newArray
  }

  sort_unsort_objects(order: any, unsortedArray: any){
    let arr1:any =[];
    order.forEach((k:any) => {
      let n = unsortedArray.filter((obj:any) => {
        return obj.Id.toString() === k
      })
      if (n.length > 0) {
        if(arr1.length > 0){
          arr1 = [...arr1, ...n]; 
        }
        else{
          arr1 = n; 
        } 
      } 
    })

    arr1.forEach((b: any) => {
      let index = unsortedArray.findIndex((e:any)=> e.Id === b.Id);
      if(index >= 0){
        unsortedArray.splice(index, 1);
      }
    });
    let mergedArray = [];
    if(unsortedArray.length > 0){
      mergedArray = [...arr1, ...unsortedArray];
    }else{
      mergedArray = arr1;
    }
    return mergedArray;
  }

  menuAccess(id: number) {
    if(this.pageType === 'dimensions'){
      id = 7023
    }
    if(this._menuaccess() && this._menuaccess().ID){
      this.menuaccess = this._menuaccess();
    }
    this.getmenuFields(id);
  }

  getmenuFields(id: number) {
    this.isLoading.set(true);
    if(this.pageType === 'dimensions'){
      id = 7023
    }
    this.menuid.set(id);
    const lang = localStorage.getItem("lang") || '';
    const user = JSON.parse(localStorage.getItem('user') || '');
    const url = 'SystemFields/GetsysFieldData?id=' + id+"&languageid="+lang+'&userid='+user.id+'&companyid='+this.companyID()+'&applicationid='+user.applicationID;
    this._http.getClient<ApiResponse>(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response ) => {
        if(response.dataModel){
          let fieldValRaw = response.dataModel;
          //this.fieldValRaw = response;
          let fieldVal = response.dataModel.filter((x:any)=> x.Visible === true);
          //this.fieldVal.sort((a:any, b:any) => a.RowLocation - b.RowLocation);  
          this.menus = JSON.stringify(response.dataModel);
          this.menusChange.emit(this.menus);     
          let subRecord = {id: 0, data: '', label: this.menus}
          this.subRecordDetail.emit(subRecord);
          let surl = 'Sys/GetDataSysUserMenuLayout';
          let sparam ={
            "menuID": this.menuid(),
            "userID": user.id,
            "languageID": lang,
            "companyID": this.companyID(),
            "applicationID": user.applicationID,
          }

          this._http.postClient<any, ApiResponse>(surl, sparam).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next:(data)=>{
              if(data && data.dataModel && data.dataModel.length > 0){
                let d: any = data.dataModel[0];
                this.getDataResposne = d;
                if(d.ColLayout){
                  const array = d.ColLayout.split(',');
                  const uniqueArray = [...new Set(array)];
                  this.colLayoutData = uniqueArray.join(',');
                  let a = this.colLayoutData.split(',');
                  let sorted: any = this.sort_objects(a, fieldVal);
                  let sortedRaw: any = this.sort_unsort_objects(a, fieldValRaw);
                  this.fieldVal = sorted;
                  this.fieldValRaw = sortedRaw;
                  fieldVal.forEach((x: any) => {
                    if (x.FieldType === "BTN" && x.Visible) {
                      if (x.ShowInPrint) {
                        this.printBTN.update(e=>[...e, x]);
                      } else {
                        this.actionBTN.update(e=>[...e, x]);
                      }
                    }
                  })
                }else{
                  this.fieldVal = fieldVal;
                  this.fieldValRaw = fieldValRaw;
                }
                this.getMenuDrillDown(id)
              }else{
                this.fieldVal = fieldVal;
                this.fieldValRaw = fieldValRaw;
                this.fieldVal.forEach((x: any) => {
                  if (x.FieldType === "BTN" && x.Visible) {
                    if (x.ShowInPrint) {
                      this.printBTN.update(e=>[...e, x]);
                    } else {
                      this.actionBTN.update(e=>[...e, x]);
                    }
                  }
                })
                this.getMenuDrillDown(id)
              }
            }
          })
        }else{
          if(response.erroMessage){
            this.toastr.error(response.erroMessage);
          }
          this.isLoading.set(false);
        }
      },
      error: (_errMsg: HttpErrorResponse) => {
        this.isLoading.set(false);
        //this.auth.logout();
      }
    });
  }

  getMenuDrillDown(id: number){
    if(this.pageType === 'dimensions'){
      id = 7023
    }
    const url = 'Sys/GetSysMenuDrillDown?TableName=Sys_MenuDrillDown&FilterCondition=MenuId=' + id;
    this._http.getClient<ApiResponse>(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.getMenuData(id, this.currentPage(), this.pageSize());
        if(response.dataModel && response.dataModel.length > 0) {
          this.applyDrillDown = true;
          this.drillDown = response.dataModel;
          
          //this.drillDownChange.emit(this.drillDown);
        }
      },
      error: (_errMsg) => {
        this.isLoading.set(false);
        //this.auth.logout();
      }
    });
  }

  getMenuData(id: number, currentPage: number, pageSize: number) {
    if(!this.fieldVal && this.noData()){
      this.menuAccess(id);
    }else{

    
    let u =  this.menulist.filter((x:any)=> x.ID === id);
    this.useraccess.set(u[0]);
        
    this.exportid = id;
    if(this.page && this.page.menuType === 'View'){
      this.getMenuViewsData(id, currentPage, pageSize)
    }
    else{
      this.isLoading.set(true);
      this.columns = [];
      const user = JSON.parse(localStorage.getItem('user') || '');
      const lang = JSON.parse(localStorage.getItem('lang') || '');
      let url = '';
      let joc = false;
      let params:any = {
        "erroMessage": null,
        "id": 0,
        "uniqueKey": 0,
        "dataModel": null,
        "stringID": null,
        "successMessage": null,
        "token": null,
        "userName": null,
        "languageID": 0,
        "rowCount": 0,
        "isActionField": true,
        "filterCondition": null
      };
      if(this.pageType === 'dimensions'){
        url = 'Dimensions/GetDimensionsData?MenuId=' + this.subMenuId() + '&RecordID=' + this.subRecordId;
      }
      else if((this.page && this.page.pageType === 'detailmenu') || this.pageType === 'submenu' || this.pageType === 'callingsubmenu'){
        let filter:any = '';
        if(this.pageType === 'submenu' || this.pageType === 'callingsubmenu'){
          //filter = this.filterKey+'='+this.subRecordId;
          filter = this.filterKey;
        }
        else if(this.page.pageType === 'detailmenu'){
          filter = this.page.query;
        }
        
        params = {
          "menuID": id,
          "userID": user.id,
          "languageID": lang,
          "companyID": this.companyID(),
          "applicationID": user.applicationID,
          "queryfields": "",
          "pageNumber": currentPage,
          "pageSize": pageSize
        }
        params["filterCondition"] = filter;

        if(this.fieldQuery){
          params['filterCondition'] = filter +' and '+ this.fieldQuery;
        }
        if(this.applyFilter && this.showFilter()){
          params['filterCondition'] = filter + ' and ' +this.filterQuery;
          if(this.fieldQuery){
            params['filterCondition'] = filter +' and '+ this.fieldQuery + ' and ' +this.filterQuery;
          }
          url = 'SystemFields/GetMenuData?IsFilterConditionApply=true&JoinOuterCondition=true&isallFields=true';
        }else{
          url = 'SystemFields/GetMenuData?IsFilterConditionApply=true&JoinOuterCondition=false&isallFields=true';
        }
      } 
      else{
        
        params = {
          "menuID": id,
          "userID": user.id,
          "languageID": lang,
          "companyID": this.companyID(),
          "applicationID": user.applicationID,
          "queryfields": "",
          "pageNumber": currentPage,
          "pageSize": pageSize
        }
        
        if(this.applyFilter && this.showFilter()){
          params.filterCondition = this.filterQuery;
          joc = true;
        }
        url = 'SystemFields/GetMenuData?IsFilterConditionApply=true&JoinOuterCondition='+joc+'&isallFields=true';
      }
      let newrecord = this.newRecordAdded;
      let _newRecordID = this._newRecordID
      if(this.pageType === 'dimensions'){
        this._http.getClient<ApiResponse>(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: (response: any) => {
            if (response.dataModel && response.dataModel.length > 0) {
              this.updateTable(response, newrecord, _newRecordID);
            }else{
              this.createDimension();
            }
          },
          error: (_errMsg) => {
            this.isLoading.set(false);
          }
        })
      }
      else{
        this._http.putClient<any, ApiResponse>(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: (response) => {
            this.updateTable(response, newrecord, _newRecordID);
          },
          error: (_errMsg) => {
            this.isLoading.set(false);
            //this.auth.logout();
          }
        });
      }
    }
    }
  }

  createDimension(){
    const user = JSON.parse(localStorage.getItem('user') || '');
    const lang = JSON.parse(localStorage.getItem('lang') || '');
    let url = "General/DimenstionOperations";
    let params = {
      "menuID": this.subMenuId(),
      "pMenuID": this.pageType === 'mainmenu' || this.pageType === 'prerequisitemenu' ? 0 : this.pmenuid(),
      "fieldID": 0,
      "userID": user.id,
      "languageID": lang,
      "companyID": this.companyID(),
      "recordID": this.subRecordId,
      "pRecordID": this.precordid ? this.precordid : 0,
      "applicationID": user.applicationID,
    }

    this._http.postClient(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (_resposne)=>{
        this.getMenuData(7023, 1, 10);
      }
    })
  }

  updateTable(response: ApiResponse, newrecord: boolean, _newRecordID: any){
    this.isLoading.set(false);
    this.loader.hide();
    this.columns = [];
    this.vlist = [];
    this.dataSource.set([]);

    if (response.dataModel && response.dataModel.length > 0) {
      this.dataSourceRawVal = JSON.stringify(response.dataModel);
      this.getLookUps()
      this.noData.set(false);
      this.resultsLength.set(response.rowCount || 0);
      this.dataSourceRaw = response.dataModel;
      this.dataSourceRawString = JSON.stringify(response.dataModel);
      this.dataKeys = Object.keys(this.dataSourceRaw[0]);
      this.resCompanyID = response.dataModel[0]['CompanyID'];
      this.resCompanyIDemit.emit(this.resCompanyID)
      
      let vse = this.dataKeys.includes("VoucherSeq");
      let seq = this.dataKeys.includes("Seq");
      let se = this.dataKeys.includes("Sequence");
      let va = this.dataSourceRaw[0];
      let m = 0;
      if(vse){
        this.rowCount.emit(va['VoucherSeq']);
      }
      else if(seq){
        this.rowCount.emit(va['Seq'])
      }
      else if(se){
        this.rowCount.emit(va['Sequence']);
      }
      else{
        this.rowCount.emit(this.resultsLength());
      }
      

     
      this.newRowCount = Math.max.apply(null,
        this.dataSourceRaw.map((o:any)=>{ 
          if(o.VoucherSeq){
            m = o.VoucherSeq; 
          }
          else if(o.Seq){
            m = o.Seq; 
          }
          if(o.Sequence){
            m = o.Sequence; 
          }
          return m;
      }));

      this.dataSourceRaw.forEach((x:any, i: number) =>{ 
          x.SNO =  i + 1
        }
      );

      this.dataSource.update(arr =>
        arr.map((e: any, i: number) => ({ 
          ...e,
          SNO: i + 1
        }))
      );

      let sysList:any = []

      if(this.fieldVal && this.fieldVal.length > 0){
        this.fieldVal.forEach((e: any) => {
          if(e.FieldName){
          let a = ['TabPage','GridTab','GridView','BTN','Expression','ExtText']
          let b = a.includes(e.FieldType)
          if (!b) {
            this.columns.push({
              header: e.FieldCaption,
              name: e.FieldName,
              fieldType: e.FieldType,
            })
          }
          }
          sysList.push({
            'FieldName': e.FieldName,
            'FieldCaption': e.FieldCaption,
            'FieldType': e.FieldType,
            'ListId': e.ListId,
            'Id': e.Id,
            'Seq': e.VoucherSeq
          })
        })
      }

      if(this.dataKeys.includes('ID')){
        sysList.push({
          'FieldName': 'ID',
          'FieldCaption': 'ID',
          'FieldType': 'TextBox',
          'ListId': null,
          'Id': 0,
          'Seq': 0
        })
      }
      if(this.fieldVal && this.fieldVal.length > 0){
        this.fieldVal.forEach((e: any)=>{         
          if(this.dataKeys.includes(e.FieldName)){
            this.vlist.push({
              id: e.Id,
              name: e.FieldCaption,
              hide: false
            })
          }
        })
      }

      if(this.fieldValRaw && this.fieldValRaw.length > 0){
      this.fieldValRaw.forEach((e: any)=>{     
        let a = ['TabPage','GridTab','GridView','BTN','Expression','ExtText']
        let b = a.includes(e.FieldType)    
        if(this.colLayoutData && !this.colLayoutData.includes(e.Id) && e.FieldName && e.Visible === true && !b){
          this.vlist.push({
            id: e.Id,
            name: e.FieldCaption,
            hide: true
          })
        }
      })
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
      this.sysList.set(newSorted);

      this.updateGoto();

      if(this.pageType === 'dimensions' && this.resultsLength() === 1 && this.autoOpen){
        this.showSubRecord( this.dataSourceRaw[0].ID, 1,'details','details')
      }

      if(newrecord){
        if(_newRecordID.type === 'save'){
          if(_newRecordID.model){
            if(this.pageType === 'mainmenu' && this.page.pageType !== 'prerequisitemenu'){
              this.showRecord(this.dataSourceRaw[0].ID, 1,'details','details')
            }else{
              this.showSubRecord(_newRecordID.modelid, 1,'details','details')
            }
          }else{
            this.activeRecord = _newRecordID.modelid;
            this.activeRecordChange.emit(this.activeRecord);
          }
        }
        else{
          this.newRecordAdded = false;
          this.activeRecord = 0;
          this.activeRecordChange.emit(this.activeRecord);
          this.newRecordShow.set(false);
          if(_newRecordID.type === 'saveadd'){
            if(this.page.pageType === 'prerequisitemenu'){
              this.rowCount.emit(0);
            }
            //this.addRecord();
          }
        }
      }else if(_newRecordID && _newRecordID.type === 'saveadd'){
          this.newRecordAdded = false;
          this.activeRecord = 0;
          this.activeRecordChange.emit(this.activeRecord);
          this.newRecordShow.set(false);
          if(this.page.pageType === 'prerequisitemenu'){
            this.rowCount.emit(0);
          }
          //this.addRecord();
      }
    }
    else{
      if(this.page && this.page.pageType === 'prerequisitemenu' && this.preReqIndex && response.erroMessage){
        this.toastr.error(response.erroMessage);
      }
      this.noData.set(true);
      this.rowCount.emit(0);
      this.resultsLength.set(0);
      this.fieldVal.forEach((e: any) => {
        if(e.FieldName){
        let a = ['TabPage','GridTab','GridView','BTN','Expression','ExtText']
        let b = a.includes(e.FieldType)
        if (!b) {
          this.columns.push({
            header: e.FieldCaption,
            name: e.FieldName,
            fieldType: ''
          })
        }
        }
      })
      if(this.fieldVal && this.fieldVal.length > 0){
        this.fieldVal.forEach((e: any)=>{         
          if(e.FieldName){
            this.vlist.push({
              id: e.Id,
              name: e.FieldCaption,
              hide: false
            })
          }
        })
      }

      if(this.fieldValRaw && this.fieldValRaw.length > 0){
      this.fieldValRaw.forEach((e: any)=>{     
        let a = ['TabPage','GridTab','GridView','BTN','Expression','ExtText']
        let b = a.includes(e.FieldType)    
        if(this.colLayoutData && !this.colLayoutData.includes(e.Id) && e.FieldName && e.Visible === true && !b){
          this.vlist.push({
            id: e.Id,
            name: e.FieldCaption,
            hide: true
          })
        }
      })
    }
      
    }
 
  }

   sortData(header: string){
    let c = header;
    if(this.sorder === 'atob'){
      this.sorder = 'btoa';
      this.dataSource.set([...this.dataSource()].sort((a, b) => {
          const x = a[c];
          const y = b[c];

          // Handle null or undefined
          if (x == null && y == null) return 0;
          if (x == null) return 1;
          if (y == null) return -1;

          // If both are numbers, sort numerically
          if (!isNaN(x) && !isNaN(y)) {
            return Number(x) - Number(y);
          }

          // If both are valid dates, sort by date
          const dx = new Date(x);
          const dy = new Date(y);
          if (!isNaN(dx.getTime()) && !isNaN(dy.getTime())) {
            return dx.getTime() - dy.getTime();
          }

          // Default: string sort (case-insensitive)
          return x.toString().localeCompare(y.toString(), undefined, { sensitivity: 'base' });
      }));
    }else{
      this.sorder = 'atob';
      this.dataSource.set([...this.dataSource()].sort((a, b) => {
        const x = a[c];
        const y = b[c];

        // Handle null or undefined
        if (x == null && y == null) return 0;
        if (x == null) return 1;
        if (y == null) return -1;

        // If both are numbers, sort numerically
        if (!isNaN(x) && !isNaN(y)) {
          return Number(x) - Number(y);
        }

        // If both are valid dates, sort by date
        const dx = new Date(x);
        const dy = new Date(y);
        if (!isNaN(dx.getTime()) && !isNaN(dy.getTime())) {
          return dx.getTime() - dy.getTime();
        }

        // Default: string sort (case-insensitive)
        return x.toString().localeCompare(y.toString(), undefined, { sensitivity: 'base' });
      }).reverse());
    }
  }


  getLookUps(){
    const lang = JSON.parse(localStorage.getItem('lang') || '');
    let url = "General/LookupValues?menuId="+this.exportid+"&languageid="+lang;

    this._http.getClient<ApiResponse>(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response)=>{
        this.loader.hide();
        if(response && response.dataModel){
            let model: any = response.dataModel;
            let dkey = Object.keys(model);
            if(this.dataSourceRaw){
              this.dataSourceRaw.forEach((e: any, i: number)=>{
                dkey.forEach((a: any)=>{
                  if(this.dataSourceRaw[i][a]){
                    let aa = model[a];  
                    aa.forEach((j: any) => {
                      if(this.dataSourceRaw[i][a] && (j.id === this.dataSourceRaw[i][a].toString())){
                        this.dataSourceRaw[i][a] = j.name;
                      }
                    });
                  }
                })
              })
              this.dataSource.set([...this.dataSourceRaw].sort((a, b) => b.ID - a.ID));
            }else{
              this.dataSource.set([...this.dataSourceRaw].sort((a, b) => b.ID - a.ID));
            }
            this.dataSource.update(arr =>
              arr.map((e: any, i: number) => ({
                 ...e, 
                 SNO: i + 1,
                }))
            );
        }else{
            this.dataSource.set([...this.dataSourceRaw].sort((a, b) => b.ID - a.ID));
             this.dataSource.update(arr =>
              arr.map((e: any, i: number) => ({
                 ...e, 
                 SNO: i + 1,
                }))
            );
        }
      }
    })
  }

  getMenuViewsData(id: number, currentPage: number, pageSize: number){
    this.isLoading.set(true);
    this.columns = [];
    const user = JSON.parse(localStorage.getItem('user') || '');
    const lang = JSON.parse(localStorage.getItem('lang') || '');
    let url = 'SystemFields/GetMenuDatafromView?isallFields=true';
    
    let params:any = {
      "menuID": id,
      "userID": user.id,
      "languageID": lang,
      "companyID": this.companyID(),
      //"recordID": 0,
      "applicationID": user.applicationID,
      "notes": "string",
      "type": this.page.menuType,
      //"queryfields": "string",
      "pageNumber": currentPage,
      "pageSize": pageSize
    };
    if(this.applyFilter && this.showFilter()){
      params['filterCondition'] = this.filterQuery;
    }
    this._http.putClient<any, ApiResponse>(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next:(response)=>{
        this.isLoading.set(false);
        if (response.dataModel && response.dataModel.length > 0) {
          this.noData.set(false);
          this.resultsLength.set(response.rowCount || 0);
          this.dataSourceRaw = response.dataModel;
          this.dataSource.set([...this.dataSourceRaw].sort((a, b) => b.ID - a.ID));
          this.dataKeys = Object.keys(this.dataSourceRaw[0]);
          this.dataSourceRaw.forEach((x:any, i: number) =>{ 
          x.SNO =  i + 1
            }
          );
            this.dataSource.update(arr=> arr.map((e: any, i: number)=>({
              ...e,
              SNO: i+1,
              isDelete: false
            })))
     
          let sysList:any = [];
          this.fieldVal.forEach((e: any) => {
            if(e.FieldName){
            let a = ['TabPage','GridTab','GridView','BTN','Expression','ExtText']
            let b = a.includes(e.FieldType)
            if (!b) {
              this.columns.push({
                header: e.FieldCaption,
                name: e.FieldName,
                fieldType: e.FieldType
              })
            }
            }

            sysList.push({
              'FieldName': e.FieldName,
              'FieldCaption': e.FieldCaption,
              'FieldType': e.FieldType,
              'ListId': e.ListId,
              'Id': e.Id,
              'Seq': e.VoucherSeq
            })
          })

          if(this.dataKeys.includes('ID')){
            sysList.push({
              'FieldName': 'ID',
              'FieldCaption': 'ID',
              'FieldType': 'TextBox',
              'ListId': null,
              'Id': 0,
              'Seq': 0
            })
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
          console.log(newSorted)
          this.sysList.set(newSorted);

          this.updateGoto();
        }else{
          this.noData.set(true);
        }
      },
      error: (_error)=>{
        this.isLoading.set(false);
      }
    })
  }

  sizeChange(e: number){
    this.pageSize.set(e);
    let id = this.subMenuId();
    this.currentPage.set(1)
    this.getMenuData(id, this.currentPage(), this.pageSize());
    this.toggleCount('rcount');
  }

  sortOrder(e: string){
    this.toggleCount('rcount');
    this._sortOrder.set(e);
    if(e === 'desc'){
      this.dataSource.set([...this.dataSource()].sort((a, b) => b.ID - a.ID));
    }else{
      this.dataSource.set([...this.dataSource()].sort((a, b) => a.ID - b.ID));
    }
  }

  updateGoto() {
    this.totalPages.set(Math.ceil(this.resultsLength() / this.pageSize()));
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
    let id = this.subMenuId();
    this.getMenuData(id, this.currentPage(), this.pageSize());
  }

  numbersOnly(event: any) {
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

  fieldValue(i: number) {
    let dd = JSON.parse(this.dataSourceRawString);
    let data = dd[i - 1];
    let fieldActionBody: any = {};
    fieldActionBody['ID'] = data['ID'];
    fieldActionBody['CompanyID'] = this.companyID();
    if(this.fieldValRaw && this.fieldValRaw.length > 0){
    this.fieldValRaw.forEach((x: any) => {
      let b = this.dataKeys.includes(x.FieldName);
      x.descEn = null;
      x.internalFieldEdit = false;
      x.keyTab = false;
      if (b) {
        let c = data[x.FieldName];
        if (typeof c !== 'object') {
          x.FieldVal = c;
          fieldActionBody[x.FieldName] = c;
        } else {
          x.FieldVal = null;
          fieldActionBody[x.FieldName] = null;
        }
      }else{
        x.FieldVal = null;
      }
    });
    }
    let fieldValRaw: any = JSON.stringify(this.fieldVal.filter((x:any)=>  x.FieldType !== 'TabPage' && x.FieldType !== 'GridTab' && x.FieldType !== 'GridView' && x.FieldType !== 'BTN' && x.FieldType !== 'Expression' && x.FieldType !== 'ExtText'));
    if(fieldValRaw){
      this.fieldAction.update(e=>[...e, {fieldActionBody: fieldActionBody, field: JSON.parse(fieldValRaw), internalEdit: false}]);
    }
    fieldValRaw = '';

    //this.menus = JSON.stringify(this.fieldValRaw);
    if(this.newRecordAdded && this._newRecordID.type !== 'saveadd' && this._newRecordID.model !== 'update' && (this.pageType === 'mainmenu' || this.pageType === 'prerequisitemenu' )){
      this.newRecordAdded = false;
      const index = this.recordList.findIndex((x: any) => x.id === 0);
      if(index >= 0){
        this.recordList.splice(index, 1);
      }
    }
    this.menusChange.emit(this.menus);
  }


  showRecord(record: number, i: number, type: string, tab: string) {
    
    if(this.recordList.length === 0) {
      this.fieldValue(i);
    } else {
      const index = this.recordList.findIndex((x: any) => x.id === record);
      if (index < 0 || (this.newRecordAdded && index <=0)) {
        this.fieldValue(i);
      }
    }
    this.activeRecord = record;
    this.activeRecordChange.emit(this.activeRecord);
   // this._menus.activeRecord.next(this.activeRecord)
    this.detailsPage = true;
    this.detailsPageChange.emit(this.detailsPage);
    this.newRecordShow.set(false);
    this.recordId = record;
    if (tab) {
      this.tabname = tab;
      this.tabnameChange.emit(tab);
    }
  }

  showSubRecord(record: number, i: number, type: string, tab: string) {
    this.fieldValue(i);
    this.subRecordData = this.dataSourceRaw[i - 1];
    this.subRecordID = record;
    let subRecord = {id: this.subRecordID, data: this.subRecordData, label: this.menus}
    this.subRecordDetail.emit(subRecord)
  }

  modalRecord(record: number){
    this.openDimension = true;
    this.subRecordID = record;
    /*this.modal = new Modal(this.modalRef, {
      keyboard: false,
      backdrop: 'static'
    });*/
    this.modal.show('modalDimension'+this.recordStamp);
  }

  closeDetails(record: number) {
    if (record === this.activeRecord) {
      this.activeRecord = 0;
      this.activeRecordChange.emit(this.activeRecord);
      this.detailsPage = false;
      this.detailsPageChange.emit(this.detailsPage);
    }
    if (this.recordList && this.recordList.length !== 0) {
      const index = this.recordList.findIndex((x: any) => x.id === record);
      if(index > -1){
        this.recordList.splice(index, 1);
      }
    }
    //this._menus.recordList.next(this.recordList);
    if (this.recordList && this.recordList.length === 0) {
      this.detailsPage = false;
      this.detailsPageChange.emit(this.detailsPage);
    }
  }

  addRecord() {
      if (this.recordList && this.recordList.length === 0) {
        this.recordList.push({ id: 0, newrecord: true, menus: null, disableClose: false, submenus: [] });
        this.recordList.currentid = 0;
        //this._menus.recordList.next(this.recordList);
      } else {
        const index = this.recordList.findIndex((x: any) => x.id === 0);
        if (index < 0) {
          this.recordList.push({ id: 0, newrecord: true, menus: null,  disableClose: false, submenus: [] });
          this.recordList.currentid = 0;
          //this._menus.recordList.next(this.recordList);
        }
      }
      this.activeRecord = 0;
      this.activeRecordChange.emit(this.activeRecord);
    
   /* this.FieldVal.forEach((e: any) => {
      //e.FieldVal = null;
      e.wfEnabled = false;
      e.editablefielddetails = '';
    });*/
    //this.menus = JSON.stringify(this.fieldValRaw);
    if(this.newRecordAdded && this._newRecordID.type !== 'saveadd' && (this.pageType === 'mainmenu' || this.pageType === 'prerequisitemenu')){
      this.newRecordAdded = false;
      const index = this.recordList.findIndex((x: any) => x.id === 0);
      if(index >= 0){
        this.recordList.splice(index, 1);
      }
    }
    this.menusChange.emit(this.menus);
    this.newRecordShow.set(true);

   // this._menus.activeRecord.next(this.activeRecord)
    //this._menus.addRecord.next('');
  }

  openMemo(header: string, msg: any){
    this.memoNote = true;
    this.modalTitle = header;
    this.modalMessage = msg;
   /* this.modal = new Modal(this.modalRef, {
      keyboard: false,
      backdrop: 'static'
    });*/
    this.modal.show('modalBox'+this.exportid);
  }

  closeModal() {
    this.modal.hide();
    this.modalShow = true;
    this.openDimension = false;
  }

  clickEvent(index: number) {
      this.cindex = index
  }

  exportData(id: number, size: number) {
    if(!this.noData()){
      const user = JSON.parse(localStorage.getItem('user') || '');
      const lang = JSON.parse(localStorage.getItem('lang') || '');
      
      if(this.page && this.page.menuType === 'View'){
  
        let url = 'SystemFields/GetMenuDatafromView?isExport=true&isallFields='+this.exportAll();
      
        let params:any = {
          "menuID": id,
          "userID": user.id,
          "languageID": lang,
          "companyID": this.companyID(),
          "applicationID": user.applicationID,
          "notes": "string",
          "type": this.page.menuType,
          "pageNumber": 1,
          "pageSize": size
        };

        if(this.applyFilter && this.showFilter()){
          params['filterCondition'] = this.filterQuery;
        }
        this._http.putClient<any, ApiResponse>(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: (response)=>{
            this.isLoading.set(false);
            this.getXlFile(response);    
          },
          error: (_error)=>{
            this.isLoading.set(false);
          }
        })
      }
      else{
        let url = 'SystemFields/GetMenuData?IsFilterConditionApply=true&JoinOuterCondition=false&isExport=true&isallFields='+this.exportAll();
        let params: any = {
          "menuID": id,
          "userID": user.id,
          "languageID": lang,
          "companyID": this.companyID(),
          "applicationID": user.applicationID,
          "queryfields": "",
          "pageNumber": 1,
          "pageSize": size
        }
        let filter:any = '';
        if(this.pageType === 'submenu' || this.pageType === 'callingsubmenu'){
          //filter = this.filterKey+'='+this.subRecordId;
          filter = this.filterKey;
        }
        else if(this.page.pageType === 'detailmenu'){
          filter = this.page.query;
        }
        params["filterCondition"] = filter;
        if(this.applyFilter && this.showFilter()){
          params['filterCondition'] = filter + ' and ' +this.filterQuery;
          if(this.fieldQuery){
            params['filterCondition'] = filter +' and '+ this.fieldQuery + ' and ' +this.filterQuery;
          }
        }
        this.isLoading.set(true);
        this._http.putClient<any, ApiResponse>(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: (response)=>{
            this.isLoading.set(false);
            this.getXlFile(response);    
          },
          error: (_error)=>{
            this.isLoading.set(false);
          }
        })
      }
    }
  }

  getXlFile(response: ApiResponse){
    this.isLoading.set(false);
    if(response.dataModel){
      const binaryString: any = response.dataModel;
      // Decode base64 string to ArrayBuffer   
      const byteCharacters = atob(binaryString);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);

      // Create a Blob from ArrayBuffer
      const blob = new Blob([byteArray], {
          type:'application/vnd.openxmlformatsofficedocument.spreadsheetml.sheet',
      });

      // Create a temporary anchor element
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'downloaded_template.xlsx'; // File name
      document.body.appendChild(link);

      // Programmatically click the link to trigger the download
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href);
    }else{
      if(response.erroMessage){
        this.toastr.error(response.erroMessage)
      }
    }
  }

  getQuery(q: string, i: number){
    let regex = /\[([^\]]+)\]/g;
    let matches = [];
    let match;    
    let a = JSON.parse(this.dataSourceRawVal);
    let dtr = a[i];
    while ((match = regex.exec(q)) !== null) {
      matches.push(match[1]);
    }

    // Output the matches 
    matches.forEach((x: any)=>{
      let c = typeof dtr[x];
      if(c === 'string'){
        q =q.replaceAll("["+x+"]", "'"+dtr[x]+"'");
      }
      else{
        q = q.replaceAll("["+x+"]", dtr[x]);
      }
    })

    return q;
  }

  detailsOpen(i: any, record: number, sno: number){
  //  this.sideBar.menuNav.next("true");
    let query = ''; 
    if(i.LinkedQuery){
      //query =  this.getQuery(i.LinkedQuery, (sno - 1));
      query = i.LinkedQuery;
    }

      let a = i.LinkedQuery.split('[');
      let b = a[1].split(']');
      
    let d = JSON.parse(this.dataSourceRawVal);
    let dtr = d[sno - 1];
    const items = {id: i.LinkedMenuID, dtid: i.LinkedMenuID+"-"+ dtr[b[0]], pwfid: '', query: query, name:  this.menuaccess ? this.menuaccess.MenuName+"*":"Dimensions *", pageType: 'detailmenu', menuType: '', record: 'add', previousMenuId: i.MenuID, previousRecordID: record, isKeyManualInput: null, isJobEnable: i.isJobEnable, disableClose: false};
    this.store.dispatch(StoreAction.addPage({menu: items}))
    this.store.dispatch(StoreAction.activePage({active: i.LinkedMenuID+"-"+ dtr[b[0]]}))

  }

  filterToggle(){
    this.showFilter.update(value => !value);
    if(!this.showFilter()){
      this.filterOff(false);
    }
  }

  filterOff(e: boolean){
    this.showFilter.set(e);
  }

  setFilterValueEvent(e: any){
    if(e.query){
      this.applyFilter = true;
      this.filterQuery = e.query;
    }else{
      this.applyFilter = false;
      this.filterQuery = null;
    }
    this.getMenuData(this.menuid(), 1, this.pageSize());
  }
  
  genReport(record: number, i: number){
    this.recordList.splice(0, this.recordList.length);
    let params = {page: this.page, recordid: record, index: i, companyID: this.resCompanyID, data: this.dataSourceRaw[i - 1]};
    this.prerequisiteType.emit(params)
  }

  doubleClick(){
    if(!this.noData() && !this.editMode() && this.wfstatus() !== 'Approved' && this.wfstatus() !== 'Rejected' && (!this.readOnly() || this.pageType === 'callingsubmenu')){
      this.editMode.set(true);
      this.updateRecord = [];
      this.deleteRecordList = [];
      let records = this.dataSourceRaw;
      if(!this.dataSourceRawString){
        this.dataSourceRawString = JSON.stringify(records);
      }
      this.fieldAction.set([]);
      for(let a = 0; a < records.length; a++){
        this.fieldValue(records[a].SNO);
      }
    }
  }

  fieldEditClick(e: number, i: number){
    this.fieldAction()[e].field[i].internalFieldEdit = true;
    this.fieldAction()[e].internalEdit = true;
    if(this.fieldAction()[e].field[i].FieldType === 'LookUp'){
      this.fieldAction()[e].field[i].updateList = true;
    }

    if(this.fieldAction()[e].field[i].FieldType === 'Editor' && !this.fieldAction()[e].field[i].descEn){
      this.getSysFieldsValue(e);
     }
  }

  closeEdit(type: string){
      if(type === 'save'){
        if(this.callFieldAction || this.fieldActionid !== 0){
          this.getActionFieldVal();
        }
        else{
          this.newarrayCalls = [];
          this.updatearrayCalls = [];
          let error = 0;
          let fieldAction = this.fieldAction();
          fieldAction.forEach((i:any)=>{
            if(i.internalEdit){
              i.field.forEach((a:any)=>{
                if(a.Mandatory && !a.FieldVal && a.FieldVal !== 0 && error === 0){   
                  alert("Enter value for "+a.FieldCaption);     
                  error++;
                  return;
                }
              })
            }
          })
          this.fieldAction.set(fieldAction);
          if(error === 0){
            if(this.deleteRecordList.length){
              this.drecordLength = this.deleteRecordList.length;
              for(let i = 0; i < this.drecordLength; i++){
                this.deleteAllRecord(this.deleteRecordList[i].id, i);
              }
            }else if(this.updateRecord.length){
              this.recordLength = this.updateRecord.length;
              for(let i = 0; i < this.recordLength; i++){
                this.updateAllRecord(this.updateRecord[i].index, i);
                if(this.recordLength === i + 1){
                  this.insertBulkRecord()
                }
              }
            }
            else{
              this.editMode.set(false);
              this.addNewRecords = false;
              this.intialNewRecord = [];
              this.newcolumns = [];
              let mid = this.exportid;
              if(this.pageType === 'dimensions'){
                mid = 7023
              }
              this.getMenuData(mid, 1, this.pageSize());
            }
          }
        }
      }else{
        this.editMode.set(false);
        this.addNewRecords = false;
        this.intialNewRecord = [];
        this.newcolumns = [];
        this.fieldAction.set([]);
        if(this.deleteRecordList.length){
          this.drecordLength = this.deleteRecordList.length;
          for(let i = 0; i < this.drecordLength; i++){
            this.deleteCancel(this.deleteRecordList[i].id, i);
          }
        }

        if(this.noData()){
          this.dataSource.set([]);
        }else{
          this.dataSource.set([...this.dataSourceRaw].sort((a, b) => b.ID - a.ID));
        }
        this.updateRecord = [];
        this.deleteRecordList = [];
        this.dataSource.update(arr => arr.map((e: any, i: number)=>({
          ...e,
          SNO: i+1})
        ))
      }
    
  }
  
  deleteAllRecord(i: number, x: number){
    const user = JSON.parse(localStorage.getItem('user') || '');
    const lang = JSON.parse(localStorage.getItem('lang') || '');
    let url = "DynamicCRUD_OP/DeleteRecord";
    let originalData = JSON.parse(this.dataSourceRawString)
    let mid = this.exportid;
    let a = this.deleteRecordList.findIndex( (e:any)=> e.id === i);
    let b = this.dataSource().findIndex( (e:any)=> e.ID === i);
    if(this.pageType === 'dimensions'){
      mid = 7023
    }
    let params = {
      "menuID": mid,
      "userID": user.id,
      "languageID": lang,
      "companyID": this.companyID(), 
      "jsonData": this.fieldAction()[b].fieldActionBody,
      "originalData": originalData[b] ? originalData[b] : this.fieldAction()[b].fieldActionBody,
    }
    
    this.loader.show();

    this._http.putClient<any, ApiResponse>(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next:(res)=>{
        this.loader.hide();
        if(res.erroMessage){
          this.toastr.error(res.erroMessage)
        }

       
        if( a > -1){
          this.deleteRecordList.splice(a, 1);
        }
        if(b > -1){
          this.dataSource()[b].isDelete = false;
        }

        //this.deleteRecordList.splice(i, 1);
        //this.dataSource.filteredData[i].isDelete = false;
        this.deletedSubRecord.emit({menuid: mid, record: this.recordId});
        if((x+1) === this.drecordLength){
          this.deleteRecordList = [];
          this.closeEdit('save');
        }
      },
      error: (_e: any)=>{
        this.loader.hide();
      }
    });
  }

  insertBulkRecord(){
    if(this.newarrayCalls.length > 0){
      let url = "General/BulkInsert";
      this._http.putClient(url, this.newarrayCalls.reverse()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next:(res:any)=>{
          this.updateRecord = [];
                    //this.closeEdit('save');
                this.editMode.set(false);
                this.addNewRecords = false;
                this.intialNewRecord = [];
                this.newcolumns = [];
                let mid = this.exportid;
                if(this.pageType === 'dimensions'){
                  mid = 7023
                }
                this.getMenuData(mid, 1, this.pageSize());
          res.forEach((response: any) => {
            if(response.erroMessage){
              this.toastr.error(response.erroMessage);      
            }else if(response.dataModel){
              if(response.successMessage === 'Data created successfully'){
                this.toastr.success("Record "+ response.dataModel + " created");
              }else if(response.successMessage === 'Data Updated Successfully'){
                this.toastr.success("Record "+ response.dataModel + " updated");
              }
            }
          });
        }
      })
    }

    if(this.updatearrayCalls.length > 0){
      let url = "General/BulkUpdate";
      this._http.putClient(url, this.updatearrayCalls.reverse()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next:(res:any)=>{
          this.updateRecord = [];
                    //this.closeEdit('save');
                this.editMode.set(false);
                this.addNewRecords = false;
                this.intialNewRecord = [];
                this.newcolumns = [];
                let mid = this.exportid;
                if(this.pageType === 'dimensions'){
                  mid = 7023
                }
                this.getMenuData(mid, 1, this.pageSize());
          res.forEach((response: any) => {
            if(response.erroMessage){
              this.toastr.error(response.erroMessage);      
            }else if(response.dataModel){
              if(response.successMessage === 'Data created successfully'){
                this.toastr.success("Record "+ response.dataModel + " created");
              }else if(response.successMessage === 'Data Updated Successfully'){
                this.toastr.success("Record "+ response.dataModel + " updated");
              }
            }
          });
        }
      })
    }
  }

  updateAllRecord(i: number, x: number){
    
      this.editMode.set(false);
      this.addNewRecords = false;
      this.intialNewRecord = [];
      this.newcolumns = [];
      let url = '';
      let params:any = {};
      let mid = this.exportid;
      if(this.pageType === 'dimensions'){
        mid = 7023
      }
      const lang = JSON.parse(localStorage.getItem('lang') || '');
      const user = JSON.parse(localStorage.getItem('user') || '');
      if(this.fieldAction()[i].fieldActionBody['ID'] === 0){
        url = "General/BulkInsert";
        params = {
          "menuID": mid,
          "userID": user.id,
          "languageID": lang,
          "companyID": this.companyID(),
          "applicationID": user.applicationID,
          "jsonData": this.fieldAction()[i].fieldActionBody,
          "originalData": "",
        }
        this.newarrayCalls.push(params);
      }else{
        let diff = '';
        url = "EfDynamic/UpdateRecord";
        let originalData = JSON.parse(this.dataSourceRawString);
        let ii = originalData.findIndex((e:any)=> e.ID === this.fieldAction()[i].fieldActionBody['ID']);

        params = {
          "menuID": mid,
          "userID": user.id,
          "languageID": lang,
          "companyID": this.companyID(),
          //"recordID": this.fieldAction()[i].fieldActionBody['ID'],
          "jsonData": this.fieldAction()[i].fieldActionBody,
          "originalData": originalData[ii],
        }
        this.updatearrayCalls.push(params);

      if(originalData[i]){
        diff = this.diffData(this.fieldAction()[i].fieldActionBody, originalData[i]);
        this.createLog(diff, originalData[i], this.fieldAction()[i].fieldActionBody['ID']);
      }
    }
      this.isLoading.set(true);
      
  }

  getmainval(e: any, i: number, fieldName: string){
    if(e && (this.fieldAction()[i].fieldActionBody[fieldName] !== e.value)){
      if(this.updateRecord.length > 0){
        let b = this.updateRecord.findIndex( (e:any)=> e.index === i);
        if(b === -1){
          this.updateRecord.push({index: i})
        }
      }
      else{
        this.updateRecord.push({index: i})
      }
      
    }
    if(e.value || e.value === 0 || e.value === false){
      this.fieldAction()[i].fieldActionBody[fieldName] = e.value;
      let a = this.fieldAction()[i].field.findIndex((x: any)=> x.FieldName === fieldName);
      if(a > -1){
        this.fieldAction.update(actions => actions.map((action: any, idx: number) => idx !== i ? action : {
          ...action,
          field: action.field.map((f: any, index: number) =>
            index !== a ? f : {
                  ...f,
                  FieldVal: e.value,
                  descEn: e.descEn
                })
            }));
      }
    }else{
      this.fieldAction()[i].fieldActionBody[fieldName] = e.value;
      let a = this.fieldAction()[i].field.findIndex((x: any)=> x.FieldName === fieldName);
      if(a > -1){
      this.fieldAction.update(actions => actions.map((action: any, idx: number) => idx !== i ? action : {
          ...action,
          field: action.field.map((f: any, index: number) =>
            index !== a ? f : {
                  ...f,
                  FieldVal: e.value,
                  descEn: e.descEn
                })
            }));
      }
    }
  }

  keypresseventEvt(_e: any, sno: any, i: number){
    if(_e){
      this.keyEventSNO = sno;
      this.keyEventI = i;
    }
  }

  callActionFieldEvent(e: any, i: number, fieldName: any){
    if(e.action){
      this.callFieldAction = true;
      this.fieldActionid = e.id;
      this.actionFieldNumber = i;
    }else{
      this.callFieldAction = false;
    }
 
    this.actionQueryField = this.fieldAction()[i].fieldActionBody;
  }

  getActionFieldVal(){
    const lang = JSON.parse(localStorage.getItem('lang') || '');
    const user = JSON.parse(localStorage.getItem('user') || '');
    let url = "SystemFields/GetDataFieldsQueryExecutions";
   
    let params= {
      "menuID": this.menuid(),
      "pMenuID": this.pmenuid(),
      "fieldID": this.fieldActionid,
      "userID": user.id,
      "languageID": lang,
      "companyID": this.companyID(),
      "recordID": this.recordId ? this.recordId : 0,
      "pRecordID": this.precordid,
      "applicationID": user.applicationID,
      "queryfields": this.actionQueryField,
    }
    this.isLoading.set(true);
    this._http.putClient<any, ApiResponse>(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (response) => { 
          this.isLoading.set(false);
          if(response.erroMessage){
           this.toastr.error(response.erroMessage);
          }
          else if(response.dataModel && response.dataModel.length > 0){
            let model: any = response.dataModel;
            this.saveModelRecord = true;
            this.actionfieldVal(model, this.actionFieldNumber);
          }else{
            this.callFieldAction = false;
            this.fieldActionid = 0;
            this.closeEdit('save');
          }
        },
        error: (_e)=>{
          this.isLoading.set(false);
        }
    })
  }

  actionfieldVal(e: Event, i: number){
    let model:any = e;
    let fab = Object.keys(this.fieldAction()[i].fieldActionBody);
    this.actionStop = false;
    let yid: any = [];
    model.forEach((r:any)=>{
      if(r.actionType === 'Stop' && r.actionValue){     
        this.fieldAction()[i].field.forEach((x:any)=>{
          if(r.fieldName === x.FieldName){
            x.FieldVal = null;
            x.descEn = null;
          }   
        })
        this.actionStop = true;
        this.toastr.error(r.actionValue);
        return;
      }else if(!this.actionStop && r.actionType === 'Set Value' || (r.actionType === 'Refresh' && r.actionValue)){
        let v = r.fieldName;
        this.fieldAction()[i].fieldActionBody[r.fieldName] = r.actionValue;

        this.fieldAction()[i].field.forEach((x:any)=>{
          if(fab.includes(v)){
            x.FieldVal = this.fieldAction()[i].fieldActionBody[x.FieldName];
          }
        })

        if(fab.includes(v)){
          this.fieldAction.update(actions =>
  actions.map((action: any, idx: number) => {
    if (idx !== i) return action;

    return {
      ...action,
      field: action.field.map((y: any) => {
        if (y.FieldName !== v) return y;

        const key = y.FieldName;

        if (y.FieldType === 'CheckBox') {
          const isTrue =
            r.actionValue === '1' ||
            r.actionValue?.toLowerCase() === 'true';

          return {
            ...y,
            FieldVal: isTrue,
            ...(action.fieldActionBody[key] = isTrue, {})
          };
        }

        const newVal = r.actionValue;

        const updatedField = {
          ...y,
          FieldVal: newVal,
          descEn: newVal ? y.descEn : null
        };

        action.fieldActionBody[key] = newVal;

        this.fieldActionid = 0;

        if (this.saveModelRecord) {
          this.callFieldAction = false;
          this.saveModelRecord = false;
          this.closeEdit('save');
        }
        
        if (y.FieldType === 'LookUp' || y.FieldType === 'Editor') {
          let val = newVal;

          if (typeof val === 'string') {
            val = `'${val}'`;
          }

          if (y.Id) {
            this.actionTypeValues = true;
            yid.push(updatedField);
          }
        }

        return updatedField;
      })
    };
  })
);
        }
      }
    })
    setTimeout(()=>{
      if(this.actionTypeValues){
        this.getActionTypeVal(yid, i)
      }
    },1000)
  }

  getActionTypeVal(a: any, i: number){
    const lang = JSON.parse(localStorage.getItem('lang') || '');
    let url = "Sys/GetSysFieldsTypeValue?menuId="+this.menuid()+"&languageid="+lang;
    this.loader.show();
    this._http.putClient<any, ApiResponse>(url, this.fieldAction()[i].fieldActionBody).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => { 
        this.loader.hide();
        if(response.erroMessage){
          this.toastr.error(response.erroMessage)
        }
        else if(response.dataModel && response.dataModel.length > 0){
              let res = response.dataModel;
              this.fieldAction.update(actions => {
  // Precompute lookups once
  const aSet = new Set(a.map((x: any) => x.Id));
  const resMap = new Map(
    res.map((r: any) => [r.fieldId, r.data?.[0]])
  );

  return actions.map((action: any, idx: number) => {
    if (idx !== i) return action;

    return {
      ...action,
      field: action.field.map((y: any) => {
        if (!aSet.has(y.Id)) return y;

        const obj = resMap.get(y.Id);

        return {
          ...y,
          descEn: obj ? Object.values(obj)[0] : y.FieldVal,
          updateList: !!obj
        };
      })
    };
  });
});
        }
      },
      error: (_e)=>{
        this.loader.hide();
      }
    })
  }

  deleteRecord(r: number, i: number){
    this.deleteRecordList.push({index: i, id: r});
    let b = this.dataSource().findIndex( (e:any)=> e.ID === r);
    if(b > -1){
      this.dataSource()[b].isDelete = true;
    }
  }
  
  deleteCancel(r: number, i: number){
    let a = this.deleteRecordList.findIndex( (e:any)=> e.id === r);
    let b = this.dataSource().findIndex( (e:any)=> e.ID === r);
    if( a > -1){
      this.deleteRecordList.splice(a, 1);
    }
    if(b > -1){
      this.dataSource()[b].isDelete = false;
    }
  }

  deleteNew(i: number){
    this.dataSource().splice(i, 1);
    this.fieldAction().splice(i, 1)
    //this.dataSource._updateChangeSubscription(); 
    this.dataSource.update(arr=> arr.map((e: any, i: number)=>({
      ...e,
      SNO: i+1
    })))

    if(this.noData() && this.dataSource().length === 0){
      this.closeEdit('close');
    }
  }

  getDefaultValue(){
    const user = JSON.parse(localStorage.getItem('user') || '');
    const lang = JSON.parse(localStorage.getItem('lang') || '');

    let url = "SystemFields/GetDataFieldsDefaultQuery";
    let fieldActionBody: any = {};
    this.fieldValRaw.forEach((x: any) => {
      x.descEn = null;
      x.internalFieldEdit = false;
      if (x.FieldType !== 'TabPage' && x.FieldType !== 'GridTab' && x.FieldType !== 'GridView' && x.FieldType !== 'BTN') { 
        x.FieldVal = null;
        fieldActionBody[x.FieldName] = null;  
      }
    });
    
    fieldActionBody['CompanyID'] = this.companyID();

    let params = {
      "menuID": this.menuid(),
      "pMenuID": this.pmenuid(),
      "userID": user.id,
      "languageID": lang,
      "companyID": this.companyID(),
      "pRecordID": this.precordid.toString(),
      "applicationID": user.applicationID,
      "queryfields": fieldActionBody
    }
    this._http.putClient<any, ApiResponse>(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => { 
        if(response.dataModel && response.dataModel.length > 0){
          let res = response.dataModel;
          this.newRowData = [];
          res.forEach((r:any)=>{
            this.newRowData.push({field: r.fieldName, value: r.fielValue});
          })
          this.addNewInit();
        }
      },
      error: (_e)=>{

      }
    })
  }

  addNew(){
    if(!this.addNewRecords){
      this.getDefaultValue();
    }
    else{
      this.addNewInit();
    }
  }

  addNewInit(){
    this.intialNewRecord.push(this.fieldVal);

    let newVal: any = {};

    this.fieldValRaw.forEach((e: any) => {
      if(e.FieldName){
        let a = ['TabPage','GridTab','GridView','BTN','Expression','ExtText']
        let b = a.includes(e.FieldType);
        if (!b) {
          newVal[e.FieldName] = null;
        }
      }
    });

    if(this.noData()){
      if(this.addNewRecords){
        this.dataSource.set([newVal, ...this.dataSource()]);
      }else{
        this.dataSource.set([newVal]);
      }
      this.editMode.set(true);
    }else{
      this.dataSource.set([newVal, ...this.dataSource()]);
      this.doubleClick();
    }
      this.dataSource.update(arr=> arr.map((e: any, i: number)=>{
      return {...e, SNO: i+1}
    }))
  
    
    this.addNewRecords = true;

    this.addnewfield();
  }

  addnewfield(){
    let fieldActionBody: any = {};
    fieldActionBody['ID'] = 0;
    fieldActionBody['CompanyID'] = this.companyID();
    this.fieldValRaw.forEach((x: any) => {
      x.descEn = null;
      x.internalFieldEdit = false;

      let a = x.FieldName;
      let i = this.newRowData.findIndex( (e:any)=> e.field === a);
      if (x.FieldType !== 'TabPage' && x.FieldType !== 'GridTab' && x.FieldType !== 'GridView' && x.FieldType !== 'BTN' && x.FieldType !== 'Expression' && x.FieldType !== 'ExtText') { 
        if(i > -1 && this.newRowData[i].value){
          x.FieldVal = this.newRowData[i].value;
          fieldActionBody[x.FieldName] = this.newRowData[i].value;
          if(x.FieldType === 'CheckBox'){
            if(this.newRowData[i].value === '1' || this.newRowData[i].value.toLowerCase() === 'true' ){
              x.FieldVal = true;
              fieldActionBody[x.FieldName] = true;
            }else{
              x.FieldVal = false;
              fieldActionBody[x.FieldName] = false;
            }
          }else if(x.FieldType === 'Number'){
            if(this.newRowData[i].value === 0){
              fieldActionBody[x.FieldName] = 0;
            }
          }
        }else{
          x.FieldVal = null;
          fieldActionBody[x.FieldName] = null;
        }
     
        if(x.FieldName === "VoucherSeq" || x.FieldName === "Sequence" || x.FieldName === "Seq"){
          this.newRowCount = this.newRowCount + 1;
          x.FieldVal = this.newRowCount;
          fieldActionBody[x.FieldName] = this.newRowCount;
        }

        if(this.filterKey){
          let a = this.filterKey.split('=')
          if(a[0] && x.FieldName.toLowerCase() === a[0].toLowerCase()){
            x.FieldVal = a[1];
            fieldActionBody[x.FieldName] = a[1];
          }
        }
      }
    });
    let fieldValRaw: any = JSON.stringify(this.fieldValRaw.filter((x:any)=> x.FieldType !== 'TabPage' && x.FieldType !== 'GridTab' && x.FieldType !== 'GridView' && x.FieldType !== 'BTN' && x.FieldType !== 'Expression' && x.FieldType !== 'ExtText'));
    this.fieldAction().unshift({fieldActionBody: fieldActionBody, field: JSON.parse(fieldValRaw), internalEdit: false});
    //console.log(this.fieldAction)
    fieldValRaw = '';
  }

    getSysFieldsValue(e: number){
    const user = JSON.parse(localStorage.getItem('user') || '');
    const lang = JSON.parse(localStorage.getItem('lang') || '');
            
    let id = this.menuid();
    if(this.page && this.page.pageType === 'prerequisitemenu' && this.page.isJobEnable){
      id = this.page.dtid;
    }

    let url = "Sys/GetSysFieldsTypeValue?menuId="+id+"&languageid="+lang;

    this._http.putClient<any, ApiResponse>(url, this.fieldAction()[e].fieldActionBody).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next:(response)=>{
        if(response.erroMessage){
          this.toastr.error(response.erroMessage)
        }
        else if(response.dataModel && response.dataModel.length > 0){
              let res = response.dataModel;
              const resMap = new Map(
  res.map((item: any) => [item.fieldId, item.data?.[0]])
);

this.fieldAction.update(actions =>
  actions.map((action: any, i: number) => {
    if (i !== e) return action;

    return {
      ...action,
      field: action.field.map((y: any) => {
        const dataObj = resMap.get(y.Id);
        const value = dataObj ? Object.values(dataObj)[0] : y.FieldVal;

        return {
          ...y,
          descEn: value
        };
      })
    };
  })
);
          }
      }
    });

  }


  diffData(newObj:any, oldObj: any){
    if (Object.keys(oldObj).length == 0 && Object.keys(newObj).length > 0){
      return newObj;
    }

    let diff:any = {};
    for (const key in oldObj) {
        if (newObj[key] && oldObj[key] != newObj[key] ) {
          diff[key] = newObj[key]; 
        }
    }

    if (Object.keys(diff).length > 0){
      return diff;
    }
        
    return oldObj;
  }

  createLog(diff: any, b: any, rid: any){
    let url = 'General/CreateLogData';

    let m = this.exportid;
    const user = JSON.parse(localStorage.getItem('user') || '');
    const lang = JSON.parse(localStorage.getItem('lang') || '');
    
    if(this.pageType === 'dimensions'){
      m = 7023;
    }
  
    let k = Object.keys(diff);

    let c:any = {};

    k.forEach((x: any)=>{
      if(b[x]){
        c[x] = b[x]
      }
    })

    let oldData = JSON.stringify(c);
    let newData = JSON.stringify(diff);
    
    oldData = oldData.replaceAll("{", "");
    oldData = oldData.replaceAll('":"', ' = ');
    oldData = oldData.replaceAll("}", "");
    oldData = oldData.replaceAll('"', '');

    newData = newData.replaceAll("{", "");
    newData = newData.replaceAll('":"', ' = ');
    newData = newData.replaceAll("}", "");
    newData = newData.replaceAll('"', '');


    let param = {
      "id": 0,
      "companyId": this.companyID(),
      "userLogId": user.userLogId,
      "logType": 'update',
      "menuId": m,
      "recordId": rid.toString(),
      "oldData": oldData,
      "newData": newData,
      "createdUser": user.id,
      "createdDate": new Date()
    }

   this._http.postClient(url, param).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next:(_response)=>{

      },
      error: (_e)=>{

      }
    });
  }

  refreshTableEvt(_e: any){
    this.getmenuFields(this.exportid)
  }

  checkStatus(recordid: number){
    const user = JSON.parse(localStorage.getItem('user') || '');
    const lang = JSON.parse(localStorage.getItem('lang') || '');
    let url = "Sys/GetMenuRulesQueryExecutions";
    this.actionBTNDisabled.set(false);
    this.wfstatus.set('');
    this.actionrecordid = recordid;
    let param = {
      "menuID": this.menuid(),
      "pMenuID": this.menuid(),
      "userID": user.id,
      "languageID": lang,
      "companyID": this.companyID(),
      "recordID": recordid.toString(),
      "pRecordID": recordid.toString(),
      "applicationID": user.applicationID
    }
    this._http.putClient<any, ApiResponse>(url, param).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response)=>{
        if(response.dataModel && response.dataModel.length > 0){
          let a = response.dataModel;
          a.forEach((b: any)=>{
            if(b.actionType === 'Disable Record'){
              if(b.actionValue === '1'){
                this.actionBTNDisabled.set(true);
              }
            }
            else if(b.actionType === 'Disable Field'){
              let index = this.actionBTN().findIndex((e:any)=> e.FieldName === b.fieldName);
              let pindex = this.printBTN().findIndex((e:any)=> e.FieldName === b.fieldName);
              if(b.actionValue === '1'){
                if(index !== -1){
                  this.actionBTN()[index].mrEnabled = false;
                  this.actionBTN()[index].Enabled = false;
                }
                if(pindex !== -1){
                  this.printBTN()[pindex].mrEnabled = false;
                  this.printBTN()[pindex].Enabled = false;
                }
              }
              /*else if(b.actionValue === '0'){
                if(index !== -1){
                  this.actionBTN[index].mrEnabled = true;
                  this.actionBTN[index].Enabled = true;
                }
                if(pindex !== -1){
                  this.printBTN[pindex].mrEnabled = true;
                  this.printBTN[pindex].Enabled = true;
                }
              }*/
            }
            else if(b.actionType === 'Enable Field'){
              let index = this.actionBTN().findIndex((e:any)=> e.FieldName === b.fieldName);
              let pindex = this.printBTN().findIndex((e:any)=> e.FieldName === b.fieldName);
              if(b.actionValue === '1'){
                if(index !== -1){
                  this.actionBTN()[index].mrEnabled = true;
                  this.actionBTN()[index].Enabled = true;
                }
                if(pindex !== -1){
                  this.printBTN()[pindex].mrEnabled = true;
                  this.printBTN()[pindex].Enabled = true;
                }
              }
              /*else if(b.actionValue === '0'){
                if(index !== -1){
                  this.actionBTN[index].mrEnabled = false;
                  this.actionBTN[index].Enabled = false;
                }
                if(pindex !== -1){
                  this.printBTN[pindex].mrEnabled = false;
                  this.printBTN[pindex].Enabled = false;
                }
              }*/
            }
          })
        }

        if(this.subeditablefielddetails){
          this.actionBTN.update(arr=>arr.map((x:any)=>{
            if(this.subeditablefielddetails.search(x.FieldName) !== -1){
              x.wfEnabled = true;
            }else{
              if(!x.wfEnabled){
                x.wfEnabled = false;
              }
            }
            return {...x}
          }))

          this.actionBTN.update(arr=>arr.map((x:any)=>{
            if(this.subeditablefielddetails.search(x.FieldName) !== -1){
              x.wfEnabled = true;
            }else{
              if(!x.wfEnabled){
                x.wfEnabled = false;
              }
            }
            return {...x}
          }))
        }
      },
      error: (_error)=>{

      }
    })

  }

  actionClick(btn: any, type: string, recordid: number, i: number){
    
    let dd = JSON.parse(this.dataSourceRawString);
    let data = dd[i];
    this.fieldActionBody['ID'] = data['ID'];
    this.fieldActionBody['CompanyID'] = this.companyID();
    this.fieldValRaw.forEach((x: any) => {
      let b = this.dataKeys.includes(x.FieldName);
      if (b) {
        let c = data[x.FieldName];
        if (typeof c !== 'object') {
          this.fieldActionBody[x.FieldName] = c;
        } else {
          this.fieldActionBody[x.FieldName] = null;
        }
      }else{
        x.FieldVal = null;
      }
    });
    this.actionrecordid = recordid;
    const user = JSON.parse(localStorage.getItem('user') || '');
    const lang = JSON.parse(localStorage.getItem('lang') || '');
    this.actionBtnType = type;
    let url = "Sys/GetOnclickSysActions";
    this.actionMenuList = btn;
    this.isLoading.set(true);
    this.hideProceed.set(false);
    let params= {
      "applicationID": user.applicationID,
      "companyID": this.companyID(),
      "fieldID": btn.Id,
      "languageID": lang,
      "menuID": this.menuid(),
      "pMenuID": this.recordList.parentPageID,
      "queryfields": this.fieldActionBody,
      "precordid": this.recordList.currentid,
      "recordID": this.actionrecordid,
      "userID": user.id,
    }
    this._http.putClient<any, ApiResponse>(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        if(response.dataModel && response.dataModel.length !== 0){
          this.actionresponsemodel = response.dataModel;
          let seq = 0;
          this.actionresponsemodel.forEach((x:any)=>{
          if(x.actionType === "Message"){
              if(seq === 0){
                seq = x.seq;
                this.modalMessage = x.message;
                this.toastr.success(x.message);
              } 
              else if(seq < x.seq){
                this.conpletedMessage = x.message;
              }
            }
            else if(x.actionType === "Procedure"){
              this.runProceedure(x.id, type, x.actionType);
            }
            else if(x.actionType === "Calling Menu"){
              if(x.linkedQuery){
                this.callingMenuLinkedQuery = x.linkedQuery;
                this.callingMenuData = x;
                this.runProceedure(x.id, type, x.actionType);
              }else{
                
              }
            }
          })
        }else{
          if(type === 'print'){
            this.printAction(this.actionMenuList)
          }
        }
        this.isLoading.set(false);
      },
      error: (_error) => {
        this.isLoading.set(false);
      }
    })
  }

  modalEmitEvent(e: string){
    this.callingMenu.set(false);
  }

  proceedAction(type: string){
    this.closeModal();
    this.actionresponsemodel.forEach((x:any)=>{
      if(x.actionType === "Procedure"){
        this.runProceedure(x.id,type, x.actionType);
      }
    });
  }

  runProceedure(id: number, type: string, actionType: string){
    const user = JSON.parse(localStorage.getItem('user') || '');
    const lang = JSON.parse(localStorage.getItem('lang') || '');
    let url = "Sys/OnclickSysActions?sysactionid="+id;
   // this.modalRef = modalRef;
    this.isLoading.set(true);
    this.hideProceed.set(true);

    let params = {
      "menuID": this.menuid(),
      "pMenuID": this.recordList.parentPageID,
      "userID": user.id,
      "languageID": lang,
      "companyID": this.companyID(),
      "recordID": this.actionrecordid,
      "applicationID": user.applicationID,
      "queryfields": this.fieldActionBody,
      "filterCondition": this.callingMenuLinkedQuery
    }

    this._http.putClient<any, ApiResponse>(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        if(response.erroMessage){
          if(response.erroMessage !== 'Linked Query Not Found'){
            this.modalMessage = response.erroMessage;
            if(this.modalShow){ 
            /*  this.modal = new Modal(this.modalRef, {
                keyboard: false,
                backdrop: 'static'
              });*/
              this.modal.show('actionModal'+this.recordStamp);
              this.modalShow = false;
            }
          }
        }
        else if(type === 'print' && actionType === 'Calling Menu'){
          this.printAction(this.actionMenuList);
        }
        else if(response.stringID){
          this.callingMenu.set(true);
          this.stringID = response.stringID;
        }
        else if(response.successMessage === "Call crystal reprot"){
          this.printAction(this.actionMenuList);
        }
        else if(response.successMessage && !this.callingMenuLinkedQuery){
          this.toastr.success(this.conpletedMessage ? this.conpletedMessage : 'Completed');
        }
        
        this.isLoading.set(false);
      },
      error: (_error) => {
        this.hideProceed.set(false);
        this.isLoading.set(false);
      }
    })
  }

  printAction(print: any){
    const user = JSON.parse(localStorage.getItem('user') || '');
    const lang = JSON.parse(localStorage.getItem('lang') || '');
    let url = "Report/GenerateReport?sysfieldid="+print.Id+"&pmenuid="+this.recordList.parentPageID+"&precordid="+ this.recordList.currentid+"&companyid="+this.companyID()+"&menuid="+this.menuid()+"&languageid="+lang+"&applicationid="+user.applicationID;
    let params = this.fieldActionBody;
    this.isLoading.set(true);
    this._http.putClient<any, ApiResponse>(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response)=>{
        this.isLoading.set(false);
        if(response.erroMessage){
          this.toastr.error(response.erroMessage)
        }else{
          if(response && response.dataModel){
            let reporturl: any = response.dataModel;
            let aa = reporturl.stream.split('"_buffer":');
            let b = JSON.parse(aa[1]);

            this.reportURL = b;
            var byteCharacters = atob(this.reportURL);
            var byteNumbers = new Array(byteCharacters.length);
            for (var i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            var byteArray = new Uint8Array(byteNumbers);
            var file = new Blob([byteArray], { type: 'application/pdf;base64' });
            this.reportURL = (window.URL || window.webkitURL).createObjectURL(file);

            let tab: any = window.open();
            tab.location.href = this.reportURL;
          }
        }
      },
      error: (_error)=>{
        this.isLoading.set(false);
      }
    })
  }

  toggleCount(id: string){
    this.openSettingId.set('');
    this.openMenuId.set(this.openMenuId() === id ? '' : id);
  }

  deletedRecordEvent(e: any){
    this.deletedSubRecord.emit(e);
  }
}
