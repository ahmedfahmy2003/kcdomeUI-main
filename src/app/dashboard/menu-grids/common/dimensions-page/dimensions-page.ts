import { Component, DestroyRef, Input, OnInit, forwardRef, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationPage } from '../notification-page/notification-page';
import { WorkflowPage } from '../workflow-page/workflow-page';
import { AttachmentsPage } from '../attachments-page/attachments-page';
import { LogdataPage } from '../logdata-page/logdata-page';
import { NotesPage } from '../notes-page/notes-page';
import { AppService } from '../../../../services/common/common.service';
import { CommentsPage } from '../comments-page/comments-page';
import { DetailsPage } from '../details-page/details-page';
import { EditableGridTabs } from '../../../../common/editable-grid-tabs/editable-grid-tabs';
import { ToastrService } from 'ngx-toastr';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiResponse } from '../../../../shared/interface';

@Component({
  selector: 'dimensions-page',
  standalone: true,
  imports: [CommonModule, CommentsPage, EditableGridTabs, FormsModule, forwardRef(() => DetailsPage), WorkflowPage, NotesPage, AttachmentsPage, NotificationPage, LogdataPage],
  templateUrl: './dimensions-page.html',
  styleUrl: './dimensions-page.scss'
})
export class DimensionsPage implements OnInit {
  activeSubTab: string;
  showSubDetails: boolean;
  activeGridTab: string = '';
  subRecordId: any;
  @Input() menuId: number;
  @Input() recordId: number;
  companyID = input<number>(0);
  wfstatus = input<string>();
  subwfEnabledStatus: boolean;
  @Input() set _subwfEnabledStatus(value: boolean){
    this.subwfEnabledStatus = value;
  }
  get _subwfEnabledStatus(): boolean{
    return this.subwfEnabledStatus;
  }
  submrEnabledStatus = input<boolean>();
  @Input() disablerecord: boolean;
  @Input() recordList: any;
  readOnly: boolean;
  @Input() set _readOnly(value: boolean){
    this.readOnly = value;
  }
  get _readOnly(): boolean{
    return this.readOnly;
  }
  otheruser: boolean;
  @Input() set _otheruser(value: boolean){
    this.otheruser = value;
  }
  get _otheruser(): boolean{
    return this.otheruser;
  }
  drillDown: any;
  recordData: any;
  menulabel: any;
  menuaccess: any;
  autoOpen: boolean = true;
  itemlist: any;
  filecount: any;
  newRecord: boolean;
  recorddeleted: any = {id: 0, deleted: false};
  isLoading: boolean = false;
  isaLoading = signal<boolean>(false)
  
  constructor(private _http: AppService, private toastr: ToastrService, private destroyRef: DestroyRef){

  }

  ngOnInit(){
    //this.setTabs('grid');
    this.activeSubTab = 'grid';
    this.getAttachment();
    this.getmenuaccess();
  }

  setTabs(tabname: string){
    this.activeSubTab = tabname;
    if(tabname === 'grid'){
      this.autoOpen = false;
    }
    else if(tabname === 'rdetails'){
      this.activeGridTab = 'details';
    }
  }

  onRefresh(){
    this.activeSubTab = '';
    setTimeout(()=>{
      this.activeSubTab = 'grid';
    },200)
  }
  
  subRecordDetail(e: any){
    if(e.id){
      this.showSubDetails = true;
      this.subRecordId = e.id;
      this.activeSubTab = 'rdetails';
      this.activeGridTab = 'details';
      this.drillDown = e.drillDown;
      this.recordData = e.data;
      this.menulabel = e.label;
      this.menuaccess = e.menuaccess;
      this.newRecord = false;
    }
  }

  setGridTabs(e: any){
    this.activeGridTab = e;
  }

  fileCountEvent(e: any){
    this.getAllAttachment();
  }

  getallAttachmentsEvt(e: boolean){
    //this.cAllatt = e;
    if(e){
      this.getAllAttachment();
    }else{
      this.getAttachment();
    }
  }

  getAttachment(){
    let filter = 'menuId='+this.menuId+' and recordId='+this.recordId;
    let user =  JSON.parse(localStorage.getItem('user') || '');
    //let url = 'Sys/GetSysAttachments?FilterCondition='+filter+'&pageNumber=1&PageSize=100';
    let url = 'Sys/GetAllSysAttachments?IsAllAttachments=false&menuId='+this.menuId+'&RecordId='+this.recordId+'&ApplicationId='+user.applicationID;

    this._http.getClient<ApiResponse>(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next:(response)=>{
        if (response.dataModel && response.dataModel.length > 0) {
          this.itemlist = response.dataModel;
          this.filecount = response.rowCount;
        }
      },
      error:(_error)=>{

      }
    })
  }

  getAllAttachment(){
    let user =  JSON.parse(localStorage.getItem('user') || '');
    let url = 'Sys/GetAllSysAttachments?IsAllAttachments=true&menuId='+this.menuId+'&RecordId='+this.recordId+'&ApplicationId='+user.applicationID;
   
    this._http.getClient<ApiResponse>(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next:(response)=>{
        this.isLoading = true;
        setTimeout(()=>{
          this.isLoading = false;
        })
        if(response.erroMessage){
          this.toastr.error('All Attachment: '+ response.erroMessage);
        }
        else if (response.dataModel && response.dataModel.length > 0) {
          this.itemlist = response.dataModel;
          this.filecount = response.rowCount ? response.rowCount: this.itemlist.length;
        }else{
          this.itemlist = '';
          this.filecount = 0;
        }
      },
      error:(_error)=>{
        this.isLoading = false;
      }
    })
  }

  getmenuaccess(){
    const lang = JSON.parse(localStorage.getItem('lang') || '');
    if(this.activeGridTab === 'dimensions'){
      this.menuId = 7023
    }
    const url = 'Sys/GetSysMenuAccess?menuId=7023&languageId=' + lang;
    this.isaLoading.set(true);
    this._http.getClient<ApiResponse>(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        if (response.dataModel && response.dataModel.length > 0) {
          let res = response.dataModel[0];
          this.menuaccess = res;
        }
        this.isaLoading.set(false);
      },
      error: (_errMsg) => {

      }
    });
  }

  addNewRecord(){
    this.newRecord = true;
    this.showSubDetails = false;
    this.activeSubTab = 'newrecord';
    let a = JSON.parse(this.menulabel);
    this.menulabel = JSON.stringify(a);
  }

  deletedRecordEvent(e: any){
    this.setTabs('grid');
    this.showSubDetails = false;
    this.recorddeleted = {id: e.menuid, deleted: true};
  }

  newSubRecordIdEvent(e: any){

  }
}
