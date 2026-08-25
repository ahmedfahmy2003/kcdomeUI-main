import { Component, DestroyRef, ElementRef, input, OnInit, Renderer2, signal, ViewChild } from '@angular/core';
import { AppService } from '../../../../services/common/common.service';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiResponse } from '../../../../shared/interface';

@Component({
  selector: 'logdata-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logdata-page.html',
  styleUrl: './logdata-page.scss'
})
export class LogdataPage implements OnInit {

  menuid = input<number>();
  recordId = input<number>();
  logResponse = signal<any>([]);
  @ViewChild('moreObtn') moreObtn: ElementRef;

  constructor(private _http: AppService, private renderer: Renderer2, private destroyRef: DestroyRef){
    this.renderer.listen('window', 'click',(e:Event)=>{
      if(this.moreObtn.nativeElement.contains(e.target)){
        
      }else{
        this.offData();
      }
    });
  }

  ngOnInit() {
    this.getLogData();
  }

  offData(){
    if(this.logResponse().length > 0){
      this.logResponse.update(arr=> arr.map((e: any)=>({
              ...e,
              showOldData: false,
              showNewData: false
      })))
    }
  }

  getLogData(){
    let rid: any = this.recordId();
    if(typeof this.recordId() === 'string'){
      rid = "'"+this.recordId()+"'";
    }
    let url = 'General/GetLogData?menuid='+this.menuid()+'&recordid='+rid;

    this._http.getClient<ApiResponse>(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response)=>{
        if(response.dataModel){
          this.logResponse.set(response.dataModel);
          this.logResponse.update(arr=> arr.map((e: any)=>({
              ...e,
              showOldData: false,
              showNewData: false
          })))
        }else{
          this.logResponse.set([]);
        }
      },
      error: (_e)=>{

      }
    })
  }

  showOData(i: number){
    this.logResponse.update((items: any) =>
      items.map((item: any, index: number) =>
        index === i ? { ...item, showOldData: true } : item
      )
    );
  }

  showNData(i: number){
    this.logResponse.update((items: any) =>
      items.map((item: any, index: number) =>
        index === i ? { ...item, showNewData: true } : item
      )
    );
  }
}
