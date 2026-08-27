import { Component, ElementRef, HostListener, signal } from "@angular/core";
import { AppService } from "../../../services/common/common.service";

@Component({
    selector: 'app-language',
    standalone: true,
    imports: [],
    templateUrl: './language.html',
    styleUrl: './language.scss'
})

export class Language{
    langid: number = 1;
    isOpen = signal(false);

    constructor(private _http: AppService, private eRef: ElementRef){
        const lang = JSON.parse(localStorage.getItem('lang')!);
        this.setTheme(lang);
    }

    toggle() {
        this.isOpen.update(v => !v);
    }

    setLang(langid: number){
        this._http.setLanguage.next(langid);
        localStorage.setItem('lang',JSON.stringify(langid));
        this.toggle();
        this.setTheme(langid);
    }

    setTheme(id: number){
        const theme = document.getElementById('theme');
        const kcdome = document.getElementById('kcdome');
        this.langid = id;
        kcdome?.classList.add('nk-body');
        if(id === 2){
            theme?.setAttribute('href','css/dashlite.rtl.css');
            kcdome?.setAttribute('dir','rtl');
            kcdome?.classList.add('has-rtl');
        }else{
            theme?.setAttribute('href','css/dashlite.css');
            kcdome?.removeAttribute('dir');
            kcdome?.classList.remove('has-rtl');
        }
    }

    @HostListener('document:click', ['$event'])
    handleClickOutside(event: Event) {
        if (!this.eRef.nativeElement.contains(event.target)) {
        this.isOpen.set(false);
        }
    }
}
