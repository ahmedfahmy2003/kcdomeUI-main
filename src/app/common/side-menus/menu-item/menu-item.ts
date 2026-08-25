import { Component, effect, ElementRef, HostListener, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-menu-item',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl:'./menu-item.html',
    styleUrl: './menu-item.scss'
})

export class MenuItems{
    item = input<any>();
    openmenu = output<any>({});
    addfav = output();
    openSub = signal(false);
    isOpen = signal(false);
    editableItem = signal<any>([]);
    constructor(private eRef: ElementRef) {
        effect(() => {
            this.editableItem.set(structuredClone(this.item()));
        });
    }
    openPage(item: any, type: any){
        if(item.children.length > 0){
           this.editableItem.update(v => ({ ...v, expand: !v.expand }));
        }else{
            this.openmenu.emit({item,type})
        }
    }

    toggle() {
        this.isOpen.update(v => !v);
    }

    openMenu(item: any, type: string){
        this.openmenu.emit({item, type});
        this.toggle();
    }

    addFav(item: any){
        this.addfav.emit(item)
        this.toggle();
    }

    @HostListener('document:click', ['$event'])
    handleClickOutside(event: Event) {
        if (!this.eRef.nativeElement.contains(event.target)) {
            this.isOpen.set(false);
        }
    }
}