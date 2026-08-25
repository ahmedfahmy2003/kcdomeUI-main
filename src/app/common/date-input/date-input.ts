import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, Inject, SimpleChanges, ElementRef, ViewChild, signal, input, effect, DestroyRef } from '@angular/core';
import { FormControl, FormsModule } from '@angular/forms';
import {MatDatepickerInputEvent, MatDatepickerIntl, MatDatepickerModule} from '@angular/material/datepicker';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import 'moment/locale/en-IN';
import 'moment/locale/ar-SA';
import { ToastrService } from 'ngx-toastr';
import { AppService } from '../../services/common/common.service';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { ModalService } from '../../services/common/modal.service';
import { ApiResponse } from '../../shared/interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'date-input',
  templateUrl: './date-input.html',
  styleUrl: './date-input.scss',
  standalone: true,
  providers: [provideMomentDateAdapter(undefined, {useUtc:true}),{provide: MAT_DATE_LOCALE, useValue: 'en-IN'}],
  imports: [CommonModule, FormsModule, MatDatepickerModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DateInput implements OnInit {
  @Output() setfieldVal = new EventEmitter;
  @Output() keypressevent = new EventEmitter;
  field = signal<any>({});
  @Input() set _field (value: any){
    this.field.set(value);
  }
  get _field(): any{
    return this.field;
  }
  @Input() actionStop: boolean;
  @Input() recordList: any;
  @Input() fieldActionBody: any;
  readOnly: boolean;
  @Input() set _readOnly(value: boolean){
    this.readOnly = value;
  }
  get _readOnly(): boolean{
    return this.readOnly;
  }
  @Input() rreadonly: boolean;
  @Input() menuId: number;
  @Input() companyID: any;
  @Input() recordId: number;
  @Input() precordid: number;
  @Input() pageType: any;
  dateFormat: string;
  date = new FormControl(new Date());
  hDate: any;
  hMonth: any;
  hYear: any;
  constHYear: any;
  hijrien: any;
  isHijri: boolean;
  @ViewChild('input') vc: ElementRef<HTMLInputElement>;
  keyTab: boolean = false;
  @Input() set _keyTab(value: boolean){
    this.keyTab = value;
    if(this.keyTab){
      setTimeout(()=>{
        this.vc.nativeElement.focus();
      },10)
    }
  }
  get _keyTab(): boolean{
    return this.keyTab;
  }
  recordStamp = new Date().getTime();
  constructor(private destroyRef: DestroyRef, private dateAdapter: DateAdapter<any>,  private toastr: ToastrService, private _http: AppService,  private _intl: MatDatepickerIntl, @Inject(MAT_DATE_LOCALE) private _locale: string,  private _adapter: DateAdapter<any>,  public hijriModal: ModalService){

  }

  ngOnInit(){
    let hijri;
    this.dateFormat = this._http.getDateFormat();
    this.isHijri = this._http.isHijri();
    this.dateAdapter.setLocale(this._http.getDateValue());
    if(((!this.field().Enabled || this.readOnly) && !this.field().wfEnabled )|| this.rreadonly || this.field().mrEnabled === false){

    }
    else{
      if(this.field().FieldVal){  
        let a = this.field().FieldVal;
        const dd = new Date(a);
        if(typeof this.field().FieldVal !== 'object'){
          const offset = dd.getTimezoneOffset();
          if (offset < 0) {
              dd.setHours(12,0,0);
          }
        }
        
        let date = dd.toISOString().substring(0,10);
        this.field().FieldVal = date;   
        this.setfieldVal.emit({value: a, type: this.field().FieldType});
        hijri = this.writeHijri(new Date(date), 'en');
      }

      else {
        hijri = this.writeHijri(new Date(), 'en');
      }
    
      if(hijri && hijri !== 'Invalid Date'){
        let h = hijri.split("/");
        this.hMonth = parseInt(h[0]);;
        this.hDate = parseInt(h[1]);
        let y = h[2].split(" ");
        this.hYear = y[0];
        this.constHYear = this.hYear;
        this._locale = this._http.getDateValue();
        this._adapter.setLocale(this._locale);
      }
      this.updateCloseButtonLabel('Close Calendar');
    }
  }

  ngOnChanges(change: SimpleChanges){
    let c: any = change;
    if(((!this.field().Enabled || this.readOnly) && !this.field().wfEnabled )|| this.rreadonly || this.field().mrEnabled === false){

    }
    else if(!this.recordId && c['fieldActionBody']?.currentValue && c['fieldActionBody']?.firstChange){
      let n = this.field().FieldName;
      this.field.update(f => ({ ...f, FieldVal: c['fieldActionBody']?.currentValue[''+n+''] }));
      
      let date;
      let a = null;
      if(this.field().FieldVal){
        a = this.field().FieldVal;
        const dd = new Date(a);
        if(typeof this.field().FieldVal !== 'object'){
          const offset = dd.getTimezoneOffset();
          if (offset < 0) {
              dd.setHours(12,0,0);
          }
        }
        date = dd.toISOString().substring(0,10);
      }else{
        date = new Date();
      }
      this.setfieldVal.emit({value: a, type: this.field().FieldType});
      let hijri;
      hijri = this.writeHijri(new Date(date), 'en');
      if(hijri && hijri !== 'Invalid Date' && hijri !== '[object Object]'){
        let h = hijri.split("/");
        this.hMonth = parseInt(h[0]);;
        this.hDate = parseInt(h[1]);
        let y = h[2].split(" ");
        this.hYear = y[0];
        this.constHYear = this.hYear;
        this._locale = this._http.getDateValue();
        this._adapter.setLocale(this._locale);
      }
    }
  }

  updateCloseButtonLabel(label: string) {
    this._intl.closeCalendarLabel = label;
    this._intl.changes.next();
  }

  closeHijriModal(){
    this.hijriModal.hide();
  }

  openHijri(){
    this.hijrien = this.field().FieldVal;
    if(!this.actionStop){
      this.hijriEvent();
      this.hijriModal.show('hijri'+this.field().Id+this.recordStamp);
    }
  }

  writeHijri(date:any, lang: string) {
    lang = lang || 'en';
    let options = {
      year: 'numeric', month: '2-digit', day: 'numeric'
    };
    return date.toLocaleString(lang + '-u-ca-islamic-umalqura', options);
  }

  hijriToCalendars(year:number, month:number, day:number, op:any ={}){
    op.fromCal ??= "islamic-umalqura";   //
    let   gD:any      = new Date(Date.UTC(2000,0,1));
          gD      = new Date(gD.setUTCDate(gD.getUTCDate() +
                    ~~(227022+(year+(month-1)/12+day/354)*354.367)));
    const gY      = gD.getUTCFullYear(gD)-2000,
          dFormat = new Intl.DateTimeFormat('en-u-ca-' + op.fromCal, {dateStyle:'short', timeZone:'UTC'});
          gD      = new Date(( gY < 0 ? "-" : "+")+("00000" + Math.abs(gY)).slice(-6)+"-"+("0" + (gD.getUTCMonth(gD)+1)).slice(-2)+"-" + ("0" + gD.getUTCDate(gD)).slice(-2));
    let [iM,iD,iY]:any = [...dFormat.format(gD).split("/")], i=0;
          gD      = new Date(gD.setUTCDate(gD.getUTCDate() +
                    ~~(year*354+month*29.53+day-(iY.split(" ")[0]*354+iM*29.53+iD*1)-2)));
    while (i < 4) {
       [iM,iD,iY] = [...dFormat.format(gD).split("/")];
       if (iD == day && iM == month && iY.split(" ")[0] == year) return formatOutput(gD);
       gD = new Date(gD.setUTCDate(gD.getUTCDate()+1)); i++;
       }
    //throw new Error("Invalid "+op.fromCal+" date!");
    function formatOutput(gD:any){
    return "toCal"in op ? (op.calendar= op.toCal,
        new Intl.DateTimeFormat(op.locale ??= "en", op).format(gD)) : gD;
    }
  }

  numbersOnly(event: any){
    const pattern = /[0-9\+\-\ ]/;

    let inputChar = String.fromCharCode(event.charCode);
    if (event.keyCode != 8 && !pattern.test(inputChar)) {
      event.preventDefault();
    }
  }


  hijriEvent(){
    let a = this.hYear - this.constHYear;
    if(a > 5){
      this.hYear = this.constHYear;
    }
    this.hijrien = this.hijriToCalendars(parseInt(this.hYear),parseInt(this.hMonth),parseInt(this.hDate), {});
    if(!this.hijrien){
      if(parseInt(this.hDate) === 30){
        this.hDate = '29';
        this.hijriEvent();
      }
    }
  }

  addEvent(_type: string, event: MatDatepickerInputEvent<Date>) {
    if(event.value){
    let a:any = event.value;
    let hijri = this.writeHijri(new Date(event.value),'');
    let h = hijri.split("/");
    this.hMonth = parseInt(h[0]);
    this.hDate = parseInt(h[1]);
    let hy = h[2].split(" ");
    this.hYear = hy[0];
    this.field.update(f => ({ ...f, FieldVal: a._d }));
    this.hijrien = a._d;
    this.setfieldVal.emit({value: new Date(event.value), type: this.field().FieldType});
    if(this.field().IsActionField){
      this.getActionFieldVal();
    }
    }
  }

  getActionFieldVal(){
    const lang = JSON.parse(localStorage.getItem('lang') || '');
    const user = JSON.parse(localStorage.getItem('user') || '');
    let url = "SystemFields/GetDataFieldsQueryExecutions";
  
    let params= {
      "menuID": this.menuId,
      "pMenuID": this.recordList.parentPageID,
      "fieldID": this.field().Id,
      "userID": user.id,
      "languageID": lang,
      "companyID": this.companyID,
      "recordID": this.recordId ? this.recordId : 0,
      "pRecordID": this.precordid,
      "applicationID": user.applicationID,
      "queryfields": this.fieldActionBody,
    }

    this._http.putClient<any, ApiResponse>(url, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (response) => { 
          if(response.erroMessage){
           this.toastr.error(response.erroMessage);
          }
          else if(response.dataModel && response.dataModel.length > 0){
            let model = response.dataModel;
            model.forEach((r:any)=>{
              if(r.actionType === 'Stop' && r.actionValue){     
                  this.toastr.error(r.actionValue);
                  this.field.update(f => ({ ...f, FieldVal: null }));
                  this.setfieldVal.emit({value: null, type: this.field().FieldType});
              }
            })
          }
        },
        error: (_e)=>{
          
        }
    })
  }

  setEnDate(){
    this.field().FieldVal =  this.hijrien;   
    console.log(this.hijrien)
    this.setfieldVal.emit({value: new Date(this.hijrien), type: this.field().FieldType});
    setTimeout(()=>{
      this.hijriModal.hide();
    }, 200)
  }

  inputKeypress(_e: any){
    this.keypressevent.emit(true);
  }
  
  setInputVal(_e: any){
    this.setfieldVal.emit({value: this.field().FieldVal, type: this.field().FieldType});
    this.keypressevent.emit(false);
  }

}
