export interface apiResultFormat {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
    totalData: number;
}

export interface mainMenu {
    menu: MenuItem[];
    separateRoute: boolean;
    menuValue: string;
    tittle: string;
    route: string;
    base: string;
    icon: string;
    showAsTab: boolean;
    url: string;
}

export interface MenuItem {
    menuValue: string;
    showSubRoute: boolean;
    route: string;
    hasSubRoute: boolean;
    icon: string;
    base: string;
    url: string;
  }

export interface SideBarData {
    tittle: string;
    active: boolean;
    icon: string;
    showAsTab: boolean;
    separateRoute: boolean;
    menu: MenuItem[];
    menuValue: string;
    menuValue1?: string;
    showSubRoute: boolean;
    route: string;
    hasSubRoute: boolean;
    base: string;
    subMenus: subMenus[];
    Mainmenu: mainMenu[];
    url: string;
  }

export interface SideBar {
    showMyTab?: boolean;
    tittle: string;
    icon: string;
    showAsTab: boolean;
    separateRoute: boolean;
    materialicons?: string;
    menu: SideBarMenu[];
}

export interface SideBarMenu {
    showMyTab?: boolean;
    menuValue: string;
    menuValue1?: string;
    route?: string;
    hasSubRoute: boolean;
    showSubRoute: boolean;
    icon: string;
    base: string;
    materialicons: string;
    subMenus: SubMenu[];
  }

export interface SubMenu {
    menuValue: string;
    menuValue1?: string;
    route?: string;
    base: string;
    base2?: string;
    base3?: string;
    base4?: string;
    base5?: string;
    base6?: string;
    base7?: string;
    base8?: string;
  }

export interface subMenus {
  url: string;
  separateRoute: boolean;
  menuValue: string;
  tittle: string;
  icon: string;
  showAsTab: boolean;
  showSubRoute: boolean;
  title: string;
  route?: string;
  base?: string;
  MenuItem: string;
}

export interface mainMenus {
  menu: MenuItem[];
  separateRoute: boolean;
  menuValue: string;
  tittle: string;
  route: string;
  base: string;
  icon: string;
  showAsTab: boolean;
  active: boolean;
  showSubRoute: boolean;
  url: string;
}

export interface mainMenu {
  menu: MenuItem[];
  separateRoute: boolean;
  menuValue: string;
  tittle: string;
  route: string;
  base: string;
  icon: string;
  showAsTab: boolean;
  url: string;
}

export interface MenuItem {
  menuValue: string;
  showSubRoute: boolean;
  route: string;
  hasSubRoute: boolean;
  icon: string;
  base: string;
  url: string;
}