import { Component, DestroyRef, effect, Input, input, OnInit, output, signal } from '@angular/core';
import { AppService } from '../../../../services/common/common.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { ModalService } from '../../../../services/common/modal.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiResponse } from '../../../../shared/interface';

@Component({
  selector: 'attachments-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attachments-page.html',
  styleUrl: './attachments-page.scss'
})
export class AttachmentsPage implements OnInit {
  @Input() menuId: number;
  callAtt = input<boolean>(true);
  @Input() recordId: number;
  @Input() companyID: number;
  fileCountNew = output<boolean>();
  getallAttachments = output<boolean>();
  itemlist: any
  @Input() set _itemlist(value: any){
    this.itemlist = value;
    if(this.itemlist && this.itemlist.length > 0){
      this.sortItemList();
    }
  }

  get _itemlist(): any{
    return this.itemlist;
  }
  reportURL: any;
  openImg = signal<boolean>(false);
  filesize: number;
  atotalCount: number;
  @Input() set totalCount(value: number){
    this.atotalCount = value;
  }
  get totalCount(): number{
    return this.atotalCount;
  }
  @Input() page: any;
  wfstatus = input<string>();
  @Input() disablerecord: boolean;
  enableAttachment = input<boolean>(true);
  readOnly = input<boolean>(false);
  currentAll = signal<boolean>(true);
  public categoryList: any;
  public addNewSection: boolean = false;
  public attachmentCategory: any;
  public fileLink: any;
  file: File[] = [];
  fileName: string;
  fileSize: any;
  description: any;
  filePath: any;
  itemid: number;
  userid: number;
  recordStamp = new Date().getTime();
  dateTimeFormat: any;
  constructor(private _http: AppService, public sanitizer: DomSanitizer,  private toastr: ToastrService, public modal: ModalService, private destroyRef: DestroyRef) {
    effect(()=>{
      this.currentAll.set(this.callAtt());
    })
  }

  ngOnInit(){
    const user = JSON.parse(localStorage.getItem('user') || '');
    this.userid = user.id;
    this.getAttachmentCategories();
    this.dateTimeFormat = this._http.getDateTimeFormat();
  }

  getAttachmentCategories(){
    let url = 'Sys/GetSysAttachmentCategories?pageNumber=1&PageSize=1000';
    this._http.getClient<ApiResponse>(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next:(response)=>{
        if (response.dataModel && response.dataModel.length > 0) {
          this.categoryList = response.dataModel;
        }
      },
      error:(_error)=>{

      }
    })
  }

  showHideNew(){
    this.addNewSection = !this.addNewSection;
  }

  closeSection(){
    this.addNewSection = false;
    if(this.fileName){
      this.clearFile();
    }
  }

  sortItemList(){
    this.itemlist.forEach((x: any)=>{
      let a = x.FileName.split('.');
      let b = ['jpg','jpeg','gif','png','jfif','svg','pdf'];
      let c = b.includes(a[1]);
      if(c){
        x.fileOpen = true;
      }else{
        x.fileOpen = false;
      }
    })
  }

  AddAttachment(){
    if(this.fileName && this.attachmentCategory){
      const user = JSON.parse(localStorage.getItem('user') || '');
      let params: any = {
        "menuId": this.menuId,
        "companyId": this.companyID,
        "userId": user.id.toString(),
        "userName": user.userName,
        "recordId": this.recordId.toString(),
        "data": []
      }
      let dataparams: any = '';
      let url = 'Sys/CreateSysAttachmentsBulk';
      this.file.forEach(file => {
        dataparams = {
          "id": 0,
          "applicationId": user.applicationID,
          "menuId": this.menuId,
          "recordId": this.recordId.toString(),
          "categoryId": this.attachmentCategory,
          "description":  this.description,
          "fileName": file.name,
          "filePath": "",
          "attachmentFile": "",
          "urlLink": "",
          "createdBy": user.id,
          "createdDate": new Date().toISOString()
        }
        params.data.push(dataparams); 
      })
      this._http.postClient(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next:(_response) => {
          this.addNewSection = false;
          this.fileCountNew.emit(true);
        },
        error: (_error) => {

        }
      })
    }else{
      if(!this.attachmentCategory){
        this.toastr.error('Please attach attachment category');
      }else{
        this.toastr.error('Please attach a file');
      }
    }
  }

  handleFileInput(event: any){
    const input = event.target as HTMLInputElement;
    this.filesize = 0;
    let formParams: any = new FormData();
    let error = 0;
    //this.file = event.target.files[0];
    if (input.files) {
      this.file = Array.from(input.files); // store files in array
    }

    let fileName = [];

    this.file.forEach(file => {
      fileName.push(file.name);
      let fn = file.name;
      let a = fn.split('.');
      let ext = a[1].toLowerCase();
      let b = ['jpg','jpeg','gif','png','jfif','svg','txt','doc','xls','ppt','docx','xlsx','pptx','pdf'];
      let c = b.includes(ext);

      if(a.length > 2){
        this.toastr.error('Filename must have only one dot');
        this.fileName = '';
        error++;
      }
      else if(!c){
        this.toastr.error('File type not allowed');
        this.fileName = '';
        this.fileSize = '';
        error++;
      }
      else if(file.size > 9437184){
        this.toastr.error('Max file size 9mb');
        this.fileName = '';
        this.fileSize = '';
        error++;
      }else{
        this.filesize = this.filesize + file.size;
        formParams.append('files', file);
        this.fileName = fileName.toString();
        this.fileName = this.fileName.replaceAll(',',', ')
      }
      
    });
    event.target.value = '';
    //this.fileName = input.name;
    
    if(this.filesize > 9437184){
      this.toastr.error('Max file size 9mb');
      this.fileName = '';
      this.fileSize = '';
    }else if(error === 0){
      let _size = this.filesize;
      let fSExt = new Array('Bytes', 'KB', 'MB', 'GB'),i=0;
      while(_size>900){_size/=1024;i++;}
      this.fileSize = (Math.round(_size*100)/100)+' '+fSExt[i];
      const user = JSON.parse(localStorage.getItem('user') || '');
      let url = 'FileUpload/SysAttachmentsBulkUploadFile';
     for (const pair of formParams.entries()) {

}
      this._http.postClient<any, ApiResponse>(url, formParams).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next:(response) => {
        this.filePath = response.filePath;
      },
      error: (_error) => {

      }
    })
    }
  }

  clearFile(){
    //this.file = '';
    //let filename = this.fileName;
    this.fileSize = '';
    const user = JSON.parse(localStorage.getItem('user') || '');
  

    this.file.forEach(file => {
      let url = 'FileUpload/DeleteFile?fileName='+ file.name;
        this.fileName = '';
        this._http.postClient(url, {}).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((_data:any)=>{ 
        
        });
    });
  }

  openFile(){

  }

  downloadFile(id: number, file: string, type: any){
    let url = 'Sys/DownloadSysAttachmentFile?id='+id;
    /*this._http.getFile(url).subscribe((data:any)=>{
      var downloadURL = window.URL.createObjectURL(data.dataModel.attachmentFile);
      var link = document.createElement('a');
      link.href = downloadURL;
      link.download = file;
      link.click();
    });*/
    this._http.getClient<ApiResponse>(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response: any)=>{
        if( response.dataModel){
        let downloadURL = response.dataModel.attachmentFile;
            var byteCharacters = atob(downloadURL);
            var byteNumbers = new Array(byteCharacters.length);
            for (var i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            var byteArray = new Uint8Array(byteNumbers);

            let a = response.dataModel.fileName.split('.');
            let ctype:any = '';

            if(a[1] === 'pdf'){
              ctype = 'application/pdf;base64'
            }
            else if(a[1] === 'png'){
              ctype = 'image/png;base64'
            }
            else if(a[1] === 'gif'){
              ctype = 'image/gif;base64'
            }
            else if(a[1] === 'svg'){
              ctype = 'image/svg+xml;base64'
            }
            else if(a[1] === 'jpg' || a[1] === 'jpeg' || a[1] === 'jfif'){
              ctype = 'image/jpg;base64'
            }
            else if(a[1] === 'doc'){
              ctype = 'application/msword;base64'
            }
            else if(a[1] === 'docx'){
              ctype = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64'
            }
            else if(a[1] === 'xls'){
              ctype = 'application/vnd.ms-excel;base64'
            }
            else if(a[1] === 'xlsx'){
              ctype = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64'
            }
            else if(a[1] === 'ppt'){
              ctype = 'application/vnd.ms-powerpoint;base64'
            }
            else if(a[1] === 'pptx'){
              ctype = 'application/vnd.openxmlformats-officedocument.presentationml.presentation;base64'
            }

            let file = new Blob([byteArray], { type: ctype });
            if(type === 'download'){
              let durl = window.URL.createObjectURL(file);

              let link: any = document.createElement('a');
              link.href = durl;
              link.download = response.dataModel.fileName;
              link.click();
            }else{
              this.reportURL = (window.URL || window.webkitURL).createObjectURL(file);
      
              this.reportURL = this.sanitizer.bypassSecurityTrustResourceUrl(this.reportURL);

              if(a[1] === 'pdf'){
                this.openImg.set(false);
              }else{
                this.openImg.set(true);
              }

              this.modal.show('fileModal'+this.recordId)

            }

          }else{
            this.toastr.error(response.erroMessage)
          }
      },
      error: (_e)=>{

      }
    })
  }

  deleteRecord(item: any){
    const user = JSON.parse(localStorage.getItem('user') || '');
    if(item.CreatedBy === user.id && !this.readOnly() && !this.disablerecord){
      this.itemid = item.Id;
      this.modal.show('deleteModalAttachment'+this.recordStamp);   
    }
  }

  deleteConfirm(id: number){
    let url = 'Sys/DeleteSysAttachments?id='+id;
    this._http.deleteClient(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((_data:any)=>{ 
      this.fileCountNew.emit(true);
      this.closeModal();
    });
  }

  getAllAttachments(){
    this.getallAttachments.emit(this.currentAll())
  }

  closeModal(){
    this.modal.hide();
  }
}
