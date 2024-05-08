import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { CountriesService } from '../../services/countries.service';
import { Region, SmallCountry } from '../../interfaces/country.interfaces';
import { filter, switchMap, tap } from 'rxjs';

@Component({
  selector: 'country-selector-page',
  templateUrl: './selector-page.component.html',
  styles: ``
})
export class SelectorPageComponent implements OnInit {

  public countriesByRegion: SmallCountry[] = [];

  public borders: SmallCountry[] = [];

  public myForm: FormGroup = this.fb.group({
    // valor, [validaciones sincronas], [validaciones asincronas]
    region: ['', [Validators.required]],
    country: ['', [Validators.required]],
    border: ['', [Validators.required]],
  });



  constructor(
    private fb: FormBuilder,
    private countriesService: CountriesService
  ) { }

  ngOnInit(): void {
    this.onRegionChanged()
    this.onCountryChanged()
  }

  // obtenemos nuestras regiones por referencia
  get regions(): Region[] {
    return this.countriesService.regions;
  }

  onRegionChanged(): void {
    this.myForm.get('region')!.valueChanges
      .pipe(
        tap(() => this.myForm.get('country')!.setValue('')),
        tap(() => this.borders = []),
        switchMap((region) => this.countriesService.getCountriesByRegion(region))
      )
      .subscribe(countries => {
        this.countriesByRegion = countries;
      });
  }

  onCountryChanged(): void {
    this.myForm.get('country')!.valueChanges
      .pipe(
        tap(() => this.myForm.get('border')!.setValue('')),
        // si no es mayor a 0 el valor del value entonces el filter lo detiene
        filter((value: string) => value.length > 0),
        switchMap((alphaCode) => this.countriesService.getCountryByAlphaCode(alphaCode)),
        switchMap( country => this.countriesService.getCountryBordersByCodes(country.borders))
      )
      .subscribe(countries => {
        this.borders = countries
      });
  }


  hasCountryBorders(): boolean {
    // evaluamos si el resultado de borders es vacio
    if (this.myForm.value.country !== '' &&
      this.regions.length > 0 &&
      this.borders.length === 0 &&
      this.countriesByRegion.length > 0)
      return true;

    return false;
  }
}
