import { Component, OnInit } from '@angular/core';
import { DotstarService } from '../dotstar.service';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'dotstar-config',
  templateUrl: './dotstar-config.component.html',
  styleUrls: ['./dotstar-config.component.scss'],
})
export class DotstarConfigComponent implements OnInit {
  readonly configForm: FormGroup;

  constructor(
    private dotstarService: DotstarService
  ) { }

  ngOnInit() {
  }

}
