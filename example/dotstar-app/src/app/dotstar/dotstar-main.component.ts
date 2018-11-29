import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { Subject } from 'rxjs';
import { ROUTES, Route } from '@angular/router';
import { LocalStorage } from '@app/shared';

enum ConfigMenuType {
  Physics = 'physics',
  Lights = 'lights',
  Connection = 'connection',
}

(window as any).configmenus = ConfigMenuType;

@Component({
  selector: 'dotstar-main',
  templateUrl: './dotstar-main.component.html',
  styleUrls: ['./dotstar-main.component.scss'],
  // viewProviders: [{
  //   provide: 'menuTypes',
  //   useValue: Object.values(ConfigMenuType),
  // }],
})
export class DotstarMainComponent implements OnInit, OnDestroy {
  private readonly unsubscribe$ = new Subject<any>();
  readonly dotstarRoutes: Route[];
  readonly MenuTypes = ConfigMenuType;

  readonly configMenus = [
    {
      type: ConfigMenuType.Lights,
      icon: 'wb_sunny',
      label: 'Lights Config',
    },
    {
      type: ConfigMenuType.Physics,
      icon: 'tune',
      label: 'Physics',
    },
    {
      type: ConfigMenuType.Connection,
      icon: 'device_hub',
      label: 'Connection',
    },
  ];

  @LocalStorage()
  selectedConfigMenuType: ConfigMenuType;

  constructor(
    @Inject(ROUTES) public injectedRoutes: Route[][]
  ) {
    const dotstarParentRoute = this.injectedRoutes[0].find(r => r.path === 'dotstar');
    if (!dotstarParentRoute) throw new Error(`No parent route wth path "/dotstar" found!`);
    this.dotstarRoutes = (dotstarParentRoute.children || []).filter(r => r.path.length > 0);

    this.selectedConfigMenuType = this.selectedConfigMenuType || ConfigMenuType.Physics;
  }

  get selectedConfigMenu() {
    return this.configMenus.find(m => m.type === this.selectedConfigMenuType);
  }

  selectMenuType(type: ConfigMenuType) {
    this.selectedConfigMenuType = type;
  }

  ngOnInit() {
    //
  }

  ngOnDestroy() {
    this.unsubscribe$.next('unsubscribe!');
    this.unsubscribe$.unsubscribe();
  }
}
