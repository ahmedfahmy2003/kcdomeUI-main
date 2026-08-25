import { Component, DestroyRef, ElementRef, HostListener, inject, Input, signal } from "@angular/core";
import { Store, select } from "@ngrx/store";
import * as StoreAction from "../../services/common/store/store.action";
import { AppService } from '../../services/common/common.service';
import { CommonModule } from "@angular/common";
import { ApiResponse } from "../../shared/interface";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
    selector: 'app-company-list',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './company-list.html',
    styleUrl: './company-list.scss'
})

export class CompanyList{
    langid: number = 1;
    isOpen = signal(false);
    private store = inject(Store);
    selectedCompany = signal<any>(null);
    companyList: any = [];

    constructor(private eRef: ElementRef, private _http: AppService, private destroyRef: DestroyRef){
      const user = JSON.parse(localStorage.getItem('user') || '');
  
          let url = 'SysMenu/GetCompanyList?UserID='+ user.id
          this._http.getClient<ApiResponse>(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (response) => { 
              if(response.successMessage){
                this.companyList = response.dataModel;
                this.selectedCompany.set(this.companyList[0]);
                this.store.dispatch(StoreAction.companyStore({list: this.companyList}));
                this.store.dispatch(StoreAction.companyID({active: this.selectedCompany()}));
              }
            },
            error: (_errMsg) => { 
              //this.auth.logout();
            }
          })
      
        

        this.store.pipe(select('company')).subscribe(data=>{
            this.selectedCompany.set(data.active);
        })
    }

    @HostListener('document:click', ['$event'])
    handleClickOutside(event: Event) {
        if (!this.eRef.nativeElement.contains(event.target)) {
        this.isOpen.set(false);
        }
    }
    
    setCompany(i: number){
        this.selectedCompany.set(this.companyList[i]);
        this.store.dispatch(StoreAction.companyID({active: this.selectedCompany()}));
        this.toggle();
    }


    toggle() {
        this.isOpen.update(v => !v);
    }

}