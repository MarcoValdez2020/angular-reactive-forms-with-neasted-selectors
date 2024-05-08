import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Country, Region, SmallCountry } from '../interfaces/country.interfaces';
import { Observable, combineLatest, map, of, tap } from 'rxjs';

@Injectable({providedIn: 'root'})
export class CountriesService {

  private baseUrl: string = 'https://restcountries.com/v3.1'

  // se pone privado para que nadie pueda cambiar las regiones, es por seguridad
  private _regions: Region[] = [Region.Africa,Region.Americas,Region.Asia,Region.Europe,Region.Oceania]

  constructor(
    private httpClient: HttpClient
  ) { }

  // hacermos un get que retorna las regiones de nuestro enum
  get regions(): Region[]{
    return [...this._regions]
  }

  getCountriesByRegion(region:Region):Observable<SmallCountry[]>{

    // si el areglo viene vacio no hacemos nada, retornamos un arreglo vacio
    if (!region ) return of([]);

    const url: string = `${this.baseUrl}/region/${region}?fields=cca3,name,borders`;

    return this.httpClient.get<Country[]>(url)
    .pipe(
      map(countries => countries.map(country=>({
        name: country.name.common,
        cca3:country.cca3,
        borders:country.borders ?? []
      }))),
    )
  }

  getCountryByAlphaCode(alphaCode:string):Observable<SmallCountry>{

    const url = `${this.baseUrl}/alpha/${alphaCode}?fields=cca3,name,borders`
    return this.httpClient.get<Country>(url)
    .pipe(
      map( country => ({
        name: country.name.common,
        cca3:country.cca3,
        borders: country.borders ?? []
      }))
    )
  }

  getCountryBordersByCodes ( borders:string[]):Observable<SmallCountry[]>{
    // con esto me aseguro de tener al menos un border
    if (!borders || borders.length ===0) return of([]);

    const countryRequest: Observable<SmallCountry>[] = [];

    borders.forEach( code => {
      const request = this.getCountryByAlphaCode(code);
      countryRequest.push( request);
    });

    return combineLatest( countryRequest);

  }

}
