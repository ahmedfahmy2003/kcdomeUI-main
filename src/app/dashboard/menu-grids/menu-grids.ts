import { Component, ComponentRef, DestroyRef, effect, EventEmitter, inject, Input, input, Output, signal, ViewChild, ViewContainerRef } from "@angular/core";
import { AppService } from "../../services/common/common.service";
import { ToastrService } from "ngx-toastr";
import { select, Store } from "@ngrx/store";
import { MenuGridTabs } from "../../common/menu-grid-tabs/menu-grid-tabs";
import { RecordNew } from "./record-new/record-new";
import { RecordDetail } from "./record-detail/record-detail";
import { FormsModule } from "@angular/forms";
import { MenuDashbaord } from "../menu-dashboard/menu-dashboard";
import { GridTabs } from "../../common/grid-tabs/grid-tabs";
import { CommonModule } from "@angular/common";
import { LoaderService } from "../../services/common/loader.service";
import * as StoreAction from "../../services/common/store/store.action";
import { ApiResponse } from "../../shared/interface";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { every } from "rxjs";

@Component({
  selector: 'menu-grids',
  standalone: true,
  imports: [CommonModule, MenuGridTabs, GridTabs, FormsModule, MenuDashbaord],
  templateUrl: './menu-grids.html',
  styleUrl: './menu-grids.scss'
})

export class MenuGrids {
  @ViewChild('container', { read: ViewContainerRef }) container!: ViewContainerRef;
  @ViewChild('containerGrid', { read: ViewContainerRef }) containerGrid!: ViewContainerRef;
  @ViewChild('containerGD', { read: ViewContainerRef }) containerGD!: ViewContainerRef;
  @ViewChild('containerGDN', { read: ViewContainerRef }) containerGDN!: ViewContainerRef;
  pages = input<any>();
  page = signal<any>({});
  pageAdd = input<boolean>(false);
  activeID = signal<any>('');

  pIndex = input<number>(0);
  activeRecord = signal<any>(0);
  public recordList: any = [];
  public newRecordShow = signal<boolean>(false);
  public detailsPage = signal<boolean>(false);
  activeRecordSub: any;
  recordListSub: any;
  public menus: any;
  detailsBtnGrid: boolean;
  tabname =  signal<string>('details');
  detailsgridID: number;
  subIndexts: number = 0;
  newrecordid: any;
  newRecordAdded = signal<boolean>(false);
  companyID = signal<number>(0);
  private store = inject(Store);
  activeCompany: any;
  menuactiveid: number;
  prtype = signal<string>('');
  preRequisiteOption = signal<boolean>(false);
  preReqIndex: any;
  queryDatagrid: any;
  gridrecordId =  signal<number>(0);
  menuacess: any;
  useraccess: any;
  menuacessgrid: any;
  rescompanyID: number;
  recorddeleted: any = {id: 0, deleted: false};
  endpoint: string;
  preid: number;
  updateTable: boolean;
  pageType: string = 'mainmenu';
  reportType = signal<string>('pdf');
  totalRecords = signal<number>(0);
  recordStamp = new Date().getTime();
  childRefs = new Map<number, ComponentRef<RecordDetail>>();
  childRefsG = new Map<number, ComponentRef<MenuGridTabs>>();
  childRefsGD = new Map<number, ComponentRef<RecordDetail>>();
  childRefsGDN = new Map<number, ComponentRef<RecordNew>>();
  getmenuFieldsto: boolean;
  pageLoad: boolean = false;
  taskid: any = [];
  or: any;
  activepage: any;
  subMenuId: number = 0;
  genReport = signal<boolean>(false)
  @Output() procedureJob = new EventEmitter;
  constructor(private _http: AppService, private toastr: ToastrService, public loader: LoaderService, private destroyRef: DestroyRef){
    effect(()=>{
      this.page.set(this.pages());
      if(!this.pageLoad){
        this.oninit();
      }
    })
    this.activeCompany = this.store.pipe(select('company')).subscribe(data=>{
      if(this.companyID() === 0){
        this.companyID.set(data.active.id);
      }
    });

  this.activepage = this.store.pipe(select('active')).subscribe(data=>{
      this.activeID.set(data.active);
  })

  /*this.or = this.store.pipe(select('recordOpen')).subscribe(data=>{
      if(data.active && data.active.mid && data.active.mid === this.activeID()){
        this.gridrecordId.set(data.active.rid);
        if(data.active.pr === 'record'){
          this.prtype.set('prerequisites');
        }else{
          this.preReqIndex = data.active.index;
          this.queryDatagrid = data.active.data;
          this.prtype.set('grid');
        }
        this.preRequisiteOption.set(false);
        setTimeout(()=>{
          this.preRequisiteOption.set(true);
          this.openreport(data.active);
        },500)
        
      }
    });*/
  }

  oninit(){
    this.pageLoad = true;
    if(typeof this.page().id === 'number'){
      this.recordList.parentPageID = this.page().id;
    }else{
      let a = this.page().id.split('-');
      this.recordList.parentPageID = parseInt(a[0]);
    }
    this.menuactiveid = this.activeID();
    if(typeof this.activeID() === "string"){
      let a = this.activeID().split("-");
      this.menuactiveid = parseInt(a[0])
    }
  }

  addRecord(type: string){
   this.newRecordShow.set(true);
   this.detailsPage.set(true);
   
   this.childRefs.forEach(ref => {
    ref.setInput('visible', false);
  });
  this.childRefsG.forEach(ref => {
     ref.setInput('visible', false);
  });
  this.childRefsGD.forEach(ref => {
   ref.setInput('visible', false);
  });
  this.childRefsGDN.forEach(ref => {
   ref.setInput('visible', false);
  });
   if(type === 'detailsBtnGrid'){
      this.detailsBtnGrid = true;
      this.childRefsGD.forEach(ref => {
        ref.setInput('visible', false);
      });
      if(this.newrecordid){
        let a = this.childRefsGD.get(this.newrecordid);
        if(a){
          this.activeRecord.set(this.newrecordid);
          a.setInput('visible', true);
        }
      }else{
        let n = this.childRefsGDN.get(0);
        if(n){
          n.setInput('visible', true);
        }
      }
   }else{
    this.activeRecord.set(0);
    this.newrecordid = '';
    const existingID = this.childRefs.get(0);
    this.detailsBtnGrid = false;
    if (existingID) {
      existingID.setInput('visible', true);
    }
   }
   
  }

  closeNewRecord(){
      const childRef = this.childRefs.get(0);
      if(childRef) {
        childRef.destroy(); // Remove from view and free resources
        this.childRefs.delete(0);
      }

      this.newrecordid = '';
    
      const index = this.recordList.findIndex((x: any) => x.id === 0);
      this.recordList.splice(index, 1);
      if (this.recordList.length === 0) {
        this.detailsPage.set(false);
      }
      this.newRecordShow.set(false);
      this.showGrid(); 
  }

  closeDetails(id: number){
    const childRef = this.childRefs.get(id);
    this.newrecordid = '';
    if(childRef) {
      childRef.destroy(); // Remove from view and free resources
      this.childRefs.delete(id);
    }

    if (this.recordList && this.recordList.length !== 0) {
      const index = this.recordList.findIndex((x: any) => x.id === id);

      if(index > -1){
        let subm = this.recordList[index];
        if(subm.submenus.length > 0){
          const aa = subm.submenus.findIndex((x: any) => x.id === this.activeRecord());
          if(aa !== -1){
            this.showGrid();
          }
          this.destroyComponent(subm.submenus);
        }
        this.recordList.splice(index, 1);
      }
    }

    if (this.recordList && this.recordList.length === 0) {
      this.activeRecord.set(0);
      this.detailsPage.set(false);
    }
   
    if(id === this.activeRecord()){
      this.detailsBtnGrid = false;
      this.showGrid();
    }
    if(this.activeRecord() !== 0){
      this.newRecordShow.set(false);
    }
    else{
      this.showGrid();
    }

  }

  showRecord(record: number, index: number, tab: string) {
    this.activeRecord.set(record);
    this.detailsPage.set(true);
    this.detailsBtnGrid = false;
    this.newRecordShow.set(false);
    this.recordList.currentid = record;
    const existingID = this.childRefs.get(this.activeRecord());
    this.childRefs.forEach(ref => {
      ref.setInput('visible', false);
    });
    if (existingID) {
      existingID.setInput('activeRecords', this.activeRecord());
      existingID.setInput('visible', true);
    }
    this.childRefsG.forEach(ref => {
      ref.setInput('_activeRecord', this.activeRecord())
      ref.setInput('visible', false);
    });
    this.childRefsGD.forEach(ref => {
      ref.setInput('visible', false);
    });
    this.childRefsGDN.forEach(ref => {
      ref.setInput('visible', false);
    });
  }

  showGrid(){
    this.detailsPage.set(false);
    this.detailsBtnGrid = false;
    this.newRecordShow.set(false);
    this.activeRecord.set(0);
    this.pageType = 'mainmenu';
    this.childRefs.forEach(ref => {
      ref.setInput('activeRecords', this.activeRecord());
      ref.setInput('visible', false);
    });
    
    this.childRefsG.forEach(ref => {
      ref.setInput('_activeRecord', this.activeRecord())
      ref.setInput('visible', false);
    });

    this.childRefsGD.forEach(ref => {
      ref.setInput('activeRecords', '');
      ref.setInput('visible', false);
    });

    this.childRefsGDN.forEach(ref => {
      ref.setInput('visible', false);
    });
  }

  showDetailBtnNewRecord(record: number) {
    const childRef = this.containerGDN.createComponent(RecordNew);
  
      let a = this.childRefsGDN.get(0);
      if(a){
        a.destroy();
        this.childRefsGDN.delete(this.newrecordid);
      }
    
    this.newrecordid = '';
    let menuid,recid;
    this.recordList.forEach((x:any)=>{
      if(x.id === this.recordList.currentid){
        x.submenus.forEach((y:any)=>{
          if(y.id === record){
            menuid = y.menuid;
            recid = y.id;
          }
        })
      }
    });

    this.childRefsG.forEach(ref => {
      ref.setInput('_activeRecord', 0)
      ref.setInput('visible', false);
    });
    childRef.setInput('recordList', this.recordList);
    childRef.setInput('companyID', this.rescompanyID);
    childRef.setInput('pageType', 'detailsBtnGrid');
    childRef.setInput('menuaccess', this.menuacess);
    childRef.setInput('menuId', menuid);
    childRef.setInput('menulabel', this.menus);
    childRef.setInput('tabname', 'details');
    childRef.setInput('visible', true);

    childRef.instance.closeNewRecord.subscribe((e: any)=>{
      this.closeNewRecordEvent(e);
    })

    this.childRefsGDN.set(0, childRef);
  }

  showDetailBtnRecord(record: number, id: number, parentid: number) {
    this.detailsBtnGrid = true;
    this.activeRecord.set(record);
    this.detailsgridID = parentid;
    this.detailsPage.set(true);
    this.recordList.currentid = id;
    this.newRecordShow.set(false);
    this.childRefs.forEach(ref => {
      ref.setInput('activeRecords', this.activeRecord());
      ref.setInput('visible', false);
    });
    this.childRefsG.forEach(ref => {
      ref.setInput('_activeRecord', this.activeRecord())
      ref.setInput('visible', false);
    });

    this.childRefsGD.forEach(ref => {
      ref.setInput('activeRecords', '');
      ref.setInput('visible', false);
    });

    this.childRefsGDN.forEach(ref => {
      ref.setInput('visible', false);
    });

    const existingID = this.childRefsGD.get(this.activeRecord());

    if (existingID) {
      // If already exists, just make it visible
      existingID.setInput('activeRecords', this.activeRecord());
      existingID.setInput('visible', true);
      return;
    }
    this.addComponentGD();
  }

  showDetailBtnGrid(record: number, parentid: number, id: number){
    this.detailsBtnGrid = true;
    this.activeRecord.set(record);
    this.detailsgridID = parentid;
    this.detailsPage.set(false);
    this.recordList.currentid = id;
    this.newRecordShow.set(false);
   
    this.childRefs.forEach(ref => {
      ref.setInput('activeRecords', this.activeRecord());
      ref.setInput('visible', false);
    });

    this.childRefsG.forEach(ref => {
      ref.setInput('visible', false);
      ref.setInput('newRecordID', '');
      ref.setInput('newRecordAdded', false);
    });

    this.childRefsGD.forEach(ref => {
      ref.setInput('visible', false);
    });

    this.childRefsGDN.forEach(ref => {
      ref.setInput('visible', false);
    });

    const existingID = this.childRefsG.get(this.activeRecord());

    if (existingID) {
      // If already exists, just make it visible
      existingID.setInput('_activeRecord', this.activeRecord());
      existingID.setInput('visible', true);
      return;
    }

    let gid, filterKey, pmid, prid;
    this.recordList.forEach((x:any)=>{
      if(x.id === this.recordList.currentid){
        x.submenus.forEach((y:any)=>{
          if(y.id === record){
            gid = y.menuid;
            filterKey = y.filter;
            pmid = y.previousMenuId;
            prid = y.previousRecordID;
          }
        })
      }
    })

    const childRef = this.containerGrid.createComponent(MenuGridTabs);
    childRef.setInput('previousMenuId', 0);
    childRef.setInput('previousRecordID', 0);
    childRef.setInput('page',this.page());
    childRef.setInput('pageIndex', this.pIndex());
    childRef.setInput('companyID', this.companyID());
    childRef.setInput('pageAdd', false);
    childRef.setInput('recordList', this.recordList);
    childRef.setInput('_pageType', 'detailsBtnGrid');
    childRef.setInput('detailsgridID', this.detailsgridID);
    childRef.setInput('detailsBtnGrid', this.detailsBtnGrid);
    childRef.setInput('newRecordShow', this.newRecordShow());
    childRef.setInput('newRecordAdded', false);
    childRef.setInput('previousMenuId', pmid);
    childRef.setInput('previousRecordID', prid);
    if(gid){
      this.subMenuId = gid;
      childRef.setInput('subMenuId', gid);
      childRef.setInput('filterKey', filterKey);
    }
    childRef.setInput('newRecordID', this.newrecordid);
    childRef.setInput('_activeRecord', this.activeRecord());
    childRef.setInput('_refreshTable', this.updateTable);

    childRef.instance.addRecordemit.subscribe((event: any)=>{
      this.addRecordEvt(event);
    })

    childRef.instance.menuaccessemit.subscribe((event: any)=>{
      this.menuaccesseventgrid(event)
    })

    childRef.instance.resCompanyIDemit.subscribe((event: any)=>{
      this.resCompanyIDEvt(event);
    })

    childRef.instance.tabnameChange.subscribe((event: any)=>{
      this.tabName(event);
    })

    childRef.instance.menusChange.subscribe((event: any)=>{
      this.menusEvent(event);
    })

    childRef.instance.activeRecordChange.subscribe((event: any) => {
      this.activeRecordEvent(event);
    });

    childRef.instance.newRecordShow.subscribe((event: any)=>{
      this.newRecordShow.set(event);
    })

    childRef.instance.closeComponentEmit.subscribe((e: any)=>{
      this.destroyComponent(e);
    })

    childRef.instance.totalRecords.subscribe((event: any)=>{
      this.totalRecordsEvt(event);
    })

    childRef.instance.useraccessemit.subscribe((event: any)=>{
      this.useraccessevent(event);
    })

    this.childRefsG.set(this.activeRecord(), childRef);
  }

  totalRecordsEvt(event: any){
    this.totalRecords.set(event);
  }

  tabName(e: string){
    this.tabname.set(e);
    const existingID = this.childRefs.get(this.activeRecord());
    const existingIDG = this.childRefsGD.get(this.activeRecord())
    if (existingID) {
      existingID.setInput('tabname', this.tabname());
    }
    if(existingIDG){
      existingIDG.setInput('tabname', this.tabname());
    }
  }

  menusEvent(e: any){
    this.menus = e;
    this.newRecordAdded.set(false);
    this.loader.hide();
    if(this.activeRecord()){
      this.newRecordShow.set(false);
    }
  }

  activeRecordEvent(e: any){
    this.detailsPage.set(true);
    if(e.type){
      if(e.type === 'detailsBtnGrid'){
        this.detailsgridID = this.activeRecord();
        this.newrecordid = '';
      }
      this.activeRecord.set(e.activeRecord)
    }else{
      this.activeRecord.set(e);
      this.detailsBtnGrid = false;
    }
    if(e.type === 'detailsBtnGrid'){
      this.showDetailBtnGrid(this.activeRecord(), this.detailsgridID, this.recordList.currentid)
    }
    if(e.type === 'details'){
      let c = this.childRefsGDN.get(0);
      if(c){
        c.destroy();
        this.childRefsGDN.delete(0);
      }
      this.showDetailBtnRecord(this.activeRecord(), this.recordList.currentid, this.detailsgridID)
    }
    if(e.type === 'detailsbtnnewrecord'){
      this.showDetailBtnNewRecord(this.activeRecord())
    }
    if(!e.type){
      this.addComponent();
    }
  }

  closeNewRecordEvent(e: any){
    this.newrecordid = '';
    if(e.type === 'saveclose'){
      this.newrecordid = e;
      this.newRecordAdded.set(true);
      this.loader.show();
      setTimeout(()=>{
        this.newRecordAdded.set(false);
        this.loader.hide();
      }, 100)
      if(e.model === 'update'){
        if(e.pageType === 'detailsBtnGrid'){
          let g = this.childRefsGD.get(e.modelid);
          if(g){
            this.recordList.forEach((x:any)=>{
              if(x.id === this.recordList.currentid){
                let index = x.submenus.findIndex((x:any)=> x.id === e.modelid);
                if(index !== -1){
                  let de = x.submenus.splice(index, x.submenus.length);
                  let a = x.submenus.length;
                  this.showDetailBtnGrid(x.submenus[a-1].id, x.submenus[a-1].parentid, this.recordList.currentid);
                  if(de){
                    this.destroyComponent(de);
                  }
                }
              }
            });
          }
        }else{
          this.closeDetails(e.modelid);
        }
      }
      else{
        this.closeNewRecord()
      }
              this.updateTable = true;
          setTimeout(()=>{
            this.updateTable = false;
          },100)
    }
    else if(e){
      this.activeRecord.set(e.modelid);
      this.detailsPage.set(true);
     
      this.tabname.set('details');
   
      this.newrecordid = e;
      this.newRecordAdded.set(true);
      this.loader.show();
    
      if(e.type === 'saveadd' && e.model){
        if(e.model === 'update'){
          if(e.pageType === 'detailsBtnGrid'){
            let g = this.childRefsGD.get(e.modelid);
            if(g){
              this.recordList.forEach((x:any)=>{
                if(x.id === this.recordList.currentid){
                  let index = x.submenus.findIndex((x:any)=> x.id === e.modelid);
                  if(index !== -1){
                    let de = x.submenus.splice(index, x.submenus.length);
                    let a = x.submenus.length;
                    if(de){
                      this.destroyComponent(de);
                    }
                    
                    let gg = this.childRefsG.get(x.submenus[a-1].id);
                    if(gg){
                        gg.setInput('_activeRecord', e.modelid);
                        gg.setInput('newRecordAdded', true);
                        gg.setInput('newRecordID', this.newrecordid);
                    }
                  }
                }
              });
            }
          }
        }else{      
          this.closeDetails(e.modelid);
          let a: any = e;
          a.modelid = 0;
          this.newrecordid = a;
          this.activeRecord.set(0);
          //this.closeNewRecord();
        }
        this.addRecordEvt({show: true, pageType: this.page().pageType})
      }
      
      if(e.model !== 'new'){
        this.updateTable = true;
        setTimeout(()=>{
          this.updateTable = false;
          this.newRecordAdded.set(false);
          this.loader.hide();
          if(e.type === 'save'){
            this.activeRecord.set(e.modelid);
          }
          this.detailsPage.set(true);
          if(e.pageType === 'detailsBtnGrid'){
            this.detailsBtnGrid = true;
          }
          else{
            this.detailsBtnGrid = false;
          }
        }, 100)
      }else{
        const index = this.recordList.findIndex((x: any) => x.id === 0);
        this.updateTable = true;
        const childRef = this.childRefs.get(0);
        if(childRef) {
          childRef.destroy();
          this.childRefs.delete(0);
        }
        if(e.pageType === 'detailsBtnGrid'){
          this.activeRecord.set(e.modelid);
          this.recordList.forEach((x: any)=>{
            x.submenus.forEach((y: any)=>{
              if(y.id === 0){
                y.id = e.modelid;
                this.newrecordid = e.modelid;
              }
            })
          })
          this.detailsBtnGrid = true;
          this.addComponentGD();
          let n = this.childRefsGDN.get(0);
          if(n){
            n.destroy();
            this.childRefsGDN.delete(0);
          }
        }
        else{
          this.detailsBtnGrid = false;
          if(this.updateTable){
            setTimeout(() => {
              this.updateTable = false;
            }, 500);
          }
          this.addComponent();
        }
        if(index >= 0){
          this.recordList[index].id = e.modelid;
          this.recordList[index].newrecord = false;
        }
        if(e.type === 'save'){
          this.newRecordAdded.set(false);
          this.loader.hide();
        }        
      }
    }
  }

  addComponent(){
    this.childRefs.forEach(ref => {
      ref.setInput('visible', false);
    });
    
    this.childRefsG.forEach(ref => {
      ref.setInput('visible', false);
    });

    this.childRefsGD.forEach(ref => {
      ref.setInput('visible', false);
    });

    this.childRefsGDN.forEach(ref => {
      ref.setInput('visible', false);
    });

    const existingID = this.childRefs.get(this.activeRecord());

    if (existingID) {
      // If already exists, just make it visible
      existingID.setInput('activeRecords', this.activeRecord());
      existingID.setInput('visible', true);
      return;
    }

    const childRef = this.container.createComponent(RecordDetail);
    childRef.setInput('menuId', this.menuactiveid);
    childRef.setInput('recordId',this.activeRecord());
    childRef.setInput('activeRecords', this.activeRecord());
    childRef.setInput('page',this.page());
    childRef.setInput('visible', true);
    childRef.setInput('tabname', this.tabname());
    childRef.setInput('pageType', this.pageType);
    childRef.setInput('menuaccess', this.menuacess);
    childRef.setInput('prerequisitesType', this.prtype());
    if(this.activeRecord() === 0){
      childRef.setInput('companyID', this.companyID());
    }else{
      childRef.setInput('companyID', this.rescompanyID);
    }
    childRef.setInput('recordList', this.recordList);
    childRef.setInput('menulabel', this.menus);

    childRef.instance.closeNewRecord.subscribe((event: any) =>{
      this.closeNewRecordEvent(event);
    })

    childRef.instance.deletedRecord.subscribe((event: any) =>{
      this.deletedRecordEvent(event);
    })

    childRef.instance.approveClose.subscribe((event: any) =>{
      this.approveCloseEvent(event);
    })

    childRef.instance.wfStatusUpdate.subscribe((event: any) =>{
      this.wfStatusUpdateEvt(event);
    })
    
    childRef.instance.activeRecordsChange.subscribe((event: any) => {
      this.activeRecordEvent(event);
    });

    childRef.instance.closeComponentEmit.subscribe((e: any)=>{
      this.destroyComponent(e);
    })

    childRef.instance.prerequisiteType.subscribe((e: any)=>{
      this.genReport.set(false);
      setTimeout(()=>{
        this.prerequisiteTypeEvent(e);
      },500)
    })

    this.childRefs.set(this.activeRecord(), childRef);
  }

  addComponentGD(){

    let menuid,recid;
    this.recordList.forEach((x:any)=>{
      if(x.id === this.recordList.currentid){
        x.submenus.forEach((y:any)=>{
          if(y.id === this.activeRecord()){
            menuid = y.menuid;
            recid = y.id;
          }
        })
      }
    })

    const childRef = this.containerGD.createComponent(RecordDetail);
    childRef.setInput('page',this.page());
    childRef.setInput('pageType', 'detailsBtnGrid');
    childRef.setInput('menuaccess', this.menuacessgrid);
    childRef.setInput('companyID', this.rescompanyID);
    childRef.setInput('recordList', this.recordList);
    childRef.setInput('menuId', menuid);
    childRef.setInput('recordId', recid);
    childRef.setInput('activeRecords', this.activeRecord());
    childRef.setInput('menulabel', '');
    childRef.setInput('tabname', this.tabname());
    childRef.instance.closeNewRecord.subscribe((e: any)=>{
      this.closeNewRecordEvent(e);
    })

    childRef.instance.deletedRecord.subscribe((e: any)=>{
      this.deletedRecordEvent(e);
    })

    childRef.instance.activeRecordsChange.subscribe((e: any)=>{
      this.activeRecordEvent(e);
    })

    childRef.instance.closeComponentEmit.subscribe((e: any)=>{
      this.destroyComponent(e);
    })

    this.childRefsGD.set(this.activeRecord(), childRef);
  }

  requisiteType(type: string){
    this.prtype.set(type);
  }

  prTypeEvent(e: any){
    this.prtype.set(e);
    this.preRequisiteOption.set(false);
  }

  prerequisiteTypeEvent(e: any){
    this.page.set(e.page);
    this.genReport.set(true);
    this.preReqIndex = e.index;
    this.queryDatagrid = e.data;
    this.gridrecordId.set(e.recordid);
    
    const user = JSON.parse(localStorage.getItem('user') || '');
    const lang = JSON.parse(localStorage.getItem('lang') || '');
    
    if(this.page().menuType === 'Dashboard'){
      let url = "General/RunPrerequesiteProcedure?isrunprocedure=true&isDataNeed=false";
      let params = {
        "menuID": this.page().id,
        "userID": user.id,
        "languageID": lang,
        "recordID": this.gridrecordId(),
        "companyID": this.companyID(),
        "applicationID": user.applicationID,
        "queryfields": this.queryDatagrid,
        "pageNumber": 1,
        "pageSize": 10,
      }
      this.loader.show();
      this._http.postClient<any, ApiResponse>(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (response)=>{
          this.loader.hide();
          if(response.erroMessage){
            this.toastr.error(response.erroMessage);
          }else{
            this.preid = response.id;
            this.preRequisiteOption.set(true);
          }
        },
        error: (_e)=>{
          this.loader.hide();
        }
      })
    }
    else{
      setTimeout(()=>{
        this.preRequisiteOption.set(true);
      },200)
    }
  }
  
  openreport(item: any){
    if(localStorage.getItem('taskid') && this.taskid.length === 0){
      this.taskid = [];
      let a  =  JSON.parse(localStorage.getItem('taskid') || '');
      a.forEach((x: any)=>{
          this.taskid.push(x)
      })
    }
    
    let a = this.taskid.filter((e: any)=> e.tid === item.tid);
    const i = this.taskid.findIndex((e: any) => e.tid === item.tid);
    this.taskid.splice(i, 1);

    if(this.taskid.length > 0){
      localStorage.setItem('taskid', JSON.stringify(this.taskid));
    }else{
      localStorage.removeItem('taskid');
    }
    if(a.length > 0){
      this.prtype.set('grid');
      this.preRequisiteOption.set(true);
      this.store.dispatch(StoreAction.reportListRemove({list: a[0]}));
    }else{
      this.prtype.set('grid');
      this.preRequisiteOption.set(true);
      this.store.dispatch(StoreAction.reportListRemove({list: item}));
      this.or.unsubscribe();
    }
  }

  menuaccessevent(event: any){
    this.menuacess = event;
  }

  useraccessevent(event: any){
    this.useraccess = event;
  }

  menuaccesseventgrid(event: any){
    this.menuacessgrid = event;
  }

  deletedRecordEvent(e: any){
    this.closeDetails(e.record);
    this.showGrid();
    this.recorddeleted = {id: e.menuid, deleted: true};
  }

  resCompanyIDEvt(e: any){
    this.rescompanyID = e;
  }

  approveCloseEvent(_e: any){
    this.closeDetails(this.activeRecord());
  }

  wfStatusUpdateEvt(_e: any){
    this.updateTable = false;
    if(_e){
      setTimeout(()=>{
        this.updateTable = true;
      }, 500)
    }
  }

  destroyComponent(e: any){
    e.forEach((x:any)=>{
      let c = this.childRefsG.get(x.id);
      let d = this.childRefsGD.get(x.id);
      let n = this.childRefsGDN.get(x.id);
        if(c){
          c.destroy();
          this.childRefsG.delete(x.id);
        }
        if(d){
          d.destroy();
          this.childRefsGD.delete(x.id);
        }
        if(n){
          n.destroy();
          this.childRefsGDN.delete(x.id);
        }
    })
  }

  getmenuFields(){
    this.getmenuFieldsto = true;
    setTimeout(()=>{
      this.getmenuFieldsto = false;
    },1000)
  }

  procedureJobEvt(e: any){
    if(e.status === 'started'){
      setTimeout(()=>{
        let c = this.recordList.findIndex((a: any)=> a.id === e.record || a.id === e.record.rid);
        if(c > -1){
          this.recordList[c].disableClose = true;
        }
        
        let a  = {'disable': true, 'pageid': this.menuactiveid}
        this.procedureJob.emit(a);
      },1000)
    }else if(e.status === 'completed'){
      setTimeout(()=>{
        let c = this.recordList.findIndex((a: any)=> a.id === e.record || a.id === e.record.rid);
        if(c > -1){
          this.recordList[c].disableClose = false;
        }
              
        let b = this.recordList.findIndex((a: any)=> a.disableClose === true);
        if(b === -1){
          let a  = {'disable': false, 'pageid': this.menuactiveid}
          this.procedureJob.emit(a);
        }
      },1000)
    }
  }

  jobProgressEvt(e: any){
    const existingID = this.childRefs.get(e.record.rid);
    if(e.status === 'inprogress'){
      let c = this.recordList.findIndex((a: any)=> a.id === e.record.rid);
        if(c > -1){
          this.recordList[c].disableClose = true;
        }
    }
    if(existingID){
      existingID.setInput('jobProgress', e)
    }
  }

  addRecordEvt(e: any){
    if(e.show === true){
       if(e.pageType === 'detailsBtnGrid'){
      let rid = this.recordList.findIndex((x:any)=> x.id === this.detailsgridID);

      if(rid >= 0){
        if(this.recordList[rid].submenus.length > 0){
          
          this.detailsBtnGrid = true;
        
          let a =  this.recordList[rid].submenus.findIndex((x:any)=> x.parentid === this.detailsgridID);

          let b = this.recordList[rid].submenus;
          if(a <= 0){
            let de = this.recordList[rid].submenus.splice(a+1, this.recordList[rid].submenus.length);
            //this.closeComponentEmit.emit(de);
            this.destroyComponent(de);
          }
          b.push({id: 0, desc: '', menuid: b[a].menuid, filter: '', parentid: b[a].parentid, recordid: '', type: 'detailsbtnnewrecord'});
          this.activeRecord.set(0);
          let r = {activeRecord: this.activeRecord(), type : 'detailsbtnnewrecord'}
          this.activeRecordEvent(r);
        }
      }
      else{
        this.recordList.forEach((x:any)=>{
          if(x.id === this.recordList.currentid){
            let a = x.submenus.findIndex((x:any)=> x.id === this.detailsgridID);
            if(a >= 0){
              let menuid:any = '';
              if(this.pageAdd() && this.activeID()) {
                menuid = this.activeID();
              }
              else if(this.subMenuId){
                menuid = this.subMenuId;
              }
              let index = x.submenus.findIndex((y:any)=> y.parentid === this.activeRecord);
              if(index !== -1){
                let de = x.submenus.splice(index, x.submenus.length);
                //this.closeComponentEmit.emit(de);
                this.destroyComponent(de);
              }
              x.submenus.push({id: 0, desc: '', menuid: menuid, filter: '', parentid: this.activeRecord(), recordid: '', type: 'detailsbtnnewrecord'});    
              
              this.activeRecord.set(0);
              let r = {activeRecord: this.activeRecord(), type : 'detailsbtnnewrecord'}
              this.activeRecordEvent(r)
            }
          }
        })
      }
    }
    else{
      if (this.recordList && this.recordList.length === 0) {
        this.recordList.push({ id: 0, newrecord: true, menus: this.menus, disableClose: false, submenus: [] });
        this.recordList.currentid = 0;
        //this._menus.recordList.next(this.recordList);
      } else {
        const index = this.recordList.findIndex((x: any) => x.id === 0);
        if (index < 0) {
          this.recordList.push({ id: 0, newrecord: true, menus: this.menus, disableClose: false, submenus: [] });
          this.recordList.currentid = 0;
          //this._menus.recordList.next(this.recordList);
        }
      }
      this.activeRecord.set(0);
      this.activeRecordEvent(this.activeRecord());
    }
    if(this.newRecordAdded && (this.newrecordid && this.newrecordid.type !== 'saveadd') && (e.pageType === 'pendingwf' || e.pageType === 'mainmenu')){
      this.newRecordAdded.set(false);
      const index = this.recordList.findIndex((x: any) => x.id === 0);
      if(index >= 0){
        this.recordList.splice(index, 1);
      }
    }
      this.addRecord(e.pageType === 'detailsBtnGrid' ? 'detailsBtnGrid':'mainmenu')
    }
  }

  ngOnDestroy(){
    //this.or.unsubscribe();
    this.activepage.unsubscribe();
    if(this.activeCompany){
      this.activeCompany.unsubscribe();
    }
  }
}