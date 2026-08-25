import { CommonModule } from "@angular/common";
import { Component, ElementRef, HostListener, input, output, signal } from "@angular/core";

@Component({
    selector: 'app-fav-item',
    standalone: true,
    imports: [CommonModule],
    templateUrl:'./fav-item.html',
    styleUrl: './fav-item.scss'
})

export class FavItems{
    item = input<any>();
    isOpen = signal(false);
    openpage = output<any>({});
    removeitem = output<number>();

    constructor(private eRef: ElementRef){
        
    }

    openFavPage(item: any, type: string){
        this.openpage.emit({item, type});
        if(type){
            this.toggle();
        }
    }

    removeFav(id: any){
        this.removeitem.emit(id);
        this.toggle();
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
}