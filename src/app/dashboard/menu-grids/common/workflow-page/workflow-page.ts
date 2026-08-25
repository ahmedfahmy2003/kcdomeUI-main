import { Component, DestroyRef, input, OnInit, signal } from '@angular/core';
import { AppService } from '../../../../services/common/common.service';
import {MatExpansionModule} from '@angular/material/expansion';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiResponse } from '../../../../shared/interface';
@Component({
  selector: 'workflow-page',
  standalone: true,
  imports: [MatExpansionModule, CommonModule],
  templateUrl: './workflow-page.html',
  styleUrl: './workflow-page.scss'
})
export class WorkflowPage implements OnInit {
  menuId = input();
  recordId = input();
  worflowid = signal<unknown>(0);
  workflowstatus = signal<unknown>('');
  referenceworkflowid = signal<unknown>(0);
  public columns: any = [];
  columnsWFSteps: any = [];
  public dataSourceRaw: any = []; 
  public dataSourceRawWfSteps: any = [];
  public dataSource = signal<any>([]);
  public dataSourceWFSteps = signal<any>([]);
  noData: boolean;
  cindex: number;
  dataKeys: any;
  menuwfid: unknown;

  constructor(private _http: AppService, private destroyRef: DestroyRef){

  }

  ngOnInit(){
    this.afterInit();
  }

  afterInit(){
    this.columns = [];
    this.columnsWFSteps = [];
    let url = "Sys/GetSysWorkflows?menuid=" + this.menuId()+"&recoredID="+ this.recordId() + "&pageNumber=1&PageSize=100";
    this._http.getClient<ApiResponse>(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        if(response.dataModel && response.dataModel.length > 0){
          this.worflowid.set(response.dataModel[0]['ID']);
          this.workflowstatus.set(response.dataModel[0]['WorkflowStatus']);
          this.referenceworkflowid.set(response.dataModel[0]['ReferenceWorkflowID']);
          this.menuwfid = response.dataModel[0]['MenuWorkflowID'];
          this.getWorkflowSteps();
          let aurl = "Sys/GetSysWorkflowTrans?FilterCondition=workflowid=" +this.worflowid()+"&pageNumber=1&PageSize=100";
          this._http.getClient<ApiResponse>(aurl).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (data) => {
              if(data.dataModel && data.dataModel.length > 0){
                this.dataSourceRaw = data.dataModel;
                this.dataSource.set(this.dataSourceRaw);
                this.dataKeys = Object.keys(this.dataSourceRaw[0]);
                this.dataSource.update(arr=> arr.map((e: any, i: number)=>({
                  ...e,
                  sno: i+1
                })))
                
                this.dataKeys.forEach((e:any)=>{
                  this.columns.push({
                    header: e,
                    name: e
                  })
                })
              }
            }
          });
        }
      },
      error: (_error)=>{

      }
    });
  }

  getWorkflowSteps(){
    
    this.columnsWFSteps = [];
    let url = 'Sys/GetSysMenuWorkflowSteps?pageNumber=1&PageSize=100&FilterCondition=MenuWorkflowID='+this.menuwfid;
    this._http.getClient<ApiResponse>(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response)=>{
        if(response.dataModel && response.dataModel.length > 0){
          this.dataSourceRawWfSteps = response.dataModel;
          this.dataSourceWFSteps.set(this.dataSourceRawWfSteps);
          
          let dataKeys = Object.keys(this.dataSourceRawWfSteps[0]);
          this.dataSourceWFSteps.update(arr=> arr.map((e: any, i: number)=>({
              ...e,
              sno: i+1
          })))

          dataKeys.forEach((e:any)=>{
            this.columnsWFSteps.push({
              header: e,
              name: e
            })
          })
        }
      },
      error: (_error)=>{

      }
    })
  }

  clickEvent(index: number) {
    this.cindex = index
  }
}
