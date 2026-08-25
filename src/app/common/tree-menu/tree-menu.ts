import { CommonModule } from "@angular/common";
import { Component, DestroyRef, effect, Input, input, output, signal } from "@angular/core";
import { DxTreeListModule } from 'devextreme-angular/ui/tree-list';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { AppService } from "../../services/common/common.service";
import { LoaderService } from "../../services/common/loader.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ApiResponse } from "../../shared/interface";

@Component({
    selector: 'tree-menu',
    standalone: true,
    imports: [CommonModule, DxTreeListModule, DxButtonModule],
    templateUrl: './tree-menu.html',
    styleUrl: './tree-menu.scss'
})

export class TreeMenu {
    @Input() menuID: number;
    @Input() companyID: number;
    size = input<number>();
    viewid = output<number>();
    dataSource = signal<any>([]);
    expanded: boolean = false;
    dataKeys = signal<any>([]);
    _refreshTable: boolean;
    @Input() set refreshTable(value: boolean){
        this._refreshTable = value;
        if(this._refreshTable){
            this.getData();
        }
    }

    get refreshTable(): boolean{
        return this._refreshTable;
    }

    constructor(public _http: AppService, public loader: LoaderService, private destroyRef: DestroyRef){
        effect(()=>{
            this.getData();
        })
    }

    getData(){
            const user = JSON.parse(localStorage.getItem('user') || '');
            const lang = JSON.parse(localStorage.getItem('lang') || '');
            let url = 'SystemFields/GetMenuData?IsFilterConditionApply=true&JoinOuterCondition=false&isallFields=true';
            let params = {
                "menuID": this.menuID,
                "userID": user.id,
                "languageID": lang,
                "companyID": this.companyID,
                "applicationID": user.applicationID,
                "queryfields": "",
                "pageNumber": 1,
                "pageSize": this.size()
            }
            this.loader.show();
            this._http.putClient<any, ApiResponse>(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
                next:(res)=>{
                    let response = res.dataModel;
                    this.loader.hide();
                    this.dataSource.set(response.reverse());
                    this.dataKeys.set(Object.keys(response[0]))
                }
            })
    }

    okClicked = (e: any) => {
        e.event?.preventDefault(); 
        e.event?.stopPropagation();
        let data = e.row?.data;
        this.viewid.emit(data);
    }
}