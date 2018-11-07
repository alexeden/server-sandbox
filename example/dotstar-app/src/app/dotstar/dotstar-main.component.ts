import { Component, OnInit } from '@angular/core';
import { DotstarBufferService } from './dotstar-buffer.service';
import { DotstarConfigService } from './dotstar-config.service';

@Component({
  selector: 'dotstar-main',
  templateUrl: './dotstar-main.component.html',
  styleUrls: ['./dotstar-main.component.scss'],
})
export class DotstarMainComponent implements OnInit {

  constructor(
    readonly bufferService: DotstarBufferService,
    readonly configService: DotstarConfigService
  ) { }

  ngOnInit() {
  }

}
