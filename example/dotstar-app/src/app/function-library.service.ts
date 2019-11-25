import { Injectable } from '@angular/core';

export interface Function {
  name: string;
  body: string;
}

@Injectable({
  providedIn: 'root',
})
export class FunctionLibraryService {

  constructor() { }
}
