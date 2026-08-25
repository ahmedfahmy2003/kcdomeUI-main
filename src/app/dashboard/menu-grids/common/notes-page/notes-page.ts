import { CommonModule } from '@angular/common';
import { Component, DestroyRef, effect, EventEmitter, input, Input, Output, signal } from '@angular/core';
import { AppService } from '../../../../services/common/common.service';
import { FormControl, FormsModule } from '@angular/forms';
import {MatDatepickerInputEvent, MatDatepickerModule} from '@angular/material/datepicker';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import { ModalService } from '../../../../services/common/modal.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'notes-page',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDatepickerModule],
  providers: [provideMomentDateAdapter(undefined, {useUtc:true}),{provide: MAT_DATE_LOCALE, useValue: 'en-IN'}],
  templateUrl: './notes-page.html',
  styleUrl: './notes-page.scss'
})
export class NotesPage {
    categoryList: any = [
      {
          "Description": "General",
          "ID": 1
      },
      {
          "Description": "Email",
          "ID": 2
      },
      {
          "Description": "Call",
          "ID": 3
      },
      {
          "Description": "Meeting",
          "ID": 4
      }
    ];
  @Input() menuId: number;
  enableNote = input<boolean>(true);
  @Input() notesCount: number;
  _notesList = signal<any>([]);
  @Input() set notesList(value: any){
    this._notesList.set(value);
    this.setupNotes();
  }
  get noteList(): any{
    return this._notesList();
  }
  readOnly = input<boolean>(false);
  @Input() page: any;
  wfstatus = input<string>('');
  @Input() companyID: number;
  @Input() recordId: any;
  @Output() fileCountNote = new EventEmitter;
  addNewSection = signal<boolean>(false);
  noteCategory = signal<any>(null);
  description: any;
  followupDate: any = new Date();
  date = new FormControl(new Date());
  privateFlag: boolean = false;
  reminderDate: any = new Date();
  itemid: number;
  editdescription: any;
  editnoteCategory: any;
  editnoteDate: any = new Date();
  editCompleted: any;
  editPrivateFlag: any;
  editCreatedDate: any;
  editCreatedBy: any;
  descText: string;
  dateFormat: any;
  dateTimeFormat: any;
  recordStamp = new Date().getTime();

  constructor(private _http: AppService, public modal: ModalService, private destroyRef: DestroyRef) {

  }

  ngOnInit(){
  this.dateFormat = this._http.getDateFormat();
  this.dateTimeFormat = this._http.getDateTimeFormat();
  }

  setupNotes(){
      
      if(this._notesList() && this._notesList().length > 0){
        this._notesList.update( list =>
          list.map((x:any) => {
            const match = this.categoryList.find(
              (e: any) => e.ID === parseInt(x.NoteTypeID)
            );
            return {
              ...x,
              NoteType: match ? match.Description : ''
            };
          })
        );
      }
  }

  showHideNew(){
    this.addNewSection.update(v => !v);
  }

  closeSection(){
    this.addNewSection.set(false);
  }

  addEvent(_type: string, event: MatDatepickerInputEvent<Date>) {
    if(event.value){
      let a:any = event.value;
      if(_type === 'edit'){
        this.editnoteDate = new Date(a)
      }
      else{
        this.reminderDate = new Date(a)
      }
    }
  }

  addNotes(type: boolean){
    if(!this.noteCategory()){
      alert("Please select a category");
    }else{
      const user = JSON.parse(localStorage.getItem('user') || '');
      let url = 'Sys/CreateSysNotes?MenuId='+this.menuId+'&companyId='+this.companyID+'&userId='+user.id+'&userName='+user.userName+'&recordId='+this.recordId;
      let params = {
        "id": 0,
        "companyId": this.companyID,
        "menuId": this.menuId,
        "recordId": this.recordId.toString(),
        "description": this.description,
        "createdBy": user.id,
        "privateFlag": type,
        "createdDate": new Date(),
        "reminderDate": this.reminderDate,
        "noteTypeId": this.noteCategory(),
      }

      this._http.postClient(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next:(_response)=>{
          this.getNotes();
        }
      })
    }
  }

  getNotes(){
    this.addNewSection.set(false);
    this.fileCountNote.emit(true);
    /*const url = 'Sys/GetSysNotes?menuId=' + this.menuId + '&RecordID=' + this.recordId();
    this._http.getClient<any, ApiResponse>(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        if (response.dataModel && response.dataModel.length > 0) {
          this.notesList = response.dataModel;
          this.notesCount = response.rowCount;
          this.notesList.forEach((x:any)=>{
            let a = this.categoryList.filter((e: any)=> {return e.ID === parseInt(x.NoteTypeID)});
            x.NoteType = a[0].Description;
          })
        }
      },
      error: (_errMsg) => {
      }
    });*/
  }

  editNote(item: any, modal: string){
    this.itemid = item.ID;
    this.modal.show(modal+this.recordStamp);  

    if(modal === 'editModalNote'){
      this.editdescription = item.Description;
      this.editnoteCategory = item.NoteTypeID;
      this.editnoteDate = item.ReminderDate;
      this.editCompleted = item.Completed;
      this.editPrivateFlag = item.PrivateFlag;
      this.editCreatedDate = item.CreatedDate;
      this.editCreatedBy = item.CreatedBy;
    }
  }

  closeModal(){
    this.modal.hide();
  }

  deleteConfirm(id: number){
    let url = 'Sys/DeleteSysNotes?id='+id;
    this._http.deleteClient(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((_data:any)=>{ 
      this.closeModal();
      this.fileCountNote.emit(true);
    });
  }

  updateNotes(type: boolean){
    if(!this.editnoteCategory){
      alert("Please select a category");
    }else{
      const user = JSON.parse(localStorage.getItem('user') || '');
      let url = 'Sys/UpdateSysNotes';
      let params = {
        "id": this.itemid,
        "companyId": this.companyID,
        "menuId": this.menuId,
        "recordId": this.recordId.toString(),
        "description": this.editdescription,
        "createdBy": this.editCreatedBy,
        "privateFlag": this.editPrivateFlag,
        "createdDate": this.editCreatedDate,
        "reminderDate": this.editnoteDate,
        "noteTypeId": this.editnoteCategory,
        "completed": type,
        "completedDate": new Date()
      }

      this._http.putClient(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next:(_response)=>{
          this.closeModal();
          this.getNotes();
        }
      })
    }
  }

  openDescription(text: string){
    this.descText = text;
    this.modal.show('desc'+this.recordStamp);
  }
}
