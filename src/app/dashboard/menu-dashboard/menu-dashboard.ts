import { AfterViewInit, Component, input, Input, signal } from "@angular/core";
import { DxDashboardControlModule } from 'devexpress-dashboard-angular';

@Component({
    selector: 'menu-dashboard',
    standalone: true,
    imports: [DxDashboardControlModule],
    templateUrl: './menu-dashboard.html',
    styleUrl: './menu-dashboard.scss'
})

export class MenuDashbaord implements AfterViewInit {
  dashboardURL: string;
  loadDashboard = signal<boolean>(false);
  endpoint = input<string>();
  page = input<any>({});
  companyID = input<number>(0);
  preid = input<number>(0);

  ngAfterViewInit(): void {
    this.dashboardURL = this.endpoint() + this.page().id + "/"+this.companyID()+"/"+this.preid();
      setTimeout(()=>{
        this.loadDashboard.set(true);
      },300)
  }
}