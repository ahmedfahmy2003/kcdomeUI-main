import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { AppService } from '../../services/common/common.service';
import { ModalService } from '../../services/common/modal.service';
import { LoaderService } from '../../services/common/loader.service';
import { InputFields } from './input-fields';

// Isolate the real input logic from the recursive CallingMenu/DetailsPage imports.
@Component({ selector: 'input-fields', template: '' })
class TestInputFields extends InputFields {}

@Component({
  imports: [TestInputFields],
  template: `@for(row of rows(); track $index) {
    @for(col of row.col; track col.Id ?? ('placeholder-' + $index)) {
      <input-fields [_field]="col" [fieldActionBody]="body" [menuId]="1"
        (setUpdateList)="acknowledge(col.Id, $event.value)" />
    }
  }`
})
class LookupHost {
  body = { FromSite: null };
  rows = signal([{ col: [3738, 1845, 1847, 60397].map(Id => ({
    Id, FieldName: `field${Id}`, FieldType: 'LookUp', DefaultValue: 'query',
    FieldVal: null, updateList: false
  })) }]);

  acknowledge(id: number, value: boolean) {
    this.rows.update(rows => rows.map(row => ({ ...row,
      col: row.col.map(col => col.Id === id ? { ...col, updateList: value } : col)
    })));
  }

  replaceFields(refreshId?: number) {
    this.rows.update(rows => rows.map(row => ({ ...row,
      col: row.col.map(col => ({ ...col, updateList: col.Id === refreshId }))
    })));
  }
}

describe('InputFields lookup lifecycle', () => {
  let api: jasmine.Spy;
  let previousLang: string | null;
  let previousUser: string | null;

  beforeEach(async () => {
    previousLang = localStorage.getItem('lang');
    previousUser = localStorage.getItem('user');
    localStorage.setItem('lang', '1');
    localStorage.setItem('user', JSON.stringify({ id: 1, applicationID: 1 }));
    api = jasmine.createSpy('putClient').and.returnValue(of({ dataModel: [], rowCount: 0 }));
    await TestBed.configureTestingModule({
      imports: [LookupHost],
      providers: [
        provideZonelessChangeDetection(),
        { provide: AppService, useValue: { getDateFormat: () => '', putClient: api } },
        { provide: Store, useValue: {} },
        { provide: ToastrService, useValue: { error: jasmine.createSpy('error') } },
        { provide: ModalService, useValue: {} },
        { provide: LoaderService, useValue: {} }
      ]
    }).compileComponents();
  });

  afterEach(() => {
    for (const [key, value] of [['lang', previousLang], ['user', previousUser]]) {
      if (value === null) localStorage.removeItem(key!);
      else localStorage.setItem(key!, value!);
    }
  });

  it('retains all four inputs and does not reload empty lookups on two action updates', async () => {
    const fixture = TestBed.createComponent(LookupHost);
    await fixture.whenStable();
    const inputs = fixture.debugElement.queryAll(By.directive(TestInputFields)).map(el => el.componentInstance);
    expect(api).toHaveBeenCalledTimes(4);
    for (let i = 0; i < 2; i++) {
      fixture.componentInstance.replaceFields();
      await fixture.whenStable();
      expect(fixture.debugElement.queryAll(By.directive(TestInputFields)).map(el => el.componentInstance)).toEqual(inputs);
      expect(api).toHaveBeenCalledTimes(4);
    }
  });

  it('reloads only the explicitly refreshed field and clears stale options on an empty response', async () => {
    api.and.returnValue(of({ dataModel: [{ ID: 'old' }], rowCount: 1 }));
    const fixture = TestBed.createComponent(LookupHost);
    await fixture.whenStable();
    const inputs: InputFields[] = fixture.debugElement.queryAll(By.directive(TestInputFields)).map(el => el.componentInstance);
    api.and.returnValue(of({ dataModel: [], rowCount: 0 }));
    fixture.componentInstance.replaceFields(1847);
    await fixture.whenStable();
    expect(api).toHaveBeenCalledTimes(5);
    expect(api.calls.mostRecent().args[0]).toContain('fieldID=1847&');
    expect(inputs[2].optionslist()).toEqual([]);
    expect(inputs[0].optionslist()).toEqual([{ ID: 'old' }]);
    fixture.componentInstance.replaceFields();
    await fixture.whenStable();
    expect(api).toHaveBeenCalledTimes(5);
  });
});
