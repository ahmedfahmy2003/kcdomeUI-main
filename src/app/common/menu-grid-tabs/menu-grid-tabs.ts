import { CommonModule } from '@angular/common';
import { Component, EventEmitter, input, inject, Input, OnInit, Output, signal, HostListener, model, output, effect, DestroyRef } from '@angular/core';
import { AppService } from '../../services/common/common.service';
import * as StoreAction from '../../services/common/store/store.action';
import { FormsModule } from "@angular/forms";
import { DxDataGridModule } from 'devextreme-angular';
import { DimensionsPage } from '../../dashboard/menu-grids/common/dimensions-page/dimensions-page';
import { FilterBox } from '../filter-box/filter-box';
import { DomSanitizer } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { Store, select } from '@ngrx/store';
import { forkJoin, map } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { VisbilityGrids } from '../../dashboard/menu-grids/common/visbility-grids/visbility-grids';
import { ExportRecord } from './export-record/export-record';
import { ModalService } from '../../services/common/modal.service';
import { MatMenuModule } from '@angular/material/menu';
import { LoaderService } from '../../services/common/loader.service';
import { TreeMenu } from '../tree-menu/tree-menu';
import { SidebarService } from '../../services/sidebar/sidebar.service';
import { PivotGrid } from '../pivot-grid/pivot-grid';
import { SignalRService } from "../../services/common/signalr.service";
import { ApiResponse } from '../../shared/interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PaginationControls } from '../pagination-controls/pagination-controls';

@Component({
    selector: 'menu-grid-tabs',
    standalone: true,
    imports: [DimensionsPage, FilterBox, CommonModule, FormsModule, TreeMenu, DxDataGridModule, VisbilityGrids, PivotGrid, ExportRecord, MatMenuModule, PaginationControls],
    templateUrl: './menu-grid-tabs.html',
    styleUrl: './menu-grid-tabs.scss'
})
export class MenuGridTabs implements OnInit{
  @Input() activeId: number = 0;
  @Input() subMenuId: number = 0;
  @Input() page: any;
  @Input() pageAdd: boolean = false;
  pageType: string;
  filterCondition: any;
  togglei: number;
  _sortOrder = signal<string>('desc');
  sorder: string = 'atob';
  messages: any = [];
  @Input() set _pageType(value: string){
    this.pageType = value;
  }
  get _pageType(): string{
    return this.pageType;
  }
  @Input() filterKey: string;
  @Input() subRecordId: number;
  @Input() autoOpen: boolean;
  @Output() subRecordDetail = new EventEmitter;
  newRecordShow = model<boolean>();
  detailsPage = model<boolean>();
  @Input() detailsBtnGrid: boolean;
  @Output() rowCount = new EventEmitter;
  @Output() resCompanyIDemit = new EventEmitter;
  @Input() recordList: any;
  @Input() detailsgridID: any;
  @Input() pageIndex: number;
  @Output() closeComponentEmit = new EventEmitter;
  @Output() acitveidemit = new EventEmitter;

  getmenuFieldsto: boolean;

  @Input() set _getmenuFieldsto(value: boolean){
    this.getmenuFieldsto = value;
    if(value && this.activeId){
      this.getmenuFields(this.activeId)
    }
  }

  get _getmenuFieldsto(): boolean{
    return this.getmenuFieldsto;
  }

  _newRecordAdded: boolean;
  exportAll = signal<boolean>(false);
  eisLoading = signal<boolean>(false);
  vlist: any = [];
  plist: any = [];
  colLayoutData: any;
  getDataResposne: any;
  conpletedMessage: any;
  wfstatus: any;
  stepid: any;
  menuwfid: any;
  refreshTable = signal<boolean>(false) ;
  @Input() visible: boolean = true; 
  @Input() set _refreshTable(value: boolean) {
    this.refreshTable.set(value);
    if(this.refreshTable() && this.activeId){
      this.getmenuFields(this.activeId);
    }
  }

  get _refreshTable(): any {
    return this.refreshTable();
  }

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
  reportType = signal<string>('');
  @Input() set _reportType(value: string){
    this.reportType.set(value);
  }
  get _reportType(): string{
    return this.reportType();
  }
  public noData = signal<boolean>(false);
  public menus: any;
  @Output() menusChange = new EventEmitter;
  @Output() addRecordemit = new EventEmitter;
  totalRecords = output<any>();
  public resultsLength = signal<number>(0);
  public fixedColumns: any = [];
  public currentPage = signal<number>(1);
  public pageSize: number = 30;
  public pageSizeOption: number[] = [10, 30, 100, 500, 1000];
  public goTo: number = 0;
  public totalPages = signal<number>(0);
  public openRecords: any;
  public recordAdd: boolean = false;
  activeRecord: any = 0;
  @Input() set _activeRecord (value: any){
    this.activeRecord = value;
  }
  get _activeRecord(): any{
    return this.activeRecord;
  }
  @Output() activeRecordChange = new EventEmitter;
  @Input() previousMenuId: number;
  @Input() previousRecordID: number;
  public applyDimensions: boolean;
  public applyWorkflow: boolean;
  public modalMessage: string;
  public menuaccess: any;
  public useraccess: any;
  public applyDrillDown: boolean;
  public drillDown: any;
  public modalRef: HTMLDivElement;
  public memoNote: boolean;
  public modalTitle: string;
  public dataSourceRaw: any = [];
  dataSourceRawVal: any = [];
  public dataSource = signal<any>([]);
  public isLoading = signal<boolean>(false);
  public recordId: number;
  public printBTN = signal<any>([]);
  public actionBTN = signal<any>([]);
  public tabname: string;
  @Output() tabnameChange = new EventEmitter;
  @Output() menuaccessemit = new EventEmitter;
  @Output() useraccessemit = new EventEmitter;
  _genrpt: boolean = false
  @Input() set genrpt(value: boolean){
    this._genrpt = value;
    if(this._genrpt){
      if(this.page.pageType === 'prerequisitemenu' && this.page.isJobEnable){
        let a = this.dataSourceRaw.findIndex((e: any)=> e.ID === this.activeRecord);
        if(a > -1){
          this.genReport(this.activeRecord, (a+1))
        }
      }
    }
  }
  get genrpt(): boolean{
    return this._genrpt
  }
  public dataKeys: any;
  public fieldVal: any;
  sysList = signal<any>([]);
  subRecordID: number;
  public columns: any = [];
  public dataSourceRawString = signal<string>('');
  subRecordData: any;
  cindex: number;
  openDimension = signal<boolean>(false);
  selectAll = signal<boolean>(false);
  closeDetailsSub: any;
  recordListSub: any;
  showFilter: boolean = false;
  menuid: number;
  setApprovebtn = signal<boolean>(false);
  applyFilter: boolean;
  subQuery: any;
  filterQuery: any;
  modalShow = signal<boolean>(true);
  hideProceed = signal<boolean>(false);
  wfType = signal<string>('');
  resCompanyID: any;
  requsitereport: boolean;
  reportURL = signal<any>('');
  menulist: any;
  menulistsub: any;
  private store = inject(Store);
  fieldValRaw: any;
  exportid = signal<number>(0);
  workflownote: any = '';
  targetTable: any;
  exceltype = signal<boolean>(false);
  binaryString: any;
  xlOk = signal<boolean>(false);
  fileName: string;
  upldfile: any;
  xlactionid: number;
  actionrecordid: number;
  actionresponsemodel: any;
  deleteXlFile: boolean;
  actionMenuList: any;
  actionbtnname: string;
  fieldActionBody: any = {};
  actionBtnType: string;
  actionBTNDisabled = signal<boolean>(false);
  arrayCalls: any = [];
  baseurl = '';
  menuErrorMsg: any = '';
  dropDown: any;
  openMenuId = signal<string>('');
  openSettingId = signal<string>('');
  menuPosition = signal<{ top: number }>({ top: 150});
  menuPositionS = signal<{ top: number, right: number }>({ top: 200, right: 200});
  recordStamp = new Date().getTime();
  tabType = signal<string>('table')
  selectedRow = signal<any>(null);
  taskid: any = [];
  jobcomplete: boolean = false;
  joberror: boolean = false;
  existingRunning: boolean = false;
  @Output() prType = new EventEmitter;
  @Output() procedureJob = new EventEmitter;
  @Output() jobProgress = new EventEmitter;
  jobCompleted = input<any>({});
  dateFormat: any;
  
  constructor(private destroyRef: DestroyRef, private http: HttpClient, public sidebar: SidebarService,  private signalR: SignalRService, private _http: AppService, public sanitizer: DomSanitizer, private toastr: ToastrService, public modal: ModalService, public loader: LoaderService) {
    
    effect(()=>{
      if(this.jobCompleted().rid){
        this.noData.set(false);
        this.preReqIndex = this.jobCompleted().index;
        this.page = this.jobCompleted().page;
        this.queryData = this.jobCompleted().data;
        this.procedureJob.emit({'record': this.jobCompleted().rid, 'status':'completed'});
        this.menuAccess(this.jobCompleted().page.id);
      }
    })

    this.baseurl = this._http.geturl();
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
    this.dateFormat = this._http.getDateFormat();
    if(this.pageAdd && this.activeId) {
      this.noData.set(false);
      this.menuAccess(this.activeId);
    }
    else if(this.subMenuId){
      this.noData.set(false);
      this.menuAccess(this.subMenuId);
    }
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.trwrap') && !target.closest('.kc-dropdown-menu') && !target.closest('.kc-dropdown-wrap')) {
      this.openMenuId.set('');
      this.openSettingId.set('');
    }
  }

  toggleCount(id: string){
    this.openSettingId.set('');
    this.openMenuId.set(this.openMenuId() === id ? '' : id);
  }

  onRowSelect(i: any){
    this.selectedRow.set(i);
  }

  toggleSetting(id: string, el: HTMLElement) {
    this.openSettingId.set(this.openSettingId() === id ? '' : id);
    const rect = el.getBoundingClientRect();

    this.menuPositionS.set({
      top: (this.togglei * 62.4) + 200,
      right: (window.innerWidth - rect.right) - 20
    });
  }

  newRecordAddFn(e: boolean){
    if(e === true){
      if(this._newRecordID && this._newRecordID.menuid){
        //this.pageType = this._newRecordID.pageType;
        this.getMenuData(this._newRecordID.menuid, 1, this.pageSize, true)
      }
    }
    else{  
      if(this._newRecordID && this._newRecordID.menuid){
        this.recordList.currentid = this._newRecordID.modelid;
      }
    }
  }

  recDeleted(e: any){
    if(e.deleted === true){
      this.getMenuData(e.id, 1, this.pageSize, true)
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
    this.isLoading.set(true);
    const lang = JSON.parse(localStorage.getItem('lang') || '');
    if(this.pageType === 'dimensions'){
      id = 7023
    }
        
    this.exportid.set(id);
    const url = 'Sys/GetSysMenuAccess?menuId=' + id + '&languageId=' + lang;
    this._http.getClient<ApiResponse>(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        if (response.dataModel && response.dataModel.length > 0) {
          let res = response.dataModel[0];
          this.menuaccess = res;
          this.menuaccessemit.emit(this.menuaccess);
          this.getmenuFields(id);
        }else{
          this.modal.show('errorMsg'+this.exportid());
          this.isLoading.set(false);
        }
      },
      error: (_errMsg) => {
        //this.auth.logout();
      }
    });
  }

  closeAccessModal(){
    this.modal.hide();
    if(this.pageType !== 'detailsBtnGrid'){
      let item = {id: this.page.id, dtid: this.page.dtid, pwfid: '', name: this.page.name, pageType: this.page.pageType, menuType: this.page.menuType, record: '', isKeyManualInput: null, isJobEnable: false, disableClose: false};
      this.store.dispatch(StoreAction.closePage({menu: item}))
      if(this.activeId === this.page.id || this.activeId === this.page.dtid){
        this.store.dispatch(StoreAction.activePage({active: 'd-0'}));
      }
    }
  }

  tabTypeEvt(e: any){
    this.tabType.set(e);
    this.openMenuId.set('');
  }

  getmenuFields(id: number) {
    this.isLoading.set(true);
    this.pageAdd = false;
    if(this.pageType === 'dimensions'){
      id = 7023
    }
    this.menuid = id;
    if(!this.activeId){
      this.activeId = id;
      this.acitveidemit.emit(this.activeId);
    }

    const user = JSON.parse(localStorage.getItem('user') || '');
    const lang = localStorage.getItem("lang") || '';
    
    const url = 'SystemFields/GetsysFieldData?id=' + id+"&languageid="+lang+'&userid='+user.id+'&companyid='+this.companyID()+'&applicationid='+user.applicationID;
    this._http.getClient<ApiResponse>(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        let response = res.dataModel;
        if(response){
        let fieldValRaw = response;
        //let fieldVal = response.filter((x:any)=> x.Visible === true);
        let fieldVal = response;
        this.menus = JSON.stringify(response);
        this.menusChange.emit(this.menus);     
        let subRecord = {id: 0, data: '', label: this.menus}
        this.subRecordDetail.emit(subRecord);
        let surl = 'Sys/GetDataSysUserMenuLayout';
        let sparam ={
          "menuID": this.menuid,
          "userID": user.id,
          "languageID": lang,
          "companyID": this.companyID(),
          "applicationID": user.applicationID,
        }

        this._http.postClient<any, ApiResponse>(surl, sparam).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next:(data)=>{
            this.printBTN.set([]);
            this.actionBTN.set([]);
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
                this.fieldValRaw = sortedRaw;
                this.fieldVal = sorted;
                fieldVal.forEach((x: any) => {
                  if (x.FieldType === "BTN" && x.Visible) {
                    if (x.ShowInPrint) {
                      this.printBTN.update(e=>[...e,x]);
                    } else {
                      this.actionBTN.update(e=>[...e,x]);
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
                    this.printBTN.update(e=>[...e,x]);
                  } else {
                    this.actionBTN.update(e=>[...e,x]);
                  }
                }
              })
              this.getMenuDrillDown(id)
            }
          }
        })
        }
        else{
          if(res.erroMessage){
            this.toastr.error(res.erroMessage);
          }
          this.isLoading.set(false);
        }
       
      },
      error: (_errMsg) => {
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
        this.getMenuData(id, this.currentPage(), this.pageSize, true);
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

  getMenuData(id: number, currentPage: number, pageSize: number, isrunprocedure: boolean) {
    let u =  this.menulist.filter((x:any)=> x.ID === id);
    this.useraccess = u[0];
    this.useraccessemit.emit(this.useraccess);
    this.exportid.set(id);
    if(this.page && this.page.menuType === 'View'){
      this.getMenuViewsData(id, currentPage, pageSize)
    }
    else{
      this.isLoading.set(true);
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
        url = 'Dimensions/GetDimensionsData?MenuId=' + this.subMenuId + '&RecordID=' + this.subRecordId;
      }
      else if((this.page && this.page.pageType === 'detailmenu') || this.pageType === 'submenu' || this.pageType === 'callingsubmenu' || (this.pageType === 'detailsBtnGrid' && !this.newRecordAdded)){
        let filter:any = '';
        if(this.pageType === 'submenu' || this.pageType === 'callingsubmenu'){
          //filter = this.filterKey+'='+this.subRecordId;
          filter = this.filterKey;
        }else if(this.pageType === 'detailsBtnGrid'){ 
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
        
        if(this.applyFilter && this.showFilter){
          params.filterCondition = this.filterQuery;
          joc = true;
        }
        
        if(this.page.previousRecordID && this.page.previousMenuId){
          url = 'SystemFields/GetMenuData?IsFilterConditionApply=true&JoinOuterCondition='+joc+'&isallFields=true&previousRecordID='+this.page.previousRecordID+'&previousMenuId='+this.page.previousMenuId;
        }
        else if(this.previousRecordID && this.previousMenuId){
          url = 'SystemFields/GetMenuData?IsFilterConditionApply=true&JoinOuterCondition='+joc+'&isallFields=true&previousRecordID='+this.previousRecordID+'&previousMenuId='+this.previousMenuId;
        }
        else{
          url = 'SystemFields/GetMenuData?IsFilterConditionApply=true&JoinOuterCondition='+joc+'&isallFields=true';
        }
      }
      else if(this.page.pageType === 'pendingwf' && (!this._newRecordID || this._newRecordID.pageType !== 'detailsBtnGrid')){
        let assoc = this.page.menuType === 'assocyes' ? true : false;
        url = "Sys/GetPendingWorkflowMenusData?IsWithAssociates="+assoc+"&stepid="+this.page.pwfid.STEPID+"&omitstepid="+this.page.pwfid.OmitStepId;

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
           
        if(this.applyFilter && this.showFilter){
          this.filterQuery = this.filterQuery.replaceAll("'","''");
          params.filterCondition = this.filterQuery;
        }
        
      }
      else if(this.page.pageType === 'prerequisitemenu' && this.preReqIndex){
        const user = JSON.parse(localStorage.getItem('user') || '');
        const lang = JSON.parse(localStorage.getItem('lang') || '');
        if(this.page.menuType === "Object" || this.page.menuType === "Dashboard"){
          let da = true;
          if(this.page.menuType === "Dashboard"){
            da = false;
          }
          if(this.page.isJobEnable){
            isrunprocedure = false
          }
          url = "General/RunPrerequesiteProcedure?isrunprocedure="+isrunprocedure+"&isDataNeed=true";
          params = {
            "menuID": this.page.id,
            "userID": user.id,
            "languageID": lang,
            "recordID": this.subRecordId,
            "companyID": this.companyID(),
            "applicationID": user.applicationID,
            "queryfields": this.queryData,
            "pageNumber": 1,
            "pageSize": this.pageSize
          }
          if(this.applyFilter && this.showFilter){
            params.filterCondition = this.filterQuery;
          }
        }else{
          let isexport = this.reportType() === 'pdf' ? false: true;
          url = "General/RunPrerequesiteProcedureReport?isexport="+isexport;
          params = {
            "menuID": this.page.id,
            "userID": user.id,
            "languageID": lang,
            "companyID": this.companyID(),
            "recordID": this.subRecordId,
            "applicationID": user.applicationID,
            "queryfields": this.queryData
          }
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
        
        if(this.applyFilter && this.showFilter){
          params.filterCondition = this.filterQuery;
          joc = true;
        }
        url = 'SystemFields/GetMenuData?IsFilterConditionApply=true&JoinOuterCondition='+joc+'&isallFields=true';
      }

      
      if(this.pageType === 'dimensions'){
        this._http.getClient<ApiResponse>(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: (response) => {
            this.updateTable(response);
          },
          error: (_errMsg) => {
            this.isLoading.set(false);
          }
        })
      }
      else if(this.page && this.page.pageType === 'prerequisitemenu' && this.preReqIndex){
        if(params.filterCondition){
          this.filterCondition = params.filterCondition;
        }else{
          this.filterCondition = '';
        }
        
        this._http.postClient<any, ApiResponse>(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: (response) => {
            if(response.erroMessage){
              this.isLoading.set(false);
              this.toastr.error(response.erroMessage);
            }
            else if(this.page.menuType === "Dashboard"){
              
            }
            else if(this.page.menuType === "Object"){
              this.updateTable(response);
            }
            else{
              this.isLoading.set(false);
              if(response && response.dataModel){
                let reporturl: any = response.dataModel;
                let aa = reporturl.stream.split('"_buffer":');
                let b = JSON.parse(aa[1])
                
                var byteCharacters = atob(b);
                var byteNumbers = new Array(byteCharacters.length);
                for (var i = 0; i < byteCharacters.length; i++) {
                  byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                var byteArray = new Uint8Array(byteNumbers);
                let file: any;
                if(this.reportType() === 'pdf'){
                  file = new Blob([byteArray], { type: 'application/pdf;base64' });
                
                  let reportURL = ((window.URL || window.webkitURL).createObjectURL(file));
      
                  this.reportURL.set(this.sanitizer.bypassSecurityTrustResourceUrl(reportURL));
                }else{
                  file = new Blob([byteArray], { type: 'application/vnd.openxmlformatsofficedocument.spreadsheetml.sheet'});
                  const link = document.createElement('a');
                  link.href = window.URL.createObjectURL(file);
                  link.download = 'report.xls'; // File name
                  document.body.appendChild(link);
                  this.reportURL.set('excel');
                  // Programmatically click the link to trigger the download
                  link.click();

                  // Clean up
                  document.body.removeChild(link);
                  window.URL.revokeObjectURL(link.href);
                }
              }
            }
          },
          error: (_errMsg) => {
            this.isLoading.set(false);
          }
        });
      }
      else{
        if(!this._newRecordID || (this._newRecordID.pageType !== 'detailsBtnGrid') || (this._newRecordID.pageType === 'detailsBtnGrid' && this.filterKey) || (this.pageType === 'detailsBtnGrid' && this.filterKey)){
          if(params.filterCondition){
            this.filterCondition = params.filterCondition;
          }
          else{
            this.filterCondition = '';
            if(this.filterKey){
              params.filterCondition = this.filterKey;
              this.filterCondition = params.filterCondition;
            }
          }
          
          this._http.putClient<any, ApiResponse>(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (response) => {
              this.updateTable(response);
            },
            error: (_errMsg) => {
              this.isLoading.set(false);
              //this.auth.logout();
            }
          });
        }
        else{
          this.isLoading.set(false);
        }
      }
    }
  }

  updateTable(response: any){
    this.isLoading.set(false);
    this.vlist = [];
    this.columns = [];
    this.plist = [];
    this.dataSource.set([]);
    if (response.dataModel && response.dataModel.length > 0) {
      this.dataSourceRawVal = JSON.stringify(response.dataModel);
      this.getLookUps()
      this.noData.set(false);
      this.resultsLength.set(response.rowCount || 0);
      this.totalRecords.emit(this.resultsLength());
      this.dataSourceRaw = response.dataModel;
      this.dataSourceRawString.set(JSON.stringify(response.dataModel));

      this.dataKeys = Object.keys(this.dataSourceRaw[0]);
      
      let vse = this.dataKeys.includes("VoucherSeq");
      let seq = this.dataKeys.includes("Seq");
      let se = this.dataKeys.includes("Sequence");
      let va = this.dataSourceRaw[0];
      if(vse){
        this.rowCount.emit(va['VoucherSeq']);
      }
      else if(seq){
        this.rowCount.emit(va['Seq'])
      }
      else if(se){
        this.rowCount.emit(va['Sequence']);
      }

      let sysList:any = []
      if(this.dataKeys){
        this.fieldVal.forEach((e: any)=>{         
          if(e.Visible === true && this.dataKeys.includes(e.FieldName)){
            this.vlist.push({
              id: e.Id,
              name: e.FieldCaption,
              hide: false
            })
          }

          if(this.dataKeys.includes(e.FieldName)){
            this.plist.push(e)
          }

        })
      }

      this.fieldVal.forEach((e: any) => {
        if(e.FieldName && e.Visible === true){
          let a = ['TabPage','GridTab','GridView','BTN','Expression','ExtText']
          let b = a.includes(e.FieldType);

          if ((!b && !this.colLayoutData) || (!b && this.colLayoutData && this.colLayoutData.includes(e.Id))) {         
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
          'Seq': e.VoucherSeq,
          'LinkedMenuId': e.LinkedMenuId,
          'LinkedCalledMenuField': e.LinkedCalledMenuField,
          'LabelId': e.LabelId ? e.LabelId : e.FieldName
        })

      })
      

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

        if(this.colLayoutData && !this.colLayoutData.includes(e.Id) && e.FieldName && !b){
          this.plist.push(e)
        }
      })


      if(this.dataKeys.includes('ID')){
        sysList.push({
          'FieldName': 'ID',
          'FieldCaption': 'ID',
          'FieldType': 'TextBox',
          'ListId': null,
          'Id': 0,
          'Seq': 0,
          'LinkedMenuId': null,
          'LinkedCalledMenuField': null,
          'LabelId': null
        })
      }
      let newSorted = sysList.sort((a: any, b: any)=>{
        let fa = a.FieldCaption ? a.FieldCaption.toLowerCase() : '',
        fb = b.FieldCaption ? b.FieldCaption.toLowerCase() : '';

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
        this.showSubRecord( this.dataSource()[0].ID, 1,'details','details')
      }

      if(this.newRecordAdded){
        if(this._newRecordID.type === 'save'){
          if(this._newRecordID.model && this._newRecordID.model === 'save'){
            if((this.pageType === 'mainmenu' || this.pageType === 'pendingwf') && this.page.pageType !== 'prerequisitemenu'){
              this.showRecord(this.dataSource()[0].ID, 1,'details','details')
            }else{
              this.showSubRecord(this.dataSource()[0].ID, 1,'details','details')
            }
          }else{
            this.activeRecord = this._newRecordID.modelid;
            this.activeRecordChange.emit(this.activeRecord);
          }
        }
        else{
          this.newRecordAdded = false;
          if(!this._newRecordID || (this._newRecordID.pageType !== 'detailsBtnGrid')){
            this.activeRecord = 0;
            this.activeRecordChange.emit(this.activeRecord);
          }
          this.newRecordShow.set(false);
          if(this._newRecordID.type === 'saveadd'){
            if(this.page.pageType === 'prerequisitemenu'){
              this.rowCount.emit(0);
            }
            this.addRecord();
          }
        }
      }else if(this._newRecordID && this._newRecordID.type === 'saveadd'){
          if(this.page.pageType === 'prerequisitemenu'){
            this.rowCount.emit(0);
          }
      }


    }
    else{
      if(this.page && this.page.pageType === 'prerequisitemenu' && this.preReqIndex && response.erroMessage){
        this.toastr.error(response.erroMessage);
      }
      this.dataSource.set([]);
      this.noData.set(true);
      this.rowCount.emit(0);
      this.resultsLength.set(0);

     this.fieldVal.forEach((e: any) => {
        if(e.FieldName && e.Visible === true){
          let a = ['TabPage','GridTab','GridView','BTN','Expression','ExtText']
          let b = a.includes(e.FieldType)
          if ((!b && !this.colLayoutData) || (!b && this.colLayoutData && this.colLayoutData.includes(e.Id))) {
            this.columns.push({
              header: e.FieldCaption,
              name: e.FieldName,
              fieldType: ''
            })
          }
        }
      })
      
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

        if(this.colLayoutData && !this.colLayoutData.includes(e.Id) && e.FieldName && !b){
          this.plist.push(e)
        }
      })

    }

    if ((this.pageType === 'mainmenu' || this.pageType === 'pendingwf') && this.page.pageType !== 'detailmenu' && this.page.record === 'add' && this.fieldVal.length > 0) {
      if (this.menuaccess.AllowInsert) {
        this.addRecord();
      } else {
        this.modalMessage = "You don't have permission to add record to this menu.";
        if(this.modalRef){
       /*   this.modal = new Modal(this.modalRef, {
            keyboard: false,
            backdrop: 'static'
          });*/
          this.modal.show('modalBox'+this.exportid());
        }
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
    let url = "General/LookupValues?menuId="+this.exportid()+"&languageid="+lang;
    this.loader.show();
    this._http.getClient<ApiResponse>(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response)=>{
        this.loader.hide();
        if(response && response.dataModel){
            let model = response.dataModel;
            let dkey = Object.keys(model);
            if(this.dataSourceRaw){
              this.dataSourceRaw.forEach((e: any, i: number)=>{
                dkey.forEach((a: any)=>{
                  if(this.dataSourceRaw[i][a]){
                    let aa: any = model[a];  
                    aa.forEach((j: any) => {
                      if(j.id === this.dataSourceRaw[i][a].toString()){
                        this.dataSourceRaw[i][a] = j.name;
                      }
                    });
                  }
                })
              })
              this.dataSource.set(this.dataSourceRaw);
              this.dataSource.set([...this.dataSource()].sort((a, b) => b.ID - a.ID));
            }
        }else{
          this.dataSource.set(this.dataSourceRaw);
          this.dataSource.set([...this.dataSource()].sort((a, b) => b.ID - a.ID));
        }
        this.dataSource.update(arr=> arr.map((e: any, i: number)=>({
          ...e,
          SNO: i+1,
          selctSNO: false
        })))
        
      if(this.pageType === 'detailsBtnGrid' && this.resultsLength() === 1){    
        this.fieldValue(this.dataSourceRaw[0].ID, 1, 'details');
        this.detailsPage.set(true);
      }
      },
      error: (_e: any)=>{
        this.loader.hide();
      }
    })
  }

  getMenuViewsData(id: number, currentPage: number, pageSize: number){
    this.isLoading.set(true);
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
    if(this.applyFilter && this.showFilter){
      params['filterCondition'] = this.filterQuery;
    }
    this.vlist = [];
    this.plist = [];
    this._http.putClient<any, ApiResponse>(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next:(response)=>{
        this.isLoading.set(false);
        if (response.dataModel && response.dataModel.length > 0) {
          this.noData.set(false);
          this.resultsLength.set(response.rowCount || 0);
          this.totalRecords.emit(this.resultsLength());
          this.dataSourceRaw = response.dataModel;
          this.dataSourceRawString.set(JSON.stringify(response.dataModel));
          this.dataSource.set(this.dataSourceRaw);
          this.dataSource.set([...this.dataSource()].sort((a, b) => b.ID - a.ID));
          this.dataKeys = Object.keys(this.dataSourceRaw[0]);
          this.dataSource.update(arr=> arr.map((e: any, i: number)=>({
            ...e,
            SNO: i+1,
            selctSNO: false
          })))


          let sysList:any = []
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
              'Seq': e.VoucherSeq,
              'LinkedMenuId': e.LinkedMenuId,
              'LinkedCalledMenuField': e.LinkedCalledMenuField,
              'LabelId': e.LabelId ? e.LabelId : e.FieldName
            })
          })

          if(this.dataKeys.includes('ID')){
            sysList.push({
              'FieldName': 'ID',
              'FieldCaption': 'ID',
              'FieldType': 'TextBox',
              'ListId': null,
              'Id': 0,
              'Seq': 0,
              'LinkedMenuId': null,
              'LinkedCalledMenuField': null,
              'LabelId': null
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

          if(this.dataKeys){
            this.fieldVal.forEach((e: any)=>{         
              if(e.Visible === true && this.dataKeys.includes(e.FieldName)){
                this.vlist.push({
                  id: e.Id,
                  name: e.FieldCaption,
                  hide: false
                })
              }
              
              if(this.dataKeys.includes(e.FieldName)){
                this.plist.push(e)
              }
      
            })
          }

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
            if(this.colLayoutData && !this.colLayoutData.includes(e.Id) && e.FieldName && !b){
              this.plist.push({
                id: e.Id,
                name: e.FieldCaption,
                hide: true
              })
            }
          })
          this.updateGoto();
        }else{
          this.noData.set(true);
          this.resultsLength.set(0);
          this.dataSource.set([]);
          
          this.fieldVal.forEach((e: any)=>{ 
            
            let a = ['TabPage','GridTab','GridView','BTN','Expression','ExtText']
            let b = a.includes(e.FieldType)
            if ((!b && !this.colLayoutData) || (!b && this.colLayoutData && this.colLayoutData.includes(e.Id))) {
              this.columns.push({
                header: e.FieldCaption,
                name: e.FieldName,
                fieldType: ''
              })
            }

            if(e.Visible === true && this.dataKeys && this.dataKeys.includes(e.FieldName)){
              this.vlist.push({
                id: e.Id,
                name: e.FieldCaption,
                hide: false
              })
            }

            if(this.dataKeys && this.dataKeys.includes(e.FieldName)){
              this.plist.push(e)
            }
    
          })

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
            if(this.colLayoutData && !this.colLayoutData.includes(e.Id) && e.FieldName && !b){
              this.plist.push(e)
            }
          })
        }
      },
      error: (_error)=>{
        this.isLoading.set(false);
      }
    })
  }

  sizeChange(e: number){
    this.pageSize = e;
    let id = this.activeId ? this.activeId: this.subMenuId;
    this.currentPage.set(1)
    this.getMenuData(id, this.currentPage(), this.pageSize, false);
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
    this.goTo = (this.currentPage() || 0) + 1;
    this.totalPages.set(Math.ceil(this.resultsLength() / this.pageSize));
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
    let id = this.activeId ? this.activeId: this.subMenuId;
    this.getMenuData(id, this.currentPage(), this.pageSize, false);
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

  fieldValue(record: number, i: number, type: string) {
    let data = this.dataSource()[i - 1];
    if(data && data.CompanyID){
      this.resCompanyID = data.CompanyID;
    }
    else{
      this.resCompanyID = this.companyID();
    }
    this.resCompanyIDemit.emit(this.resCompanyID)
    /*this.FieldVal.forEach((x: any) => {
      let b = this.dataKeys.includes(x.fieldName);
      if (b) {
        let c = data[x.fieldName];
        x.wfEnabled = false;
        x.editablefielddetails = '';
        if (typeof c !== 'object') {
          x.FieldVal = c;
        } else {
          x.FieldVal = null;
        }
      }
    });*/
    //this.menus = JSON.stringify(this.fieldValRaw);
    if(this.newRecordAdded && this._newRecordID.type !== 'saveadd' && this._newRecordID.model !== 'update' && (this.pageType === 'mainmenu' || this.pageType === 'pendingwf')){
      this.newRecordAdded = false;
     /* const index = this.recordList.findIndex((x: any) => x.id === 0);
      if(index >= 0){
        this.recordList[index].id = this._newRecordID.modelid;
        this.recordList[index].newrecord = false;
      }*/
    }
    this.menusChange.emit(this.menus);
    if(((this.pageType === 'mainmenu' || this.pageType === 'detailmenu' || this.pageType === 'pendingwf' || (this.page.pageType === 'prerequisitemenu' && this.page.isJobEnable)) && !this.newRecordAdded) || (this.newRecordAdded && this._newRecordID.model !== 'update' && (this.pageType === 'pendingwf' || this.pageType === 'detailmenu' || this.pageType === 'mainmenu'))){
      if(!this._newRecordID || this._newRecordID.model === 'update' || (this._newRecordID.model === 'new' && this._newRecordID.type !== 'save')){
        this.recordList.push({ id: data.ID, newrecord: false, menus: this.menus, type: type, disableClose: false, submenus: [] });
      }else{
        this._newRecordID = '';
      }
      this.recordList.currentid = data.ID;
    }

    if(this.pageType === 'detailsBtnGrid'){   
      let rid = this.recordList.findIndex((x:any)=> x.id === this.detailsgridID);
      if(rid >= 0){
        if(this.recordList[rid].submenus.length > 0){
        
            const index = this.recordList[rid].submenus.findIndex((x: any) => x.id === 0);
            if(index !== -1){
              let de = this.recordList[rid].submenus.splice(index, 1);
              this.closeComponentEmit.emit(de);
              this.newRecordAdded = false;
            }
          
          let a =  this.recordList[rid].submenus.findIndex((x:any)=> x.id === record);
          if(a < 0){
            let menuid:any = '';
            if(this.pageAdd && this.activeId) {
              menuid = this.activeId;
            }
            else if(this.subMenuId){
              menuid = this.subMenuId;
            }
            let index = this.recordList[rid].submenus.findIndex((y:any)=> y.parentid  === this.activeRecord);
            if(index !== -1){
              let de = this.recordList[rid].submenus.splice(index, this.recordList[rid].submenus.length);
              this.closeComponentEmit.emit(de);
            }
            this.recordList[rid].submenus.push({id: data.ID, desc: '', menuid: menuid, filter: '', parentid: this.activeRecord, recordid: '', type: 'details'});    
            
            this.activeRecord = record;
            let r = {activeRecord: this.activeRecord, type : 'details'}
            this.activeRecordChange.emit(r)
          }else{
            this.activeRecord = record;
            let r = {activeRecord: this.activeRecord, type : 'details'}
            this.activeRecordChange.emit(r)
          }
         // this.recordList.currentid = data.ID;
        }else{
        // this.recordList[rid].submenus.push({id: record, desc: '', menuid: '', filter: '', parentid: this.recordId, recordid: this.recordId, type: 'details'})
        }
      }else{
        this.recordList.forEach((x:any)=>{
          
            const index = x.submenus.findIndex((y: any) => y.id === 0);
            if(index !== -1){
              let de = x.submenus.splice(index, 1);
              this.closeComponentEmit.emit(de);
              this.newRecordAdded = false;
            }
           
          if(x.id === this.recordList.currentid){
            let a = x.submenus.findIndex((y:any)=> y.id === record);
            if(a < 0){
              let menuid:any = '';
              if(this.pageAdd && this.activeId) {
                menuid = this.activeId;
              }
              else if(this.subMenuId){
                menuid = this.subMenuId;
              }
              else if(this.exportid()){
                menuid = this.exportid();
              }
              let index = x.submenus.findIndex((y:any)=> y.parentid === this.activeRecord);
              if(index !== -1){
               let de = x.submenus.splice(index, x.submenus.length);
               this.closeComponentEmit.emit(de);
              }
              x.submenus.push({id: record, desc: '', menuid: menuid, filter: '', parentid: this.activeRecord, recordid: '', type: 'details'});    
              
              this.activeRecord = record;
              let r = {activeRecord: this.activeRecord, type : 'details'}
              this.activeRecordChange.emit(r)
            }else{
              this.activeRecord = record;
                let r = {activeRecord: this.activeRecord, type : 'details'}
                this.activeRecordChange.emit(r)
            }
          }
        })
        //this.recordList.currentid = record;
      }
      
    }else{
      this.activeRecord = record;
      this.activeRecordChange.emit(this.activeRecord);
    }
  }

  openTreeView(e: any){
    let data = e;
    if(data.CompanyID){
      this.resCompanyID = data.CompanyID;
    }
    else{
      this.resCompanyID = this.companyID();
    }
    let index = this.dataSource().findIndex((e:any)=> e.ID === data.ID);
    if(index > -1){
      this.showRecord(data.ID, (index+1), 'details','details');
    }else{
      const index = this.recordList.findIndex((x: any) => x.id === data.ID);
      if(index === -1){
        this.resCompanyIDemit.emit(this.resCompanyID)
        this.menusChange.emit(this.menus);
        this.recordList.push({ id: data.ID, newrecord: false, menus: this.menus, type: 'details', disableClose: false, submenus: [] });
        this.recordList.currentid = data.ID;
        this.activeRecordChange.emit(data.ID);
      }else{
        this.activeRecord = data.ID;
        this.activeRecordChange.emit(data.ID);
      }
    }
   
  }

  showRecord(record: number, i: number, type: string, tab: string) {
    
    if(this.recordList.length === 0) {
      this.fieldValue(record, i, type);
    } else {
      const index = this.recordList.findIndex((x: any) => x.id === record);
      if (index < 0 || (this.newRecordAdded && index <=0)) {
        this.fieldValue(record, i, type);
      }else{
        this.activeRecord = record;
        this.activeRecordChange.emit(this.activeRecord);
      }
    }
   // this._menus.activeRecord.next(this.activeRecord)
    this.detailsPage.set(true);
    this.newRecordShow.set(false);
    this.recordId = record;
    if (tab) {
      this.tabname = tab;
      this.tabnameChange.emit(tab);
    }
  }

  showSubRecord(record: number, i: number, type: string, tab: string) {
    this.fieldValue(record, i, type);
    this.subRecordData = this.dataSourceRaw[i - 1];
    this.subRecordID = record;
    let subRecord = {id: this.subRecordID, data: this.subRecordData, label: this.menus}
    this.subRecordDetail.emit(subRecord)
  }

  modalRecord(record: number){
    this.openDimension.set(true);
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
      this.detailsPage.set(false);
    }
    if (this.recordList && this.recordList.length !== 0) {
      const index = this.recordList.findIndex((x: any) => x.id === record);
      if(index > -1){
        this.recordList.splice(index, 1);
      }
    }
    //this._menus.recordList.next(this.recordList);
    if (this.recordList && this.recordList.length === 0) {
      this.activeRecord = 0;
      this.activeRecordChange.emit(this.activeRecord);
      this.detailsPage.set(false);
    }
  }

  addRecord() {
    this.menusChange.emit(this.menus);
    this.resCompanyIDemit.emit(this.resCompanyID ? this.resCompanyID : this.companyID());4
    this.addRecordemit.emit({show: true, pageType: this.pageType});
   
    this.newRecordShow.set(true);
    setTimeout(()=>{
      this.addRecordemit.emit({show: false, pageType: this.pageType});
    },100)
  }

  openMemo(header: string, msg: any){
    this.memoNote = true;
    this.modalTitle = header;
    this.modalMessage = msg;    
  /*  this.modal = new Modal(m, {
      keyboard: false,
      backdrop: 'static'
    });*/
    this.modal.show('modalBox'+this.exportid());
  }

  closeModal() {
    this.modal.hide();
    this.modalShow.set(true);
    this.openDimension.set(false);
  }

  clickEvent(index: number) {
      this.cindex = index
  }

  exportEmitEvt(e: any){
    this.exportAll.set(e.exportAll)
    this.exportData(e.id, e.size);
  }

  exportData(id: number, size: number) {
    if(!this.noData()){
      const user = JSON.parse(localStorage.getItem('user') || '');
      const lang = JSON.parse(localStorage.getItem('lang') || '');
      let url = '', params: any = {};
      if(this.page && this.page.menuType === 'View'){
        url = 'SystemFields/GetMenuDatafromView?isExport=true&isallFields='+this.exportAll();
      
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
        if(this.applyFilter && this.showFilter){
          params['filterCondition'] = this.filterQuery;
        }
        if(this.filterCondition){
          params['filterCondition'] = this.filterCondition;
        }
        this.eisLoading.set(true);
        this._http.putClient<any, ApiResponse>(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: (response)=>{
            this.eisLoading.set(false);
            this.getXlFile(response, size);    
          },
          error: (_error)=>{
            this.eisLoading.set(false);
          }
        })
      }
      else if(this.page && this.page.pageType === 'prerequisitemenu' && this.preReqIndex){
        const user = JSON.parse(localStorage.getItem('user') || '');
        const lang = JSON.parse(localStorage.getItem('lang') || '');
        if(this.page.menuType === "Object"){
          url = 'General/RunPrerequesiteProcedure?isrunprocedure=false&isDataNeed=true&isExport=true&isallFields='+this.exportAll();
          params = {
            "menuID": this.page.id,
            "userID": user.id,
            "languageID": lang,
            "recordID": this.subRecordId,
            "companyID": this.companyID(),
            "applicationID": user.applicationID,
            "queryfields": this.queryData,
            "pageNumber": 1,
            "pageSize": size
          }
          
          if(this.applyFilter && this.showFilter){
            params.filterCondition = this.filterQuery;
          }
        
         // this.eisLoading.set(true);
          this._http.postClient<any, ApiResponse>(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (response)=>{
              if(response.dataModel){
                this.getXlFile(response, size);
              }
            },
            error: (_error)=>{
              this.eisLoading.set(false);
            }
          })
        }
      }else{
        let url = '';
        if(this.page.previousRecordID && this.page.previousMenuId){
          url = 'SystemFields/GetMenuData?IsFilterConditionApply=true&JoinOuterCondition=false&isExport=true&isallFields='+this.exportAll()+'&previousRecordID='+this.page.previousRecordID+'&previousMenuId='+this.page.previousMenuId;
        }
        else if(this.previousRecordID && this.previousMenuId){
          url = 'SystemFields/GetMenuData?IsFilterConditionApply=true&JoinOuterCondition=false&isExport=true&isallFields='+this.exportAll()+'&previousRecordID='+this.previousRecordID+'&previousMenuId='+this.previousMenuId;
        }else{
          url = 'SystemFields/GetMenuData?IsFilterConditionApply=true&JoinOuterCondition=false&isExport=true&isallFields='+this.exportAll();
        }
        let params:any = {
          "menuID": id,
          "userID": user.id,
          "languageID": lang,
          "companyID": this.companyID(),
          "applicationID": user.applicationID,
          "queryfields": "",
          "pageNumber": 1,
          "pageSize": size
        }
        if(this.applyFilter && this.showFilter){
          params.filterCondition = this.filterQuery;
        }
        if(this.filterCondition){
          params['filterCondition'] = this.filterCondition;
        }
        this.eisLoading.set(true);
        this._http.putClient<any, ApiResponse>(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: (response)=>{
            this.eisLoading.set(false);
            this.getXlFile(response, size);    
          },
          error: (_error)=>{
            this.eisLoading.set(false);
          }
        })
      }
    }
  }

  getXlFile(response: any, size: number){
    this.eisLoading.set(false);
    if(response.dataModel){
      const binaryString = response.dataModel;
      // Decode base64 string to ArrayBuffer   
      const byteCharacters = atob(binaryString);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);

      // Create a Blob from ArrayBuffer
      let blob;
      if(size > 700000){
        blob = new Blob([byteArray], {
          type:'text/csv',
      });
      }else{
        blob = new Blob([byteArray], {
          type:'application/vnd.openxmlformatsofficedocument.spreadsheetml.sheet',
      });
      }
      

      // Create a temporary anchor element
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      if(size > 700000){
        link.download = 'downloaded_template.csv'; // File name
      }
      else{
        link.download = 'downloaded_template.xlsx'; // File name
      }
      document.body.appendChild(link);

      // Programmatically click the link to trigger the download
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href);
    }else{
      this.toastr.error(response.erroMessage)
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
      if(this.page.pageType === 'prerequisitemenu'){
    //    this.sideBar.menuNav.next("true");
        let query = ''; 
        if(i.LinkedQuery){
          //query =  this.getQuery(i.LinkedQuery, (sno - 1));
          query = i.LinkedQuery;
        }
        
        let a = i.LinkedQuery.split('[');
        let b = a[1].split(']');
        let dtr = this.dataSourceRaw[0];
        const items = {id: i.LinkedMenuID, dtid: i.LinkedMenuID+"-"+dtr[b[0]], pwfid: '', query: query, name:  this.menuaccess ? this.menuaccess.MenuName+"*":"Dimensions *", pageType: 'detailmenu', menuType: '', record: 'add', previousMenuId: i.MenuID, previousRecordID:record, isKeyManualInput: null, isJobEnable: false, disableClose: false};
        this.store.dispatch(StoreAction.addPage({menu: items}))
        this.store.dispatch(StoreAction.activePage({active: i.LinkedMenuID+"-"+dtr[b[0]]}))
    }
    else if(this.recordList && this.recordList.length > 0){
      this.recordId = record;
      const index = this.recordList.findIndex((x: any) => x.id === record);
      if (index < 0) {
        this.fieldValue(record , sno, 'details');
      }
      this.recordList.forEach((e:any)=> {
        if(this.recordList.currentid === e.id && e.id === this.recordId){
          e.submenus.splice(0, e.submenus.length);
          let query = ''; 
          if(i.LinkedQuery){
            //query =  this.getQuery(i.LinkedQuery, (sno - 1));
            query = i.LinkedQuery;
          }
          e.submenus.push({recordData: '', drillDown: '', desc: i.Description, menuid: i.LinkedMenuID, filter: query, parentid: this.recordId, id: i.ID+this.recordId, recordid: i.ID, type: 'detailsBtnGrid', previousMenuId: i.MenuID, previousRecordID:record})
        }
        else if(this.recordId === this.activeRecord){
          if(e.submenus.length > 0){
            let index = e.submenus.findIndex((x:any)=> x.parentid === this.activeRecord && x.type !== 'details');
            if(index !== -1){
              e.submenus.splice(index, e.submenus.length)
            }
            
          }
          let query = ''; 
          if(i.LinkedQuery){
            //query =  this.getQuery(i.LinkedQuery, (sno - 1));
            query = i.LinkedQuery;
          }
          if(this.recordList.currentid === e.id){
            e.submenus.push({recordData: '', drillDown: '', desc: i.Description, menuid: i.LinkedMenuID, filter: query, parentid: this.recordId, id: i.ID+this.recordId, recordid: i.ID, type: 'detailsBtnGrid', previousMenuId: i.MenuID, previousRecordID:record})
          }
        }
      })
    
      this.activeRecord = i.ID+this.recordId;
      let r = {activeRecord: this.activeRecord, type : 'detailsBtnGrid'}
      this.activeRecordChange.emit(r);
    }else{
      this.showRecord(record, sno, 'details', 'details');
      setTimeout(()=>{
        this.detailsOpen(i, record, sno);
      }, 100);
      
    }
  }

  filterToggle(){
    this.showFilter = !this.showFilter;
    if(!this.showFilter){
      this.filterOff(false);
    }
  }

  filterOff(e: boolean){
    this.showFilter = e;
  }

  setFilterValueEvent(e: any){
    if(e.query){
      this.applyFilter = true;
      this.filterQuery = e.query;
    }else{
      this.applyFilter = false;
      this.filterQuery = null;
    }
    if(this.subQuery && this.filterQuery){
      this.applyFilter = true;
      this.filterQuery = this.filterQuery +' and '+ this.subQuery;
    }
    else if(this.subQuery && !this.filterQuery){
      this.applyFilter = true;
      this.filterQuery = this.subQuery;
    }
    this.getMenuData(this.menuid, 1, this.pageSize, true);
  }

  approveFlow(type: string){
    const user = JSON.parse(localStorage.getItem('user') || '');
    const lang = JSON.parse(localStorage.getItem('lang') || '');
    this.selectAll.set(false);
    if(this.setApprovebtn()){
      this.isLoading.set(true);
      this.closeModal();
      if(type === 'Approve'){
        this.arrayCalls = [];
        let url = "SysFields/SysWorkFlowApproval";
        this.dataSource.update(arr=>arr.map((e: any, i: number)=>{
          if(e.selctSNO){
            let param = 
              {
                "menuID": this.menuid,
                "userID": user.id,
                "languageID": lang,
                "companyID": this.companyID(),
                "recordID": e.ID,
                "applicationID": user.applicationID,
                "type": "Approve",
                "queryfields": "",
                "notes": this.workflownote 
              }
              const headers = new HttpHeaders({"Authorization": user._token, "RequestingResource":"Browser","UserID": user.id})
              this.arrayCalls.push(this.http.put(this.baseurl + url, param,{headers: headers}));
          }
          return { ...e};
        }))

        setTimeout(()=>{
          forkJoin(this.arrayCalls).pipe(map((response) => {
            this.isLoading.set(true);
            this.getmenuFields(this.activeId);
            return response;
          })).subscribe({
            next:(responses: any)=>{
              for(let response of responses){
                if(response.erroMessage){
                  let message = response.erroMessage.replaceAll('\n','<br />')
                  this.toastr.error(message, 'Error : ',  {
                    timeOut: 8000,
                    enableHtml: true
                  });
                }
              }
            },
            error: (_e)=>{
              this.isLoading.set(false);
              this.toastr.error('An Error Occurred');      
            }
          });
        },1000)
      }else{
        let url = "SysFields/SysWorkFlowRejection?workflowid=0";

        this.dataSource.update(arr=>arr.map((e: any, i: number)=>{
             if(e.selctSNO){
            let param = 
              {
                "menuID": this.menuid,
                "userID": user.id,
                "languageID": lang,
                "companyID": this.companyID(),
                "recordID":  e.ID,
                "applicationID": user.applicationID,
                "type": type,
                "queryfields": "",
                "notes": this.workflownote 
              }
              const headers = new HttpHeaders({"Authorization": user._token, "RequestingResource":"Browser","UserID": user.id})
              this.arrayCalls.push(this.http.put(this.baseurl + url, param,{headers: headers}));
          }
          return {...e}
        }));

        setTimeout(()=>{
          forkJoin(this.arrayCalls).pipe(map((response) => {
            this.isLoading.set(true);
            setTimeout(()=>{
              this.getmenuFields(this.activeId);
            }, 8000)
            return response;
          })).subscribe({
            next:(responses: any)=>{
              for(let response of responses){
                if(response.erroMessage){
                  let message = response.erroMessage.replaceAll('\n','<br />')
                  this.toastr.error(message, 'Error : ',  {
                    timeOut: 8000,
                    enableHtml: true
                  });
                }
              }
            },
            error: (_e)=>{
              this.isLoading.set(false);
              this.toastr.error('An Error Occurred');      
            }
          });
        },1000)
      }

    }else{
      if(type === 'Approve'){
        let url = "SysFields/SysWorkFlowApproval";
        let param = 
              {
                "menuID": this.menuid,
                "userID": user.id,
                "languageID": lang,
                "companyID": this.companyID(),
                "recordID": this.recordId,
                "applicationID": user.applicationID,
                "type": "Approve",
                "queryfields": "",
                "notes": this.workflownote 
              }
        this._http.putClient<any, ApiResponse>(url, param).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: (response)=>{
            if(response.erroMessage){
              this.toastr.error(response.erroMessage);
            }
            this.closeModal()
          },
          error: (_e)=>{
            this.closeModal();
          }
        })
      }else{
        this.closeModal();
      }
    }
  }

  openApproveModalBulk(type: string){
    this.wfType.set(type);
    if(this.modalShow()){
    /*  this.modal = new Modal(this.modalRef, {
        keyboard: false,
        backdrop: 'static'
      });*/
      this.modal.show('approveModal'+this.recordStamp);
      this.modalShow.set(false);
    }
  }


  openApproveModal(modalRef: HTMLDivElement, record: any, i: number, type: string){

    if(type === 'Open'){
      this.showRecord(record, i,'workflow','workflow')
    }
    else{
      this.modalRef = modalRef;
      this.wfType.set(type);
      if(this.modalShow()){
      /*  this.modal = new Modal(this.modalRef, {
          keyboard: false,
          backdrop: 'static'
        });*/
        this.modal.show('approveModal'+this.recordStamp);
        this.modalShow.set(false);
      }
    }
  }

  refreshTableEvt(_e: any){
    this.sysList.set([]);
    this.getmenuFields(this.activeId)
  }

  getWorkflow(){
      let url = "Sys/GetSysWorkflows?menuid=" + this.menuid +"&recoredID="+ this.actionrecordid + "&pageNumber=1&PageSize=100";
      this._http.getClient<ApiResponse>(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (res) => {
          let response = res;
          if(response.dataModel && response.dataModel.length > 0){
            this.menuwfid = response.dataModel[0]['MenuWorkflowID'];
          }
          this.getWorkflowProgress();
        },
        error: (_error)=>{

        }
      });
  }

  checkStatus(recordid: number){
    const user = JSON.parse(localStorage.getItem('user') || '');
    const lang = JSON.parse(localStorage.getItem('lang') || '');
    let url = "Sys/GetMenuRulesQueryExecutions";
    this.actionBTNDisabled.set(false);
    this.wfstatus = '';
    this.actionrecordid = recordid;
    let param = {
      "menuID": this.menuid,
      "pMenuID": this.menuid,
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
                  this.actionBTN.update(items =>{
                    const copy = [...items];
                    copy[index] = { ...copy[index], mrEnabled: false, Enabled: false };
                    return copy;
                  })
                }
                if(pindex !== -1){
                  this.printBTN.update(items =>{
                    const copy = [...items];
                    copy[index] = { ...copy[pindex], mrEnabled: false, Enabled: false };
                    return copy;
                  })
                }
              }
            }
            else if(b.actionType === 'Enable Field'){
              let index = this.actionBTN().findIndex((e:any)=> e.FieldName === b.fieldName);
              let pindex = this.printBTN().findIndex((e:any)=> e.FieldName === b.fieldName);
              if(b.actionValue === '1'){
                if(index !== -1){
                  this.actionBTN.update(items =>{
                    const copy = [...items];
                    copy[index] = { ...copy[index], mrEnabled: true, Enabled: true };
                    return copy;
                  })
                }
                if(pindex !== -1){
                  this.printBTN.update(items =>{
                    const copy = [...items];
                    copy[index] = { ...copy[pindex], mrEnabled: true, Enabled: true };
                    return copy;
                  })
                }
              }
            }
          })
        }

        if(this.menuaccess && this.menuaccess.ApplyWorkflow){
          this.getWorkflow();
        }
      },
      error: (_error)=>{

      }
    })

  }

  getWorkflowProgress(){
    const user = JSON.parse(localStorage.getItem('user') || '');
    let isassociate = false;
    if(this.page.pageType === 'pendingwf'){
      isassociate = true;
    }
    let url = "SysMenu/GetWorkflowProgressdata?menuid=" + this.menuid +"&recordid="+ this.actionrecordid + "&companyid="+this.companyID()+"&userid="+user.id+"&isassociate="+isassociate;
    this._http.getClient<ApiResponse>(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next:(res: any)=>{
        if(res.dataModel && res.dataModel.length > 0){      
          let response = res.dataModel[0];
          this.wfstatus = response.WorkflowStatus;
          this.stepid = response.StepID;
          const str = response.Userid;
          const value = user.id.toString();
          const exists = new RegExp(`(^|,\\s*)${value}(,|$)`).test(str);
          if(response.Userid){
            if(!exists){
              if(response.IsAssociate !== 1){
                this.actionBTNDisabled.set(true);
                this.getWorkflowSteps();
              }
            }
          }

          if(response.Userid && exists){
            if(response.EditableFields){
              let b = response.EditableFields.split(',');
              if(b.length > 0){
                b.forEach((be:any) => {
                  this.actionBTN.update(arr=> arr.map((x: any)=>{
                     if(x.FieldName === be.trim()){
                      x.wfEnabled = true;
                      
                      if(x.FieldType === "BTN"){
                        if(x.ShowInPrint){
                        }else{
                          this.actionBTNDisabled.set(false);
                        }
                      }
                    }else{
                      if(!x.wfEnabled){
                        x.wfEnabled = false;
                      }
                    }
                    return {...x}
                  }))
              
                });
              }

            }else{
            }

          }

          

          if(this.wfstatus === 'Rejected' || this.wfstatus === 'Approved'){
            this.actionBTNDisabled.set(true);;
          }else{
            if(response.IsAssociate !== 1){
              this.actionBTNDisabled.set(true);;
            }else{
              this.actionBTNDisabled.set(false);;
            }
          }

          this.getWorkflowSteps();
        }else{

        }
      }
    })

  }

  getWorkflowSteps(){
    const user = JSON.parse(localStorage.getItem('user') || '');
    let url = 'Sys/GetSysMenuWorkflowSteps?pageNumber=1&PageSize=100&FilterCondition=MenuWorkflowID='+this.menuwfid;
    this._http.getClient<ApiResponse>(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response)=>{
        if(response.dataModel && response.dataModel.length > 0){
          let a = response.dataModel;
          a.forEach((e:any) => {
            if(e.ID === this.stepid){
              this.wfstatus = e.Description; 
              if(e.CreatedUser === user.id){
                if(e.EditableFields){
                  let b = e.EditableFields.split(',');
                  if(b.length > 0){
                    b.forEach((be:any) => {
                      this.actionBTN.update(arr=> arr.map((x: any)=>{
                        if(x.FieldName === be.trim()){
                          x.wfEnabled = true;
                          this.actionBTNDisabled.set(false);;
                        }else{
                          if(!x.wfEnabled){
                            x.wfEnabled = false;
                          }
                        }
                        return {...x}
                      }))
                      
                    });
                  }

                }else{
                  //this.enableSavebtn = false;
                }

                
              }
              
            }
          });

        }
        
      },
      error: (_error)=>{
        this.isLoading.set(false);
      }
    })
  }

  actionClick(btn: any, type: string, recordid: number, i: number){
    
    let dd = JSON.parse(this.dataSourceRawString());
    let data = dd[i];
    this.fieldActionBody['ID'] = data['ID'];
    this.fieldActionBody['CompanyID'] = this.companyID();
    if(this.dataKeys){
      this.fieldVal.forEach((x: any) => {
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
    }
    this.actionrecordid = recordid;
    const user = JSON.parse(localStorage.getItem('user') || '');
    const lang = JSON.parse(localStorage.getItem('lang') || '');
    this.exceltype.set(false);
    this.actionBtnType = type;
    let url = "Sys/GetOnclickSysActions";
  
    this.actionMenuList = btn;
    this.loader.show();
    this.hideProceed.set(false);
    let params= {
      "applicationID": user.applicationID,
      "companyID": this.companyID(),
      "fieldID": btn.Id,
      "languageID": lang,
      "menuID": this.menuid,
      "pMenuID": this.menuid,
      "queryfields": this.fieldActionBody,
      "precordid": this.actionrecordid,
      "recordID": this.actionrecordid,
      "userID": user.id,
    }
    this._http.putClient<any, ApiResponse>(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        if(response.dataModel && response.dataModel.length !== 0){
          this.actionresponsemodel = response.dataModel;
          let seq = 0;
          this.actionresponsemodel.forEach((x:any)=>{
            if(x.actionType === "Excel"){
              this.upldfile = '';
              this.fileName = '';
              this.deleteXlFile = false;
              this.exceltype.set(true);
              this.xlOk.set(false);
              this.actionbtnname = btn.FieldCaption;
              this.getTemplate(btn.Id, x.id);
              if(this.modalShow()){ 
                this.openMenuId.set('');
                this.openSettingId.set('');
                this.modal.show('gxlModal'+this.pageIndex);
                this.modalShow.set(false);
              }
            }
            else if(x.actionType === "Message" && !this.exceltype()){
              if(seq === 0){
                seq = x.seq;
                this.modalMessage = x.message;
                this.toastr.success(x.message);
              } 
              else if(seq < x.seq){
                this.conpletedMessage = x.message;
              }
            }
            else if(x.actionType === "Procedure" && !this.exceltype()){
              this.runProceedure(x.id, type, x.actionType);
            }
            else if(x.actionType === "Calling Menu"){
              if(x.linkedQuery){
                  this.runProceedure(x.id, this.actionBtnType, x.actionType);
              }
            }
          })
        }else{
          if(type === 'print'){
            this.printAction(this.actionMenuList)
          }
        }
        this.loader.hide();
      },
      error: (_error) => {
        this.loader.hide();
      }
    })
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
    this.loader.show();
    this.hideProceed.set(true);
    
    let params = {
      "menuID": this.menuid,
      "pMenuID": this.menuid,
      "userID": user.id,
      "languageID": lang,
      "companyID": this.companyID(),
      "recordID": this.actionrecordid,
      "applicationID": user.applicationID,
      "queryfields": this.fieldActionBody
    }

    this._http.putClient<any, ApiResponse>(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        if(response.erroMessage){
          if(response.erroMessage !== 'Linked Query Not Found'){
            this.modalMessage = response.erroMessage;
            this.toastr.clear();
            if(this.modalShow()){ 
          /*    this.modal = new Modal(this.modalRef, {
                keyboard: false,
                backdrop: 'static'
              });*/
              this.modal.show('actionModal'+this.recordStamp); 
              this.modalShow.set(false);
            }
          }
        }
        else if(response.successMessage === "Call crystal reprot"){
          this.printAction(this.actionMenuList);
        }
        else if(response.successMessage){
          this.toastr.success(this.conpletedMessage ? this.conpletedMessage : 'Completed');
        }
        
        this.loader.hide();
      },
      error: (_error) => {
        this.hideProceed.set(false);
        this.loader.hide();
      }
    })
  }

  printAction(print: any){
    const user = JSON.parse(localStorage.getItem('user') || '');
    const lang = JSON.parse(localStorage.getItem('lang') || '');
    let url = "Report/GenerateReport?sysfieldid="+print.Id+"&pmenuid="+this.menuid+"&precordid="+this.actionrecordid+"&companyid="+this.companyID()+"&menuid="+this.menuid+"&languageid="+lang+"&userid="+user.id+"&applicationid="+user.applicationID;
    let params = this.fieldActionBody;
    this.loader.show();
    this._http.putClient<any, ApiResponse>(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response)=>{
        this.loader.hide();
        if(response.erroMessage){
          this.toastr.error(response.erroMessage)
        }else{
          if(response && response.dataModel){
            let reporturl: any = response.dataModel;
            let aa = reporturl.stream.split('"_buffer":');
            let b = JSON.parse(aa[1]);

            var byteCharacters = atob(b);
            var byteNumbers = new Array(byteCharacters.length);
            for (var i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            var byteArray = new Uint8Array(byteNumbers);
            var file = new Blob([byteArray], { type: 'application/pdf;base64' });
            this.reportURL.set((window.URL || window.webkitURL).createObjectURL(file));

            let tab: any = window.open();
            tab.location.href = this.reportURL();  
            this.openMenuId.set('');
            this.openSettingId.set('');
          }
        }
      },
      error: (_error)=>{
        this.loader.hide();
      }
    })
  }

  getTemplate(fieldid: number, actionid: number){
    const user = JSON.parse(localStorage.getItem('user') || '');
    const lang = JSON.parse(localStorage.getItem('lang') || '');
    let url = "FileUpload/XmlDownloadFile";
    this.xlactionid = actionid;
    let params: any = {
      "menuID": this.menuid,
      "pMenuID": 0,
      "fieldID": fieldid,
      "actionID": actionid,
      "userID": user.id,
      "languageID": lang,
      "companyID": this.companyID(),
      "recordID":  this.actionrecordid,
      "pRecordID": 0,
      "applicationID": user.applicationID,
      "queryfields": this.fieldActionBody
    }

    this._http.postClient<any, ApiResponse>(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response)=>{
        if(response.dataModel){
          this.binaryString = response.dataModel;
          this.targetTable = response.stringID;
        }
      },
      error: (_e)=>{

      }
    })
  }

  dnldTemplate(){
          // Decode base64 string to ArrayBuffer   
          const byteCharacters = atob(this.binaryString);
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
  }

  handleFileInput(event: any){
    this.upldfile = event.target.files[0];
    event.target.value = '';
    this.fileName = this.upldfile.name;

    let a = this.fileName.split('.');
    let ext = a[1].toLowerCase();
    let b = ['xls','xlsx'];
    let c = b.includes(ext)
    if(a.length > 2){
      this.toastr.error('Filename must have only one dot');
    }
    else if(!c){
      this.toastr.error('File type not allowed');
      this.fileName = '';
    }else{
      this.xlOk.set(true);
      /*let _size = this.file.size;
      let fSExt = new Array('Bytes', 'KB', 'MB', 'GB'),i=0;
      while(_size>900){_size/=1024;i++;}
      this.fileSize = (Math.round(_size*100)/100)+' '+fSExt[i];*/      
    }
  }

  contProcedure(){

    const user = JSON.parse(localStorage.getItem('user') || '');
      let url = 'FileUpload/xmlBulkInsert?actionID='+ this.xlactionid+'&recordId='+this.actionrecordid+'&deleteExistingrecord='+this.deleteXlFile;
      let formParams = new FormData();
      formParams.append('file', this.upldfile);
      this._http.postClient<any, ApiResponse>(url, formParams).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next:(response) => {
        if(response.successMessage){
          let seq = 0;
          this.closeModal();
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
              this.runProceedure(x.id, this.actionBtnType, x.actionType);
            }
          })
        }else{
          this.toastr.error(response.erroMessage ?? '');
        }
        //this.filePath = response.filePath;
      },
      error: (_error) => {
        this.toastr.error('Error in excel file upload');
      }
    })
  }

  selecEvent(){
    if(this.selectAll()){
      this.setApprovebtn.set(true);
      this.dataSource.update(arr=>arr.map(
        (e: any, i: number)=>({
          ...e,
          selctSNO: true
        })
      ))
    }else{
      this.setApprovebtn.set(false);
      this.dataSource.update(arr=>arr.map(
        (e: any, i: number)=>({
          ...e,
          selctSNO: false
        })
      ))
    }
  }

  selectID(e: any){
    this.setApprovebtn.set(false);
    if(!e.target.checked){
      this.selectAll.set(false);
    }
    else{
      this.setApprovebtn.set(true);
    }
    this.dataSource.update(arr=>arr.map((e: any, i: number)=>{
          if(e.selctSNO){
            this.setApprovebtn.set(true);
          }
          
          return { ...e }; 
        }
      ));
  }

  genReport(record: number, i: number){
    //this.recordList.splice(0, this.recordList.length);
    //let params = {page: this.page, recordid: record, index: i, companyID: this.resCompanyID, data: this.dataSourceRaw[i - 1]};
     const e = this.store.pipe(select('reportlist')).subscribe(data=>{
            if(data.list && data.list.length > 0){
                let a = data.list;
                let b = a.findIndex((e: any)=> e.rid === this.activeId);
                if(b > -1){

                }else{
                  this.prerequisiteType(record, i);
                }
            }else{
              this.prerequisiteType(record, i);
            }
      });
      e.unsubscribe();
  }

  showPreRecord(record: number, i: number, type: string, tab: string) {
    this.prType.emit('prerequisites');
    this.showRecord(record, i, type, tab)
  }

  prerequisiteType(record: number, i: number){
    const user = JSON.parse(localStorage.getItem('user') || '');
    const lang = JSON.parse(localStorage.getItem('lang') || '');
    let url = "General/RunPrerequesiteProcedureJob";
    let params = {
      "menuID": this.page.id,
      "preMenuID": this.page.dtid,
      "userID": user.id,
      "languageID": lang,
      "recordID": record,
      "companyID": this.companyID(),
      "applicationID": user.applicationID,
      "queryfields": this.dataSourceRaw[i - 1],
      "pageNumber": 1,
      "pageSize": 10,
    }
    let e = 0;
   
    if(this.taskid.length > 0){
            const index = this.taskid.findIndex((x:any) => (x.mid === this.page.id && x.rid === record));
            if(index > -1 && this.taskid[index].status){
              setTimeout(()=>{
             // this.prtype.set('prerequisites');
             // this.preRequisiteOption.set(false);
             if(this.taskid[index].status === 'completed'){
                this.toastr.success('Report for ID:'+record+' is '+ this.taskid[index].status);
             }else{
                this.toastr.warning('Report for ID:'+record+' is '+ this.taskid[index].status);
             }
              
              }, 200)
              e++;
            }
    }
          if(e === 0){
          this._http.putClient<any, ApiResponse>(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (response)=>{
              if(response && response.taskId){
                this.taskid.push({'tid':response.taskId, 'rid': record, 'mname':this.page.name, 'mid': this.page.id, 'page': this.page, 'status':'running', 'index': i, 'data': this.dataSourceRaw[i - 1]});
                //localStorage.setItem('taskid', JSON.stringify(this.taskid));
                this.toastr.warning('Report generation started for ID:'+record);
                this.prType.emit('prerequisites');
                this.showRecord(record, i, 'details', 'report')
                setTimeout(()=>{
                    this.setSignalR(record, this.page.id);
                },500)
              }else if(response && response.status){
                this.prType.emit('prerequisites');

                this.showRecord(record, i, 'details', 'report')
                let task =  {'tid': null, 'rid': record, 'mname':this.page.name, 'mid': this.page.id, 'page': this.page, 'status':'running', 'index': i, 'data': this.dataSourceRaw[i - 1]};
                if(this.dataSourceRaw[i - 1] && this.dataSourceRaw[i - 1].JobStatus && this.dataSourceRaw[i - 1].JobStatus === 'Running'){
                  this.taskid.push(task);
                  this.existingRunning = true;
                  setTimeout(()=>{
                    this.setSignalR(record, this.page.id);
                  },500)
                }else{
                  this.procedureJob.emit({'record': task, 'status':'completed'});
                  this.jobProgress.emit({'record': task, 'status': 'completed', 'progress': 100});
                  this.toastr.warning(response.status)
                }
              }
            },
            error: (_error: any)=>{
    
            }
          });
          }
  }

  setSignalR(record: any, id: any){
    const user = JSON.parse(localStorage.getItem('user') || '');
    this.signalR.startConnection("TaskStatus", user._token);
    this.signalR.on("JobStatus", (message, jobId) => {
      let j = jobId.split('|');
      let a = this.taskid.findIndex((e: any)=> e.tid === j[0]);
      if(a > -1){
        if(message === 'JobCompleted'){
          this.jobcomplete = true;
          this.joberror = false;
        
          this.toastr.success('Report generated for '+ this.taskid[a].mname +' ID:'+this.taskid[a].rid);
          this.taskid[a].status = 'completed';
          
          this.procedureJob.emit({'record': this.taskid[a], 'status':'completed'});
          this.jobProgress.emit({'record': this.taskid[a], 'status': 'completed', 'progress': 100});
          //this.store.dispatch(StoreAction.reportList({list: this.taskid[a]}));
          this.taskid.splice(a, 1);
          
        }else if(message){
          this.jobcomplete = false;
          this.joberror = true;
          let a = this.taskid.findIndex((e: any)=> e.tid === jobId);
          if(a > -1){
            this.jobProgress.emit({'record':this.taskid[a], 'status': 'error', 'progress': 100});
            this.procedureJob.emit({'record':this.taskid[a], 'status':'completed'});
            this.toastr.success('Report generated for '+ this.taskid[a].mname +' ID:'+this.taskid[a].rid);
            this.taskid[a].status = 'completed';
            this.taskid.splice(a, 1);
          }else{
            this.jobProgress.emit({'record': jobId, 'status': 'error', 'progress': 100});
            this.procedureJob.emit({'record':jobId, 'status':'completed'});
          }
          this.toastr.error(message)
        }
      }
    });

    this.signalR.on("JobProgress", (message, jobId)=>{
        let j = jobId.split('|');
        if(this.existingRunning){
          let x = this.taskid.findIndex((e: any)=> e.tid === null && e.rid === record && e.mid === id);
          if(x > -1){
            this.taskid[x].tid = j[1] 
          };
          this.existingRunning = false;
        }
        let a = this.taskid.findIndex((e: any)=> e.tid === j[1]);
        if(a > -1){
        if(!this.joberror){
          let a = this.taskid.findIndex((e: any)=> e.tid === j[1]);
          this.procedureJob.emit({'record':this.taskid[a], 'status':'started'});
          this.jobProgress.emit({'record': this.taskid[a], 'status': 'completed', 'progress': 0});
          if(message === 'ProgressUpdate'){
            let n = Number(j[0]);
            
            if(n === 100){
              this.jobProgress.emit({'record': this.taskid[a], 'status': 'completed', 'progress': 100});
              this.procedureJob.emit({'record':this.taskid[a], 'status':'completed'});
              this.toastr.success('Report generated for '+ this.taskid[a].mname +' ID:'+this.taskid[a].rid);
              this.taskid.splice(a, 1);
            }else{
              this.jobProgress.emit({'record': this.taskid[a], 'status': 'inprogress', 'progress': n});
            }
          }
        }else{
          this.jobProgress.emit({'record':this.taskid[a], 'status': 'error', 'progress': 100});
          this.procedureJob.emit({'record':this.taskid[a], 'status':'completed'});
          this.taskid.splice(a, 1);
        }
      }
    })
  }

  subQueryEmitEvt(e: any){
    this.subQuery = e? String(e()): '';
  }
  
}
