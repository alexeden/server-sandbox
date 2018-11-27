import { Component, OnInit } from '@angular/core';
import { PhysicsConfigService } from './physics-config.service';

@Component({
  templateUrl: './pointer-particles.component.html',
  styleUrls: ['./pointer-particles.component.scss'],
  providers: [ PhysicsConfigService ],
})
export class PointerParticlesComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
