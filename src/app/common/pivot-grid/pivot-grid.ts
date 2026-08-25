import { Component, DestroyRef, Input, OnInit, signal, ViewChild } from "@angular/core";
import { AppService } from "../../services/common/common.service";
import { CommonModule } from "@angular/common";
import { DxPivotGridModule, DxPivotGridComponent, DxSelectBoxModule } from 'devextreme-angular';
import { exportPivotGrid } from 'devextreme/excel_exporter';
import { saveAs } from 'file-saver-es';
import { DxPivotGridTypes } from 'devextreme-angular/ui/pivot-grid';
import { Workbook } from 'devextreme-exceljs-fork';
import { FormsModule } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ApiResponse } from "../../shared/interface";
import { HttpErrorResponse } from "@angular/common/http";

@Component({
    selector: 'pivot-grid',
    standalone: true,    
    imports: [CommonModule, FormsModule, DxSelectBoxModule, DxPivotGridModule, DxPivotGridComponent],
    templateUrl: './pivot-grid.html',
    styleUrl: './pivot-grid.scss'
})

export class PivotGrid implements OnInit{
    selectData = signal<any>([]);
    selectedID = signal<any>('');
    showLayout = signal<boolean>(false)
    webGridLayout = signal<any>('');
    pivotLayout = signal<any>('');
    newLayout = signal<boolean>(false);
    @Input() page: any;
    @Input() menuID: number;
    @Input() menuData: any;
    @Input() companyID: any;
    @Input() plist: any;
    @ViewChild('pivot', { static: false }) pivotGrid!: DxPivotGridComponent;
    psource: any;
    layoutUser = signal<any>({});
    newLayoutName = signal<string>('');
    newLayoutPrivate = signal<boolean>(false);
    userid = signal<number>(0)
    enableDelete = signal<boolean>(false);
    summaryType = signal<'sum' | 'avg' | 'count' | 'min' | 'max'>('sum');
    summaryTypeO = signal<'sum' | 'avg' | 'count' | 'min' | 'max'>('count');

    constructor(public http: AppService, private toastr: ToastrService, private destroyRef: DestroyRef){

    }
    ngOnInit() {
        this.onInit();
    }

    onInit(){
        const user = JSON.parse(localStorage.getItem('user') || '');
        this.userid.set(user.id);
        let url = 'Layout/GetLayoutList?menuID='+this.menuID+'&userID='+user.id;
        this.http.getClient<ApiResponse>(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (response)=>{
                if(response.dataModel && response.dataModel.length > 0){
                    this.selectData.set(response.dataModel);
                }
            },
            error: (_e: any)=>{

            }
        });
    }
    
    onValueChanged(e: any) {
        this.enableDelete.set(false);
        this.newLayout.set(false)
        let c = Number(e.target.value);
        this.getLayout(c)
        let a = this.selectData();
        let b  = a.findIndex((x: any)=> x.Id === c)
        if(b > -1){
            this.layoutUser.set(a[b]);
            if(this.userid() === this.layoutUser().CreatedBy){
                this.enableDelete.set(true);
            }
        }
    };

    getLayout(id: any){
        let url = 'Layout/GetLayout?id='+id;
        this.showLayout.set(false);
        this.http.getClient<ApiResponse>(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (response)=>{
                if(response.dataModel && response.dataModel.length > 0){
                    this.showLayout.set(true);
                    this.psource = response.dataModel[0];
                    if(this.psource.PivotLayout){
                        let result = this.parseUnknown(this.psource.PivotLayout);
                        if(result){
                            result.store = this.menuData;
                            this.pivotLayout.set(result);
                        }
                    }else{
                        this.pivotLayout.set('');
                    }
                }else{
                    this.pivotLayout.set('');
                }
            },
            error: (_e: any)=>{
                
            }
        });
    }

    parseUnknown(v: string) {
        // 1. Try JSON
        try {
            return JSON.parse(v);
        } catch {
            // ignore parse error and continue
        }

        // 2. Check if XML (simple check: starts with <)
        if (v.trim().startsWith("<")) {

            // Parse XML string into DOM
            const xml = new DOMParser().parseFromString(v, "text/xml");

            // Recursive XML → JSON converter
            const toJson = (node: any): any => {

            // CASE A: Node contains a single text node → return text
            if (
                node.childNodes.length === 1 &&
                node.firstChild.nodeType === 3 // TEXT_NODE
            ) {
                return node.firstChild.nodeValue.trim();
            }

            // CASE B: Node contains element children → build object
            const result: any = {};

            [...node.childNodes].forEach((child: any) => {
                if (child.nodeType === 1) { // ELEMENT_NODE
                result[child.nodeName] = toJson(child);
                }
            });

            return result;
            };

            return toJson(xml);
        }

        // 3. Not JSON, not XML → return as-is
        return v;
    }

    createLayout(){
        this.newLayoutName.set('');
        let f: any = {};
        f.fields = [];
        this.plist.forEach((x: any, i: number)=>{
            if(x.FieldType === 'DateTime'){
                f.fields.push({dataField: x.FieldName, caption: x.FieldCaption, area: 'column', areaIndex: i,  dataType: 'date'})
            }
            else if(x.FieldType === 'Number'){
                f.fields.push({dataField: x.FieldName, caption: x.FieldCaption, area: 'data', areaIndex: i,  dataType: 'number', summaryType: this.summaryType()})
            }
            else{
                f.fields.push({dataField: x.FieldName, caption: x.FieldCaption, area: 'data', areaIndex: i, dataType: 'string', summaryType: this.summaryTypeO()})
            }
        })
        f.store = this.menuData;
        this.enableDelete.set(false);
        this.newLayout.set(true);
        this.pivotLayout.set(f);
    }

    saveLayout(){
        if(this.newLayout()){
            if(!this.newLayoutName()){
                this.toastr.error("Please enter layout name")
            }else{
                this.createLayoutFn();
            }
        }else{
        let state = this.pivotGrid.instance.getDataSource().state();
        if (state && state.store) {
            delete state.store;
        }
        
        let url = 'Layout/UpdateLayout';
        let params = {
            "id": this.psource.Id,
            "companyId": this.companyID,
            "menuId": this.menuID,
            "layoutName": this.psource.LayoutName,
            "gridLayout": this.psource.GridLayout ?? null,
            "pivotLayout": JSON.stringify(state),
            "treeLayout": this.psource.TreeLayout ?? null,
            "createdBy": this.userid(),
            "createdDate": new Date().toISOString(),
            "privateFlag":  this.layoutUser().PrivateFlag,
            "webGridLayout": this.psource.WebGridLayout ?? null,
            "webPivotLayout": this.psource.WebPivotLayout ?? null,
            "webTreeLayout": this.psource.WebTreeLayout ?? null,
            "webChartLayout": this.psource.WebChartLayout ?? null
        }
        this.http.putClient<any, ApiResponse>(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (res)=>{
                this.afterRes(res);
            },
            error: (_e: any)=>{

            }
        });
        }
    }

    createLayoutFn(){
        let url = 'Layout/CreateLayout';
        let state = this.pivotGrid.instance.getDataSource().state();
        if (state && state.store) {
            delete state.store;
        }
        let params = {
            "id": 0,
            "companyId": this.companyID,
            "menuId": this.menuID,
            "layoutName": this.newLayoutName(),
            "gridLayout": null,
            "pivotLayout": JSON.stringify(state),
            "treeLayout": null,
            "createdBy": this.userid(),
            "createdDate": new Date().toISOString(),
            "privateFlag": this.newLayoutPrivate,
            "webGridLayout": null,
            "webPivotLayout": null,
            "webTreeLayout": null,
            "webChartLayout": null
        }

        this.http.postClient<any, ApiResponse>(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (response)=>{
                this.afterRes(response);
            },
            error: (_e: HttpErrorResponse)=>{

            }
        })
    }

    afterRes(response: ApiResponse){
        if(response.erroMessage){
            this.toastr.error(response.erroMessage)
        }
        else if(response.successMessage || response.id){
            this.toastr.success(response.successMessage ?? 'Layout Created Successfully');
            if(this.newLayout()){
                this.newLayout.set(false);
                this.onInit();
                this.selectedID.set(response.id ?? '');
                this.enableDelete.set(true);
                this.getLayout(response.id)
            }
        }
    }

    deleteLayout(){
        let url = 'Layout/DeleteLayout?id='+this.psource.Id;
        this.http.deleteClient<ApiResponse>(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next:(response)=>{
                if(response.successMessage){
                    this.toastr.success(response.successMessage);
                    this.showLayout.set(false);
                    this.selectedID.set('');
                    this.newLayout.set(false);
                    this.onInit();
                }
                else if(response.erroMessage){
                    this.toastr.error(response.erroMessage);
                }
            }
        })
    }

    contextMenuPreparing(e: DxPivotGridTypes.ContextMenuPreparingEvent) {
        const dataSource = e.component.getDataSource();
        const sourceField: any = e.field;
        if (sourceField) {
        if (sourceField.dataType !== 'date') {
        const setSummaryType: any = function (args: any) {
          dataSource.field(sourceField.areaIndex, {
            summaryType: args.itemData.value,
          });

          dataSource.load();
        };
        const menuItems: any = [];

        e.items?.push({ text: 'Summary Type', items: menuItems });
        if (sourceField.dataType === 'number') {
            console.log(sourceField.dataType)
             console.log(sourceField.dataField)
            for (const summaryType of ['Sum', 'Avg', 'Min', 'Max']) {
            const summaryTypeValue = summaryType.toLowerCase();

            menuItems.push({
                text: summaryType,
                value: summaryType.toLowerCase(),
                onItemClick: setSummaryType,
                selected: e.field?.summaryType === summaryTypeValue,
            });
            }
        }
        else {
            console.log(sourceField.dataType)
             console.log(sourceField.dataField)
            for (const summaryType of ['Count', 'Min', 'Max']) {
            const summaryTypeValue = summaryType.toLowerCase();

            menuItems.push({
                text: summaryType,
                value: summaryType.toLowerCase(),
                onItemClick: setSummaryType,
                selected: e.field?.summaryType === summaryTypeValue,
            });
            }
        }
      }
        }
    }

    onExporting(e: DxPivotGridTypes.ExportingEvent) {
        const workbook = new Workbook();
        const worksheet = workbook.addWorksheet(this.page.name);

        exportPivotGrid({
        component: e.component,
        worksheet,
        }).then(() => {
        workbook.xlsx.writeBuffer().then((buffer) => {
            saveAs(new Blob([buffer], { type: 'application/octet-stream' }), this.page.name+'.xlsx');
        });
        });
    }
}