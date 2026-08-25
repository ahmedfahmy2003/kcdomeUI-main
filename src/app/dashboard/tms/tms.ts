import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, signal, ViewChild } from '@angular/core';
import { AppService } from '../../services/common/common.service';
import { FormControl, FormsModule } from '@angular/forms';
import {MatDatepickerInputEvent, MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { ToastrService } from 'ngx-toastr';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ModalService } from '../../services/common/modal.service';
import { LoaderService } from '../../services/common/loader.service';

@Component({
  selector: 'app-tms',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDatepickerModule, MatInputModule, MatTableModule, MatPaginatorModule],
  providers: [provideNativeDateAdapter(), {provide: MAT_DATE_LOCALE, useValue: 'en-IN'}],
  templateUrl: './tms.html',
  styleUrl: './tms.scss'
})
export class TmsComponent implements OnInit {
  @Input() page: any;
  @Output() closeSettingsPage = new EventEmitter;
  date = new FormControl(new Date());
  searchEmployee: string = '';
  employeeListRaw: any = [];
  employeeList: any = [];
  empAttendanceList = signal<boolean>(false);
  empAttendance = signal<any>([]);
  public columns: any = [];
  lateEarlyChbx: boolean = true;
  absentChbx: boolean = true;
  approvedChbx: boolean = false;
  rejectedChbx: boolean = false;
  justifiedChbx: boolean = false;
  ontimeChbx: boolean = false;
  selectedUser: number;
  empIndex: any;
  selectdEmployee: any;
  emplTerminated: boolean = false;
  allemplSelected: boolean;
  displayedColumns: string[] = ['Date', 'Log Time', 'Calendar Time','Late Status','Late Minutes','Late Justify','Late Justification','Late Note','Paid Late Approval','Non-Paid Late Approval','Late Rejection','Approved Late Minute','Early Leave Status','Early Minutes','Early Leave Justification', 'Early Leave Note','Paid Early Approval','Non Paid Early Approval','Early Rejection','Approved Early Minutes','Attachments'];
  resultsLength: number;
  currentPage: number = 0;
  pageSize: number = 30;
  pageno: number = 1;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  startDate = signal<string>("");
  endDate = signal<string>("");
  timestamp: any = new Date().getTime();
  recordStatus: any;
  justTypesList: any;
  justTypes: any;
  dateFormat: any;
  dateTimeFormat: any;
  
  constructor(public _http: AppService, private toast: ToastrService, public modal: ModalService, public loader: LoaderService){
    const now = new Date();
    this.startDate.set(new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1)).toISOString());
    this.endDate.set(new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0)).toISOString());
  }

  ngOnInit(){
    this.getEmployeeList();
    this.justificationTypes();
    this.dateFormat = this._http.getDateFormat();
    this.dateTimeFormat = this._http.getDateTimeFormat();
  }

  justificationTypes(){
    const url = 'TMS/GetJustificationTypes';
    this._http.getClient(url).subscribe({
      next: (res: any)=>{
        const response = res;
        if(response.dataModel && response.dataModel.length > 0){
          this.justTypesList = response.dataModel;
        }
      }
    })
  }

  getEmployeeList(){
    let user = JSON.parse(localStorage.getItem('user') || '');
    if(user.empID){
      let url = 'TMS/GetReporteeEmployees?empID='+user.empID+'&isTerminatedEmployeesIncludes='+this.emplTerminated;
      this.loader.show();
      this._http.getClient(url).subscribe({
        next: (res: any)=>{
          this.loader.hide();
          const response = res;
          // const manager = {
          //   "FullNameEn": user.userName,
          //   "ID": user.empID,
          //   "Code": user.id,
          // }

          if(response && response.dataModel && response.dataModel.length > 0){
            //this.employeeList = [manager, ...response.dataModel];
            this.employeeList = response.dataModel;
            
            this.employeeList.forEach((e:any) => {
              e.selected = false;
            });

            this.employeeListRaw = this.employeeList;
            this.allemplSelected = false;
            this.allemplDetails();
          }
          else if(response.erroMessage){
            this.toast.error(response.erroMessage)
          }

  
        },
        error: (_e)=>{
          this.loader.hide();
        }
      });
    }else{
      this.toast.error("Employee Id not available.")
    }
  }

  prevMonth(){
    const now = new Date(this.startDate());
    this.startDate.set(new Date(Date.UTC(now.getFullYear(), now.getMonth()-1, 1)).toISOString());
    this.endDate.set(new Date(Date.UTC(now.getFullYear(), now.getMonth(), 0)).toISOString());
    if(this.selectdEmployee){
      this.pageno = 1;
      this.pageSize = 30;
      this.getEmplDetails(this.selectdEmployee);
    }
  }

  nextMonth(){
    const now = new Date(this.endDate());
    this.startDate.set(new Date(Date.UTC(now.getFullYear(), now.getMonth()+1, 1)).toISOString());
    this.endDate.set(new Date(Date.UTC(now.getFullYear(), now.getMonth() + 2, 0)).toISOString());
    if(this.selectdEmployee){
      this.pageno = 1;
      this.pageSize = 30;
      this.getEmplDetails(this.selectdEmployee);
    }
  }

  applyFilter(employee: string){
    this.employeeList = this.filterRecursive(employee, this.employeeListRaw);
  }

  clearSearch(){
    this.searchEmployee = '';
    this.employeeList = this.filterRecursive('', this.employeeListRaw);
    const index = this.employeeList.findIndex((x: any) => x.selected === true);

    if(index >= 0){
      this.selectedUser = index;
      this.empIndex = index;
    }
  }

  filterRecursive(filterText: string, array: any[]){
    let filteredData;

    //make a copy of the data so we don't mutate the original
    function copy(o: any) {
      return Object.assign({}, o);
    }

    // has string
    if (filterText) {
      // need the string to match the property value
      filterText = filterText.toLowerCase();
      // copy obj so we don't mutate it and filter
      filteredData = array.map(copy).filter(function x(y){
        if (y['FullNameEn'].toLowerCase().includes(filterText)) {
          return true;
        }else{
          return false;
        }
      });
      // no string, return whole array
    } else {
      filteredData = array;
    }

    return filteredData;
  }

  emplDetails(employee: any, i: any){
    if(i === '-1'){
      this.allemplDetails();
    }
    else{
      this.allemplSelected = false;
      this.empIndex = i;
      this.selectdEmployee = employee;
      this.employeeList.forEach((e:any) => {
        e.selected = false;
      });
      this.employeeListRaw.forEach((e:any) => {
        e.selected = false;
      });
      this.employeeList[i].selected = true;
      const index = this.employeeListRaw.findIndex((x: any) => x.Code === this.employeeList[i].Code);

      if(index >= 0){
        this.employeeListRaw[index].selected = true;
      }

      if(this.selectedUser !== i){
        this.selectedUser = i;
        if(index >= 0){
          this.getEmplDetails(this.selectdEmployee);
        }
      }
    }
  }

  emplDetailsOptions(employee: any, i: number){
    this.employeeList.forEach((e:any) => {
      e.selected = false;
    });
    this.employeeListRaw.forEach((e:any) => {
      e.selected = false;
    });

    if(i >= 0){
      this.employeeList[i].selected = true;
      const index = this.employeeListRaw.findIndex((x: any) => x.FullNameEn === this.employeeList[i].FullNameEn);

      if(index >= 0){
        this.employeeListRaw[index].selected = true;
      }
      
      this.selectedUser = i;
    }

    this.pageno = 1;
    this.pageSize = 30;
    this.getEmplDetails(employee);
  }

  allemplDetails(){
    if(!this.allemplSelected){
      this.employeeList.forEach((e:any) => {
        e.selected = false;
      });

      this.selectdEmployee = '';
      this.selectedUser = -1;
      this.allemplSelected = true;
      let user = JSON.parse(localStorage.getItem('user') || '');
      const manager = {
        "ID": user.empID,
      }
      this.empIndex = -1;
      this.getEmplDetails(manager);
    }
  }

  getEmplDetails(employee: any){
   this.selectdEmployee = employee;
   let url = "TMS/GetEmployeeMonthlyAttendenceOnSelectEmployee";

    let params = {
      "empID": employee.ID,
      "fromDate": this.startDate(),
      "toDate": this.endDate(),
      "approved": this.approvedChbx,
      "justified": this.justifiedChbx,
      "onTime": this.ontimeChbx,
      "late": this.lateEarlyChbx,
      "absents": this.absentChbx,
      "rejected": this.rejectedChbx,
      "isAllEmployee": this.allemplSelected,
      "isTerminatedEmployees": this.emplTerminated
    }
    //"allEmployeesSelected": this.allemplSelected,
    this.loader.show();
    this.empAttendanceList.set(false);
    this._http.putClient(url, params).subscribe({
      next:(res: any)=>{
        const response = res;
        this.loader.hide();
        if(response && response.dataModel && response.dataModel.length > 0){
          this.empAttendanceList.set(true);
          let empAtt = response.dataModel.filter((x:any)=> x.StartTime && x.EndTime);
          if(empAtt.length > 0){
            this.empAttendance.set(empAtt);
          }else{
            this.empAttendance.set(response.dataModel);
          }
          this.resultsLength = response.dataModel.length;
        }else{
          this.empAttendance.set([]);
        }
      },
      error:(_e: any)=>{
            this.loader.hide();
      }
    })
  }

  handlePage(e: PageEvent) {
    this.currentPage = e.pageIndex ? e.pageIndex : 0;
    this.pageSize = e.pageSize;
    this.pageno = e.pageIndex + 1;
    this.getEmplDetails(this.selectdEmployee);
  }

  addEvent(_type: string, event: MatDatepickerInputEvent<Date>) {
    const date:any = event.value;
    this.startDate.set(new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString());
    if(this.selectdEmployee){
      this.pageno = 1;
      this.pageSize = 30;
      this.getEmplDetails(this.selectdEmployee);
    }
  }

  addToEvent(_type: string, event: MatDatepickerInputEvent<Date>) {
    const date:any = event.value;
    this.endDate.set(new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString());
    if(this.selectdEmployee){
      this.getEmplDetails(this.selectdEmployee);
    }
  }

  openBox(e: any){
    console.log(e)
    this.recordStatus = e; 
    this.modal.show('tms');
  }

  closeModal(){
    this.modal.hide();
  }
}
