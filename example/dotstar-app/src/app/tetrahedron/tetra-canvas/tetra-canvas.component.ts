import { Component, OnInit, ElementRef, Renderer2 } from '@angular/core';
import { CanvasService } from '../canvas.service';
import { SceneUtils, colors } from '../lib';
import { Scene, WebGLRenderer, PerspectiveCamera, Clock, Mesh, SphereGeometry, MeshBasicMaterial, AxesHelper, Group } from 'three';
import { interval } from 'rxjs';
import { animationFrame } from 'rxjs/internal/scheduler/animationFrame';
import CameraControls from 'camera-controls';
import { tap, take } from 'rxjs/operators';
import { GeometryService } from '../geometry.service';

@Component({
  selector: 'dotstar-tetra-canvas',
  templateUrl: './tetra-canvas.component.html',
  styleUrls: ['./tetra-canvas.component.scss'],
})
export class TetraCanvasComponent implements OnInit {

  constructor(
    private readonly elRef: ElementRef,
    private readonly renderer2: Renderer2,
    private readonly canvas: HTMLCanvasElement,
    private readonly camera: PerspectiveCamera,
    private readonly cameraControls: CameraControls,
    private readonly renderer: WebGLRenderer,
    private readonly canvasService: CanvasService,
    private readonly clock: Clock,
    private readonly scene: Scene,
    readonly geoService: GeometryService
  ) {
    (window as any).tetraCanvasComponent = this;
    this.renderer2.appendChild(this.elRef.nativeElement, this.canvas);
    this.scene.add(...SceneUtils.createLights(), ...SceneUtils.createScenePlatform());
    // this.scene.add(new AxesHelper(2000));
  }

  ngOnInit() {
    // this.renderer.setPixelRatio(window && window.devicePixelRatio || 2);

    this.canvasService.canvasRect.pipe(
      tap(rect => {
        const hostRect = this.elRef.nativeElement!.getBoundingClientRect();
        this.renderer.setSize(hostRect.width, hostRect.height);
        // this.renderer2.setAttribute(this.canvas, 'height', `${2 * rect.height}`);
        // this.renderer2.setStyle(this.canvas, 'height', `${rect.height}px`);
        // this.renderer2.setAttribute(this.canvas, 'width', `${2 * rect.width}`);
        // this.renderer2.setStyle(this.canvas, 'width', `${rect.width}px`);
      })
    )
    .subscribe();

    this.geoService.tetra.pipe(
      take(1),
      tap(tetra => {
        const group = new Group();

        Object.values(tetra.vertices).forEach(vert => {
          const sphere = new Mesh(new SphereGeometry(25, 32, 32), new MeshBasicMaterial({ color: colors.lightBlue }));
          sphere.position.copy(vert.pos);

          group.add(sphere);

        });
        const pixelGeo = new SphereGeometry(3, 5, 5);
        console.log(tetra.pixels);

        const pixelMat = new MeshBasicMaterial({ color: colors.green });
        Object.values(tetra.pixels).forEach((p, i) => {
          const sphere = new Mesh(pixelGeo.clone(), pixelMat);
          sphere.position.copy(p.pos);

          group.add(sphere);
        });

        this.scene.add(group);
        this.canvasService.start();
      })
      // tap(tetra => {
      //   Object.entries(tetra.edges).forEach(([eid, line]) => {
      //     console.log(`Edge ${eid} has length `, line.distance());
      //   });
      // })
    )
    .subscribe();

    // this.canvasService.canvasRect.subscribe(() => {
    //   this.renderer.setPixelRatio(window && window.devicePixelRatio || 2);
    //   console.log('pixel ratio set!', window && 2 * window.devicePixelRatio || 2);
    // });

    /** Render */
    /* TODO: ADD AN UNSUBSCRIBE EMITTER HERE */
    interval(0, animationFrame).subscribe(() => {
      if (this.cameraControls.enabled) this.cameraControls.update(this.clock.getDelta());
      this.renderer.render(this.scene, this.camera);
    });
  }

}
