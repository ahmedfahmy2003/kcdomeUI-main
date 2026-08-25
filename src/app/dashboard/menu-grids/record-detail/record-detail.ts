import { Component, DestroyRef, effect, inject, Input, input, output, signal } from '@angular/core';
import { LogdataPage } from '../common/logdata-page/logdata-page';
import { DimensionsPage } from '../common/dimensions-page/dimensions-page';
import { WorkflowPage } from "../common/workflow-page/workflow-page";
import { NotificationPage } from "../common/notification-page/notification-page";
import { NotesPage } from "../common/notes-page/notes-page";
import { AttachmentsPage } from "../common/attachments-page/attachments-page";
import { CommonModule } from '@angular/common';
import { AppService } from '../../../services/common/common.service';
import { CommentsPage } from '../common/comments-page/comments-page';
import { DetailsPage } from '../common/details-page/details-page';
import { ToastrService } from 'ngx-toastr';
import { select, Store } from '@ngrx/store';
import { MenuGridTabs } from '../../../common/menu-grid-tabs/menu-grid-tabs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiResponse } from '../../../shared/interface';

@Component({
  selector: 'record-detail',
  standalone: true,
  imports: [CommonModule, DetailsPage, LogdataPage, DimensionsPage, MenuGridTabs, AttachmentsPage, NotesPage, NotificationPage, WorkflowPage, CommentsPage],
  templateUrl: './record-detail.html',
  styleUrl: './record-detail.scss'
})
export class RecordDetail {
  menuId = input<number>(0);
  recordId = input<any>();
  otheruser: any;
  visible = input<boolean>(true); 
  activeRecords = input();
  _activeRecords = signal<any>(null);
  menulabel = input();
  tabname = input<string>('');
  companyID = input<number>(0);
  page = input<any>({});
  pageType = input<string>('');
  menuaccess = input<any>({});
  recordList = input();
  activeRecordsChange = output<any>({});
  closeNewRecord = output<any>({});
  deletedRecord = output<any>({});
  approveClose = output<string>();
  wfStatusUpdate = output();
  closeComponentEmit = output();
  prerequisiteType = output();
  isLoading = signal<boolean>(false);
  public activeTab = signal<string>('details');
  public filecount = signal<number>(0);
  public notesCount = signal<number>(0)
  public itemlist: any;
  public notesList = signal<any>('');
  commentsList = signal<any>('');
  commentsCount = signal<number>(0);
  wfstatus = signal<string>('');
  disablerecord = signal<boolean>(false);
  enableAttachment = signal<boolean>(false);
  enableDimension = signal<boolean>(false);
  enableNote = signal<boolean>(false);
  enableComment = signal<boolean>(true);
  readOnly = signal<boolean>(false);
  isaLoading = signal<boolean>(false);
  menulabelbtn = signal<string>('');
  cAllatt = signal<boolean>(true);
  enableReport = signal<boolean>(false)
  pageLoad: boolean = false;
  prepage = signal<any>({});
  private store = inject(Store);
  clogo = signal<string>('');
  _prerequisitesType = signal<string>('')
  @Input() set prerequisitesType(value: string){
    this._prerequisitesType.set(value);
  }
  get prerequisitesType(): string{
    return this._prerequisitesType();
  }
  jobProgress = input<any>({});
  constructor(private _http: AppService, private toastr: ToastrService, private destroyRef: DestroyRef){
    effect(() => {
  
      if(!this.pageLoad){
        this.oninit();
      }
      if(this.page().pageType === 'prerequisitemenu' && this.page().isJobEnable && this.tabname() === 'report'){
        this.enableReport.set(true);
      }
      this.getothers()
    });
  }

  getothers() {
      const id = this.recordId();
      if (id) {
        this.getAllAttachment();
        this.getNotes();
        this.getAllComments();
      }
  }
  oninit() {
    this.pageLoad = true;
    if(this.pageType() === 'detailsBtnGrid'){
      this.getmenus(); 
    }
    this.setTabs(this.tabname());
  }

  setTabs(menu: string){
    this.activeTab.set(menu);
  }

  fileCount(e: any){
    this.filecount.set(e);
  }

  getmenus(){
    const lang = localStorage.getItem("lang") || '';
    const user = JSON.parse(localStorage.getItem('user') || '');
    const url = 'SystemFields/GetsysFieldData?id=' +this.menuId()+"&languageid="+lang+'&userid='+user.id+'&companyid='+this.companyID()+'&applicationid='+user.applicationID;

    this._http.getClient<ApiResponse>(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        let response = res.dataModel;
        if(response){
          this.menulabelbtn.set(JSON.stringify(response));
        }
        else{
          if(res.erroMessage){
            this.toastr.error(res.erroMessage);
          }
        }
      }
    });
  }

  getAllAttachment(){
    let user =  JSON.parse(localStorage.getItem('user') || '');
    let url = 'Sys/GetAllSysAttachments?IsAllAttachments=true&menuId='+this.menuId()+'&RecordId='+this.recordId()+'&ApplicationId='+user.applicationID;
   
    this.isaLoading.set(true);
    this._http.getClient<ApiResponse>(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next:(response)=>{
          this.isaLoading.set(false);
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
        this.isaLoading.set(false);
      }
    })
  }

  getAttachment(){
    let user =  JSON.parse(localStorage.getItem('user') || '');
    let url = 'Sys/GetAllSysAttachments?IsAllAttachments=false&menuId='+this.menuId()+'&RecordId='+this.recordId()+'&ApplicationId='+user.applicationID;
    this._http.getClient<ApiResponse>(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next:(response)=>{
        this.isaLoading.set(true);
        setTimeout(()=>{
          this.isaLoading.set(false);
        })
        if(response.erroMessage){
          this.toastr.error('Attachment: '+ response.erroMessage);
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
        this.isaLoading.set(false);
      }
    })
  }

  fileCountEvent(_e: any){
    this.getAllAttachment();
  }

  fileCountCommentEvt(_e: any){
    this.getAllComments();
  }

  getAllComments(){
    if(this.recordId()){
      let id: any = this.recordId();
      if(typeof this.recordId() === 'string'){
        id = "'" + this.recordId() + "'";
      }
      const url = 'Sys/GetSysMenuComments?menuId=' + this.menuId() + '&RecordID=' + id;
      this.isLoading.set(true);
      this._http.getClient<ApiResponse>(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          if(response.erroMessage){
            this.toastr.error('Notes: '+ response.erroMessage);
          }
          else if (response.dataModel && response.dataModel.length > 0) {
            this.commentsList.set(response.dataModel);
            this.commentsCount.set(response.rowCount ? response.rowCount : response.dataModel.length);
          }
        },
        error: (_errMsg) => {
          this.isLoading.set(false);
        }
      });
    }
  }
  
  getallAttachmentsEvt(e: boolean){
    this.cAllatt.set(e);
    if(e){
      this.getAllAttachment();
    }else{
      this.getAttachment();
    }
  }

  fileCountNoteEvent(_e: any){
    this.getNotes();
  }

  recordListEvent(e: any){
    this.recordList = e;
  }

  activeRecordEvent(e: any){
    this._activeRecords.set(e);
    this.activeRecordsChange.emit(this._activeRecords())
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
          if(response.erroMessage){
            this.toastr.error('Notes: '+ response.erroMessage);
          }
          else if (response.dataModel && response.dataModel.length > 0) {
            this.notesList.set(response.dataModel);
            this.notesCount.set(response.rowCount);
          }
        },
        error: (_errMsg) => {
          this.isLoading.set(false);
        }
      });
    }
  }

    
  closeNewRecordEvent(e: any){
    if(Object.keys(this.jobProgress() ?? {}).length === 0 || this.jobProgress().progress === 100){
      this.closeNewRecord.emit(e)
    }
  }

  wfstatusEvent(event: string){
    this.wfstatus.set(event);
  }

  disablerecordEvent(event: boolean){
    this.disablerecord.set(event);
  }

  enableAttachmentEvt(event: boolean){
    this.enableAttachment.set(event);
  }

  enableDimensionEvt(event: boolean){
    this.enableDimension.set(event);
  }

  enableNoteEvt(event: boolean){
    this.enableNote.set(event);
  }

  enableCommentEvt(event: any){
    this.enableComment.set(event);
  }

  deletedRecordEvent(event: any){
    this.deletedRecord.emit(event)
  }

  otherReadonlyevent(e: any){
    this.isaLoading.set(true);
    this.readOnly.set(false);
    setTimeout(()=>{
      this.isaLoading.set(false);
    },100)
    if(e.readonly || e.disable){
      this.readOnly.set(e.readonly);
    }
  }

  approveCloseEvent(_e: any){
    this.approveClose.emit('close');
  }

  wfStatusUpdateEvt(_e: any){
    this.wfStatusUpdate.emit(_e);
  }

  otherUseremitEvt(e: any){
    this.otheruser = e;
  }

  closeComponentDetailEvt(e: any){
    this.closeComponentEmit.emit(e);
  }

  prerequisiteTypeEvent(e: any){
    this.enableReport.set(true);
    this.setTabs('report');
    this.prepage.set(e.page)
    this.prerequisiteType.emit(e)
  }

  dcidevt(e : any){
    this.store.pipe(select('companylist')).subscribe(data=>{
          let clist = data.list;
          if(this.companyID() !== 0 && this.companyID()){
            let a = clist.filter((x:any) => x.id === e);
            if(a[0].logo){
              this.clogo.set(a[0].logo)
            }
          }
    });
  }
}
