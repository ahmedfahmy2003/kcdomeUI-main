import { Component, DestroyRef, effect, ElementRef, inject, OnDestroy, OnInit, signal, ViewChild } from "@angular/core";
import { AppService } from "../../services/common/common.service";
import { Store, select } from "@ngrx/store";
import * as StoreAction from '../../services/common/store/store.action';
import { MenuDashbaord } from "../menu-dashboard/menu-dashboard";
import { CommonModule } from "@angular/common";
import { MenuGrids } from "../menu-grids/menu-grids";
import { UIDashboard } from "../ui-dashboard/ui-dashboard";
import { UserSettings } from "../user-settings/user-settings";
import { DashboardMenu } from "./dashboard-menu/dashboard-menu";
import { TmsComponent } from "../tms/tms";
import { ApiResponse } from "../../shared/interface";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
    selector: 'app-page',
    standalone: true,
    imports: [CommonModule, MenuGrids, MenuDashbaord, UserSettings, UIDashboard, DashboardMenu, TmsComponent],
    templateUrl: './page.html',
    styleUrl: './page.scss'
})

export class Page implements OnInit, OnDestroy {
  @ViewChild('pageTabsRow') pageTabsRow?: ElementRef<HTMLDivElement>;

  private store = inject(Store);
  public tabList = signal<any>([]);
  public dlist = signal<any>([]);
  public activeId = signal<any>(0);
  pages: any;
  activepage: any;
  public pageAdd = signal<boolean>(false); 
  endpoint = signal<string>('');
  companyID = signal<number>(0);
  editbtn = signal<boolean>(false);
  templateList = signal<any>([]);
  templateName = signal<string>('Main Dashboard');
  templateID = signal<number>(0);
  templateEdit = signal<boolean>(true);
  closealldisable = signal<boolean>(false);
  previousTabCount = 0;

  constructor(private _http: AppService, private destroyRef: DestroyRef){
    effect(() => {
      this.activeId();
      const tabCount = this.tabList().length;
      const shouldScrollToEnd = tabCount > this.previousTabCount;
      this.previousTabCount = tabCount;

      setTimeout(() => this.scrollActiveTabIntoView(shouldScrollToEnd), 0);
    });
    
    this.pages = this.store.pipe(select('pages')).subscribe(data=>{
      this.tabList.set(data.menulist);
      this.dlist.set(data.menulist.filter((x: any)=>{return x.pageType !== 'dashboard'}));
      this.pageAdd.set(data.pageAdd);
    })

    this.store.pipe(select('company')).subscribe(data=>{
      this.companyID.set(data.active.id);
      if(this.templateList().length === 0){
        this.getUserTemplates();
      }
    })
 
    this.activepage = this.store.pipe(select('active')).subscribe(data=>{
      this.activeId.set(data.active);
    })

    let url = this._http.geturl();

    this.endpoint.set(url+"dashboard/");

    const items = {id: 'd-0', dtid: 'd-0', pwfid: '', name: 'Main Dashboard', pageType: 'dashboard', menuType: 'maindashboard', record: '', isKeyManualInput: null, isJobEnable: false, disableClose: false};

    this.store.dispatch(StoreAction.addPage({menu: items}));
    this.store.dispatch(StoreAction.activePage({active: items.id}));

  }

  ngOnInit() {
    setTimeout(()=>{
      this.templateID.set(0);
    },500)
  }

  switchPage(page: any){
    if(page.pageType !== 'detailmenu' && page.pageType !== 'pendingwf'){
      this.store.dispatch(StoreAction.activePage({active: page.id}))
    }
    else if(page.pageType === 'pendingwf'){
      this.store.dispatch(StoreAction.activePage({active: page.id}))
    }
    else{
      this.store.dispatch(StoreAction.activePage({active: page.dtid}))
    }
  }

  isActivePage(page: any): boolean{
    return (page.pageType !== 'detailmenu' && this.activeId() === page.id) || (page.pageType === 'detailmenu' && this.activeId() === page.dtid);
  }

  scrollActiveTabIntoView(scrollToEnd = false){
    const container = this.pageTabsRow?.nativeElement;
    const activeTab = container?.querySelector<HTMLElement>('.page-tab-link-active');

    if (!container || !activeTab) {
      return;
    }

    if (scrollToEnd) {
      container.scrollTo({
        left: container.scrollWidth,
        behavior: 'smooth'
      });
      return;
    }

    const targetLeft = Math.max(activeTab.offsetLeft - 24, 0);
    const targetRight = activeTab.offsetLeft + activeTab.offsetWidth + 24;
    const visibleLeft = container.scrollLeft;
    const visibleRight = visibleLeft + container.clientWidth;

    if (targetLeft < visibleLeft || targetRight > visibleRight) {
      container.scrollTo({
        left: Math.max(activeTab.offsetLeft - ((container.clientWidth - activeTab.offsetWidth) / 2), 0),
        behavior: 'smooth'
      });
    }
  }

  editList(){
    this.editbtn.set(true);
  }

  editBtnEmitEvt(e: boolean){
    this.editbtn.set(e);
  }

  closePage(page: any){
    this.editbtn.set(false);
    let item = {id: page.id, dtid: page.dtid, pwfid: '', name: page.name, pageType: page.pageType, menuType: page.menuType, record: '', isKeyManualInput: null, isJobEnable: page.isJobEnable, disableClose: false};
    this.store.dispatch(StoreAction.closePage({menu: item}))
    if(this.activeId() === page.id || this.activeId() === page.dtid){
      this.store.dispatch(StoreAction.activePage({active: 'd-0'}));
    }
  }

  closeAll(){
    this.store.dispatch(StoreAction.closeAll())
    this.store.dispatch(StoreAction.activePage({active: '0'}))
  }

  getUserTemplates(){
    if(localStorage.getItem('user')){
    let url = 'Dashboard/GetTemplateData';
    this._http.getClient<ApiResponse>(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response)=>{
        if(response.dataModel && response.dataModel.length > 0){
          this.templateList.set(response.dataModel);
        }
      },
      error: (_e)=>{

      }
    })
    }
  }

  selectTemplateEvt(e: number){
    this.selectTemplate(e);
  }

  selectTemplate(i: number){
    if(i !== 0){
      this.templateName.set(this.templateList()[i-1].description);
      this.templateEdit.set(this.templateList()[i-1].canUpdate);
      this.templateID.set(this.templateList()[i-1].id);
    }else{
      this.templateName.set('Main Dashboard');
      this.templateEdit.set(true);
      this.templateID.set(0);
    }
  }

  closeSettingsPageEvt(_e: any, page: any){
    this.closePage(page)
  }

  procedureJobEvt(e: any){
    if(e.disable){
      let c = this.tabList().findIndex((a: any)=> a.id === e.pageid);
      if(c > -1){
        this.closealldisable.set(true)
        this.tabList.update(tabs =>
          tabs.map((tab: any, i: any) =>
            i === c ? { ...tab, disableClose: true } : tab
          )
        );
      }else{
        this.closealldisable.set(false)
      }
    }else{
      this.closealldisable.set(false);
      this.tabList.update(tabs =>
        tabs.map((tab: any) => ({ ...tab, disableClose: false }))
      );
    }
  }

  ngOnDestroy(){
    this.closeAll();
    this.activepage.unsubscribe();
    this.pages.unsubscribe();
  }
}
