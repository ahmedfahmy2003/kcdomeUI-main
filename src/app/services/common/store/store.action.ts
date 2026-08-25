import { createAction, props } from "@ngrx/store";
import { Menu, ListR } from "../../../shared/interface";

export const addPage = createAction("[Menu] Add Page", props<{menu: Menu}>());
export const activePage = createAction("[Menu] Active Page", props<{active: string}>());
export const recordOpen = createAction("[Menu] Open Record", props<{active: any}>());
export const menuList = createAction("[Menu] Menu List", props<{list: any}>());
export const companyStore = createAction("[App] Company List", props<{list: any}>());
export const companyID = createAction("[App] Active Company", props<{active: any}>());
export const closePage = createAction("[Menu] Close Page", props<{menu: Menu}>());
export const closeAll = createAction("[Menu] Close All Page");
export const reportList = createAction("[App] Report List", props<{list: ListR}>());
export const reportListRemove = createAction("[App] Report List Close", props<{list: ListR}>());