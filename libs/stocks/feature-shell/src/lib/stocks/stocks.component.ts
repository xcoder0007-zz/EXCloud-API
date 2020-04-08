import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PriceQueryFacade } from '@coding-challenge/stocks/data-access-price-query';
import { Subscription } from 'rxjs';


@Component({
  selector: 'coding-challenge-stocks',
  templateUrl: './stocks.component.html',
  styleUrls: ['./stocks.component.css']
})
export class StocksComponent implements OnInit, OnDestroy {
  stockPickerForm: FormGroup;
  symbol: string;
  fromDate: string;
  toDate: string;
  disabledDatepicker = true

  quotes$ = this.priceQuery.priceQueries$;

  max = new Date();

  fromDateSub:Subscription;

  constructor(private fb: FormBuilder, private priceQuery: PriceQueryFacade) {
    this.stockPickerForm = fb.group({
      symbol: [null, Validators.required],
      fromDate: [null, Validators.required],
      toDate: [ null, Validators.required ]
    }, {
      validator: this.toDateValidator('fromDate', 'toDate')
    });
  }

  ngOnInit() {
    this.stockPickerForm.controls['toDate'].disable()
    this.fromDateSub = this.stockPickerForm.controls.fromDate.valueChanges.subscribe(() => this.stockPickerForm.controls['toDate'].enable());
    
  }

    __checkDateInputs =(From: Date, To: Date) => {
    const days = ( To.valueOf() !== From.valueOf()) ? Math.round(Math.abs((toDateValue - fromDateValue) / 86400000)) : 0;
    let period;
    switch (true) {
      case (days === 0 ):
        return null;
      case (days <= 2):
       period = '1d';
        break;  
      case (days <= 5):
        period = '5d';
        break;
      case (days <= 30):
        period = '1m'
        break;
      case (days <= 180):
        period = '6m'
        break;
      case (days <= 365):
        period = '1y'
        break;
      case (days <= 730):
        period ='2y'
        break;
      case (days > 730):
        period = 'max'
        break;
    }
    return period;

  }

  fetchQuote() {
    if (this.stockPickerForm.valid) {
      const { symbol, From, To } = this.stockPickerForm.value;
      const period = this.__checkDateInputs(From, To);
      if(!period) {
        this.stockPickerForm.controls['From'].setErrors({ 'incorrect': true });
        this.stockPickerForm.controls['To'].setErrors({ 'incorrect': true });
      } else {
        this.priceQuery.fetchQuote(symbol, period);

      }
    }
  }

  toDateValidator(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const fromDate = formGroup.controls[controlName];
      const toDate = formGroup.controls[matchingControlName];
      if (toDate.errors && toDate.errors.matDatepickerMin) {
        toDate.setValue(fromDate.value);
      }
    }
  }

  //__dispatchDateOnChange(e) => console.log(e)
  __dispatchDateOnChange(e) {
  //  console.log(e);
     this.disabledDatepicker = false
  }

  ngOnDestroy() {
    this.fromDateSub.unsubscribe();
  }

}