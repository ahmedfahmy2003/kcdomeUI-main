import { Component, inject, signal } from '@angular/core';
import { SideMenus } from '../common/side-menus/side-menus';
import { Header } from '../common/header/header';
import { SidebarService } from '../services/sidebar/sidebar.service';
import { CommonModule } from '@angular/common';
import { Page } from './page/page';
import { StorageService } from '../services/auth/storage.service';
import { ThemeService } from '../services/common/theme.service';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SideMenus, Header, Page],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  hasHover = signal(false);
  readonly themeService = inject(ThemeService);

  constructor(public sidebar: SidebarService){
    
  }

  hoverEvt(e: boolean){
    this.hasHover.set(e);
  }

}
