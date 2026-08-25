import { Component, DestroyRef, ElementRef, HostListener, inject, signal } from "@angular/core";
import { Store, select } from "@ngrx/store";
import { AppService } from "../../../services/common/common.service";
import * as StoreAction from "../../../services/common/store/store.action";
import { FormsModule } from "@angular/forms";
import { ApiResponse } from "../../../shared/interface";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
    selector: 'app-notification',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './notification.html',
    styleUrl: './notification.scss'
})

export class Notification{
    pendingCount = signal(0);
    isOpen = signal(false);
    private store = inject(Store);
    companyID = signal<number>(0);
    selectedCompany:any;
    pendingList: any = [];
    associates: boolean = false;

    constructor(private _http: AppService, private eRef: ElementRef, private destroyRef: DestroyRef){
        let a = 0
        this.store.pipe(select('company')).subscribe(data=>{
            this.selectedCompany = data.active;
            if(this.companyID() !== this.selectedCompany.id){
                a = 0;
            }
            this.companyID.set(this.selectedCompany.id);
            if(this.companyID() && a === 0){
                a++;
                this.ispendingWorkflow();
            }
        })
    }

    toggle(){
        this.isOpen.update(v => !v);
        if(this.isOpen()){
            this.pendingWorkflow();
        }
    }

    ispendingWorkflow(){
        this.pendingList = [];
        this.pendingWorkflow();
    }

    pendingWorkflow(){
        const lang = JSON.parse(localStorage.getItem('lang') || '');
        const user = JSON.parse(localStorage.getItem('user') || '');
        let url = "Sys/GetPendingWorkFlow?companyid="+this.companyID()+"&languageid="+lang+"&applicationid="+user.applicationID+"&userid="+user.id+"&isWithAssociates="+this.associates;
        let params = {

        }
        this._http.putClient<any, ApiResponse>(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next:(response)=>{
            if(response.dataModel) {
                this.pendingList = response.dataModel;
                let pendingCount = 0;
                this.pendingList.forEach((x:any)=>{
                    pendingCount = pendingCount + x.RecordCount;
                })
                this.pendingCount.set(pendingCount);
            }else{
                this.pendingCount.set(0);
            }
        },
        error:(_error)=>{

        }
        })
    }

    openMenu(page: any){
        let items;
        if(this.associates){
        if(page.STEPID){
            items = {id:  page.MenuID+'-'+page.STEPID, dtid: page.MenuID+'-'+page.STEPID, pwfid: page, name: page.MenuName, pageType: 'pendingwf', menuType: 'assocyes', record: '', isKeyManualInput:page.isKeyManualInput, isJobEnable: page.isJobEnable, disableClose: false};
        }
        else{
            items = {id:  page.MenuID+'-'+page.MenuID, dtid: page.MenuID+'-'+page.STEPID, pwfid: page, name: page.MenuName, pageType: 'pendingwf', menuType: 'assocyes', record: '', isKeyManualInput:page.isKeyManualInput, isJobEnable: page.isJobEnable, disableClose: false};
        }
        }
        else{
        if(page.STEPID){
            items = {id:  page.MenuID+'-'+page.STEPID, dtid: page.MenuID+'-'+page.STEPID, pwfid: page, name: page.MenuName, pageType: 'pendingwf', menuType: 'assocno', record: '', isKeyManualInput:page.isKeyManualInput, isJobEnable: page.isJobEnable, disableClose: false};
        }else{
            items = {id:  page.MenuID+'-'+page.MenuID, dtid: page.MenuID+'-'+page.STEPID, pwfid: page, name: page.MenuName, pageType: 'pendingwf', menuType: 'assocno', record: '', isKeyManualInput:page.isKeyManualInput, isJobEnable: page.isJobEnable, disableClose: false};
        }
        //this.store.dispatch(StoreAction.activePage({active: page.MenuID}))
        }
        if(page.STEPID){
        this.store.dispatch(StoreAction.activePage({active: page.MenuID+'-'+page.STEPID}))
        }else{
        this.store.dispatch(StoreAction.activePage({active: page.MenuID+'-'+page.MenuID}))
        }
        this.store.dispatch(StoreAction.addPage({menu: items}));
        this.isOpen.set(false);
    }

    @HostListener('document:click', ['$event'])
    handleClickOutside(event: Event) {
        if (!this.eRef.nativeElement.contains(event.target)) {
        this.isOpen.set(false);
        }
    }

}