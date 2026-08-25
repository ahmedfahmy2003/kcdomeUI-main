import { Component, ElementRef, EventEmitter, HostListener, Input, Output, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";

@Component({
    selector: 'export-record',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './export-record.html',
    styleUrl: './export-record.scss'
})

export class ExportRecord {
    isOpen = signal(false);
    exportAll = signal(false);
    resultsLength: number = 0;
    @Input() set _resultsLength(value: number){
        this.resultsLength = value;
    }

    get _resultsLength(): number{
        return this.resultsLength;
    }

    pageSize: number = 0;
    @Input() set _pageSize(value: number){
        this.pageSize = value;
    }

    get _pageSize(): number{
        return this.pageSize;
    }

    exportid: number = 0;
    @Input() set _exportid(value: number){
        this.exportid = value;
    }

    get _exportid(): number{
        return this.exportid;
    }

    @Output() exportEmit = new EventEmitter;

    constructor(private eRef: ElementRef){
  
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

    exportData(id: number, size: number) {
        this.isOpen.set(false);
        this.exportEmit.emit({id: id, size: size, exportAll: this.exportAll()});
    }
}