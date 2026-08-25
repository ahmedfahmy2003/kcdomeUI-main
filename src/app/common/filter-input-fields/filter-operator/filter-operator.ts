import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'filter-operator',
  standalone: true,
  imports: [CommonModule, MatMenuModule],
  templateUrl: './filter-operator.html',
  styleUrl: './filter-operator.scss'
})
export class FilterOperator {
  filteroption: string = 'like';
  @Input() type: string;
  @Input() operator: any;
  @Output() operatorEmit = new EventEmitter;

  ngOnInit(){
    if(this.operator){
    if(this.operator === "like '%___%'"){
      this.filteroption = "like";
    }
    else if(this.operator === "not like '%___%'"){
      this.filteroption = "not like";
    }
    else if(this.operator === "like '___%'"){
      this.filteroption = "begin";
    }
    else if(this.operator === "like '%___'"){
      this.filteroption = "ends";
    }
    else if(this.operator === "="){
      this.filteroption = "equals"
    }
    else if(this.operator === "<>"){
      this.filteroption = "notequals"
    }
    else if(this.operator === ">"){
      this.filteroption = "greaterthan"
    }
    else if(this.operator === ">="){
      this.filteroption = "greaterthanequal"
    }
    else if(this.operator === "<"){
      this.filteroption = "lesserthan"
    }
    else if(this.operator === "<="){
      this.filteroption = "lesserthanequal"
    }
    else if(this.operator === "in"){
      this.filteroption = "in"
    }
    else if(this.operator.toLowerCase() === "is null"){
      this.filteroption = "null"
    }
    else if(this.operator.toLowerCase() === "is not null"){
      this.filteroption = "notnull"
    }
    }
  }

  filterOptions(type: string, opr: any){
    this.filteroption = type;
    this.operatorEmit.emit({type: type, opr: opr})
  }
}
