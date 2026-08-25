import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, ElementRef, ViewChild, signal, input, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';

@Component({
  selector: 'time-input',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxMaterialTimepickerModule],
  templateUrl: './time-input.html',
  styleUrl: './time-input.scss'
})
export class TimeInput implements OnInit {
  @Output() setfieldVal = new EventEmitter;
  @Input() actionStop: boolean;
  field = signal<any>({});
  _field = input<any>();
  readOnly: boolean;
  @Input() set _readOnly(value: boolean){
    this.readOnly = value;
  }
  get _readOnly(): boolean{
    return this.readOnly;
  }
  @Input() rreadonly: boolean;
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
  constructor(){
    effect(()=>{
      this.field.set(this._field())
    })
  }
  ngOnInit(): void {
    if(this.field().FieldVal){
      let a = this.field().FieldVal.split('T');
        if(a.length > 1){
        let b = a[1].split(":");
        this.field.update(f => ({ ...f, FieldVal: b[0]+":"+b[1] }));
        this.setfieldVal.emit({value: this.field().FieldVal, type: this.field().FieldType});
      }
    }

  }

  clearTime(){
    this.field.update(f => ({ ...f, FieldVal: null }));
  }
  
  addEvent(e: any){
    this.setfieldVal.emit({value: this.field().FieldVal, type: this.field().FieldType});
  }
}
