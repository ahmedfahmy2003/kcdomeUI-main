import { Component, ElementRef, HostListener, inject, signal } from "@angular/core";
import { LogoutService } from "../../../services/auth/logout.service";
import { Store } from '@ngrx/store';
import * as StoreAction from "../../../services/common/store/store.action";

@Component({
    selector: 'user-menu',
    standalone: true,
    imports: [],
    templateUrl: './user-menu.html',
    styleUrl: './user-menu.scss'
})

export class Usermenu{
    username: string = '';
    isOpen = signal(false);
    private store = inject(Store);
    constructor(private eRef: ElementRef, private logout: LogoutService){
        const user = JSON.parse(localStorage.getItem('user') || '');
        this.username = user.userName;  
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

    logOut() {
        this.logout.logout();
    }
    userOptions(name: string){
        const items = {id:name+'0', dtid: '', pwfid: '', name: name, pageType: 'user', menuType: '', record: '', isKeyManualInput: null, isJobEnable: false, disableClose: false};
        this.store.dispatch(StoreAction.addPage({menu: items}))
        this.store.dispatch(StoreAction.activePage({active: name+'0'}));
        this.isOpen.set(false);
    }
}