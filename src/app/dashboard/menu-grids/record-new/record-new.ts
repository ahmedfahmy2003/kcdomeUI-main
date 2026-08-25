import { Component, input, OnInit, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DetailsPage } from '../common/details-page/details-page';

@Component({
  selector: 'record-new',
  standalone: true,
  imports: [CommonModule, DetailsPage],
  templateUrl: './record-new.html',
  styleUrl: './record-new.scss'
})
export class RecordNew implements OnInit {
  menulabel = input();
  tabname = input<string>('');
  pageType = input<string>('');
  companyID = input<number>(0);
  recordList = input();
  closeNewRecord = output<any>({});
  menuId = input<number>(0);
  visible = input<boolean>();
  menuaccess = input();
  activeTab: string = 'details';

  ngOnInit(): void {
    this.setTabs(this.tabname());
  }

  setTabs(menu: string){
    this.activeTab = menu;
  }
  
  closeNewRecordEvent(e: any){
    this.closeNewRecord.emit(e)
  }
}
