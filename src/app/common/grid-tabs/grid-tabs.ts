import { CommonModule } from '@angular/common';
import { Component, EventEmitter, input, Input, OnInit, Output, forwardRef, signal, model, inject, DestroyRef } from '@angular/core';
import { DimensionsPage } from '../../dashboard/menu-grids/common/dimensions-page/dimensions-page';
import { WorkflowPage } from '../../dashboard/menu-grids/common/workflow-page/workflow-page';
import { NotesPage } from '../../dashboard/menu-grids/common/notes-page/notes-page';
import { AttachmentsPage } from '../../dashboard/menu-grids/common/attachments-page/attachments-page';
import { NotificationPage } from '../../dashboard/menu-grids/common/notification-page/notification-page';
import { LogdataPage } from '../../dashboard/menu-grids/common/logdata-page/logdata-page';
import { AppService } from '../../services/common/common.service';
import { CommentsPage } from '../../dashboard/menu-grids/common/comments-page/comments-page';
import { DetailsPage } from '../../dashboard/menu-grids/common/details-page/details-page';
import { EditableGridTabs } from '../editable-grid-tabs/editable-grid-tabs';
import { ToastrService } from 'ngx-toastr';
import { select, Store } from '@ngrx/store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiResponse } from '../../shared/interface';

@Component({
  selector: 'grid-tabs',
  standalone: true,
  imports: [CommonModule, CommentsPage, EditableGridTabs, forwardRef(()=> DetailsPage), DimensionsPage, WorkflowPage, NotesPage, AttachmentsPage, NotificationPage, LogdataPage ],
  templateUrl: './grid-tabs.html',
  styleUrl: './grid-tabs.scss'
})
export class GridTabs implements OnInit {
  activeSubTab = signal<string>('');
  showSubDetails = signal<boolean>(false);
  activeGridTab = signal<string>('');
  subRecordId: any;
  recordId = signal<any>(0);
  companyID = input<number>(0);
  @Input() wfEnabledStatus: boolean;
  mrEnabledStatus = input<boolean>();
  pageType = signal<string>('');
  notesList: any;
  @Input() set _pageType(value: string){
    this.pageType.set(value);
    if(this.pageType() === 'mainmenu' || this.pageType() === 'prerequisitemenu'){
      this.setTabs('grid');
      //this.getmenuaccess();
    }
  }
  get _pageType(): string {
    return this.pageType();
  }

  
  @Input() set _recordId(value: number){
    this.recordId.set(value);
  }
  get _recordId(): number {
    return this.recordId();
  }
  
  menuId = signal<number>(0);
  @Input() set _menuId(value: number){
    this.menuId.set(value);
     if(this.recordId()){
      this.setTabs('grid');
    }
    this.getmenuaccess();
  }
  get _menuId(): number{
    return this.menuId();
  }
  filterKey = signal<string>('');
  @Input() set _filterKey(value: string){
    this.filterKey.set(value);
    if(this.recordId()){
      this.setTabs('grid');
    //  this.getmenuaccess();
    }
  }
  get _filterKey(): any{
    return this.filterKey();
  }
  @Input() associateUser: boolean;
  @Input() fieldType: string;
  @Input() page: any;
  @Input() recordList: any;
  @Input() fieldQuery: any;
  @Input() readOnly: boolean;
  @Input() wfStatus: string;
  otherUser: boolean;
  @Input() set _otherUser(value: boolean){
    this.otherUser = value;
  }
  get _otherUser(): boolean{
    return this.otherUser;
  }
  @Input() disabelbtns: boolean;
  editablefielddetails: string;

  @Input() set _editablefielddetails (value: string){
    this.editablefielddetails = value;
  }

  get _editablefielddetails(): string{
    return this.editablefielddetails;
  }
  detailsPage = model<boolean>();
  @Output() prType = new EventEmitter;
  @Output() prerequisiteType = new EventEmitter;
  @Input() pmenuid: number;
  @Input() precordid: number;
  @Input() preReqIndex: number;
  drillDown: any;
  recordData: any;
  menulabel = signal<any>('');
  menuaccess = signal<any>([]);
  itemlist: any;
  filecount = signal<number>(0);
  notesCount = signal<number>(0);
  newsubrecord = signal<boolean>(false);
  rowcount = signal<number>(0);
  preRequisiteOption: boolean = false;
  _prerequisitesType = signal<string>('')
  @Input() set prerequisitesType(value: string){
    this._prerequisitesType.set(value);
  }
  get prerequisitesType(): string{
    return this._prerequisitesType();
  }
  @Output() deletedRecord = new EventEmitter;
  rescompanyID: number;
  wfstatus: string;
  disablerecord: boolean;
  enableAttachment: boolean;
  enableDimension: boolean;
  enableNote: boolean;
  recorddeleted: any = {id: 0, deleted: false};
  isLoading = signal<boolean>(false);
  isaLoading = signal<boolean>(false);
  saveAdd: boolean;
  newrecordid = signal<any>({});
  newRecordAdded = signal<boolean>(false);
  recordType: string;
  newrecorddetail: any;
  cAllatt = signal<boolean>(true);
  private store = inject(Store);
  menulistsub: any;
  menulist: any;

  constructor(private _http: AppService, private toastr: ToastrService, private destroyRef: DestroyRef){
    this.menulistsub = this.store.pipe(select('list')).subscribe(data=>{
      this.menulist = data.list;
      setTimeout(()=>{
        let u =  this.menulist.filter((x:any)=> x.ID === this.menuId());
          if(u[0] && u[0].ID){
            this.page = {
            ...this.page,
            isKeyManualInput: u[0].IsKeyManualInput
          };
          }
      },1000)
    });
  }

  ngOnInit(){
    if((this.wfEnabledStatus || this.mrEnabledStatus()) && !this.editablefielddetails){
      this.readOnly = false;
    }

    if(this.wfStatus === '-----'){
      if(this.pageType() === 'submenu'){
        //this.readOnly = false;
      }
    }
  }

  detailsPageChangeEvent(e: any){
    this.detailsPage.set(e)
  }

  setTabs(tabname: string){
    this.activeSubTab.set(tabname);
    if(tabname === 'grid'){
      this.newsubrecord.set(false);
    }
    if(tabname === 'rdetails'){
      this.activeGridTab.set('details');
      this.newsubrecord.set(false);
    }
    else if(tabname === 'newrecord'){
      this.addNewSubRecord()
    }
  }
  
  subRecordDetail(e: any){
    if(e.id){
      this.showSubDetails.set(true);
      this.subRecordId = e.id;
      this.getAllAttachment();
      this.activeSubTab.set('rdetails');
      this.activeGridTab.set('details');
      this.recordData = e.data;
      this.menulabel.set(e.label);
      if(this.recordType === 'save' || this.recordType === 'saveadd'){
        this.newRecordAdded.set(true);
        this.newrecordid.set(this.newrecorddetail);
        this.recordType = '';
      }else{
        this.newRecordAdded.set(false);
        this.newrecordid.set({});
      }
    }

    if(e.id === 0 && e.label){
      let a = JSON.parse(e.label);
      a.forEach((x:any)=>{
        x.FieldVal = null;
      })
      this.activeSubTab.set('grid');
      this.activeGridTab.set('details');
      this.recordData = e.data;
      this.menulabel.set(JSON.stringify(a));
      if(this.recordType === 'save' || this.recordType === 'saveadd'){
        this.newRecordAdded.set(true);
        this.newrecordid.set(this.newrecorddetail);
        this.recordType = '';
      }else{
        this.newRecordAdded.set(false);
        this.newrecordid.set({});
      }
    }
  }

  onRefresh(){
    this.activeSubTab.set('');
    setTimeout(()=>{
      this.activeSubTab.set('grid');
    },200)
  }

  setGridTabs(e: any){
    this.activeGridTab.set(e);
    if(e === 'attachments'){
      this.getAllAttachment();
    }
  }

  getAttachment(){
    if(this.subRecordId && this.pageType() !== 'prerequisitemenu'){
    this.getNotes();
    let filter = 'menuId='+this.menuId()+' and recordId='+this.subRecordId;
    let user =  JSON.parse(localStorage.getItem('user') || '');
    let url = 'Sys/GetAllSysAttachments?IsAllAttachments=false&menuId='+this.menuId()+'&RecordId='+this.subRecordId+'&ApplicationId='+user.applicationID;

    this.isLoading.set(true);
    this._http.getClient<ApiResponse>(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next:(response)=>{
        this.isLoading.set(false);
        if (response.dataModel && response.dataModel.length > 0) {
          this.itemlist = response.dataModel;
          this.filecount.set(this.itemlist.length);
        }
      },
      error:(_error)=>{
        this.isLoading.set(false);
      }
    })
    }
  }

  getAllAttachment(){
    if(this.pageType() !== 'prerequisitemenu'){
    let user =  JSON.parse(localStorage.getItem('user') || '');
    let url = 'Sys/GetAllSysAttachments?IsAllAttachments=true&menuId='+this.menuId()+'&RecordId='+this.subRecordId+'&ApplicationId='+user.applicationID;
   
    this._http.getClient<ApiResponse>(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next:(response)=>{
        this.isLoading.set(true);
        setTimeout(()=>{
          this.isLoading.set(false);
        })
        if(response.erroMessage){
          this.toastr.error('All Attachment: '+ response.erroMessage);
        }
        else if (response.dataModel && response.dataModel.length > 0) {
          this.itemlist = response.dataModel;
          this.filecount.set(this.itemlist.length);
        }else{
          this.itemlist = '';
          this.filecount.set(0);
        }
      },
      error:(_error)=>{
        this.isLoading.set(false);
      }
    })
    }
  }

  getNotes(){
    if(this.recordId()){
      let id: any = this.recordId();
      if(typeof this.recordId() === 'string'){
        id = "'" + this.recordId() + "'";
      }
      const url = 'Sys/GetSysNotes?menuId=' + this.menuId() + '&RecordID=' + id;
      this.isLoading.set(true);
      this._http.getClient<ApiResponse>(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          if (response.dataModel && response.dataModel.length > 0) {
            this.notesList = response.dataModel;
            this.notesCount.set(response.rowCount);
          }
        },
        error: (_errMsg) => {
          this.isLoading.set(false);
        }
      });
    }
  }

  fileCountNoteEvent(_e: any){
    this.getNotes();
  }

  fileCountEvent(e: any){
    this.getAllAttachment();
  }

  getallAttachmentsEvt(e: boolean){
    this.cAllatt.set(e);
    if(e){
      this.getAllAttachment();
    }else{
      this.getAttachment();
    }
  }

  getmenuaccess(){
    const lang = JSON.parse(localStorage.getItem('lang') || '');
    if(this.activeGridTab() === 'dimensions'){
      this.menuId.set(7023)
    }
    const url = 'Sys/GetSysMenuAccess?menuId=' + this.menuId() + '&languageId=' + lang;
    this.isaLoading.set(true);
    this._http.getClient<ApiResponse>(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        if (response.dataModel && response.dataModel.length > 0) {
          let res = response.dataModel[0];
          this.menuaccess.set(res);
        }
        this.isaLoading.set(false);
      },
      error: (_errMsg) => {

      }
    });
  }

  addNewSubRecord(){
    this.newsubrecord.set(true);
    this.showSubDetails.set(false);
    this.activeSubTab.set('newrecord');
    let a = JSON.parse(this.menulabel());
    a.forEach((x:any) => {
      if(this.filterKey() && (x.FieldName.toLowerCase() === this.filterKey().toLowerCase())){
        x.FieldVal = this.recordId();
      }
      if(x.FieldName === "VoucherSeq" || x.FieldName === "Sequence" || x.FieldName === "Seq"){
        x.FieldVal = this.rowcount() + 1;
      }
    });
    this.menulabel.set(JSON.stringify(a));
  }

  rowCountEvent(e: any){
    this.rowcount.set(e);
    if(this.saveAdd){
      this.saveAdd = false;
      this.addNewSubRecord();
    }
  }

  prerequisiteTypeEvent(e :any){
    this.preRequisiteOption = true;
    this._prerequisitesType.set('grid');
    this.prType.emit(this._prerequisitesType());
    this.prerequisiteType.emit(e)
    this.page = e.page;
    this.rescompanyID = e.companyID;
  }

  wfstatusEvent(event: any){
    this.wfstatus = event;
  }

  disablerecordEvent(event: boolean){
    this.disablerecord = event;
  }

  enableAttachmentEvt(event: boolean){
    this.enableAttachment = event;
  }

  enableDimensionEvt(event: boolean){
    this.enableDimension = event;
  }

  enableNoteEvt(event: boolean){
    this.enableNote = event;
  }

  deletedRecordEvent(e: any){
    this.setTabs('grid');
    this.showSubDetails.set(false);
    this.recorddeleted = {id: e.menuid, deleted: true};
  }

  newSubRecordIdEvent(e: any){
    this.subRecordId = e;
    this.getAllAttachment();
    this.activeSubTab.set('grid');
    this.newsubrecord.set(false);
    //this.setTabs('rdetails');
  }

  closeNewRecordEvent(e: any){
    this.newRecordAdded.set(false);
    this.recordType = '';
    this.setTabs('grid');
    if(e.type === 'saveclose'){
      this.showSubDetails.set(false);
    }
    if(e.type === 'saveadd'){
      this.showSubDetails.set(false);
      this.saveAdd = true;
    }
    this.newrecorddetail = e;
    if(e.type === 'save' && e.model === 'new'){
    }
    this.recordType = e.type;
  }
}
