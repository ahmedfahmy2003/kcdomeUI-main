export interface MenuItem {
  seq: number;
  name: string;
  id: number;
  parentMenuId: number;
  linkedMenuID: number;
  icon: string;
  menuType: string;
  menuPath: string;
  prerequisiteMenuID: number;
  expand: boolean;
  children: [];
}