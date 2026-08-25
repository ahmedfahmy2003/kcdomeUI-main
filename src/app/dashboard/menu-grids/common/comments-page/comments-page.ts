import { CommonModule } from '@angular/common';
import { Component, DestroyRef, EventEmitter, input, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppService } from '../../../../services/common/common.service';
import { ModalService } from '../../../../services/common/modal.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';
import { itemDataAxisNames } from 'devexpress-dashboard/data';
import { timeBoxEditor } from 'devexpress-dashboard/designer/form-adapter/_form-adapter-editors';

@Component({
  selector: 'comments-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comments-page.html',
  styleUrl: './comments-page.scss'
})
export class CommentsPage {
  enableComment = input<boolean>(true);
  wfstatus = input<string>('');
  readOnly = input<boolean>(false);
  addNewSection = signal<boolean>(false);
  @Input() page: any;
  @Input() companyID: number;
  @Output() fileCountComment = new EventEmitter;
  @Input() commentsCount: number;
  @Input() menuId: number;
  dateFormat: any;
  dateTimeFormat: any;
  @Input() recordId: any;
  description: any;
  _commentsList = signal<any>([]);
  @Input() set commentsList(value: any){
    this._commentsList.set(value);
  }
  get commentsList(): any{
    return this._commentsList();
  }

  descText = signal<string>('');
  itemid: number;
  editCompleted: any;
  editdescription: any;
  sequence: any;
  parentCommentId: any;
  editCreatedBy: any;
  editCreatedDate: any;

  constructor(private _http: AppService, public modal: ModalService, private destroyRef: DestroyRef, private toastr: ToastrService) {
  }
  
  ngOnInit(){
    this.dateFormat = this._http.getDateFormat();
    this.dateTimeFormat = this._http.getDateTimeFormat();
  }

  showHideNew(){
    this.addNewSection.update(v => !v);
  }

  closeSection(){
    this.addNewSection.set(false);
  }

  getComments(){
    this.addNewSection.set(false);
    this.fileCountComment.emit(true);
  }

  addComment(){
     if(!this.description){
      this.toastr.error("Comment is empty")
    }else{
      const user = JSON.parse(localStorage.getItem('user') || '');
      let url = 'Sys/CreateSysMenuComments?MenuId='+this.menuId+'&companyId='+this.companyID+'&userId='+user.id+'&userName='+user.userName+'&recordId='+this.recordId;
      let params = {
        "id": 0,
        "companyId": this.companyID,
        "menuId": this.menuId,
        "recordId": this.recordId.toString(),
        "description": this.description,
        "createdUser": user.id,
        "createdDate": new Date()
      }

      this._http.postClient(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next:(_response)=>{
          this.getComments();
        }
      })
    }
  }

  openDescription(text: string){
    this.descText.set(text);
    this.modal.show('desc'+this.recordId);
  }

  closeModal(){
    this.modal.hide();
  }

  deleteConfirm(id: number){
    let url = 'Sys/DeleteSysMenuComments?id='+id;
    this._http.deleteClient(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((_data:any)=>{ 
      this.closeModal();
      this.fileCountComment.emit(true);
    });
  }

    updateComment(){
   if(!this.editdescription){
      this.toastr.error("Comment is empty")
    }else{
      const user = JSON.parse(localStorage.getItem('user') || '');
      let url = 'Sys/UpdateSysMenuComments';
      let params = {
        "id": this.itemid,
        "companyId": this.companyID,
        "description": this.editdescription,
        "sequence": this.sequence,
        "menuId": this.menuId,
        "recordId": this.recordId.toString(),
        "parentCommentId": this.parentCommentId,
        "createdUser": this.editCreatedBy,
        "createdDate": this.editCreatedDate,
        "modifiedDate": new Date()
      }

      this._http.putClient(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next:(_response)=>{
          this.closeModal();
          this.getComments();
        }
      })
    }
  }

  editComment(item: any, modal: string){
    this.itemid = item.id;
    this.modal.show(modal+this.recordId);  
    if(modal === 'editModalComment'){
      this.editdescription = item.description;
      this.sequence = item.sequence;
      this.parentCommentId = item.parentCommentId;
      this.editCreatedBy = item.createdUser;
      this.editCreatedDate = item.createdDate;
    }
  }

}
