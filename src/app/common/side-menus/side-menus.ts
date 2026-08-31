import { CommonModule } from "@angular/common";
import { AfterViewInit, Component, signal, inject, OnDestroy, output, DestroyRef } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { AppService } from "../../services/common/common.service";
import * as StoreAction from "../../services/common/store/store.action";
import { Store, select } from "@ngrx/store";
import { MenuItems } from "./menu-item/menu-item";
import { MenuItem } from "./menu.model";
import { FavItems } from "./fav-item/fav-item";
import { CompanyList } from "../company-list/company-list";
import { SidebarService } from "../../services/sidebar/sidebar.service";
import { ApiResponse } from "../../shared/interface";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-side-menus',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, MenuItems, FavItems, CompanyList],
    templateUrl: './side-menus.html',
    styleUrl: './side-menus.scss'
})

export class SideMenus implements AfterViewInit, OnDestroy {
  public isDataLoded = signal(false);
  public isFavDataLoded = signal(false);
  private store = inject(Store);
  hoverin = output<boolean>();
  base = 'dashboard';
  page = '';
  last = '';
  currentRoute = '';
  side_bar_data:any[] = [];
  public langid: number = 1;
  menucall: any;
  searchMenu = signal<string>('');
  favdataSource = signal<any[]>([]);
  activeTab = signal('all');
  dataSource = signal<any[]>([]);
  dataSourceRaw: any = [];

  constructor(private _http: AppService, public sidebar: SidebarService, private destroyRef: DestroyRef) {

  }


  ngAfterViewInit(){
    this.langid = JSON.parse(localStorage.getItem('lang')!);

      this.menucall = this._http.setLanguage.subscribe((langid)=>{
        if(langid){
          this.menuList(langid);
          this.getfavList();
        }
      })

  }

  menuList(id: number){
    this.langid = id;
    let url = 'Sys/GetSysMenus?languageId='+ this.langid;
    this.isDataLoded.set(false);
    this._http.getClient<ApiResponse>(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => { 
        /*response.dataModel.forEach((e:any) => {
          if(e.IsJobEnable !== null){
            console.log(e.IsJobEnable)
          }
        });*/
        this.store.dispatch(StoreAction.menuList({list: response.dataModel}))
        const res = response.dataModel.map((item:any) => ({seq: item.Seq, name: item.MenuName, id: item.ID, parentMenuId: item.ParentMenuID, linkedMenuID: item.LinkedMenuID, icon: typeof item.Icon === 'object' ? '': item.Icon, menuType: item.MenuType, menuPath: item.MenuPath, prerequisiteMenuID: item.PrerequisiteMenuID, expand: false, isKeyManualInput: item.IsKeyManualInput, isJobEnable: item.IsJobEnable, disableClose: false}));    
        const result = res.reduce((a:any, o:any) => (
            (a[o.parentMenuId] ??= []).push({ ...o, children: (a[o.id] ??= []) }), a), {}
          )['0']; 
        this.dataSource.set(result);
        this.dataSourceRaw = (result);
        this.isDataLoded.set(true);
      },
      error: (_errMsg) => { 
        //this.auth.logout();
      }
    })
  }

  getfavList(){
    const user = JSON.parse(localStorage.getItem('user') || '');
    const lang = JSON.parse(localStorage.getItem('lang') || '');
    const url = 'Sys/GetSysUserMenuFavourites?userID=' + user.id+'&LanguageID='+ lang;
    this.isFavDataLoded.set(false);
    this._http.getClient<ApiResponse>(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        if (res.dataModel && res.dataModel.length > 0) {
          res.dataModel.forEach((x: any)=>{
            x.isOpen = false;
          })
          this.favdataSource.set(res.dataModel);
        }else{
          this.favdataSource.set([])
        }
        this.isFavDataLoded.set(true);
      },
      error: (_error) => {

      }
    })
  }

  onHover(){
    if(this.sidebar.isExpanded()){
      this.hoverin.emit(true);
    }
  }

  onLeave(){
    this.hoverin.emit(false);
  }

  addfavEvt(e: any){
    this.addFav(e);
  }

  addFav(menu: any){
    let menuadded = false;
    if(this.favdataSource().length > 0){
      menuadded = this.favdataSource().some((e: any) => e.MenuID === menu.id);
    }

    if(!menuadded){
      const user = JSON.parse(localStorage.getItem('user') || '');
      const url = 'Sys/CreateSysUserMenuFavourites';
      let params = {
        "id": 0,
        "companyId": 0,
        "userId": user.id.toString(),
        "menuId": menu.id,
        "tableViewId": 0,
        "seq": menu.seq
      }
      this._http.postClient(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (_response) => {
            
        },
        error: (_error) => {

        }
      })  
    }  
  }

  removeitemevt(i: any){
    this.removeFav(i);
  }

  removeFav(id: number){
    const url = 'Sys/DeleteSysUserMenuFavourites?id=' + id;
    this._http.delClient(url).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (_response) => {
        this.getfavList();
      },
      error: (_error) => {

      }
    })
  }



  openmenuEvt(e: any){
    this.openPage(e.item, e.type)
  }

  openfavpageEvt(e: any){
    this.openFavPage(e.item, e.type);
  }

  openPage(page:any, record: string){
    let items;
    if(page.menuType === 'WebLink'){
      
      const link = document.createElement('a');
      link.href = page.menuPath;
      link.target = "_blank";
      document.body.appendChild(link);

      // Programmatically click the link to trigger the download
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href);
      this.closeMobileMenu();
    }
    else{
      if(page === 'dashboard'){
        items = {id: 'd-0', dtid: 'd-0', pwfid: '', name: 'Main Dashboard', pageType: 'dashboard', menuType: 'maindashboard', record: record, isKeyManualInput: page.isKeyManualInput, isJobEnable: page.isJobEnable, disableClose: false};
      }
      else{
        if(page.prerequisiteMenuID){
          items = {id: page.id, dtid: page.prerequisiteMenuID, pwfid: '', name: page.name, pageType: 'prerequisitemenu', menuType: page.menuType, record: record, isKeyManualInput: page.isKeyManualInput, isJobEnable: page.isJobEnable, disableClose: false};
        }
        else if(page.linkedMenuID){
          items = {id: page.linkedMenuID, dtid: page.id, pwfid: '', name: page.name, pageType: 'mainmenu', menuType: page.menuType, record: record, isKeyManualInput: page.isKeyManualInput, isJobEnable: page.isJobEnable, disableClose: false};
        }
        else{
          items = {id: page.id, dtid: '', pwfid: '', name: page.name, pageType: 'mainmenu', menuType: page.menuType, record: record, isKeyManualInput: page.isKeyManualInput, isJobEnable: page.isJobEnable, disableClose: false};
        }
      }
      this.store.dispatch(StoreAction.addPage({menu: items}));
      this.store.dispatch(StoreAction.activePage({active: items.id}));
      this.closeMobileMenu();
    }
  }

  openFavPage(page:any, record: string){
    let items;
    if(page.MenuType === 'WebLink'){
      
      const link = document.createElement('a');
      link.href = page.MenuPath;
      link.target = "_blank";
      document.body.appendChild(link);

      // Programmatically click the link to trigger the download
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href);
      this.closeMobileMenu();
    }
    else{
      if(page.PrerequisiteMenuID){
        items = {id: page.ID1, dtid: page.PrerequisiteMenuID, pwfid:'', name: page.MenuName, pageType: 'prerequisitemenu', menuType: page.MenuType, record: record, isKeyManualInput: page.isKeyManualInput, isJobEnable: page.isJobEnable, disableClose: false};
      }
      else if(page.LinkedMenuID){
        items = {id: page.LinkedMenuID, dtid: page.ID1, pwfid: '', name: page.MenuName, pageType: 'mainmenu', menuType: page.MenuType, record: record, isKeyManualInput: page.isKeyManualInput, isJobEnable: page.isJobEnable, disableClose: false};
      }
      else{
        items = {id: page.ID1, dtid: '', pwfid: '', name: page.MenuName, pageType: 'mainmenu', menuType: page.MenuType, record: record, isKeyManualInput: page.isKeyManualInput, isJobEnable: page.isJobEnable, disableClose: false};
      }
      this.store.dispatch(StoreAction.addPage({menu: items}))
      this.store.dispatch(StoreAction.activePage({active: items.id}))
      this.closeMobileMenu();
    }
  }

  private closeMobileMenu(): void {
    if (this.sidebar.isExpandedm()) {
      this.sidebar.collapse();
    }
  }


  filterRecursive(filterText: string, array: any[], property: string) {
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
      filteredData = array.map(copy).filter(function x(y) {
        if (y[property].toLowerCase().includes(filterText)) {
          return true;
        }
        // if children match
        if (y.children) {
          return (y.children = y.children.map(copy).filter(x)).length;
        }
      });
      // no string, return whole array
    } else {
      filteredData = array;
    }

    return filteredData;
  }

  setTabs(menu: string){
    this.activeTab.set(menu);
    if(menu === 'fav'){
      this.getfavList();
    }
  }

  applyFilter(term: string){
    if(!term || term.length > 2){
      let a = this.filterMenu(this.dataSourceRaw, term.toLocaleLowerCase());
      this.dataSource.set(a);
    }else{
      this.dataSource.set(this.dataSourceRaw);
    }
  }

  filterMenu(items: MenuItem[], term: string): MenuItem[]{
    return items.map((item: any) => {
        const matches = item.name.toLowerCase().includes(term);
        const filteredChildren:any = item.children ? this.filterMenu(item.children, term) : [];

        if (matches || filteredChildren.length > 0) {
          return {
            ...item,
            children: filteredChildren.length > 0 ?  filteredChildren : item.children,
            expand: term ? true:false,
          };
        }
        return null;
      })
      .filter((i: any): i is MenuItem => i !== null);
  }

  clearSearch(){
    this.searchMenu.set('');
    this.dataSource.set(this.dataSourceRaw);
  }


  ngOnDestroy(): void {
    this.menucall.unsubscribe();
  }

}
