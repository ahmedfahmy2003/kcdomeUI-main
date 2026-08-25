import { isDevMode } from '@angular/core';
import {
  ActionReducerMap,
  MetaReducer
} from '@ngrx/store';
import { pageReducer, activePage, activeCompany, recordOpen, menuList, companyStore, reportStore } from '../services/common/store/store.reducer';

export interface State {

}

export const reducers: ActionReducerMap<State> = {
  pages: pageReducer,
  active: activePage,
  recordOpen: recordOpen,
  company: activeCompany,
  list: menuList,
  companylist: companyStore,
  reportlist: reportStore,
};


export const metaReducers: MetaReducer<State>[] = isDevMode() ? [] : [];
