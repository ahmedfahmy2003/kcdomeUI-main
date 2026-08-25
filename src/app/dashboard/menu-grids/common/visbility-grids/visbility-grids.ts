import { Component, DestroyRef, effect, input, OnInit, output, signal } from '@angular/core';
import { AppService } from '../../../../services/common/common.service';
import { CommonModule } from '@angular/common';
import { CdkDrag, CdkDragDrop, CdkDragPlaceholder, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ModalService } from '../../../../services/common/modal.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiResponse } from '../../../../shared/interface';

@Component({
  selector: 'visbility-grids',
  standalone: true,
  imports: [CommonModule, FormsModule, CdkDropList, CdkDrag, CdkDragPlaceholder],
  templateUrl: './visbility-grids.html',
  styleUrl: './visbility-grids.scss'
})
export class VisbilityGrids implements OnInit {
  menuid = input();
  vList = signal<any>([]);
  vlist = input();
  companyID = input<number>(0);
  getDataResposne = input<any>();
  ids = input<any>();
  refreshTable = output<boolean>();
  selectAll = signal<boolean>(false);
  updateLayout: boolean;
  layoutID: number = 0;
  defaultLayout: string = 'default';
  errorMsg = signal<string>('');
  sortCol: boolean;

  constructor(private _http: AppService, public toastr: ToastrService, public modal: ModalService, private destroyRef: DestroyRef){
    effect(()=>{
      this.vList.set(this.vlist());
    })
  }

  ngOnInit(){
  }

  getLayOut(){
          
    let res = this.getDataResposne();
    if(res && res.ID){
      this.updateLayout = true;
      this.layoutID = res.ID;
      this.defaultLayout = res.LayoutName;
            this.vList.update(list =>
              list.map((e:any) => {
                const hide = !res.ColLayout.includes(e.id);
                if (hide) this.sortCol = true;
                return { ...e, hide };
              })
            );
            if(this.sortCol){
                this.vList.update(list =>
                  [...list].sort((a, b) => Number(a.hide) - Number(b.hide))
                );
            } 
    }else{
      this.updateLayout = false;
      this.layoutID = 0;
    }
  }

  selecEvent(){
    if(this.selectAll()){  
      this.vList.update(list => list.map((e:any) => ({ ...e, hide: true })));
    }else{
      this.vList.update(list => list.map((e:any) => ({ ...e, hide: false })));
    }
  }

  visibilityPopup(id: any){
    this.closeModal();
    this.selectAll.set(false);
    this.modal.show(id)
    this.getLayOut();
  }

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.vList(), event.previousIndex, event.currentIndex);
  }

  closeModal(){
    this.modal.hide();
  }

  updateModal(){
    let vlist = this.vList().filter((e:any) => !e.hide).map((e:any) => e.id);
    this.sortCol = false;
    let listv = vlist.toString();

    if(!listv){
      this.toastr.error('Atleast one must be visible');
    }
    else{
    const user = JSON.parse(localStorage.getItem('user') || '');    
    const lang = JSON.parse(localStorage.getItem('lang') || '');
    let url;
    let params = {
      "id": this.layoutID,
      "companyId": this.companyID(),
      "userId": user.id,
      "menuId": this.menuid(),
      "layoutName": this.defaultLayout,
      "colLayout": listv
    }

      url = 'Sys/CreateSysUserMenuLayout?MenuId='+this.menuid()+'&companyId='+this.companyID()+'&userId='+user.id+'&languageID='+lang;
      this._http.postClient<any, ApiResponse>(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (response)=>{
          if(response.erroMessage){
            this.closeModal();
            setTimeout(()=>{
              this.errorMsg.set(response.erroMessage ?? '');
              this.modal.show('errorModal'+this.ids()); 
            }, 50)
          }else{
            this.refreshTable.emit(true);
          }
        },
        error: (_e)=>{

        }
      })
    //}
    this.modal.hide();
    }
  }
}
