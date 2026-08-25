import { inject, Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { firstValueFrom } from "rxjs";

@Injectable({
  providedIn: 'root'
})

export class AppService {
    _baseurl = '';
    _signalrurl = '';
    reporturl = '';
    dateFormat = '';
    dateTimeFormat = '';
    hijriDate = false;
    dateValue = '';
    copyright = "";
    version = "";
    private http = inject(HttpClient);
    public langid: number = JSON.parse(localStorage.getItem('lang') || '1');
    setLanguage: BehaviorSubject<number> = new BehaviorSubject(this.langid);
    closeDetails: BehaviorSubject<number> = new BehaviorSubject<number>(0);

    async loadConfig(): Promise<void> {
        const data = await firstValueFrom(this.http.get<any>("./setup.json"));
        this._baseurl = data.apiUrl;
        this.version = data.version,
        this.copyright = data.copyright;
        this._signalrurl = data.signalrurl;
        this.dateFormat = data.dateFormat;
        this.dateTimeFormat = data.dateTimeFormat;
        this.hijriDate = data.hijri;
        this.dateValue = data.value;    
    }

    get baseurl() {
        return this._baseurl;
    }

    get signalrurl() {
        return this._signalrurl;
    }

    getSignalrURL(url: string){
        return this.http.get(this.signalrurl + url);
    }

    geturl(){
        return this._baseurl;
    }

    isHijri(){
        return this.hijriDate;
    }

    getDateFormat(){
        return this.dateFormat;
    }

    getDateTimeFormat(){
        return this.dateTimeFormat;
    }

    getDateValue(){
        return this.dateValue;
    }

    getClient<AResponse>(url: string){
        return this.http.get<AResponse>(`${this._baseurl}${url}`, {headers: this.handleHeaders()});
    }

    deleteClient<AResponse>(url: string){
        return this.http.delete<AResponse>(this._baseurl + url, {headers: this.handleHeaders()});
    }

    getFile(url: string){
        return this.http.get(this._baseurl + url, {headers: this.handleHeaders(), responseType: 'blob'})
    }

    getReport(url: string, body: any){
        return this.http.put(this.reporturl + url, body);
    }

    postClient<AString, AResponse>(url: string, body: AString){
        return this.http.post<AResponse>(`${this._baseurl}${url}`, body,{headers: this.handleHeaders()});
    }

    putClient<AString, AResponse>(url: string, body: AString){
        return this.http.put<AResponse>(`${this._baseurl}${url}`, body,{headers: this.handleHeaders()});
    }

    delClient(url: string){
        return this.http.delete(this._baseurl + url, {headers: this.handleHeaders()});
    }

    handleHeaders(){
        const user = JSON.parse(localStorage.getItem('user') || '');
        return new HttpHeaders({"Authorization": user._token, "RequestingResource":"Browser","UserID": user.id})
    }

}