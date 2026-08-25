import { CommonModule } from '@angular/common';
import { Component, DestroyRef, effect, input, output, signal, untracked} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppService } from '../../services/common/common.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import {CdkDrag, CdkDragHandle} from '@angular/cdk/drag-drop';
import { AngularResizeEventModule, ResizedEvent } from 'angular-resize-event-package';
import { UiDashboardLayout } from './ui-dashboard-layout/ui-dashboard-layout';
import { ModalService } from '../../services/common/modal.service';
import { LoaderService } from '../../services/common/loader.service';
import { MatMenuModule } from '@angular/material/menu';
import { ApiResponse } from '../../shared/interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Appointment } from 'devextreme/ui/scheduler';

@Component({
  selector: 'ui-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTooltipModule, CdkDrag, CdkDragHandle, MatMenuModule, AngularResizeEventModule, UiDashboardLayout],
  templateUrl: './ui-dashboard.html',
  styleUrl: './ui-dashboard.scss'
})
export class UIDashboard {
  editBtn = input<boolean>(false);
  disableBtn = signal<boolean>(true);
  ismLoading = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  loadDiv = signal<number>(0);
  companyID = input<number>(0);
  
  templateData: any = [];
  templateName = input<string>();
  templateID: number | undefined;
  _templateID = input<number>()
  editBtnEmit = output<boolean>();
  moduleList = signal<any>([]);
  moduleListRaw: any = [];
  searchList: string = '';
  mulitSelectList: any = [];
  dragWidget = signal<any>([]);
  dragWidgetTemp: any = [];
  childID = signal<number>(0);

  constructor(public _http: AppService, public modal: ModalService, public loader: LoaderService, private destroyRef: DestroyRef){
    effect(()=>{
      this.templateID = this._templateID();
      if(!this.editBtn() && (this.templateID || this.templateID === 0)){
        this.getTemplateData();
      }
    })
  }

  getTemplateData(){
    let url;
    if(this.templateID){
      url = 'Dashboard/GetTemplateDashboardData?TemplateId='+this.templateID;
    }
    else{
      url = 'Dashboard/GetUserDashboards';
    }
    this.ismLoading.set(true);
    this._http.getClient<ApiResponse>(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next:(response)=>{
        this.ismLoading.set(false);
        if(response.dataModel && response.dataModel.length >0){
          let a = response.dataModel;
          a.forEach((x: any)=>{
            let b = x.DashboardPosition.split(',');
            x.position = {x: b[0], y: b[1]};
            x.position.x = x.position.x.replaceAll('px','');
            x.position.x = parseInt(x.position.x);
            x.position.y = x.position.y.replaceAll('px','');
            x.position.y = parseInt(x.position.y);
            x.transform = b[0]+","+ b[1]+", 0px";
            let c = x.DashboardSize.split(',');
            x.size = {width: c[0]+'px', height: c[1]+'px'};
            x.removed = 'no';
          })
          this.templateData = a;
          if(this.templateID){
            this.getPopUpData('');
          }
          this.getDashboardData();
        }else{
          this.templateData = [];
          this.dragWidgetTemp = [];
          this.dragWidget.set([])
        }
      },
      error: (_e)=>{
        this.ismLoading.set(false);
      }
    })
  }

  getDashboardData(){
    this.dragWidgetTemp = [];
    if(this.templateData && this.templateData.length > 0){
    let j = 0;
    this.templateData.forEach((x: any)=>{ 
      const user = JSON.parse(localStorage.getItem('user') || '');
        const lang = JSON.parse(localStorage.getItem('lang') || '');
      this.ismLoading.set(true);
        let url = 'Dashboard/GetDashboardQueryData?id='+x.DashboardID+'&languageid='+lang+'&Companyid='+this.companyID()+'&applicationid='+user.applicationID;
        this._http.getClient<ApiResponse>(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: (res)=>{
            this.ismLoading.set(false);
            let response = res;
            let description: any =[];
            if(response.dataModel){
              description.push({id: x.DashboardID, value: x.Description});

              this.moduleListRaw.forEach((b: any)=>{
                if(b.ParentDashboardID === x.DashboardID){
                  description.push({id: b.ID, value: b.Description})
                }
              });
              
              this.dragWidgetTemp.push({id: x.DashboardID, rid: x.DashboardID, widget: x, type: 'existing', title: description, setTitle: description[0].value, model: response.dataModel.length > 0 ? response.dataModel : '', position: x.position, size: x.size, transform: x.transform});
              
              j++;
              if(j === this.templateData.length){
                this.dragWidget.set(this.dragWidgetTemp);
              }
            }
          },
          error: (_e: any)=>{
            this.ismLoading.set(false);
          }
        })
      })
    }
  }

  resetgetDashboardData(){
    if(this.templateData && this.templateData.length > 0){
      this.templateData.forEach((x: any)=>{ 
        if(x.removed === 'yes'){
          const user = JSON.parse(localStorage.getItem('user') || '');
          const lang = JSON.parse(localStorage.getItem('lang') || '');
          let url = 'Dashboard/GetDashboardQueryData?id='+x.DashboardID+'&languageid='+lang+'&Companyid='+this.companyID()+'&applicationid='+user.applicationID;
          this._http.getClient<ApiResponse>(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
              next: (res)=>{
                let response = res;
                let description: any = [];
                if(response.dataModel){
                  description.push({id: x.DashboardID, value: x.Description});
                  this.moduleListRaw.forEach((b: any)=>{
                    if(b.ParentDashboardID === x.DashboardID){
                      description.push({id: b.ID, value: b.Description})
                    }
                  });
                  x.removed = 'no';
                  this.dragWidget.update(e => [...e, {id: x.DashboardID, rid: x.DashboardID, widget: x, type: 'existing', title: description, setTitle: description[0].value, model: response.dataModel.length > 0 ? response.dataModel : '', position: x.position, size: x.size, transform: x.transform}])
                }
              }
            })
          }
        })
    }
  }

  resetAll(){
    this.childID.set(0);
    this.resetgetDashboardData();
    this.disableBtn.set(true);
    this.editBtnEmit.emit(false);
  }

  openPopUp(){
    this.loader.show();
    this.getPopUpData('modal');
  }

  getPopUpData(modal: string){
    this.mulitSelectList = [];
    
      const user = JSON.parse(localStorage.getItem('user') || '');
      let url = 'DashBoard/GetDashboardPopUpData?companyID='+this.companyID();

      this._http.getClient<ApiResponse>(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (response)=>{
          if(this.loader.isLoading()){
            this.loader.hide()
          }
          if(response.dataModel && response.dataModel.length > 0){
            this.moduleListRaw = response.dataModel;
            this.moduleList.set(this.moduleListRaw.filter((e:any)=> {return e.ParentDashboardID === null}));
            let modulelist = this.moduleListRaw.filter((e:any)=> {return e.ParentDashboardID === null});
            modulelist.forEach((x: any)=>{
              x.checked = false;
            })

            this.moduleList.set(modulelist);

            if(this.templateData && this.templateData.length > 0){
              this.templateData.forEach((x: any)=>{
                let index = this.moduleList().findIndex((a:any) => a.ID === x.DashboardID);
                if(index >= 0 && x.removed !== 'yes'){
                  this.moduleList.update(list => {
                    const copy = [...list];
                    copy[index] = { ...copy[index], checked: true };
                    return copy;
                  });
                }
              })
            }

            if(this.dragWidget().length > 0){
              this.moduleList.update((modules: any) => {
                const widgetIds = this.dragWidget().map((w: any) => w.id);

                return modules.map((m:any)=> ({
                  ...m,
                  checked: widgetIds.includes(m.ID)
                }));
              });
            }
            if(modal){
              this.modal.show('mlist');
            }
          }
        },
        error: (e: any)=>{
          if(this.loader.isLoading()){
            this.loader.hide()
          }
        }
      })
  }

  okModal(){
    this.modal.hide();
    if(this.mulitSelectList.length > 0){
      this.mulitSelectList.forEach((x: any)=>{
        const user = JSON.parse(localStorage.getItem('user') || '');
        const lang = JSON.parse(localStorage.getItem('lang') || '');
        let url = 'Dashboard/GetDashboardQueryData?id='+x.ID+'&languageid='+lang+'&Companyid='+this.companyID()+'&applicationid='+user.applicationID;
        this._http.getClient<ApiResponse>(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: (res)=>{
            let response = res;
            let description: any =[];
            //let a = this.moduleListRaw.findIndex((b: any)=> b.ParentDashboardID === x.ID);
            if(response.dataModel){
              description.push({id: x.ID, value: x.Description});
              this.moduleListRaw.forEach((b: any)=>{
                if(b.ParentDashboardID === x.ID){
                  description.push({id: b.ID, value: b.Description})
                }
              });
              this.disableBtn.set(false);
              this.dragWidget.update(e=>[...e, {id: x.ID, rid: x.ID, type: 'new', widget: x, title: description, setTitle: description[0].value, model: response.dataModel.length > 0 ? response.dataModel : '', position: {x: 0, y: 0}, size: '400, 200'}]);
            }
          }
        })
      })
    }
  }

  closeModal(){
    this.mulitSelectList = [];
    this.modal.hide();
  }

  setMultiSelect(e: any, i: number){
    if(e.target.checked){
      this.moduleList.update(list => {
        const copy = [...list];
        copy[i] = { ...copy[i], checked: true };
        return copy;
      });
      this.mulitSelectList.push(this.moduleList()[i])
    }
    else{
      this.moduleList.update(list => {
        const copy = [...list];
        copy[i] = { ...copy[i], checked: false };
        return copy;
      });
      const index = this.mulitSelectList.findIndex((x:any) => x.ID === this.moduleList()[i].ID);
      if(index >=0){
        this.mulitSelectList.splice(index, 1);
      }else{
        const dindex = this.dragWidget().findIndex((x:any) => x.id === this.moduleList()[i].ID);
        if(dindex >=0){
          this.dragWidget().splice(dindex, 1);
        }
        //this.clsoeWidget(item);
      }
    }
  }

  applyFilter(event: string) {
    if(event.trim()){
      this.moduleList.set(this.moduleListRaw.filter((e: any)=> { return e.ParentDashboardID === null && e.Description.toLowerCase().search(event) !== -1 }));
      if(this.dragWidget().length > 0){
        this.moduleList.update((modules: any) => {
          const widgetIds = this.dragWidget().map((w: any) => w.id);

          return modules.map((m:any) => ({
            ...m,
            checked: widgetIds.includes(m.ID)
          }));
        });
      }
    }else{
      this.moduleList.set(this.moduleListRaw.filter((e:any)=> {return e.ParentDashboardID === null}));
      if(this.dragWidget().length > 0){
        this.moduleList.update((modules: any) => {
          const widgetIds = this.dragWidget().map((w: any) => w.id);

          return modules.map((m:any) => ({
            ...m,
            checked: widgetIds.includes(m.ID)
          }));
        });
      }
    }
  }

  onDragEnd(event: any, i: number){
    
    let info: any = document.getElementById('gridarea')?.getBoundingClientRect();
    let binfo: any = document.getElementById('box'+i)?.getBoundingClientRect();

    if(binfo.width > info.width){
      let b: any = document.getElementById('box'+i);
      b.style.width = info.width+'px';
    }

    if(binfo.height > info.height){
      let b: any = document.getElementById('box'+i);
      b.style.height = info.height+'px';
    }

    let dx = this.dragWidget()[i].position.x + event.distance.x;
    let dy = this.dragWidget()[i].position.y + event.distance.y;

    if(dx > (info.width - binfo.width)){
      dx = (info.width - binfo.width)
    }
    
    if(dx < 0){
      dx = 0
    }

    if(dy > (info.height - binfo.height)){
      dx = (info.height - binfo.height)
    }

    
    if(dy < 0){
      dy = 0
    }

    this.dragWidget.update(widgets => {
      const updatedWidgets = [...widgets]; // Clone the array
      updatedWidgets[i] = {
        ...updatedWidgets[i], // Keep other properties intact
        position: { x: dx, y: dy }, // Update only the position
        transform: dx+'px, '+dy+'px, 0px' // Update only the transform
      };
      return updatedWidgets; // Return the new array
    });
    this.disableBtn.set(false);
  }

  onResized(event: ResizedEvent, i: number){
    let info: any = document.getElementById('gridarea')?.getBoundingClientRect();
    let binfo: any = document.getElementById('box'+i)?.getBoundingClientRect();

    if(binfo.width > info.width){
      let b: any = document.getElementById('box'+i);
      b.style.width = info.width+'px';
    }

    if(binfo.height > info.height){
      let b: any = document.getElementById('box'+i);
      b.style.height = info.height+'px';
    }

    this.dragWidget.update(widgets => {
      const updatedWidgets = [...widgets]; // Clone the array
      updatedWidgets[i] = {
        ...updatedWidgets[i], // Keep other properties intact
        size: {width: binfo.width+'px', height: binfo.height+'px'} // Update only the size
      };
      return updatedWidgets; // Return the new array
    });
    
    this.disableBtn.set(false);
  }

  clsoeWidget(item: any){
    const index = this.dragWidget().findIndex((x:any) => x.id === item.id);
    const mindex = this.moduleList().findIndex((x:any) => x.Id === item.id);
    const eindex = this.templateData.findIndex((x:any) => x.DashboardID === item.id);
    this.disableBtn.set(false);
    if(index >=0){
      if(this.dragWidget()[index].type === 'existing'){
        this.templateData[eindex].removed = 'yes';
      }
      this.dragWidget().splice(index, 1);
    }

    if(mindex >=0){
      this.moduleList.update(list => {
        const copy = [...list];
        copy[mindex] = { ...copy[mindex], checked: false };
        return copy;
      });
      this.moduleList().splice(mindex, 1);
    }
  }

  saveDashboard(){
    this.disableBtn.set(true);
    const user = JSON.parse(localStorage.getItem('user') || '');
    let url = '';
    let params: any = [];
    if(this.dragWidget().length > 0){
      this.dragWidget().forEach((x: any)=>{
        //if(x.type === 'new'){
          this.childID.set(0);
          let dp = x.position.x+'px,'+x.position.y+'px';
          let ds = x.size.width+','+x.size.height;
          ds = ds.replaceAll('px','')
          if(this.templateName() === 'Main Dashboard'){
            url = 'Dashboard/CreateSysDashboardUsers?deleteall=false';
            params.push({
                "dashboardId": x.id,
                "companyId": this.companyID(),
                "userId": user.id,
                "dashboardPosition": dp,
                "dashboardSize": ds,
                "deleted": false
            });
            

          }else{
            url = 'Dashboard/CreateTemplateDetailData?DeleteAll=false&Templateid='+ this.templateID;
            params.push({
              "companyId": this.companyID(),
              "templateId": this.templateID,
              "dashboardId": x.id,
              "dashboardPosition": dp,
              "dashboardSize": ds
            })
         
          }
        //}
      })
      if(this.templateName() === 'Main Dashboard'){
        this._http.putClient<any, ApiResponse>(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next:(_response)=>{
            this.editBtnEmit.emit(false);
          }
        })
      }else{
        this._http.postClient<any, ApiResponse>(url, params).subscribe({
          next:(_response)=>{
            this.editBtnEmit.emit(false);
          }
        })
      }
    }else{
      if(this.templateName() === 'Main Dashboard'){
        url = 'Dashboard/CreateSysDashboardUsers?deleteall=true';
        params.push({
          "id": 0,
          "companyId": 0,
          "userId": 0,
          "dashboardId": 0,
          "dashboardPosition": "string",
          "dashboardSize": "string",
          "deleted": true
        });
        this._http.putClient<any, ApiResponse>(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next:(_response)=>{
            this.editBtnEmit.emit(false);
          }
        })

      }else{
        url = 'Dashboard/CreateTemplateDetailData?DeleteAll=true&Templateid='+ this.templateID;
        params.push({
          "id": 0,
          "companyId": 0,
          "templateId": 0,
          "dashboardId": 0,
          "dashboardPosition": "string",
          "dashboardSize": "string"
        })
        this._http.postClient<any, ApiResponse>(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next:(_response)=>{
            this.editBtnEmit.emit(false);
          }
        })
      }
    }
  }

  
  refreshdataevt(_e: any, x: any, i: number){
    const user = JSON.parse(localStorage.getItem('user') || '');
    const lang = JSON.parse(localStorage.getItem('lang') || '');
    let url = 'Dashboard/GetDashboardQueryData?id='+x.rid+'&languageid='+lang+'&Companyid='+this.companyID()+'&applicationid='+user.applicationID;
    this.dragWidget.update(arr => {
      const copy = [...arr]; // create a new array reference
      copy[i] = {id: x.id, rid: x.rid, widget: x.widget, title: x.title, setTitle: x.setTitle, model: 'Loading...', position: x.position, size: x.size, transform: x.transform};
      return copy;
    });
    this._http.getClient<ApiResponse>(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res)=>{
        let response = res;
        if(response.dataModel){
          this.dragWidget.update(arr => {
              const copy = [...arr];
              copy[i] = {id: x.id, rid: x.rid, widget: x.widget, title: x.title, setTitle: x.setTitle, model: response.dataModel.length > 0 ? response.dataModel : '', position: x.position, size: x.size, transform: x.transform};
              return copy;
          });
        }
      }
    })
  }

  selectChange(e: any, i: number){
    this.isLoading.set(true);
    this.loadDiv.set(i);
    let j = this.moduleListRaw.findIndex((a: any)=>{ return a.Description === e});
    if(j >= 0){
      let x = this.moduleListRaw[j];
      let c = this.dragWidget()[i];
      const user = JSON.parse(localStorage.getItem('user') || '');
      const lang = JSON.parse(localStorage.getItem('lang') || '');
      this.childID.set(x.ID);
      let url = 'Dashboard/GetDashboardQueryData?id='+x.ID+'&languageid='+lang+'&Companyid='+this.companyID()+'&applicationid='+user.applicationID;
      this.dragWidget.update(arr => {
          const copy = [...arr];
          copy[i] = {id: c.id, rid: this.childID(), widget: x, title: c.title, setTitle: e, model: 'Loading...', position: c.position, size: c.size, transform: c.transform};
          return copy;
      });
      this._http.getClient<ApiResponse>(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (res)=>{
          let response = res;
          this.isLoading.set(false);
          if(response.dataModel && response.dataModel.length > 0){
            this.dragWidget.update(arr => {
              const copy = [...arr];
              copy[i] = {id: c.id, rid: this.childID(), widget: x, title: c.title, setTitle: e, model: response.dataModel.length > 0 ? response.dataModel : '', position: c.position, size: c.size, transform: c.transform};
              return copy;
            });
          }else{
            this.dragWidget.update(arr => {
                const copy = [...arr];
                copy[i] = {id: c.id, rid: this.childID(), widget: x, title: c.title, setTitle: e, model: '', position: c.position, size: c.size, transform: c.transform};
                return copy;
            });
          }
      }
      })
    }
  }
}
