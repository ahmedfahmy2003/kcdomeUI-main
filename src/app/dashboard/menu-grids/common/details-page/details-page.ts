import { CommonModule } from "@angular/common";
import { Component, DestroyRef, ElementRef, EventEmitter, inject, input, Input, OnInit, Output, signal } from "@angular/core";
import { InputFields } from "../../../../common/input-fields/input-fields";
import { DateInput } from "../../../../common/date-input/date-input";
import { MenuGridViews } from "../../../../common/menu-grid-views/menu-grid-views";
import { GridTabs } from "../../../../common/grid-tabs/grid-tabs";
import { AppService } from "../../../../services/common/common.service";
import { ToastrService } from 'ngx-toastr';
import { TimeInput } from "../../../../common/time-input/time-input";
import { FormsModule, FormControl, ReactiveFormsModule } from "@angular/forms";
import { SidebarService } from "../../../../services/sidebar/sidebar.service";
import { Store, select } from "@ngrx/store";
import * as StoreAction from "../../../../services/common/store/store.action";
import { DomSanitizer } from "@angular/platform-browser";
import { CallingMenu } from "../calling-menu/calling-menu";
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatExpansionModule} from '@angular/material/expansion';
import { ModalService } from "../../../../services/common/modal.service";
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatFormFieldModule} from '@angular/material/form-field';
import { LoaderService } from "../../../../services/common/loader.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ApiResponse } from "../../../../shared/interface";

export interface userState {
  id: number;
  userName: string;
}

@Component({
    selector: 'details-page',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, MenuGridViews, CallingMenu, GridTabs, InputFields, TimeInput, DateInput, MatExpansionModule, MatMenuModule, MatAutocompleteModule, MatFormFieldModule, MatButtonModule, MatTooltipModule],
    templateUrl: './details-page.html',
    styleUrl: './details-page.scss'
  })

export class DetailsPage implements OnInit{
  //@Input() allRecordData: any;
  @Input() menulabel: any;
  @Input() ids: any;
  newRecord = signal<boolean>(false);
  actionTypeValues: boolean;
  @Input() set _newRecord(value: boolean){
    this.newRecord.set(value);
  }
  get _newRecord(): boolean{
    return this.newRecord();
  }
  mainMenuId = input<any>();
  recordId = signal<any>(0);
  @Input() set _recordId(value: any){
    this.recordId.set(value)
  }
  get _recordId(): any{
    return this.recordId();
  }
  pageType = signal<string>('');
  @Input() set _pageType(value: string){
    this.pageType.set(value);
  }
  get _pageType(): string{
    return this.pageType();
  }
  menuAccess: any;
  @Input() set menuaccess(value: any){
    this.menuAccess = value;
  }
  get menuaccess(): any{
    return this.menuAccess;
  }
  @Input() page: any;
  @Input() subwfstatus: any;
  @Input() subreadonly: boolean;
  @Input() subeditablefielddetails: string;
  @Output() closeNewRecord = new EventEmitter;
  @Output() approveClose = new EventEmitter;
  @Output() wfStatusUpdate = new EventEmitter;
  @Input() prerequisitesType: string;
  @Input() subRecordId: number;
  @Input() plinkedfieldid: any;
  @Input() seqrowcount: number = 0;
  pmenuid = input<number>(0)
  precordid = signal<number>(0);
  @Input() set _precordid(value: any){
    this.precordid.set(value)
  }
  get _precordid(): any{
    return this.precordid();
  }
  companyID = input<number>(0);
  submrEnabledStatus = input<boolean>();
  subwfEnabledStatus = signal<boolean>(false);
  @Input() set _subwfEnabledStatus(value: boolean){
    this.subwfEnabledStatus.set(value);
  }
  get _subwfEnabledStatus(): boolean{
    return this.subwfEnabledStatus();
  }
  subotherUser = signal<boolean>(false);
  @Input() set _subotherUser(value: boolean){
    this.subotherUser.set(value);
  }
  get _subotherUser(): boolean{
    return this.subotherUser();
  }
  public allTabField: any;
  public mainTabTable: any;
  public printBTN = signal<any>([]);
  public actionBTN = signal<any>([]);
  @Input() recordList: any;
  _activeRecords: any;
  @Input() set activeRecords(value: any){
    this._activeRecords = value;
  }
  get activeRecords(): any{
    return this._activeRecords;
  }
  trTab = signal<any>([]);
  trTabGrid = signal<any>([]);
  otherTrTab = signal<any>([]);
  otherTrTabGrid = signal<any>([]);
  menuParsed: any;
  mrData: boolean = false;
  recordData = signal<any>([]);
  originalData: any = '';
  detailsTab = signal<any>([]);
  drillDown = signal<any>([]);
  activeTab = signal<string>('');
  fieldActionBody = signal<any>({});
  maxRow: number = 0;
  maxCol: number = 0;
  readonly = signal<boolean>(true);
  rreadonly = signal<boolean>(false);
  actionBTNDisabled = signal<boolean>(false);
  rs: number = 1;
  fieldType = signal<string>('');
  menuId = signal<number>(0);
  cmenuId = signal<number>(0);
  gridmenuId: number;
  filterKey = signal<string>('');
  fieldQuery = signal<string>('');
  viewid = signal<number>(0);
  subindex: number;
  actionStop = signal<boolean>(false);
  newModelID: any;
  modalMessage: string;
  saveType: string;
  @Output() activeRecordsChange = new EventEmitter;
  @Output() newSubRecordId = new EventEmitter;
  @Output() prerequisiteType = new EventEmitter;
  @Output() wfstatusemit = new EventEmitter;
  @Output() disablerecordemit = new EventEmitter;
  @Output() enableAttachmentEmit = new EventEmitter;
  @Output() enableDimensionEmit = new EventEmitter;
  @Output() enableNoteEmit = new EventEmitter;
  @Output() enableCommentsEmit = new EventEmitter;
  @Output() deletedRecord = new EventEmitter;
  @Output() deletedSubRecord = new EventEmitter;
  @Output() otherReadonly = new EventEmitter;
  @Output() otherUseremit = new EventEmitter;
  @Output() closeComponentDetailEmit = new EventEmitter;
  actionMenuList: any;
  actionresponsemodel: any;
  hideProceed = signal<boolean>(false);
  hideGrid = signal<boolean>(false);
  conpletedMessage: any;
  wfType: string;
  workflowid: unknown;
  workflowcreatedby: unknown;
  workflownote: any;
  private store = inject(Store);
  userlist: any; 
  filtereduserlist: Observable<userState[]>; 
  wfUser = new FormControl('');
  datacompanyid: number;
  @Output() dcid = new EventEmitter;
  wfstatus  = signal<string>('-----');
  allowPass = signal<boolean>(false);
  allowRecall = signal<boolean>(false);
  allowReturn = signal<boolean>(false);
  allowRevoke = signal<boolean>(false);
  allowReverse = signal<boolean>(false);
  allowReject = signal<boolean>(false);
  disabelbtns = signal<boolean>(false);
  associateUser = signal<boolean>(false);
  menuwfid: any;
  stepid: number;
  enableSavebtn = signal<boolean>(false);
  wfEnabledStatus = signal<boolean>(false);
  mrEnabledStatus = signal<boolean>(false);
  editablefielddetails: string = '';
  createError = signal<boolean>(false);
  reportURL = signal<string>('');
  callingMenu = signal<boolean>(false);
  callingMenuData: any;
  callingMenuLinkedQuery: any;
  stringID: any;
  useraccess = signal<any>([]);
  menulist: any;
  menulistsub: any;
  disableWfBtn = signal<boolean>(false);
  trlen: any = [];
  modalErrorMessage: string = '';
  callFieldAction: boolean;
  fieldActionid: number = 0;
  saveModelRecord: boolean;
  savemodalRef: HTMLDivElement;
  actionClickType: string;
  allowDelete = signal<boolean>(true);
  otherUser = signal<boolean>(false);
  targetTable: any;
  exceltype: boolean;
  binaryString: any;
  xlOk: boolean;
  fileName: string;
  upldfile: any;
  actionBtnType: string;
  xlactionid: number;
  deleteXlFile: boolean = false;
  actionbtnname: string;
  recordUpdate: boolean = false;
  recordStamp = new Date().getTime();
  jobProgress = input<any>();
  manualID = signal<any>('');

  @Input() set _associateUser(value: boolean){
    if(value){
      this.associateUser.set(value);
    }
  }

  get _associateUser(): boolean{
    return this.associateUser();
  }

  constructor(private destroyRef: DestroyRef, public modal: ModalService, private _http: AppService, private toastr: ToastrService, private sideBar: SidebarService, public sanitizer: DomSanitizer, private elem: ElementRef, public loader: LoaderService){
    this.menulistsub = this.store.pipe(select('list')).subscribe(data=>{
      this.menulist = data.list;
    });
  }
  
  ngOnInit() { 
    if(this.menulabel){
      this.menuParsed = JSON.parse(this.menulabel);
      this.menuParsed.forEach((x:any)=>{
        x.mrEnabled = null;
        x.FieldVal = null;
        if(x.FieldType === 'LookUp'){
          x.updateList = true;
        }
        if(x.FieldName === "VoucherSeq" || x.FieldName === "Sequence" || x.FieldName === "Seq"){
          x.FieldVal = this.seqrowcount + 1;
        }
        if(x.FieldType !== 'Memo' && x.FieldType !== 'Image'){
          if(x.RowSpan > 1){
            x.RowSpan = 1;
          }
        }else{
          if(x.RowSpan > 1){
            x.RowSpan = 2;
          }
        }
      })
      this.afterinit();
    }
  }

  afterinit(){
    this.hideGrid.set(false);
    this.rreadonly.set(false);
    this.menuId.set(this.mainMenuId());
    this.cmenuId.set(this.menuId());
    this.disabelbtns.set(false);
    if(this.recordId()){
      this.enableSavebtn.set(false);
      if(this.pageType() === 'dimensions'){
        this.getRecordData('init');
      }
      if(this.pageType() !== 'dimensions'){
        this.getMenuRules();
      }else{
        if(this.pageType() !== 'dimensions' && this.menuId()  && this.menuAccess && this.menuAccess.ApplyWorkflow){
          this.getWorkflow();
        }
        else {
          //this.readonly = true;
          this.getDrillDown();
        
          this.afterLoaded('init');
          if(this.subwfstatus === 'Rejected' || this.subwfstatus === 'Approved' || this.subotherUser()){
            this.readonly.set(true);
            this.disabelbtns.set(true);
          }
          else{
            this.readonly.set(false);
            this.disabelbtns.set(false);
          }
        }
      }
    }
    else if(this.newRecord() || !this.menuAccess || !this.menuAccess.ApplyWorkflow){
      this.readonly.set(false);
      this.disabelbtns.set(false);
      this.afterLoaded('init');
    }
    
  }

  getMenuRules(){
    const user = JSON.parse(localStorage.getItem('user') || '');
    const lang = JSON.parse(localStorage.getItem('lang') || '');
    let url = "Sys/GetMenuRulesQueryExecutions";
    let id = this.menuId();
    if(this.page && this.page.pageType === 'prerequisitemenu' && this.page.isJobEnable){
      id = this.page.dtid;
    }
    let param = {
      "menuID": id,
      "pMenuID": this.pmenuid() ? this.pmenuid() : id,
      "userID": user.id,
      "languageID": lang,
      "companyID": this.companyID(),
      "recordID": this.recordId().toString(),
      "pRecordID": this.precordid() ?  this.precordid().toString(): this.recordId().toString(),
      "applicationID": user.applicationID
    }
    
    if(this.subreadonly){
      this.disabelbtns.set(true);
      this.readonly.set(true);
    }

    if(this.mrData){
      this.menuParsed = JSON.parse(this.menulabel);
      this.menuParsed.forEach((x:any)=>{
        x.mrEnabled = null;
      });
    }

    this._http.putClient<any, ApiResponse>(url, param).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response)=>{
        if(response.dataModel && response.dataModel.length > 0){
          this.mrData = true;
          let a = response.dataModel;
          a.forEach((b: any)=>{
            if(b.actionType === 'Disable Record'){
              if(b.actionValue === '1'){
                this.rreadonly.set(true);
                this.disablerecordemit.emit(true)
              }
            }
            else if(b.actionType === 'Disable Field'){
              let index = this.menuParsed.findIndex((e:any)=> e.FieldName === b.fieldName);
              if(b.actionValue === '1'){
                if(index !== -1){
                  //menu rules disabled
                  this.menuParsed[index].mrEnabled = false;
                  this.menuParsed[index].Enabled = false;
                }
              }
              /*else if(b.actionValue === '0'){
                if(index !== -1){
                  //menu rules enabled
                  this.menuParsed[index].mrEnabled = true;
                  this.menuParsed[index].Enabled = true;
                }
              }*/
            }
            else if(b.actionType === 'Enable Field'){
              let index = this.menuParsed.findIndex((e:any)=> e.FieldName === b.fieldName);
              if(b.actionValue === '1'){
                if(index !== -1){
                  //menu rules enabled
                  let ft = this.menuParsed[index].FieldType;
                  if(ft === "Memo" || ft === "CheckBox" || ft === "Number" || ft === 'Editor' || ft === 'LookUp' ||  ft === 'TextBox'){
                    this.rreadonly.set(false);
                  }
                  this.menuParsed[index].mrEnabled = true;
                  this.menuParsed[index].Enabled = true;
                }
              }
              /*else if(b.actionValue === '0'){
                if(index !== -1){
                  //menu rules disabled
                  this.menuParsed[index].mrEnabled = false;
                  this.menuParsed[index].Enabled = false;
                }
              }*/
            }
            else if(b.actionType === 'Enable Attachment'){
              if(b.actionValue === '1'){
                this.enableAttachmentEmit.emit(true)
              }
            }
            else if(b.actionType === 'Enable Dimension'){
              if(b.actionValue === '1'){
                this.enableDimensionEmit.emit(true)
              }
            }
            else if(b.actionType === 'Enable Note'){
              if(b.actionValue === '1'){
                this.enableNoteEmit.emit(true)
              }
            }
            else if(b.actionType === 'Enable Comments'){
              if(b.actionValue === '1'){
                this.enableCommentsEmit.emit(true)
              }
            }
          })
        }
        if(this.menuId() && this.recordId() && this.menuAccess && this.menuAccess.ApplyWorkflow){
          this.getWorkflow();
        }
        if(this.recordId()){
          //this.readonly = true;
          this.getDrillDown();
        }
        
      },
      error: (_error)=>{

      }
    })
  }

  getWorkflowProgress(){
    const user = JSON.parse(localStorage.getItem('user') || '');
    let isassociate = false;
    if(this.page  && this.page.pageType === 'pendingwf'){
      isassociate = true;
    }
    let url = "SysMenu/GetWorkflowProgressdata?menuid=" + this.menuId() +"&recordid="+ this.recordId()+ "&companyid="+this.companyID() +"&userid="+user.id+"&isassociate="+isassociate;
    this._http.getClient<ApiResponse>(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next:(res)=>{
        if(res.dataModel && res.dataModel.length > 0){
          if(this.pageType() === 'submenu' || this.pageType() === 'callingsubmenu'){
            this.allowDelete.set(true);
          }else{
            this.allowDelete.set(false);
          }
          let response: any = res.dataModel[0];
          this.wfstatusemit.emit(response.WorkflowStatus);
          this.wfstatus.set(response.StepDescription ? response.StepDescription : response.WorkflowStatus);
          this.getWfUserQuery();
          this.allowPass.set(response.AllowPass);
          this.allowRecall.set(response.AllowRecall);
          this.allowReject.set(response.AllowReject);
          this.allowReturn.set(response.AllowReturn);
          this.stepid = response.StepID;
          if(this.wfstatus() === 'Created' || this.wfstatus() === 'InProcess'){
            this.allowReject.set(true);
            this.readonly.set(false);
          }
          else if(this.wfstatus() === 'Approved'){
            if(this.workflowcreatedby === user.id && this.menuAccess && this.menuAccess.AllowRevoke){
              this.allowRevoke.set(true);
            }

            if(this.workflowcreatedby === user.id && this.menuAccess && this.menuAccess.AllowReverse){
              this.allowReverse.set(true);
            }
          }
          
            const str = response.Userid;
            const value = user.id.toString();
            const exists = new RegExp(`(^|,\\s*)${value}(,|$)`).test(str);
          
          if(response.Userid){
            if(!exists){
              this.otherUser.set(true);
              if(response.IsAssociate !== 1){
                this.readonly.set(true);
                this.disabelbtns.set(true);
              }
              else{
                this.associateUser.set(true);
                this.getWorkflowSteps();
              }
            }else{
              this.otherUser.set(false);
            }
          }

          this.otherUseremit.emit(this.otherUser())

          if(response.Userid && exists){
            if(response.EditableFields){
              let b = response.EditableFields.split(',');
              if(b.length > 0){
                b.forEach((be:any) => {
                  this.menuParsed.forEach((x:any)=>{
                    if(x.FieldName === be.trim()){
                      //workflow enabled fields
                      x.wfEnabled = true;
                      this.disabelbtns.set(false);
                      this.enableSavebtn.set(true);
                      if(x.FieldType === 'GridTab'){
                        if(response.EditableFieldDetails){
                          let ed = response.EditableFieldDetails.includes(be.trim());
                          if(ed){
                            let j = be.trim()+'[';
                            let result = response.EditableFieldDetails.substring(response.EditableFieldDetails.indexOf( j ) + j.length, response.EditableFieldDetails.indexOf( ']' ) );
                            x.editablefielddetails = result;
                          }
                        }
                      }
                      if(x.FieldType === "BTN" && x.Visible){
                        if(x.ShowInPrint){
                          this.printBTN.update(e => [...e, x]);
                        }else{
                          this.actionBTN.update(e => [...e, x]);
                          this.actionBTNDisabled.set(false);
                        }
                      }
                    }else{
                      if(!x.wfEnabled){
                        x.wfEnabled = false;
                      }
                    }
                  })
                });
                // /this.afterLoaded('init');
              }

            }else{
              this.enableSavebtn.set(false);
            }

          }

          

          if(this.wfstatus() === 'Rejected' || this.wfstatus() === 'Approved'){
            this.readonly.set(true);
            this.disabelbtns.set(true);
          }else{
            if(response.IsAssociate !== 1){
              this.disableWfBtn.set(true);
            }else{
              this.disableWfBtn.set(false);
              this.getWorkflowSteps();
            }
          }

        }else{
          this.disableWfBtn.set(true);
          this.afterLoaded('init');
          this.otherReadonly.emit({readonly: this.readonly(), disable: this.rreadonly})
        }
      }
    })

  }

  getWorkflowSteps(){
    if(this.menuwfid || this.menuwfid === 0){
    const user = JSON.parse(localStorage.getItem('user') || '');
    let url = 'Sys/GetSysMenuWorkflowSteps?pageNumber=1&PageSize=100&FilterCondition=MenuWorkflowID='+this.menuwfid;
    this.loader.show();
    this._http.getClient<ApiResponse>(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response)=>{
        this.loader.hide();
        if(response.dataModel && response.dataModel.length > 0){
          let a = response.dataModel;
          a.forEach((e:any) => {
            if(e.ID === this.stepid){
              this.wfstatus.set(e.Description); 
              if(e.CreatedUser === user.id){
                if(e.EditableFields){
                  let b = e.EditableFields.split(',');
                  if(b.length > 0){
                    b.forEach((be:any) => {
                      this.menuParsed.forEach((x:any)=>{
                        if(x.FieldName === be.trim()){
                           //workflow enabled fields
                          x.wfEnabled = true;
                          this.disabelbtns.set(false);
                          this.enableSavebtn.set(true);
                          if(x.FieldType === 'GridTab'){
                            const str = x.CreatedUser;
                            const value = user.id.toString();
                            const exists = new RegExp(`(^|,\\s*)${value}(,|$)`).test(str);
                            if(x.CreatedUser && (exists)){
                              if(e.EditableFieldDetails){
                                let ed = e.EditableFieldDetails.includes(be.trim());
                                if(ed){
                                  let j = be.trim()+'[';
                                  let result = e.EditableFieldDetails.substring( e.EditableFieldDetails.indexOf( j ) + j.length, e.EditableFieldDetails.indexOf( ']' ) );
                                  x.editablefielddetails = result;
                                }
                              }
                            }
                          }
                          if(x.FieldType === "BTN" && x.Visible){
                            if(x.ShowInPrint){
                              this.printBTN.update(e => [...e, x]);
                            }else{
                              this.actionBTN.update(e => [...e, x]);
                              this.actionBTNDisabled.set(false);
                            }
                          }
                        }else{
                          if(!x.wfEnabled){
                            x.wfEnabled = false;
                          }
                        }
                      })
                    });
                    this.afterLoaded('init');
                  }

                }else{
                  this.enableSavebtn.set(false);
                }

                if(this.wfstatus() === 'Created'){
                  this.allowReject.set(true);
                }
              }
              else{
                this.readonly.set(true);
              }
              
            }
          });
          this.loader.hide()
        }
        
        this.otherReadonly.emit({readonly: this.readonly(), disable: this.rreadonly})
      },
      error: (_error)=>{
        this.loader.hide()
      }
    })
  }
  }

  getWorkflow(){
    if(this.menuId() && this.menuAccess && this.menuAccess.ApplyWorkflow){
      let url = "Sys/GetSysWorkflows?menuid=" + this.mainMenuId() +"&recoredID="+ this.recordId()+ "&pageNumber=1&PageSize=100";
      this._http.getClient<ApiResponse>(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (res) => {
          let response = res;
          if(response.dataModel && response.dataModel.length > 0){
            this.workflowid = response.dataModel[0]['ID'];
            this.workflowcreatedby = response.dataModel[0]['CreatedBy'];
            this.menuwfid = response.dataModel[0]['MenuWorkflowID'];
          }
        },
        error: (_error)=>{

        }
      });
    }
  }

  getuserlist(){
    const user = JSON.parse(localStorage.getItem('user') || '');
    const lang = JSON.parse(localStorage.getItem('lang') || '');
    let url = "Sys/GetSwapUsers";
    let params = {
      "menuID": this.menuId(),
      "userID": user.id,
      "languageID": lang,
      "companyID": this.companyID(),
      "recordID": this.recordId(),
      "applicationID": user.applicationID,
    }
    this._http.putClient<any, ApiResponse>(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        if(response.dataModel && response.dataModel.length > 0){
          this.userlist = response.dataModel;
           this.filtereduserlist = this.wfUser.valueChanges.pipe(
            startWith(''),
            map((state:any) => (state ? this._filterUsers(state) : this.userlist.slice())),
          );
        }
      },
      error: (_error)=>{

      }
    })
  }

  _filterUsers(value: string): userState[] {
    if(value){
      const filterValue = value.toLowerCase();
      return this.userlist.filter((u:any) => u.userName.toLowerCase().includes(filterValue) || u.id.toString().includes(filterValue));
    }

    return this.userlist;
  }

  getWfUserQuery(){
    const user = JSON.parse(localStorage.getItem('user') || '');
    const lang = JSON.parse(localStorage.getItem('lang') || '');
    let url = "SysFields/SysWorkFlowUserQuery";
    let params = {
      "menuID": this.mainMenuId(),
      //"pMenuID": this.recordList.parentPageID,
      "pMenuID": this.pmenuid() ? this.pmenuid() : this.menuId(),
      "userID": user.id,
      "languageID": lang,
      "companyID": this.companyID(),
      "recordID": this.recordId(),
      "pRecordID": this.precordid(),
      "applicationID": user.applicationID,
    }
    
    this._http.putClient<any, ApiResponse>(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response)=>{
        if(response.dataModel){
          let a: any = response.dataModel;
            const str = a.reverseUserQuery;
            const str2 = a.revokeUserId;
            const str3 = a.swapUserQuery;
            const value = user.id.toString();
            const exists = new RegExp(`(^|,\\s*)${value}(,|$)`).test(str);
            const exists2 = new RegExp(`(^|,\\s*)${value}(,|$)`).test(str2);
            const exists3 = new RegExp(`(^|,\\s*)${value}(,|$)`).test(str3);
          if(a.reverseUserQuery){
            if(exists){
              this.allowReverse.set(true);
            }
          }
          if(a.revokeUserId){
            if(this.wfstatus() === 'Approved' && exists2){
              this.allowRevoke.set(true);
            }
          }
          if(a.swapUserQuery){
            if(exists3){
              this.allowPass.set(true);
            }
          }
        }
      },
      error: (_error)=>{

      }
    })
  }

  afterLoaded(type: any){
 
    this.trTab.set([]);
    if(!this.recordUpdate){
      this.otherTrTab.set([]);
      this.trTabGrid.set([]);
      this.otherTrTabGrid.set([]);
    }
    if(this.menulabel && !this.stepid){
      if(!this.menuParsed){
        this.menuParsed = JSON.parse(this.menulabel);
      }

      if(this.subeditablefielddetails){
        
        this.subeditablefielddetails.replaceAll('[','');
            this.menuParsed.forEach((x:any)=>{
              const word = x.FieldName;
              const regex = new RegExp(`\\b${word}\\b`, "g");

              const matches = this.subeditablefielddetails.match(regex);
              if(matches){
                 //workflow enabled fields
                x.wfEnabled = true;
                this.disabelbtns.set(false);
                this.enableSavebtn.set(true);
              }else{
                if(!x.wfEnabled){
                  x.wfEnabled = false;
                }
              }
            })
      
      }


      this.maxRow = Math.max.apply(null,
        this.menuParsed.map((o:any)=>{ 
         return o.RowLocation; 
      }));
      let m = this.menuParsed.filter((x: any)=>{return x.Visible})
      this.maxCol = Math.max.apply(null,
        m.map((o:any)=>{ 
          return o.ColLocation; 
      }));
    }
    
    
      this.actionBTN.set([]);
      this.printBTN.set([]);
      this.menuParsed.forEach((x:any)=>{
        if(x.FieldType === "BTN" && x.Visible){
          if(x.ShowInPrint){
            this.printBTN.update(e => [...e, x]);
          }else{
            this.actionBTN.update(e => [...e, x]);
            if(!x.Enabled){
              this.actionBTNDisabled.set(true);
            }
          }
        }
      })
    
    if(this.menulabel){
      if(type !==  'refresh'){
        const key = 'ContainerName';
        let allTab = [...new Map(this.menuParsed.map((item:any) => [item[key], item])).values()];
        this.detailsTab.set(allTab.filter((x: any)=> {return x.ContainerName && x.ContainerName !== 'MainTabPage'}));
      
        this.detailsTab().forEach((x:any)=>{
          this.menuParsed.forEach((y:any)=>{
            if(x.ContainerName === y.FieldName){
              x.Caption = y.FieldCaption;
              x.Seq = y.Seq;
            }
          })
        })

        this.detailsTab().sort((a:any, b:any) => a.Seq - b.Seq);  
        this.mainTabTable = this.menuParsed.filter((x:any)=> {return x.RowLocation && x.FieldType && x.ContainerName === 'MainTabPage'});
        if(!this.allTabField){
          this.allTabField = this.menuParsed.filter((x:any)=> {return x.RowLocation && x.FieldType && x.FieldType !== "TabPage" && x.FieldType !== "GridTab" && x.FieldType !== "GridView" && x.FieldType !== 'BTN' && x.FieldType !== 'ExtText'});
          this.allTabField.forEach((x: any)=>{
            let a = x.FieldName;
            if(a && x.FieldType !== "Separator"){
              if(!this.recordId()){
                this.fieldActionBody.update(body => ({...body, [a]: x.FieldVal ?? null}));
              }else{
                this.fieldActionBody.update(body => ({...body, [a]: x.FieldVal}));
              }
            }
          })
        }
      }
          if(this.plinkedfieldid){
      let a = this.plinkedfieldid.split('=');
      if(a[1] && a[1]!== 'null' && !this.fieldActionBody()[a[0]]){
        let v = a[1]
        if(typeof a[1] === 'string'){
          v = v.replaceAll("'",'')
        }
        this.fieldActionBody.update(body => ({...body, [a[0]]: v }));
        this.filterKey.set(this.plinkedfieldid);
      }
      else{
        if(this.fieldActionBody()[a[0]]){
          this.filterKey.set(a[0]+'='+this.fieldActionBody()[a[0]]);
        }
      }
    }
      
          if(!this.recordId() && this.menuId()){
            const user = JSON.parse(localStorage.getItem('user') || '');
            const lang = JSON.parse(localStorage.getItem('lang') || '');
       
            let url = "SystemFields/GetDataFieldsDefaultQuery";
            this.fieldActionBody.update(body => ({...body, CompanyID:  this.companyID() }));
            let params = {
              "menuID": this.menuId(),
              //"pMenuID": this.recordList.parentPageID,
              "pMenuID": this.pmenuid() ? this.pmenuid() : this.menuId(),
              "userID": user.id,
              "languageID": lang,
              "companyID": this.companyID(),
              "pRecordID": this.precordid() ? this.precordid().toString() : null,
              "applicationID": user.applicationID,
              "queryfields": this.fieldActionBody()
            }
            this._http.putClient<any, ApiResponse>(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
              next: (response) => { 
                if(response.dataModel && response.dataModel.length > 0){
                  let res = response.dataModel;
                  let keys:any = [];
                  res.forEach((r:any)=>{
                    keys.push({field: r.fieldName, value: r.fielValue});
                  })
                  this.allTabField.forEach((x: any)=>{
                    let a = x.FieldName;
                    let i = keys.findIndex( (e:any)=> e.field === a);
                    if(i > -1 && keys[i].value && x.FieldType !== 'Separator'){
                      this.fieldActionBody.update(body => ({...body, [a]: keys[i].value }));
                      x.FieldVal = keys[i].value;
                      if(x.FieldType === 'LookUp' || x.FieldType === 'Editor'){
                        x.descEn = keys[i].value;
                      }
                      if(x.FieldType === 'CheckBox'){
                        if(keys[i].value === '1' || (keys[i].value && keys[i].value.toLowerCase() === 'true')){
                          x.FieldVal = true;
                          this.fieldActionBody.update(body => ({...body, [a]: true }));
                        }else{
                          x.FieldVal = false;
                          this.fieldActionBody.update(body => ({...body, [a]: false }));
                        }
                      }else if(x.FieldType === 'Number'){
                        if(keys[i].value === 0){
                          this.fieldActionBody.update(body => ({...body, [a]: 0 }));
                        }
                      }
                      else if(x.FieldType === 'DateTime'){
                        let dateString = x.FieldVal;
                        let date = new Date(dateString);
                        x.FieldVal = date.toISOString().split('.')[0];
                      }
                    }

                    if(!x.FieldVal && x.FieldType !== 'Separator'){
                      if(x.FieldName === 'CreatedUser'){
                        const user = JSON.parse(localStorage.getItem('user') || '');
                        this.fieldActionBody.update(body => ({...body, [a]: user.id }));
                        x.FieldVal = user.id;
                      }
                    }
                  })
                }else{
                  this.allTabField.forEach((x: any)=>{
                    let a = x.FieldName ? x.FieldName : x.LabelId;
                    if(x.FieldName === 'CreatedUser' && x.FieldType !== 'Separator'){
                      const user = JSON.parse(localStorage.getItem('user') || '');
                      this.fieldActionBody.update(body => ({...body, [a]: user.id }));
                      x.FieldVal = user.id;
                    }
                  })
                }
                
                this.getSysFieldsValue();
                //this.createTrTab();
              },
              error: (_e)=>{
              }
            })
          }else if(this.recordId() && this.menuId()){
            const user = JSON.parse(localStorage.getItem('user') || '');
            const lang = JSON.parse(localStorage.getItem('lang') || '');
       
            let url = "SystemFields/GetDataFieldsExpressionDefaultQuery";
            this.fieldActionBody.update(body => ({...body, CompanyID:  this.companyID() }));
            let params = {
              "menuID": this.menuId(),
              "pMenuID": this.pmenuid() ? this.pmenuid() : this.menuId(),
              "userID": user.id,
              "languageID": lang,
              "companyID": this.companyID(),
              "pRecordID": this.precordid() ? this.precordid().toString() : null,
              "applicationID": user.applicationID,
              "queryfields": this.fieldActionBody()
            }
            this._http.putClient<any, ApiResponse>(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
               next: (response) => { 
                if(response.dataModel && response.dataModel.length > 0){
                  let res = response.dataModel;
                  let keys:any = [];
                  res.forEach((r:any)=>{
                    keys.push({field: r.fieldName, value: r.fielValue});
                  })
                  this.allTabField.forEach((x: any)=>{
                    let a = x.FieldName;
                    let i = keys.findIndex( (e:any)=> e.field === a);
                    if(i > -1 && keys[i].value && x.FieldType === 'Expression'){
                      this.fieldActionBody.update(body => ({...body, [a]: keys[i].value }));
                      x.FieldVal = keys[i].value;
                      x.descEn = keys[i].value;
                    }
                  })
                }
               }
            })
            this.getSysFieldsValue();
          }else{
            this.getSysFieldsValue();
          }

    }
    if(type !==  'refresh'){
      if(!this.recordUpdate){
        this.activeTab.set('Main');
      }
    }
    //console.log(this.trTab)
  }

  getSysFieldsValue(){
    
            const lang = JSON.parse(localStorage.getItem('lang') || '');
            
            let id = this.menuId();
            if(this.page && this.page.pageType === 'prerequisitemenu' && this.page.isJobEnable){
                id = this.page.dtid;
            }

            let url = "Sys/GetSysFieldsTypeValue?menuId="+id+"&languageid="+lang;
            this.fieldActionBody.update(body => ({...body, CompanyID:  this.companyID() }));

            this._http.putClient<any, ApiResponse>(url, this.fieldActionBody()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
              next: (response) => { 
                if(response.dataModel && response.dataModel.length > 0){
                  let res: any = response.dataModel;
                  this.allTabField.forEach((x: any)=>{
                    let i = res.findIndex((e:any)=> e.fieldId === x.Id);
                    if(i > -1){
                      let a  = res[i].data ? res[i].data[0] : '';
                      if(a){
                        let b = Object.values(a);
                        x.descEn = b[0];
                        x.updateList = true;
                      }else{
                        let b = res[i].multicheckvalue ? res[i].multicheckvalue : '';
                        if(b && b.length > 0){
                          let d = '';
                          b.forEach((x: any)=>{
                            if(x.dataModel[0] && x.dataModel[0].DescriptionEn){
                            if(d){
                              d = d+', '+x.dataModel[0].DescriptionEn;
                            }else{
                              d = x.dataModel[0].DescriptionEn;
                            }
                            }
                          })
                          x.descEn = d;
                          x.updateList = true;
                        }
                      }
                    }
                  })
                
                }else{
                   this.allTabField.forEach((x: any)=>{
                    x.descEn = null;
                    if(this.recordId()){
                      x.updateList = false;
                    }
                   })
                
                }
                this.createTrTab();
              },
              error: (_e)=>{

              }
            })

  }

  createTrTab(){
    this.trTabGrid.set([]);
    this.trTab.set([]);
    this.activeTab.set('Main')
    /*if(this.plinkedfieldid){
      let a = this.plinkedfieldid.split('=');
      if(a[1] && a[1]!== 'null' && !this.fieldActionBody()[a[0]]){
        let v = a[1]
        if(typeof a[1] === 'string'){
          v = v.replaceAll("'",'')
        }
        this.fieldActionBody.update(body => ({...body, [a[0]]: v }));
        this.filterKey.set(this.plinkedfieldid);
      }else{
        if(this.fieldActionBody()[a[0]]){
          this.filterKey.set(a[0]+'='+this.fieldActionBody()[a[0]]);
        }
      }
    }*/
    if(this.pageType() !== 'dimensions'){
      this.fieldActionBody.update(body => ({...body, ID: this.recordId() ?? 0 }));
    }else{
      this.fieldActionBody.update(body => ({...body, ID: this.subRecordId ?? 0 }));
    }
        
    for(let i = 0; i < this.maxRow; i++){
      this.trTab.update(e=>[...e,{'col': []}]);
    }

    this.mainTabTable.forEach((x:any)=>{
      if(x.FieldType !== 'BTN' && x.FieldType !== 'ExtText' && x.FieldType !== 'GridTab' && x.Visible){
        let a = x.RowLocation;
        x.skipCol = 'false';
        x.hideCol = 'false';
        this.trTab()[a - 1].col.push(x); 
      }
    
      if(x.FieldType === 'GridTab'){
        this.trTabGrid.update(e => [...e, x]);
        if(x.LinkedField.toLowerCase() === 'id'){
          if(typeof this.recordId() === 'string'){
            this.filterKey.set(x.LinkedCalledMenuField+"='"+this.recordId()+"'");
          }else{
            this.filterKey.set(x.LinkedCalledMenuField+"="+this.recordId());
          }
        }else{
          let i = this.menuParsed.findIndex((a:any)=> a.FieldName === a.LinkedField);
          if(i >= 0){
            this.filterKey.set(x.LinkedCalledMenuField+"="+this.menuParsed[i].FieldVal);
          }
        }
      }
    })

    this.trTab.update(tab => {
      tab.forEach((x:any)=>{
        let myArray = x.col;
        myArray.sort((a:any, b:any) => a.ColLocation - b.ColLocation);   
      })

      return tab;
    })
    
    this.trTab.update(tab =>{
      tab.forEach((x:any, j:number)=>{
        x.col.forEach((y:any, i: number)=>{
          if(i !== 0){
            if((i+1) !== x.col[i].ColLocation){
              if(x.col[i].ColLocation !== ((x.col[i-1].ColumnSpan ? x.col[i-1].ColumnSpan : 1) + x.col[i-1].ColLocation)){
                let c = (x.col[i].ColLocation) - ((x.col[i-1].ColumnSpan ? x.col[i-1].ColumnSpan : 1) + x.col[i-1].ColLocation);
                for(let j = 0; j < c; j++){
                  x.col = x.col.toSpliced((j+1),0,{ColLocation: (j+1), RowLocation: (j+1), RowSpan:1, ColumnSpan: 1, hideCol: 'false'})
                }
              }
            }
          }else{
          if(j !==0 && x.col[i].ColLocation !== 1 && this.trTab()[j-1].col.length > 0){
              this.rs = this.trTab()[j-1].col[0].RowSpan || this.rs; 
              if(this.rs > 1){
                for(let a = 0; a < (this.rs-1); a++){
                  if(this.trTab()[j+a].col[0]){
                    this.trTab()[j+a].col[0].skipCol = 'true';
                  }
                }
              }  
                          
              if(this.rs <= 1){
                let c = (x.col[i].ColLocation) - this.trTab()[j-1].col[0].ColLocation;
                if(this.trTab()[j-1].col[0]?.ColLocation > 2 && x.col[i].skipCol === 'true'){
                              
                }
                else{
                  if(!c){
                    c = this.trTab()[j-1].col[0]?.ColLocation - 1;
                  }
                }
                                
                for(let m = 0; m < c; m++){
                  x.col = [{ColLocation: (m+1), RowLocation: (j+1), RowSpan:1, ColumnSpan: 1, hideCol: 'false'}, ...x.col];
                  x.col.sort((a:any, b:any) => a.ColLocation - b.ColLocation);   
                }
              }        
            }
            else{
              if(x.col[i].ColLocation !== 1){
                let c = x.col[i].ColLocation - 1;
                for(let m = 0; m < c; m++){
                  x.col = [{ColLocation: (m+1), RowLocation: (j+1), RowSpan:1, ColumnSpan: 1, hideCol: 'false'}, ...x.col];
                  x.col.sort((a:any, b:any) => a.ColLocation - b.ColLocation);   
                }
              }
            }
          }
        })
      })
      return tab;
    });

    this.trlen = [];
    let l = 0;
    
    this.trTab.update(tab=>{
      tab.forEach((x:any, j:number)=>{
        x.col.forEach((y:any, i: number)=>{
          if(i !== 0){
            if(x.col[i].RowSpan > 1){
              let a = x.col[i].RowSpan;
              for(let m = 1; m < a; m++){
              if(this.trTab()[j+m] &&  this.trTab()[j+m].col[i] && !this.trTab()[j+m].col[i].FieldType){
                this.trTab()[j+m].col[i].hideCol = 'true';
              }
              }
            }
          }
          if(l < i){
            l = i;
          }
        });
      })
      return tab;
    });

    for(let i = 0; i < (l+1); i++){
      this.trlen.push({'col': i});
    }
    this.elem.nativeElement.style.setProperty('--tdcol', this.maxCol);
                
    this.otherReadonly.emit({readonly: this.readonly(), disable: this.rreadonly});
    this.loader.hide()
  }

  openTab(tab: any, index: number){
    let otherTable: any;
    this.otherTrTabGrid.set([]);
    this.filterKey.set('');
    setTimeout(()=>{
    if(tab === 'Main'){
      this.menuId.set(this.mainMenuId());
      this.activeTab.set(tab);
    }else{

      let u =  this.menulist.filter((x:any)=> x.ID === this.menuId());
      this.useraccess.set(u[0]);

      if(this.recordId() || this.pageType() !== 'mainmenu' || !this.useraccess().AutoSaveOnTabChange){
        otherTable = this.menuParsed.filter((x:any)=> {return x.RowLocation && x.FieldType && x.FieldType !== "TabPage" && x.FieldType !== "GridTab" && x.FieldType !== "GridView" && x.ContainerName === tab.ContainerName});
        this.otherTrTabGrid.set(this.menuParsed.filter((x:any)=> {return x.FieldType && (x.FieldType === "TabPage" || x.FieldType === "GridTab" || x.FieldType === "GridView") && x.ContainerName === tab.ContainerName}));
        this.activeTab.set(tab.ContainerName);
        this.wfEnabledStatus.set(this.otherTrTabGrid()[0] ? this.otherTrTabGrid()[0].wfEnabled : tab.wfEnabled);
        this.mrEnabledStatus.set(this.otherTrTabGrid()[0] ? this.otherTrTabGrid()[0].mrEnabled : tab.mrEnabled);
        this.editablefielddetails = this.otherTrTabGrid()[0] ? this.otherTrTabGrid()[0].editablefielddetails : tab.editablefielddetails;
      }else{
        let error = 0;
        this.createError.set(false);
        let k = Object.keys(this.fieldActionBody());
        this.allTabField.forEach((x:any)=>{
          if(k.includes(x.FieldName)){
            x.FieldVal = this.fieldActionBody()[x.FieldName];
          }
          
          if(x.Mandatory && !x.FieldVal && x.FieldVal !== 0 && error === 0){   
            this.modalMessage = "Enter value for "+x.FieldCaption; 
            this.createError.set(true);
            this.modal.show('myModal'+this.recordStamp);      
            
            error++;
          }
        })

        if(error === 0){
          
          this.createModel('save');
          otherTable = this.menuParsed.filter((x:any)=> {return x.RowLocation && x.FieldType && x.FieldType !== "TabPage" && x.FieldType !== "GridTab" && x.FieldType !== "GridView" && x.ContainerName === tab.ContainerName});
          this.otherTrTabGrid.set(this.menuParsed.filter((x:any)=> {return x.FieldType && (x.FieldType === "TabPage" || x.FieldType === "GridTab" || x.FieldType === "GridView") && x.ContainerName === tab.ContainerName}));
          if(this.otherTrTabGrid()[0].LinkedMenuId){
            this.gridmenuId = this.otherTrTabGrid()[0].LinkedMenuId;
          }
          this.activeTab.set(tab.ContainerName);
          this.wfEnabledStatus.set(this.otherTrTabGrid()[0] ? this.otherTrTabGrid()[0].wfEnabled : tab.wfEnabled);
          this.mrEnabledStatus.set(this.otherTrTabGrid()[0] ? this.otherTrTabGrid()[0].mrEnabled : tab.mrEnabled);
          this.editablefielddetails = this.otherTrTabGrid()[0] ? this.otherTrTabGrid()[0].editablefielddetails : tab.editablefielddetails;
        }
      }
    }
    if(tab === 'Main'){
      this.getDrillDown();
    }
    this.otherTrTab.set([]);
    this.fieldType.set('');
    
    this.subindex = index;
    if(tab !== 'Main' && this.otherTrTabGrid().length > 0){

      this.otherTrTabGrid().forEach((x:any)=>{
        this.menuId.set(x.LinkedMenuId);
        this.gridmenuId = x.LinkedMenuId;
        if(x.FieldType === 'GridTab' || x.FieldType === 'TabPage'){
          
          this.filterKey.set(x.LinkedCalledMenuField);
          this.fieldQuery.set(x.FilterQuery);
          if(x.LinkedField && x.LinkedField.toLowerCase() === 'id'){
            if(typeof this.recordId() === 'string'){
              this.filterKey.set(x.LinkedCalledMenuField+"='"+this.recordId()+"'");
            }else{
              this.filterKey.set(x.LinkedCalledMenuField+"="+this.recordId());
            }
          }else{
            let i = this.menuParsed.findIndex((a:any)=> a.FieldName === x.LinkedField);
            if(i !== -1){
              this.filterKey.set(x.LinkedCalledMenuField+"="+this.menuParsed[i].FieldVal);
            }
          }
        }
        else if(x.FieldType === 'GridView'){
          this.filterKey.set(x.LinkedQuery);
          this.viewid.set(x.Id);
        }
        setTimeout(()=>{
          this.fieldType.set(x.FieldType);
        }, 100)
      })

    }

    if(otherTable && otherTable.length > 0){
      for(let i = 0; i < this.maxRow; i++){
        this.otherTrTab.update(e=>[...e, {'col': []}]);
      }
      otherTable.forEach((x:any)=>{
        if(x.FieldType !== 'BTN' && x.FieldType !== 'ExtText' && x.Visible && x.FieldType !== 'Separator'){
          
            x.FieldVal = this.fieldActionBody()[x.FieldName] ?? null; 
          
          let a = x.RowLocation;
          x.skipCol = 'false';
          x.hideCol = 'false';
          this.otherTrTab()[a - 1].col.push(x); 
        }
      });
      //this.otherTrTab = this.otherTrTab.filter((e:any)=> { return e.col.length > 0 } )
      this.otherTrTab.update(tab=>{
        tab.forEach((x:any)=>{
          let myArray = x.col;
          myArray.sort((a:any, b:any) => a.ColLocation - b.ColLocation);   
        })
        return tab;
      })

    this.otherTrTab.update(tab =>{
      tab.forEach((x:any, j:number)=>{
        x.col.forEach((y:any, i: number)=>{
          if(i !== 0){
            if((i+1) !== x.col[i].ColLocation){
              if(x.col[i].ColLocation !== ((x.col[i-1].ColumnSpan ? x.col[i-1].ColumnSpan : 1) + x.col[i-1].ColLocation)){
                let c = (x.col[i].ColLocation) - ((x.col[i-1].ColumnSpan ? x.col[i-1].ColumnSpan : 1) + x.col[i-1].ColLocation);
                for(let j = 0; j < c; j++){
                  x.col = x.col.toSpliced((j+1),0,{ColLocation: (j+1), RowLocation: (j+1), RowSpan:1, ColumnSpan: 1, hideCol: 'false'})
                }
              }
            }
          }else{
          if(j !==0 && x.col[i].ColLocation !== 1 && this.otherTrTab()[j-1].col.length > 0){
              this.rs = this.otherTrTab()[j-1].col[0].RowSpan || this.rs; 
              if(this.rs > 1){
                for(let a = 0; a < (this.rs-1); a++){
                  if(this.otherTrTab()[j+a].col[0]){
                    this.otherTrTab()[j+a].col[0].skipCol = 'true';
                  }
                }
              }  
                          
              if(this.rs <= 1){
                let c = (x.col[i].ColLocation) - this.otherTrTab()[j-1].col[0].ColLocation;
                if(this.otherTrTab()[j-1].col[0]?.ColLocation > 2 && x.col[i].skipCol === 'true'){
                              
                }
                else{
                  if(!c){
                    c = this.otherTrTab()[j-1].col[0]?.ColLocation - 1;
                  }
                }
                                
                for(let m = 0; m < c; m++){
                  x.col = [{ColLocation: (m+1), RowLocation: (j+1), RowSpan:1, ColumnSpan: 1, hideCol: 'false'}, ...x.col];
                  x.col.sort((a:any, b:any) => a.ColLocation - b.ColLocation);   
                }
              }        
            }
            else{
              if(x.col[i].ColLocation !== 1){
                let c = x.col[i].ColLocation - 1;
                for(let m = 0; m < c; m++){
                  x.col = [{ColLocation: (m+1), RowLocation: (j+1), RowSpan:1, ColumnSpan: 1, hideCol: 'false'}, ...x.col];
                  x.col.sort((a:any, b:any) => a.ColLocation - b.ColLocation);   
                }
              }
            }
          }
        })
      })
      return tab;
    });

      this.otherTrTab.update(tab=>{
        tab.forEach((x:any, j:number)=>{
          x.col.forEach((y:any, i: number)=>{
            if(i !== 0){
              if(x.col[i].RowSpan > 1){
                let a = x.col[i].RowSpan;
                for(let m = 1; m < a; m++){
                  if(this.otherTrTab()[j+m] && this.otherTrTab()[j+m].col[i] && !this.otherTrTab()[j+m].col[i].FieldType){
                    this.otherTrTab()[j+m].col[i].hideCol = 'true';
                  }
                }
              }
            }
          });
        })
        return tab;
      });
    }
    },100)
  }
  setUpdate(e: any, fieldName: string){
      this.trTab.update(tab => {
      tab.forEach((x: any) => {
        x.col.forEach((y: any) => {
          if(y.FieldName === fieldName && y.FieldType === 'LookUp'){
            y.updateList = e.value;
          }
        })
      })
      return tab;   // IMPORTANT: must return updated array
    });
  }
  getmainval(e: any, fieldName: string)
  {
    this.fieldActionBody.update(body => ({...body, [fieldName]: e ? e.value : null }));
    this.trTab.update(tab => {
      tab.forEach((x: any) => {
        x.col.forEach((y: any) => {
          if(y.FieldName === fieldName){
            if(!e || !e.value){
              y.descEn = '';
              y.FieldVal = null;
            }
            if(e && e.descEn){
              y.descEn = e.descEn;
            }
            if(e && e.value){
              y.FieldVal = e.value;
            }
          }
        })
      })
      return tab;   // IMPORTANT: must return updated array
    });
  }

  resetAll(){
    this.allTabField.forEach((x: any)=>{
      if(x.FieldName === "VoucherSeq" || x.FieldName === "Sequence" || x.FieldName === "Seq"){
        x.FieldVal = this.seqrowcount + 1;
      }
      else if(!x.DefaultValue && x.FieldType !== 'DateTime'){
        x.FieldVal = null;
        this.getmainval(null, x.FieldName);
      }
    })
  }
  
  getDrillDown(){
    let id = 0;
    if(this.pageType() === 'dimensions'){
      id = 7023;
    }
    else if(this.page && this.page.pageType === 'prerequisitemenu' && this.page.isJobEnable){
      id = this.page.dtid;
    }
    else{
      id = this.mainMenuId();
    }
    const url = 'Sys/GetSysMenuDrillDown?TableName=Sys_MenuDrillDown&FilterCondition=MenuId=' + id;
    this.loader.show()
    this._http.getClient<ApiResponse>(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.loader.hide()
        if(response.dataModel && response.dataModel.length > 0) {
          let d = response.dataModel;
          this.drillDown.set(d.filter((x:any)=> x.Active === true))
        }
        if(this.recordId()){
          this.getRecordData('init');
        }
      },
      error: (_errMsg) => {
        this.loader.hide()
      }
    });
  }

  getRecordData(type: string){
    const user = JSON.parse(localStorage.getItem('user') || '');
    const lang = JSON.parse(localStorage.getItem('lang') || '');
    let url;

    let u =  this.menulist.filter((x:any)=> x.ID === this.menuId());
    this.useraccess.set(u[0]);
    if(this.pageType() === 'dimensions'){
      url = 'Dimensions/GetDimensionsData?MenuId=' + this.menuId() + '&RecordID=' + this.recordId()+ "&FilterCondition=ID="+this.subRecordId;
      this._http.getClient<ApiResponse>(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (response) => {
          this.updateResponse(response, type, user);
        },
        error: (_error) => {
          this.loader.hide()
        }
      });
    }else{
      url = 'SystemFields/GetMenuData?IsFilterConditionApply=false&JoinOuterCondition=false&isallFields=true';
      let m = this.menuId();
      if(this.page && this.page.pageType === 'prerequisitemenu' && this.page.isJobEnable){
        m = this.page.dtid;
      }
      let params = {
        "menuID": m,
        "userID": user.id,
        "languageID": lang,
        "companyID": this.companyID(),
        "applicationID": user.applicationID,
        "queryfields": "",
        "pageNumber": 1,
        "pageSize": 10,
        "filterCondition": 'ID='+this.recordId()
      }
      if(typeof this.recordId() === 'string'){
        params['filterCondition'] = "ID='"+this.recordId()+"'"
      }
      this._http.putClient<any, ApiResponse>(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (response) => {
          this.updateResponse(response, type, user);
        },
        error: (_error) => {
          this.loader.hide()
        }
      });
    }
  }  
  
  updateResponse(response: any, type: string, user: any){
    this.loader.hide()
    if (response.dataModel && response.dataModel.length > 0) {
      this.recordData.set(response.dataModel[0]);
      let re = response.dataModel[0];
      this.originalData = JSON.stringify(response.dataModel[0]);
      this.fieldActionBody.set(this.recordData());
      this.datacompanyid = this.recordData().CompanyID;
      if(this.recordData().CompanyID){
        this.dcid.emit(this.recordData().CompanyID);
      }
      let dataKeys = Object.keys(re);
      this.otherUser.set(true);

     if(this.pageType() !== 'mainmenu' && this.pageType() !== 'prerequisitemenu' && this.pageType() !== 'detailsBtnGrid'){
      if(this.subwfstatus === 'Rejected'){
        this.readonly.set(true);
        this.disabelbtns.set(true);
      }
      else if(this.subwfstatus === 'noworkflow'){
        this.readonly.set(false);
        this.disabelbtns.set(false);
      }
      else if(this.subwfstatus === 'Created' || this.subwfstatus === 'InProcess'){
        if(this.pageType() === 'submenu' && !this.subotherUser()){
          this.readonly.set(false);;
        }
      }
      else{
        this.readonly.set(true);;
      }

      if(!this.subotherUser() && (this.subwfstatus === 'Created' || this.subwfstatus === 'InProcess') && (!this.menuAccess || !this.menuAccess.ApplyWorkflow)){
        this.disabelbtns.set(false);
        this.readonly.set(false);;
      }
      }

      if(this.pageType() === 'dimensions'){
        if(this.subreadonly){
          this.disabelbtns.set(true);
          this.readonly.set(true);
        }
      }
          
      if(this.pageType() === 'mainmenu' || this.pageType() === 'detailsBtnGrid'){
        if(this.menuAccess && this.menuAccess.ApplyWorkflow){
          this.getWorkflowProgress();
        }
        else if(!this.menuAccess || !this.menuAccess.ApplyWorkflow){
          this.readonly.set(false);
          this.disabelbtns.set(false);
          this.wfstatus.set('noworkflow');
        }
      }
      if(this.pageType() === 'prerequisitemenu' && this.menuAccess && this.menuAccess.EditFlag){
        this.readonly.set(false);
        this.disabelbtns.set(false);
      }

      //submenu wf-enabled
      if(this.subwfEnabledStatus() || this.associateUser()){
        if(!this.subeditablefielddetails){
          this.disabelbtns.set(false);
          this.readonly.set(false);
        }
      }

      if(this.submrEnabledStatus()){
        this.disabelbtns.set(false);
        this.readonly.set(false);
      }
      
      if(type !==  'refresh'){
        this.menuParsed.forEach((x: any) => {
          let b = dataKeys.includes(x.FieldName);
          if (b) {
            let c = this.recordData()[x.FieldName];
            x.wfEnabled = false;
            x.editablefielddetails = '';
            if (typeof c !== 'object') {
              x.FieldVal = c;
            } else {
              x.FieldVal = null;
            }
          }
        });
        this.allTabField = this.menuParsed.filter((x:any)=> {return x.RowLocation && x.FieldType && x.FieldType !== "TabPage" && x.FieldType !== "GridTab" && x.FieldType !== "GridView" && x.FieldType !== 'BTN' && x.FieldType !== 'ExtText'});
      }
        this.allTabField.forEach((x:any)=>{
          if(x.FieldType !== 'Separator'){
            let a = x.FieldName;
            this.fieldActionBody.update(body => ({...body, [a]: x.FieldVal}));
          }
        })

        if(this.recordUpdate){
          this.otherTrTabGrid().forEach((x:any)=>{
            if(x.FieldType === 'GridTab' || x.FieldType === 'TabPage'){
              this.filterKey.set('');
              setTimeout(()=>{
                if(x.LinkedField.toLowerCase() === 'id'){
                  if(typeof this.recordId() === 'string'){
                    this.filterKey.set(x.LinkedCalledMenuField+"='"+this.recordId()+"'");
                  }else{
                    this.filterKey.set(x.LinkedCalledMenuField+"="+this.recordId());
                  }
                }else{
                  let i = this.menuParsed.findIndex((a:any)=> a.FieldName === x.LinkedField);
                  if(i !== -1){
                    this.filterKey.set(x.LinkedCalledMenuField+"="+this.menuParsed[i].FieldVal);
                  }
                }
              },50)
            }
            else if(x.FieldType === 'GridView'){
              this.filterKey.set(x.LinkedQuery);
              this.viewid.set(x.Id);
            }
            setTimeout(()=>{
              this.fieldType.set(x.FieldType);
            }, 100)
          })
        }

        this.afterLoaded(type);
    }
  };

  callActionFieldEvent(e: any){
    if(e.action){
      this.callFieldAction = true;
      this.fieldActionid = e.id;
    }else{
      this.callFieldAction = false;
    }
  }

  actionfieldVal(e: any){
    let model:any = e;
    let fab = Object.keys(this.fieldActionBody());
    this.actionStop.set(false);
    this.actionTypeValues = false;
    let yid: any = [];
    model.forEach((r:any)=>{
      if(r.actionType === 'Stop' && r.actionValue){   
        this.trTab.update(tabs =>
          tabs.map((tab:any) => ({
            ...tab,
            col: tab.col.map((col: any) => 
              col.FieldName === r.fieldName
                ? { ...col, FieldVal: null, descEn: null, updateList: false }
                : col
            )
          }))
        );
        this.actionStop.set(true);
        this.toastr.error(r.actionValue);
        return;
      }
      else if(r.actionType === 'Enable Field'){
        let index = this.menuParsed.findIndex((e:any)=> e.FieldName === r.fieldName);
          let v = r.fieldName;
              if(r.actionValue === '1'){
                if(index !== -1){
                  this.menuParsed[index].mrEnabled = true;
                  this.menuParsed[index].Enabled = true;
                }
                this.trTab.update(tab =>
                 tab.map((x: any) => ({
                  ...x,
                  col: x.col.map((y: any) => {
                    if (y.FieldName !== v) return y;   // no change, return original

                    let updatedY = { ...y };
                    updatedY.Enabled = true;
                    updatedY.mrEnabled = true;

                    return updatedY; 
                  })

                  
                })
              ));
              }
              /*else if(r.actionValue === '0'){
                if(index !== -1){
                  this.menuParsed[index].mrEnabled = false;
                  this.menuParsed[index].Enabled = false;
                }
              }*/
      } 
      else if(r.actionType === 'Disable Field'){
        let index = this.menuParsed.findIndex((e:any)=> e.FieldName === r.fieldName);
          let v = r.fieldName;
              if(r.actionValue === '1'){
                if(index !== -1){
                  this.menuParsed[index].mrEnabled = false;
                  this.menuParsed[index].Enabled = false;
                }
                this.trTab.update(tab =>
                 tab.map((x: any) => ({
                  ...x,
                  col: x.col.map((y: any) => {
                    if (y.FieldName !== v) return y;   // no change, return original

                    let updatedY = { ...y };
                    updatedY.Enabled = false;
                    updatedY.mrEnabled = false;

                    return updatedY; 
                  })

                  
                })
              ));
              }
              
              /*else if(r.actionValue === '0'){
                if(index !== -1){
                  this.menuParsed[index].mrEnabled = true;
                  this.menuParsed[index].Enabled = true;
                }
              }*/
      } 
      else if(!this.actionStop() && r.actionType === 'Set Value' || (r.actionType === 'Refresh' && r.actionValue)){
        let v = r.fieldName;
        this.fieldActionBody.update(body => ({...body, [r.fieldName]: r.actionValue }));

        this.allTabField.forEach((x:any)=>{
          if(fab.includes(v) && x.FieldType !== 'Separator' && x.FieldType !== 'DateTime'){
            x.FieldVal = this.fieldActionBody()[x.FieldName];
          }

          if(x.FieldName === v && x.FieldType === 'CheckBox'){
            if(r.actionValue === '1' || (r.actionValue && r.actionValue.toLowerCase() === 'true')){
              x.FieldVal = true;
              this.fieldActionBody.update(body => ({...body, [v]: true }));
            }else if(r.actionValue === '0' || (r.actionValue && r.actionValue.toLowerCase() === 'false')){
              x.FieldVal = false;
              this.fieldActionBody.update(body => ({...body, [v]: false }));
            }
          }
        })

        if(fab.includes(v)){
          this.trTab.update(tab =>
            tab.map((x: any) => ({
              ...x,
              col: x.col.map((y: any) => {
                if (y.FieldName !== v) return y;   // no change, return original

                let fieldName = y.FieldName;
                let newValue: any = null;

                let updatedY = { ...y }; // immutable copy

                // --- CheckBox ---
                if (y.FieldType === 'CheckBox') {
                  const val = r.actionValue?.toString().toLowerCase();
                  newValue = (val === '1' || val === 'true');
                  updatedY.FieldVal = newValue;
                }

                // --- DateTime ---
                else if (y.FieldType === 'DateTime') {
                  if(r.actionValue){
                  const date = new Date(r.actionValue);
                  const iso = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 19);
                  newValue = iso;
                  updatedY.FieldVal = iso;
                  }else{
                    updatedY.FieldVal = null;
                  }
                }

                // --- Default ---
                else {
                  newValue = r.actionValue;
                  updatedY.FieldVal = r.actionValue;
                  if(!r.actionValue){
                    updatedY.descEn = '';
                  }
                }

                // Update fieldActionBody
                this.fieldActionBody.update(body => ({
                  ...body,
                  [fieldName]: newValue
                }));

                // Post update logic
                this.fieldActionid = 0;

                

                if (this.saveModelRecord) {
                  this.callFieldAction = false;
                  this.saveModelRecord = false;

                  setTimeout(() => {
                    if (this.actionClickType === 'saverecord') {
                      this.createModel(this.saveType);
                    } else {
                      this.approveFlow(this.saveType);
                    }
                  }, 1000);

                } else if (y.FieldType === 'LookUp' || y.FieldType === 'Editor') {
                  if (y.Id) {
                    this.actionTypeValues = true;
                    yid.push(updatedY);
                  }
                }

                return updatedY;   // return updated object
              })
            }))
          );


        }
      }
    })
    this.loader.show();
    setTimeout(()=>{
      if(this.actionTypeValues){
        this.getActionTypeVal(yid)
      }else{
        this.loader.hide();
      }
    },1000)
  }

  getActionTypeVal(a: any){
      let trTab = this.trTab();
                  const lang = JSON.parse(localStorage.getItem('lang') || '');
                  let url = "Sys/GetSysFieldsTypeValue?menuId="+this.menuId()+"&languageid="+lang;
                    this._http.putClient<any, ApiResponse>(url, this.fieldActionBody()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
                      next: (response) => { 
                       this.loader.hide();
                        if(response.erroMessage){
                          this.toastr.error(response.erroMessage)
                        }
                        else if(response.dataModel && response.dataModel.length > 0){
                           const res: any = response.dataModel;

                            this.trTab.update(tabs =>
                              tabs.map((tab: any) => ({
                                ...tab,
                                col: tab.col.map((cell: any) => {

                                  // Check existence in array a
                                  const j = a.findIndex((e: any) => e.Id === cell.Id);

                                  if (j > -1) {
                                    // ID exists in array a → now check res
                                    const i = res.findIndex((e: any) => e.fieldId === cell.Id);

                                    if (i > -1) {
                                      const aa = res[i].data[0];
                                      if(aa){
                                        const firstValue = Object.values(aa)[0];
                                        return {
                                          ...cell,
                                          FieldVal: this.fieldActionBody()[cell.FieldName],
                                          descEn: firstValue,
                                          updateList: true
                                        };
                                      }
                                    } else {
                                      return {
                                        ...cell,
                                        descEn: cell.descEn ? cell.descEn : cell.FieldVal,
                                        updateList: false
                                      };
                                    }

                                  } else {
                                    const i = res.findIndex((e: any) => e.fieldId === cell.Id);
                                    // ID NOT in a → default values
                                    if (i > -1) {
                                      const aa = res[i].data[0];
                                      const firstValue = Object.values(aa)[0];
                                      return {
                                        ...cell,
                                        FieldVal: this.fieldActionBody()[cell.FieldName],
                                        descEn: firstValue,
                                        updateList: true
                                      };
                                    }else{
                                      return {
                                        ...cell,
                                        descEn: cell.descEn ? cell.descEn : cell.FieldVal,
                                        updateList: false
                                      };
                                    }
                                  }

                                })
                              }))
                            );
                        }
                      },
                      error: (_e)=>{
                       // this.loader.hide()
                        //
                      }
                    })
  }

  getQuery(q: string){
    let regex = /\[([^\]]+)\]/g;
    let matches = [];
    let match;
    while ((match = regex.exec(q)) !== null) {
      matches.push(match[1]);
    }

    // Output the matches 
    matches.forEach((x: any)=>{
      let c = typeof this.recordData()[x];
      if(c === 'string'){
        q =q.replaceAll("["+x+"]", "'"+this.recordData()[x]+"'");
      }
      else{
        q = q.replaceAll("["+x+"]", this.recordData()[x]);
      }
    })

    return q;
  }

  detailsOpen(i: any){
    if(this.pageType() === "submenu" || this.pageType() === "dimensions"){
     // work on this this.sideBar.menuNav.next("true");
      let query = ''; 
      if(i.LinkedQuery){
        //query =  this.getQuery(i.LinkedQuery);
        query = i.LinkedQuery;
        let a = i.LinkedQuery.split('[');
        let b = a[1].split(']');
     
        const items = {id: i.LinkedMenuID, dtid: i.LinkedMenuID+"-"+this.recordData()[b[0]], pwfid: '', query: query, name:  this.menuAccess ? this.menuAccess.MenuName+"*":"Dimensions *", pageType: 'detailmenu', menuType: '', record: 'add', previousMenuId: i.MenuID, previousRecordID: this.recordId(), isKeyManualInput: null, isJobEnable: false, disableClose: false};
        this.store.dispatch(StoreAction.addPage({menu: items}))
        this.store.dispatch(StoreAction.activePage({active: i.LinkedMenuID+"-"+this.recordData()[b[0]]}))
      }
    }
    else if(this.recordList){
      this.recordList.forEach((e:any)=> {
        if(e.id === this.recordId()){
          if(this.recordId() === this._activeRecords && e.submenus.length > 0){
            let index = e.submenus.findIndex((x:any)=> x.parentid === this._activeRecords);
            if(index !== -1){
              let de = e.submenus.splice(index, e.submenus.length);
              this.closeComponentDetailEmit.emit(de);
            }
          }
          let query = ''; 
          if(i.LinkedQuery){
            //query =  this.getQuery(i.LinkedQuery);
            query = i.LinkedQuery;
          }
          e.submenus.push({recordData: '', drillDown: '', desc: i.Description ? i.Description : i.LabelID, menuid: i.LinkedMenuID, filter: query, parentid: this.recordId(), id: i.ID+this.recordId(), recordid: i.ID, type: 'detailsBtnGrid', previousMenuId: i.MenuID, previousRecordID: this.activeRecords})
        }
        else if(this.recordId() === this._activeRecords){
          if(e.submenus.length > 0){
            let index = e.submenus.findIndex((x:any)=> x.parentid === this._activeRecords && x.type !== 'details');
            if(index !== -1){
              let de = e.submenus.splice(index, e.submenus.length);
              this.closeComponentDetailEmit.emit(de);
            }
            
          }
          let query = ''; 
          if(i.LinkedQuery){
            //query =  this.getQuery(i.LinkedQuery);
            query = i.LinkedQuery;
          }
          if(this.recordList.currentid === e.id){
            e.submenus.push({recordData: '', drillDown: '', desc: i.Description ? i.Description : i.LabelID, menuid: i.LinkedMenuID, filter: query, parentid: this.recordId(), id: i.ID+this.recordId(), recordid: i.ID, type: 'detailsBtnGrid', previousMenuId: i.MenuID, previousRecordID: this.activeRecords})
          }
        }
      })
    
      let _activeRecords = i.ID+this.recordId();
      let record = {activeRecord: _activeRecords, type : 'detailsBtnGrid'}
      this.activeRecordsChange.emit(record)
      //console.log(this.recordList);
    }
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

  getActionFieldVal(){
    const lang = JSON.parse(localStorage.getItem('lang') || '');
    const user = JSON.parse(localStorage.getItem('user') || '');
    let url = "SystemFields/GetDataFieldsQueryExecutions";
   
    let params= {
      "menuID": this.menuId(),
      //"pMenuID": this.recordList.parentPageID,
      "pMenuID": this.pmenuid() ? this.pmenuid() : this.menuId(),
      "fieldID": this.fieldActionid,
      "userID": user.id,
      "languageID": lang,
      "companyID": this.companyID(),
      "recordID": this.recordId() ? this.recordId() : 0,
      "pRecordID": this.precordid(),
      "applicationID": user.applicationID,
      "queryfields": this.fieldActionBody(),
    }
    this.loader.show()
    this._http.putClient<any, ApiResponse>(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (response: any) => { 
          this.loader.hide()
          if(response.erroMessage){
           this.toastr.error(response.erroMessage);
          }
          else if(response.dataModel && response.dataModel.length > 0){
            let model = response.dataModel;
            this.saveModelRecord = true;
            this.actionfieldVal(model);
          }else{
            this.callFieldAction = false;
            this.fieldActionid = 0;
            this.createModel(this.saveType);
          }
        },
        error: (_e)=>{
          this.loader.hide()
        }
    })
  }

  createModel(type: string){
    if(this.callFieldAction || this.fieldActionid !== 0){
      this.saveType = type;
      this.actionClickType = 'saverecord';
      this.getActionFieldVal();
    }else{
      let k = Object.keys(this.fieldActionBody());
      let error = 0;
      let diff = '';
      this.modalErrorMessage = '';
      this.createError.set(false);

      this.allTabField.forEach((x:any)=>{
        if(k.includes(x.FieldName)){
          x.FieldVal = this.fieldActionBody()[x.FieldName];
        }
        
        if(x.Mandatory && !x.FieldVal && x.FieldVal !== 0){   
          this.modalMessage = "Enter value for "+x.FieldCaption;
          this.createError.set(true); 
          this.modal.show('myModal'+this.recordStamp);      
          error++;
        }
      })
      if(this.page && this.page.isKeyManualInput && !this.recordId() && !this.manualID()){
        error++;
        this.modalMessage = "Please provide value for ID";
        this.createError.set(true); 
        this.modal.show('myModal'+this.recordStamp);  
      }else if(this.page && this.page.isKeyManualInput  && !this.recordId() && this.manualID()){
        this.fieldActionBody.update(body => ({...body, ID:  this.manualID() }));
      }
      if(error === 0){
        this.saveType = type;
        this.readonly.set(true);
        const user = JSON.parse(localStorage.getItem('user') || '');
        const lang = JSON.parse(localStorage.getItem('lang') || '');
        let url = '', params:any = {};
        this.fieldActionBody.update(body => ({...body, CompanyID:  this.companyID() }));
        if(!this.recordId()){
          url = "EfDynamic/CreateRecord";
          params = {
            "menuId": this.allTabField[0].MenuId,
            "userId": user.id,
            "languageId": lang,
            "companyId": this.companyID(),
            "jsonData": this.fieldActionBody()
          }
          //url = "DynamicCRUD_OP/CreateDynamicModel";
          /*params = {
            "menuId": this.allTabField[0].MenuId,
            "userId": user.id,
            "languageId": lang,
            "companyId": this.companyID(),
            "applicationID": user.applicationID,
            "queryfields": this.fieldActionBody(),
            "originalData": "",
          }*/
        }
        else if(this.recordId()){
            
          let a: any = JSON.stringify(this.fieldActionBody());
          let b = a.replaceAll('.000Z','');
          diff = this.diffData(JSON.parse(b), JSON.parse(this.originalData));
        
          if(this.pageType() === 'dimensions'){
            url = "EfDynamic/UpdateRecord";
            params = {
              "menuID": 7023,
              "userID": user.id,
              "languageID": lang,
              "companyID": this.companyID(),
            //  "recordID": this.subRecordId,
              "jsonData": JSON.parse(b),
              "originalData": JSON.parse(this.originalData),
            }
          }else{
            url = "EfDynamic/UpdateRecord";
            params = {
              "menuID": this.allTabField[0].MenuId,
              "userID": user.id,
              "languageID": lang,
              "companyID": this.companyID(),
           //   "recordID": this.recordId(),
              "jsonData": JSON.parse(b),
              "originalData": JSON.parse(this.originalData),
            }
          }
        }
        this.menuId.set(this.allTabField[0].MenuId);
        if(!this.recordId()){
          this._http.postClient<any, ApiResponse>(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next:(response)=>{        
            if(response.erroMessage){
              if(this.pageType() === 'callingmenu'){
                let param = {menuid: this.allTabField[0].MenuId, modelid: this.newModelID, type: this.saveType, pageType: this.pageType(), model: this.recordId() ? 'update':'new'};
                this.closeNewRecord.emit(param);  
                if(response.erroMessage){
                  this.toastr.error(response.erroMessage)
                }
              }
              else{
                this.saveType = '';
                this.loader.hide()
                this.readonly.set(false);
                this.modalMessage = response.erroMessage;      
                this.modal.show('myModal'+this.recordStamp);
                this.createError.set(true);
              }
            }
            else if(response.id || response.dataModel || response.stringID){
                this.loader.hide()
                this.newModelID = response.id ? response.id : response.stringID ? response.stringID : response.dataModel;
                if(!this.recordId()){
                  this.fieldActionBody.update(body => ({...body, ID: this.newModelID }));
                  this.modalMessage = "Record "+this.newModelID + " created";
                  if(this.menuAccess && this.menuAccess.ApplyDimensions){
                    this.createDimension();
                  }

                } else{
                  this.modalMessage = "Record "+this.newModelID + " Updated";
                  let a = params['originalData'];
                  let b = params['queryfields'];
                  if(a && b){
                    if(Object.entries(a).sort().toString() !== Object.entries(b).sort().toString()){
                      this.createLog(diff, 'update');
                    }
                  }
                  this.afterinit();
                }  
                this.toastr.success(this.modalMessage);
                if(this.pageType() === 'submenu' || this.pageType() === 'callingsubmenu' || this.prerequisitesType === 'prerequisites'){
                  this.newSubRecordId.emit(this.newModelID)
                }
                else{
                  if(this.pageType() !== 'callingmenu'){
                    this.closeModal();
                  }else{
                    this.originalData = JSON.stringify(this.fieldActionBody());
                    this.recordId.set(this.newModelID);
                  }
                }
                
                let param = {menuid: this.allTabField[0].MenuId, modelid: this.newModelID, type: this.saveType, pageType: this.pageType(), model: this.recordId() ? 'update':'new'};
                this.closeNewRecord.emit(param);  
                
                
                  
                  this.recordUpdate = true;
                  this.recordId.set(this.newModelID);
                 // this.afterinit();
                 if(this.pageType() === 'mainmenu' || this.pageType() === 'detailsBtnGrid'){
                    if(this.menuAccess && this.menuAccess.ApplyWorkflow){
                      this.getWorkflowProgress();
                    }
                 }
                  if(this.pageType() === 'detailsBtnGrid'){
                    this.readonly.set(false);
                    this.recordId.set(0);
                  }
                
              }
            },
            error:(_error)=>{
              this.loader.hide()
              this.saveType = '';
            }
          })
        }else{
          this._http.putClient<any, ApiResponse>(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next:(response)=>{        
            if(response.erroMessage){
              if(this.pageType() === 'callingmenu'){
                let param = {menuid: this.allTabField[0].MenuId, modelid: this.newModelID, type: this.saveType, pageType: this.pageType(), model: this.recordId() ? 'update':'new'};
                this.closeNewRecord.emit(param);  
                if(response.erroMessage){
                  this.toastr.error(response.erroMessage)
                }
              }
              else{
                this.saveType = '';
                this.loader.hide()
                this.readonly.set(false);
                this.modalMessage = response.erroMessage;      
                this.modal.show('myModal'+this.recordStamp);
                this.createError.set(true);
              }
            }
            else if(response.dataModel || response.successMessage){
                this.loader.hide()
                this.newModelID = response.dataModel ? response.dataModel : this.recordId();
                if(!this.recordId()){
                  this.fieldActionBody.update(body => ({...body, ID: this.newModelID }));
                  this.modalMessage = "Record "+this.newModelID + " created";
                  if(this.menuAccess && this.menuAccess.ApplyDimensions){
                    this.createDimension();
                  }

                } else{
                  this.modalMessage = "Record "+this.newModelID + " Updated";
                  let a = params['originalData'];
                  let b = params['queryfields'];
                  if(a && b){
                    if(Object.entries(a).sort().toString() !== Object.entries(b).sort().toString()){
                      this.createLog(diff, 'update');
                    }
                  }
                  this.afterinit();
                }  
                this.toastr.success(this.modalMessage);
                if(this.pageType() === 'submenu' || this.pageType() === 'callingsubmenu' || this.prerequisitesType === 'prerequisites'){
                  this.newSubRecordId.emit(this.newModelID)
                }
                else{
                  if(this.pageType() !== 'callingmenu'){
                    this.closeModal();
                  }else{
                    this.originalData = JSON.stringify(this.fieldActionBody());
                    this.recordId.set(this.newModelID);
                  }
                }
                
                let param = {menuid: this.allTabField[0].MenuId, modelid: this.newModelID, type: this.saveType, pageType: this.pageType(), model: this.recordId() ? 'update':'new'};
                this.closeNewRecord.emit(param);  
                
                  this.recordUpdate = true;
                  this.afterLoaded('init');
                
              }
            },
            error:(_error)=>{
              this.loader.hide()
              this.saveType = '';
            }
          })
        }
      }
    }
  }

  createLog(diff: any, type: string){
    let url = 'General/CreateLogData';

    let m = this.allTabField[0].MenuId;
    const user = JSON.parse(localStorage.getItem('user') || '');
    const lang = JSON.parse(localStorage.getItem('lang') || '');
    
    if(this.pageType() === 'dimensions'){
      m = 7023;
    }
  
    let b = (JSON.parse(this.originalData));
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
      "logType": type,
      "menuId": m,
      "recordId": this.recordId().toString(),
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

  createDimension(){
    const user = JSON.parse(localStorage.getItem('user') || '');
    const lang = JSON.parse(localStorage.getItem('lang') || '');
    let url = "General/DimenstionOperations";
    let params = {
      "menuID": this.allTabField[0].MenuId,
      "pMenuID": this.pageType() === 'mainmenu' ? 0 : this.pmenuid,
      "fieldID": 0,
      "userID": user.id,
      "languageID": lang,
      "companyID": this.companyID(),
      "recordID": this.newModelID,
      "pRecordID": this.precordid() ? this.precordid() : 0,
      "applicationID": user.applicationID,
    }

    this._http.postClient(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (_resposne: any)=>{

      }
    })
  }

  closeModal(){
    this.createError.set(false);
    this.modal.hide();
    if(this.ids){
      const kcdome = document.getElementById('kcdome');
      kcdome?.classList.add('modal-open');
    }
    if(this.saveType === 'save'){
     // this.readonly = true;
    }
    else if(this.saveType === 'saveadd'){
     // this.readonly = false;
      this.resetAll();
    }
    else if(this.saveType === 'saveclose'){
      //this.readonly = false;
    }
  }

  actionClick(btn: any, type: string){
    const user = JSON.parse(localStorage.getItem('user') || '');
    const lang = JSON.parse(localStorage.getItem('lang') || '');
    this.exceltype = false;
    this.actionBtnType = type;
    //"pMenuID" = this.recordList.parentPageID,
    let pid = this.pmenuid() ? this.pmenuid() : this.menuId();
    let url = "Sys/GetOnclickSysActions";

    this.actionMenuList = btn;
    this.loader.show()
    this.hideProceed.set(false);
    this.hideGrid.set(true);
    let params = {
      "applicationID": user.applicationID,
      "companyID": this.companyID(),
      "fieldID": btn.Id,
      "languageID": lang,
      "menuID": this.allTabField[0].MenuId,
      "pMenuID": pid,
      "queryfields": this.fieldActionBody(),
      "precordid": this.recordList.currentid,
      "recordID": this.recordId(),
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
              this.exceltype = true;
              this.xlOk = false;
              this.actionbtnname = btn.FieldCaption;
              this.getTemplate(btn.Id, x.id);

                this.modal.show('xlModal'+this.recordStamp); 
              
            }
            else if(x.actionType === "Message" && !this.exceltype){
              if(seq === 0){
                seq = x.seq;
                this.modalMessage = x.message;
                this.toastr.success(x.message);
              } 
              else if(seq < x.seq){
                this.conpletedMessage = x.message;
              }
            }
            else if(x.actionType === "Procedure" && !this.exceltype){
              this.runProceedure(x.id, type, x.actionType);
            }
            else if(x.actionType === "Calling Menu" && !this.exceltype){
              if(x.linkedQuery){
                this.callingMenuLinkedQuery = x.linkedQuery;
                this.callingMenuData = x;
                this.runProceedure(x.id, type, x.actionType);
              }else{
                if(type !== 'print'){
                  this.recordUpdate = true;
                  this.afterinit();
                }
              }
            }
          })
        }else{
          if(type === 'print'){
            this.printAction(this.actionMenuList)
          }
        }
        this.loader.hide()
      },
      error: (_error) => {
        this.loader.hide()
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
    this.loader.show()
    this.hideProceed.set(true);
    let pid = this.pmenuid() ? this.pmenuid() : this.menuId();
    
    let params = {
      "menuID": this.allTabField[0].MenuId,
      "pMenuID": pid,
      "userID": user.id,
      "languageID": lang,
      "companyID": this.companyID(),
      "recordID": this.recordId(),
      "applicationID": user.applicationID,
      "queryfields": this.fieldActionBody(),
      "filterCondition": this.callingMenuLinkedQuery
    }

    this._http.putClient<any, ApiResponse>(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.loader.hide()
        if(response.erroMessage){
          this.loader.hide()
          if(response.erroMessage !== 'Linked Query Not Found'){
            this.modalMessage = response.erroMessage;
            this.toastr.clear();
              this.modal.show('actionModal'+this.recordStamp);

          }
        }
        else if(type === 'print' && actionType === 'Calling Menu'){
          this.printAction(this.actionMenuList);
        }
        else if(response.stringID){
          this.callingMenu.set(true);
          this.stringID = response.stringID;
          this.loader.hide()
        }
        else if(response.successMessage === "Call crystal reprot"){
          this.printAction(this.actionMenuList);
        }
        else if(response.successMessage && !this.callingMenuLinkedQuery){
          this.toastr.success(this.conpletedMessage ? this.conpletedMessage : 'Completed');
          this.loader.hide()
          this.afterinit();
        }

        if(type !== 'print'){
          this.recordUpdate = true;
          this.afterinit();
        }
      },
      error: (_error) => {
        this.hideProceed.set(false);
        this.loader.hide()
      }
    })
  }

  approveFlow(type: string){
    const user = JSON.parse(localStorage.getItem('user') || '');
    const lang = JSON.parse(localStorage.getItem('lang') || '');

    let surl = '';
    let sparams:any = {};
    let diff = '';
    this.fieldActionBody.update(body => ({...body, CompanyID:  this.companyID() }));

    if((!this.rreadonly() && !this.readonly() && !this.disabelbtns()) || this.enableSavebtn()){
      if(this.callFieldAction || this.fieldActionid !== 0){
        if(type === 'approveclose')
        {
          this.saveType = 'Approve';
        }else{
          this.saveType = type;
        }
        this.actionClickType = 'workflow';
        this.getActionFieldVal();
      }
      else{

        if(!this.recordId()){
          surl = "EfDynamic/CreateRecord";
          sparams = {
            "menuId": this.allTabField[0].MenuId,
            "userId": user.id,
            "languageId": lang,
            "companyId": this.companyID(),
            "jsonData": this.fieldActionBody()
          }
          //surl = "DynamicCRUD_OP/CreateDynamicModel";
          /*sparams = {
            "menuId": this.mainMenuId(),
            "userId": user.id,
            "languageId": lang,
            "companyId": this.companyID(),
            "applicationID": user.applicationID,
            "queryfields": this.fieldActionBody(),
            "originalData": "",
          }*/
        }
        else if(this.recordId()){
          
          let a: any = JSON.stringify(this.fieldActionBody());
          let b = a.replaceAll('.000Z','');
          diff = this.diffData(JSON.parse(b), JSON.parse(this.originalData));
    
          surl = "EfDynamic/UpdateRecord";
          sparams = {
            "menuID": this.mainMenuId(),
            "userID": user.id,
            "languageID": lang,
            "companyID": this.companyID(),
            //"recordID": this.recordId(),
            "jsonData": JSON.parse(b),
            "originalData": JSON.parse(this.originalData),
          }
    
        }
        
        this.menuId.set(this.allTabField[0].MenuId);
        this.loader.show();

        if(!this.recordId()){
          this._http.postClient<any, ApiResponse>(surl, sparams).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next:(_res)=>{
              this.loader.hide()
              if(_res.erroMessage){
                this.saveType = '';
                this.readonly.set(false);
                this.modalErrorMessage = _res.erroMessage;  
                this.closeModal(); 
                if(this.modalErrorMessage){
                  this.modal.show('errModal'+this.recordStamp);      
            
                }   
                this.createError.set(true);
              }
              else if(_res.id || _res.successMessage || _res.stringID){
                this.wfAction(type, sparams);
              }
            }
          });

        }else{
          this._http.putClient<any, ApiResponse>(surl, sparams).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next:(_res)=>{
              this.loader.hide()
              if(_res.erroMessage){
                this.saveType = '';
                this.readonly.set(false);
                this.modalErrorMessage = _res.erroMessage;  
                this.closeModal(); 
                if(this.modalErrorMessage){
                  this.modal.show('errModal'+this.recordStamp);      
            
                }   
                this.createError.set(true);
              }
              else if(_res.dataModel || _res.successMessage){
                
                this.wfAction(type, sparams);
  
              }
            }
          });
        }

      }
    }else{
      this.wfAction(type, sparams);
    }
  }

  wfAction(type: string, sparams: any){
    const user = JSON.parse(localStorage.getItem('user') || '');
    const lang = JSON.parse(localStorage.getItem('lang') || '');

    let diff = '';
    if(type === 'Approve' || type === 'approveclose'){
      let url = "SysFields/SysWorkFlowApproval";
      let param: any = 
        {
          "menuID": this.mainMenuId(),
          "userID": user.id,
          "languageID": lang,
          "companyID": this.companyID(),
          "recordID": this.recordId(),
          "applicationID": user.applicationID,
          "type": "Approve",
          "queryfields": this.fieldActionBody(),
          "notes": this.workflownote 
        }
      this.loader.show()
      this._http.putClient<any, ApiResponse>(url, param).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (response)=>{
          this.closeModal()
          this.loader.hide()
          
          if(response.erroMessage){
            this.modalErrorMessage = response.erroMessage.replaceAll('\n','<br />');
            if(this.modalErrorMessage){ 
              this.modal.show('errModal'+this.recordStamp);
            }
            //this.toastr.error(response.erroMessage);
          }else{
            if(this.recordId()){
              let a = sparams['originalData'];
              let b = sparams['queryfields'];
              if(a && b){
                if(Object.entries(a).sort().toString() !== Object.entries(b).sort().toString()){
                  this.createLog(diff, 'update');
                }
              }
            }

            
            this.wfStatusUpdate.emit(this.mainMenuId());
            if(type === 'approveclose'){
              this.approveClose.emit('close');
            }else{
              //this.openTab('Main', 0);
              this.afterinit();
            }
          }
        },
        error: (_e)=>{
          this.loader.hide()
          this.closeModal();
        }
      })
    }
    else{
      let url = '';
      if(type === 'Reject'){
        url = "SysFields/SysWorkFlowRejection?workflowid=0";
      }else{
        let a:any = '';
        if(this.wfUser.value){
          a = this.userlist.filter((x: any)=> x.userName === this.wfUser.value);
        url = "SysFields/SysWorkFlowRejection?workflowid="+this.workflowid+"&SwapUserid="+ a[0].id;
        }
        else{
          url = "SysFields/SysWorkFlowRejection?workflowid="+this.workflowid+"&SwapUserid="+a;
        }
      }
      let param = {
        "menuID": this.mainMenuId(),
        "userID": user.id,
        "languageID": lang,
        "companyID": this.companyID(),
        "recordID": this.recordId(),
        "applicationID": user.applicationID,
        "type": type,
        "queryfields": "",
        "notes": this.workflownote 
      }
      this.loader.show()
      this._http.putClient<any, ApiResponse>(url, param).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (response)=>{
          this.loader.hide()
          this.closeModal()
          if(response.erroMessage){
              this.toastr.error(response.erroMessage);
          }else{
            this.wfStatusUpdate.emit(this.mainMenuId());
            //this.openTab('Main', 0);
            this.afterinit()
          }
        },
        error: (_e)=>{
          this.loader.hide()
          this.closeModal();
        }
      })
    }
  }

  openApproveModal(type: string){
    this.workflownote = '';
    this.wfType = type;
    if(type==='Swap'){   
      this.getuserlist()
    }
 
    this.modal.show('approveModal'+this.recordStamp);
  }

  genReport(record: number){
    if(!this.page.isJobEnable){
      this.recordList.splice(0, this.recordList.length);
    }
    let params = {page: this.page, recordid: record, index: 1, companyID: this.datacompanyid, data: this.recordData()};
    this.prerequisiteType.emit(params)
  }

  printAction(print: any){
    const user = JSON.parse(localStorage.getItem('user') || '');
    const lang = JSON.parse(localStorage.getItem('lang') || '');
    //"pMenuID" = this.recordList.parentPageID,
    let pid = this.pmenuid() ? this.pmenuid() : this.menuId();
    let url = "Report/GenerateReport?sysfieldid="+print.Id+"&pmenuid="+pid+"&precordid="+ this.recordList.currentid+"&companyid="+this.companyID()+"&menuid="+this.allTabField[0].MenuId+"&languageid="+lang+"&userid="+user.id+"&applicationid="+user.applicationID;
    let params = this.fieldActionBody();
    this.loader.show()
    this._http.putClient<any, ApiResponse>(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response)=>{
        this.loader.hide()
        if(response.erroMessage){
          this.toastr.error(response.erroMessage);
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

            this.loader.hide()
            let tab: any = window.open();
            tab.location.href = this.reportURL();
          }
        }
      },
      error: (_error)=>{
        this.loader.hide()
      }
    })
  }

  deleteRecord(){
    this.modal.show('deleteModal'+this.recordStamp);
  }

  deleteConfirm(){
    const user = JSON.parse(localStorage.getItem('user') || '');
    const lang = JSON.parse(localStorage.getItem('lang') || '');
    let url = "DynamicCRUD_OP/DeleteRecord";
    let params = {
      "menuID": this.allTabField[0].MenuId,
      "userID": user.id,
      "languageID": lang,
      "companyID": this.companyID(),
      "jsonData": this.fieldActionBody(),
      "originalData": JSON.parse(this.originalData),
    }
    this._http.putClient<any, ApiResponse>(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next:(res)=>{
        if(res.erroMessage){
          this.toastr.error(res.erroMessage)
        }
        else if(this.pageType() === 'mainmenu'){
          this.deletedRecord.emit({menuid: this.allTabField[0].MenuId, record: this.recordId()})
        }else{
          this.deletedSubRecord.emit({menuid: this.allTabField[0].MenuId, record: this.recordId()})
        }
        this.closeModal();
      }
    });
  }

  deletedRecordEvent(e: any){
    this.deletedSubRecord.emit(e);
  }

  getTemplate(fieldid: number, actionid: number){
    const user = JSON.parse(localStorage.getItem('user') || '');
    const lang = JSON.parse(localStorage.getItem('lang') || '');
    let url = "FileUpload/XmlDownloadFile";
    this.xlactionid = actionid;
    let params: any = {
      "menuID": this.menuId(),
      "pMenuID": this.pmenuid() ? this.pmenuid() : this.menuId(),
      "fieldID": fieldid,
      "actionID": actionid,
      "userID": user.id,
      "languageID": lang,
      "companyID": this.companyID(),
      "recordID":  this.recordId(),
      "pRecordID": this.precordid(),
      "applicationID": user.applicationID,
      "queryfields": this.fieldActionBody()
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
      this.xlOk = true;
      /*let _size = this.file.size;
      let fSExt = new Array('Bytes', 'KB', 'MB', 'GB'),i=0;
      while(_size>900){_size/=1024;i++;}
      this.fileSize = (Math.round(_size*100)/100)+' '+fSExt[i];*/      
    }
  }

  contProcedure(){

    const user = JSON.parse(localStorage.getItem('user') || '');
      let url = 'FileUpload/xmlBulkInsert?actionID='+ this.xlactionid+'&recordId='+this.recordId()+'&deleteExistingrecord='+this.deleteXlFile;
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
            else if(x.actionType === "Calling Menu"){
              if(x.linkedQuery){
                  this.callingMenuLinkedQuery = x.linkedQuery;
                  this.callingMenuData = x;
                  this.runProceedure(x.id, this.actionBtnType, x.actionType);
              }else{
                if(this.actionBtnType !== 'print'){
                  this.afterinit();
                }
              }
            }
          })
        }else{
          if(response.erroMessage){
            this.toastr.error(response.erroMessage);
          }
        }
        //this.filePath = response.filePath;
      },
      error: (_error) => {
        this.toastr.error('Error in excel file upload');
      }
    })

   
  }

}