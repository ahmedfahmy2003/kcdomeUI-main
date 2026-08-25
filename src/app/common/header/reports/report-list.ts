import { CommonModule } from "@angular/common";
import { Component, ElementRef, HostListener, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { select, Store } from "@ngrx/store";
import * as StoreAction from "../../../services/common/store/store.action";

@Component({
    selector: 'app-report-list',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './report-list.html',
    styleUrl: './report-list.scss'
})

export class ReportList {
    lcount = signal(0);
    private store = inject(Store);
    isOpen = signal(false);
    rlist = signal<any>([]);
    menuclicked: boolean = false

    constructor(private eRef: ElementRef){
        this.store.pipe(select('reportlist')).subscribe(data=>{
            if(data.list && data.list.length > 0){
                this.lcount.set(data.list.length);
                this.rlist.set(data.list);
            }else{
                this.lcount.set(0);
                this.rlist.set([]);
            }
        });
    }

    @HostListener('document:click', ['$event'])
    handleClickOutside(event: Event) {
        if (!this.eRef.nativeElement.contains(event.target)) {
            this.isOpen.set(false);
        }
    }

    toggle() {
        this.isOpen.update(v => !v);
    }

    openMenu(items: any){
        this.isOpen.set(false);
        this.menuclicked = false;
        this.openm(items);
    }

    openm(items: any){
        
       let a =  this.store.pipe(select('pages')).subscribe(data=>{
            if(!this.menuclicked){
                this.menuclicked = true;
                let menus: any = data.menulist;
                if(menus.length !== 0){
                    let i = menus.findIndex((m: any)=>m.id === items.page.id);
                    if(i < 0){
                        this.openitem(items.page, items);
                    }else{
                        this.store.dispatch(StoreAction.activePage({active: items.page.id}));
                        let a  = {tid: items.tid, rid: items.rid, mid: items.mid,pr: 'record', index: items.index, data: items.data}
                        setTimeout(()=>{
                        this.store.dispatch(StoreAction.recordOpen({active: a}));
                        },1000)
                    }
                }
            }
        });

        a.unsubscribe();
    }

    openitem(page: any, e: any){
        let items = {id: page.id, dtid: page.dtid, pwfid:'', name: page.name, pageType: 'prerequisitemenu', menuType: page.menuType, record: '', isKeyManualInput: null, isJobEnable: false, disableClose: false};
        this.store.dispatch(StoreAction.addPage({menu: items}))
        this.store.dispatch(StoreAction.activePage({active: items.id}));
        let a  = {tid: e.tid, rid: e.rid, mid: e.mid, pr: 'menu', index: e.index, data: e.data}
        setTimeout(()=>{
            this.store.dispatch(StoreAction.recordOpen({active: a}));
        },1000)
    }
}