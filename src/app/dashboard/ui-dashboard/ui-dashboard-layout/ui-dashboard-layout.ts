import { CommonModule } from '@angular/common';
import { Component, effect, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DxChartModule } from 'devextreme-angular';
import {MatTooltipModule} from '@angular/material/tooltip';

@Component({
  selector: 'ui-dashboard-layout',
  standalone: true,
  imports: [CommonModule, FormsModule, DxChartModule, MatTooltipModule],
  templateUrl: './ui-dashboard-layout.html',
  styleUrl: './ui-dashboard-layout.scss'
})
export class UiDashboardLayout {
  list = input<any>([]);
  listKeys: any;
  listValues: any;
  toalValues: any;
  public dataSourceRaw: any;
  public dataSource = signal<any>([]);
  public columns:any = [];
  dataSourceChart: any[];
  dataKeys: any;
  noData = signal<boolean>(false);

  constructor(){
    effect(()=>{
      this.setUILayout();
    })
  }

  setUILayout(){
    
    let response = this.list().model;
    if(response){
      this.listKeys = this.list().widget?.GroupByFields?.trim();
      this.listValues = this.list().widget?.ValueFields?.trim();
      this.toalValues = Object.values(response[0]);
      this.dataSourceChart = response;
      this.dataSourceRaw = response;
      this.dataSource.set(this.dataSourceRaw);
      this.columns = [];
      this.noData.set(false);
      this.dataKeys = Object.keys(this.dataSourceRaw[0]);  
          this.dataKeys.forEach((e:any)=>{
            this.columns.push({
                header: e,
                name: e
            })
          })
    }
    else{
      this.noData.set(true);
    }
  }
  
}
