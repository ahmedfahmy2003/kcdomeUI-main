export interface Menu {
    id: string,
    dtid: string,
    pwfid: string,
    name: string,
    pageType: string,
    menuType: string,
    record: string,
    isJobEnable: boolean,
    isKeyManualInput: any,
    disableClose: boolean
}

export interface MenuList {
    menulist: Menu[]
}

export interface RList {
    list: ListR []
}

export interface ListR {
    tid: string,
    rid: any,
    mid: any,
    mname: string
    page: any,
    status: string,
    index: any,
    data: any
}

export interface MenuNode { 
    children: MenuNode[];
    id: number;    
    icon:string;
    labelId: string;
    menuType: string;
    name: string;
    parentMenuId: number;
    prerequisiteMenuID: number;
    linkedMenuID: number;
    menuPath: string;
}

export interface MenuFlatNode {
    children: MenuNode[];
    id: number;
    icon: string;
    labelId: string;
    menuType: string;
    name: string;
    parentMenuId: number;
    prerequisiteMenuID: number,
    linkedMenuID: number,
    expandable: boolean;
    level: number;
    menuPath: string;
}

export interface Record {
    id: number
}

export interface RecordList {
    recordlist: Record[]
}
  
export interface url{
    url:string
}

type DynamicRow = { [key: string]: unknown };

export interface ApiResponse<T = DynamicRow> {
  erroMessage: string | null;
  successMessage: string | null;
  dataModel: T[];
  stringID: string | null;
  token: string | null;
  userName: string | null;
  languageID: number;
  rowCount: number;
  applicationID: number;
  empID: number;
  userLogId: number;
  id: number;
  uniqueKey: number;
  isActionField: boolean;
  filterCondition: string | null;
  taskId: number;
  status: string | null;
  filePath: string | null;
}