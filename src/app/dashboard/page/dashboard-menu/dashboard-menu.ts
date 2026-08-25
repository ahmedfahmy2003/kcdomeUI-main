import { Component, ElementRef, HostListener, input, output, signal } from "@angular/core";

@Component({
    selector: 'dashboard-menu',
    standalone: true,
    imports: [],
    templateUrl: './dashboard-menu.html',
    styleUrl: './dashboard-menu.scss'
})

export class DashboardMenu {
    templateList = input<any>([]);
    isOpen = signal<boolean>(false);
    editbtn = input<boolean>(true);
    selectTemplateEmit = output<number>();
    constructor(private eRef: ElementRef) {}
    @HostListener('document:click', ['$event'])
    handleClickOutside(event: Event) {
        if (!this.eRef.nativeElement.contains(event.target)) {
            this.isOpen.set(false);
        }
    }

    toggle(){
        this.isOpen.update(v => !v);
    }

    selectTemplate(e: number){
        this.isOpen.set(false);
        this.selectTemplateEmit.emit(e)
    }
}