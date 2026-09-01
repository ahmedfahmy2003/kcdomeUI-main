import { CommonModule } from '@angular/common';
import { Component, DestroyRef, input, Input, OnInit, signal, ViewChild } from '@angular/core';
import { AppService } from '../../services/common/common.service';
import { FormsModule } from '@angular/forms';
import {MatTooltipModule} from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { ToastrService } from 'ngx-toastr';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiResponse } from '../../shared/interface';
import { PaginationControls } from '../pagination-controls/pagination-controls';

@Component({
  selector: 'menu-grid-views',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTooltipModule, MatMenuModule, PaginationControls],
  templateUrl: './menu-grid-views.html',
  styleUrl: './menu-grid-views.scss'
})
export class MenuGridViews implements OnInit{
  filterKey: string;
  menuid = signal<number>(0);
  public currentPage = signal<number>(1);
  public pageSize = signal<number>(10);
  @Input() set _menuid(value: number){
    this.menuid.set(value)
  }
  get _menuid(): number{
    return this.menuid();
  }
  @Input() set _filterKey(value: string){
    this.filterKey = value;
  }
  get _filterKey(): string{
    return this.filterKey;
  }
  recordId = signal<number>(0);
  @Input() set _recordId(value: number){
    this.recordId.set(value);
  }
  get _recordId(): number{
    return this.recordId();
  }
  @Input() recordData: any;
  @Input() fieldQuery: any;
  public isLoading: boolean;
  public resultsLength = signal<number>(0);
  public columns: any = [];
  public dataSourceRaw: any = [];
  public dataSource = signal<any>([]);
  public dataKeys: any;
  public pageNumbers: number[] = [];
  public totalPages = signal<number>(0);
  exportAll = signal<boolean>(false);
  activeCompany: any;
  companyID = input<number>(0);
  sorder = 'atob';

  constructor(private _http: AppService, private toastr: ToastrService, private destroyRef: DestroyRef) {
 
  }

  ngOnInit(){
    this.getMenuData(this.currentPage(), this.pageSize());
  }

  getMenuData(currentPage: number, pageSize: number){
    const user = JSON.parse(localStorage.getItem('user') || '');
    const lang = JSON.parse(localStorage.getItem('lang') || '');

        this.dataSource.set([]);
        this.resultsLength.set(0)
    let query = this.fieldQuery ? this.fieldQuery : '';
    let url = 'Sys/GetGridViewData?fieldId='+this.recordId()+'&pageNumber=' + currentPage + '&PageSize=' + pageSize + '&companyId='+this.companyID()+'&UserId=' + user.id + '&LangaugeId=' + lang
    +'&Filterquery='+ query+'&isExport=false';
    this._http.putClient<any, ApiResponse>(url, this.recordData).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        if (response.dataModel && response.dataModel.length > 0) {
          this.resultsLength.set(response.rowCount || 0);
          this.dataSourceRaw = response.dataModel;
          this.dataSource.set(this.dataSourceRaw);
          this.dataKeys = Object.keys(this.dataSourceRaw[0]);
          this.dataKeys.forEach((e: any) => {
              this.columns.push({
                header: e,
                name: e
              })
            
          })
          this.updateGoto();
        }
      },
      error: (_errMsg) => {
        this.isLoading = false;
      }
    })
  }

   sortData(header: string){
    let c = header;
    if(this.sorder === 'atob'){
      this.sorder = 'btoa';
      this.dataSource.set([...this.dataSource()].sort((a, b) => {
          const x = a[c];
          const y = b[c];

          // Handle null or undefined
          if (x == null && y == null) return 0;
          if (x == null) return 1;
          if (y == null) return -1;

          // If both are numbers, sort numerically
          if (!isNaN(x) && !isNaN(y)) {
            return Number(x) - Number(y);
          }

          // If both are valid dates, sort by date
          const dx = new Date(x);
          const dy = new Date(y);
          if (!isNaN(dx.getTime()) && !isNaN(dy.getTime())) {
            return dx.getTime() - dy.getTime();
          }

          // Default: string sort (case-insensitive)
          return x.toString().localeCompare(y.toString(), undefined, { sensitivity: 'base' });
      }));
    }else{
      this.sorder = 'atob';
      this.dataSource.set([...this.dataSource()].sort((a, b) => {
        const x = a[c];
        const y = b[c];

        // Handle null or undefined
        if (x == null && y == null) return 0;
        if (x == null) return 1;
        if (y == null) return -1;

        // If both are numbers, sort numerically
        if (!isNaN(x) && !isNaN(y)) {
          return Number(x) - Number(y);
        }

        // If both are valid dates, sort by date
        const dx = new Date(x);
        const dy = new Date(y);
        if (!isNaN(dx.getTime()) && !isNaN(dy.getTime())) {
          return dx.getTime() - dy.getTime();
        }

        // Default: string sort (case-insensitive)
        return x.toString().localeCompare(y.toString(), undefined, { sensitivity: 'base' });
      }).reverse());
    }
  }


  updateGoto() {
    this.totalPages.set(Math.ceil(this.resultsLength() / this.pageSize()));
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
    this.getMenuData(this.currentPage(), this.pageSize());
  }

  numbersOnly(event: any) {
    const pattern = /[0-9\+\-\ ]/;

    let inputChar = String.fromCharCode(event.charCode);
    if (event.keyCode != 8 && !pattern.test(inputChar)) {
      event.preventDefault();
    }

    if(this.currentPage() < 1){
      setTimeout(()=>{
        this.currentPage.set(1);
      },50)
      
      event.preventDefault();
    }
    else if (this.currentPage() > this.totalPages()) {
      setTimeout(()=>{
        this.currentPage.set(this.totalPages());
      },50)
      event.preventDefault();
    }
  }

  exportData(currentPage: number, pageSize: number) {
      const user = JSON.parse(localStorage.getItem('user') || '');
    const lang = JSON.parse(localStorage.getItem('lang') || '');
    let query = this.fieldQuery ? this.fieldQuery : '';
    let url = 'Sys/GetGridViewData?fieldId='+this.recordId()+'&pageNumber=' + currentPage + '&PageSize=' + pageSize + '&companyId='+this.companyID()+'&UserId=' + user.id + '&LangaugeId=' + lang
    +'&Filterquery='+ query+'&isExport=true';
    this._http.putClient<any, ApiResponse>(url, this.recordData).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
         if(response.dataModel){
          const binaryString: any = response.dataModel;
          const byteCharacters = atob(binaryString);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);

          // Create a Blob from ArrayBuffer
          const blob = new Blob([byteArray], {
              type:'application/vnd.openxmlformatsofficedocument.spreadsheetml.sheet',
          });

          // Create a temporary anchor element
          const link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);
          link.download = 'downloaded_template.xlsx'; // File name
          document.body.appendChild(link);

          // Programmatically click the link to trigger the download
          link.click();

          // Clean up
          document.body.removeChild(link);
          window.URL.revokeObjectURL(link.href);
        }else{
          if(response.erroMessage){
            this.toastr.error(response.erroMessage)
          }
        }
      },
      error: (_errMsg) => {
        this.isLoading = false;
      }
    })
  }

  ngOnDestroy(){
    if(this.activeCompany){
      this.activeCompany.unsubscribe();
    }
  }
}
