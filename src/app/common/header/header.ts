import { Component, inject, signal } from "@angular/core";
import { CompanyList } from "../company-list/company-list";
import { SidebarService } from "../../services/sidebar/sidebar.service";
import { Language } from "./language/language";
import { Usermenu } from "./user-menu/user-menu";
import { Notification } from "./notification/notification";
import { ThemeService } from "../../services/common/theme.service";

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CompanyList, Language, Usermenu, Notification],
    templateUrl: './header.html',
    styleUrl: './header.scss'
})

export class Header {
    reportAvailable = signal<boolean>(false);
    readonly themeService = inject(ThemeService);

    constructor(public sidebar: SidebarService){

    }

    toggleTheme(): void {
        this.themeService.toggleTheme();
    }
}
