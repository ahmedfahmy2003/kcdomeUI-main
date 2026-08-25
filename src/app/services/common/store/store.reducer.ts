import { createReducer, on, Store } from "@ngrx/store"
import { initialState, initialPage, initialCompanyID, companystore, reportstore, menus } from "./store.state";
import * as StoreAction from "./store.action"

const _pageReducer = createReducer(initialState,
    on(StoreAction.addPage, (state, action)=>{
        const menulist = [...state.menulist];
        const index = menulist.findIndex(x => ((x.id === action.menu.id && x.pageType === action.menu.pageType) && (action.menu.pageType !== 'detailmenu' && action.menu.pageType !== 'prerequisitemenu' && action.menu.pageType !== 'pendingwf')) || ((x.dtid === action.menu.dtid && x.id === action.menu.id && x.pageType === action.menu.pageType) &&  (action.menu.pageType === 'detailmenu' || action.menu.pageType === 'prerequisitemenu' || action.menu.pageType === 'pendingwf')));
        let pageStatus:boolean = false; 
        if(index < 0){
            menulist.push(action.menu);
            pageStatus = true;
        }
        return {
            ...state,
            menulist: menulist,
            pageAdd: pageStatus
        }
    }),
    on(StoreAction.closePage, (state, action)=>{
        const menulist = [...state.menulist];
        const index = menulist.findIndex(x => ((x.id === action.menu.id && x.pageType === action.menu.pageType) && (action.menu.pageType !== 'detailmenu' && action.menu.pageType !== 'prerequisitemenu' && action.menu.pageType !== 'pendingwf')) || ((x.dtid === action.menu.dtid && x.id === action.menu.id && x.pageType === action.menu.pageType) &&  (action.menu.pageType === 'detailmenu' || action.menu.pageType === 'prerequisitemenu' || action.menu.pageType === 'pendingwf')));
        menulist.splice(index, 1);
        return {
            ...state,
            menulist: menulist,
            pageAdd: false
        }
    }),
    on(StoreAction.closeAll, (state)=>{
        return {
            ...state,
            menulist: []
        }
    })
);

const _activePage = createReducer(initialPage,
    on(StoreAction.activePage, (state, action)=> {
        return {
            ...state,
            active: action.active
        }
    })
)

const _recordOpen = createReducer(initialPage,
    on(StoreAction.recordOpen, (state, action)=> {
        return {
            ...state,
            active: action.active
        }
    })
)


const _activeCompany = createReducer(initialCompanyID,
    on(StoreAction.companyID, (state, action)=> {
        return {
            ...state,
            active: action.active
        }
    })
)

const _companystore = createReducer(companystore,
    on(StoreAction.companyStore, (state, action)=> {
        return {
            ...state,
            list: action.list
        }
    })
)

const _reportstore = createReducer(reportstore,
    on(StoreAction.reportList, (state, action)=> {
        let clist:any = [...state.list];
        const index = clist.findIndex((x:any) => (x.mid === action.list.mid && x.rid === action.list.rid));
        if(index < 0){
            clist.push(action.list);
        }
        return {
            ...state,
            list: clist
        }
    }),
    on(StoreAction.reportListRemove, (state, action)=>{
        let clist:any = [...state.list];
        const index = clist.findIndex((x:any) => x.tid === action.list.tid);
        if(index > -1){
            clist.splice(index, 1);
        }
        return {
            ...state,
            list: clist
        }
    })
)

const _menuList = createReducer(menus,
    on(StoreAction.menuList, (state, action)=> {
        return {
            ...state,
            list: action.list
        }
    })
)

export function pageReducer(state: any, action: any){
    return _pageReducer(state, action)
}

export function activePage(state: any, action: any){
    return _activePage(state, action)
}

export function recordOpen(state: any, action: any){
    return _recordOpen(state, action)
}

export function activeCompany(state: any, action: any){
    return _activeCompany(state, action)
}

export function companyStore(state: any, action: any){
    return _companystore(state, action)
}

export function reportStore(state: any, action: any){
    return _reportstore(state, action)
}

export function menuList(state: any, action: any){
    return _menuList(state, action)
}