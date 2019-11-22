import * as THREE from 'three';
import {
  Mesh,
  GridHelper,
  PlaneBufferGeometry,
  PointLight,
  AmbientLight,
  PerspectiveCamera,
  WebGLRenderer,
  Object3D,
  MeshPhongMaterial,
  Color,
} from 'three'; // tslint:disable-line:no-duplicate-imports
import CameraControls from 'camera-controls';

export const colors = {
  black: new Color('#000000'),
  blue: new Color('#00b7ff'),
  darkBlue: new Color('#00818f'),
  lightBlue: new Color('#00e4ff'),
  darkBrown: new Color('#3E2723'),
  darkGray: new Color('#263238'),
  gray: new Color('#aaaaaa'),
  orange: new Color('#ffab00'),
  green: new Color('#76ff03'),
  lightGray: new Color('#dddddd'),
  red: new Color('#ff2b35'),
  white: new Color('#ffffff'),
};

export enum SceneConst {
  FieldLength = 2000,
  FieldHeight = 2000,
  CameraX = -1000,
  CameraY = 0,
  CameraZ = 1000,
  CameraMaxDistance = 3000,
}

export interface SceneTreeNode {
  name: string;
  type: string;
  children: SceneTreeNode[];
}

export class SceneUtils {
  // Camera
  static createCamera() {
    const camera = new PerspectiveCamera(55, 1, 10, 3 * SceneConst.CameraMaxDistance);
    camera.position.set(SceneConst.CameraX, SceneConst.CameraY, SceneConst.CameraZ);

    return camera;
  }

  // Camera Controls
  static createCameraControls(camera: PerspectiveCamera, canvas: HTMLCanvasElement) {
    CameraControls.install({ THREE });
    const controls = new CameraControls(camera, canvas);
    controls.minPolarAngle = 0;
    controls.maxPolarAngle = Math.PI * 0.49;
    controls.minDistance = 1;
    controls.maxDistance = SceneConst.CameraMaxDistance;
    controls.setTarget(0, 0, 0);

    return controls;
  }

  // Lights
  static createLights() {
    const ambientLight = new AmbientLight(0xffffff, 0.001);

    const pointLightLocations = [
      // [100, SceneConst.FieldHeight - 50, 0],
      [100, 0, SceneConst.FieldHeight],
      // [100, 0, SceneConst.FieldHeight],
      [100, SceneConst.FieldHeight, 2 * SceneConst.FieldHeight],
      [-SceneConst.FieldHeight, 0, 0],
    ];

    const pointLights = pointLightLocations.map(([x, y, z]) => {
      const light = new PointLight(colors.white, 0.01, 0);
      light.decay = 0.1;
      light.position.set(x, y, z);
      light.castShadow = true;

      return light;
    });

    return [ambientLight, ...pointLights];
  }

  // Platform (Floor + Grids)
  static createScenePlatform() {
    const gridXZ = new GridHelper(SceneConst.FieldLength, SceneConst.FieldLength / 100, colors.white, colors.white);
    gridXZ.translateY(-300);
    if (!Array.isArray(gridXZ.material)) {
      gridXZ.material.transparent = true;
      gridXZ.material.opacity = 0.15;
    }

    return [gridXZ];
  }

  // Renderer
  static createRenderer(canvas: HTMLCanvasElement) {
    const context = canvas.getContext('webgl2') as WebGLRenderingContext;
    const renderer = new WebGLRenderer({ antialias: true, canvas, context });
    renderer.shadowMap.enabled = true;
    renderer.setPixelRatio(window && window.devicePixelRatio || 2);

    return renderer;
  }

  // Debug
  static getSceneTree(obj: Object3D): SceneTreeNode {
    return {
      name: obj.name,
      type: obj.type,
      children: [
        ...obj.children.map(SceneUtils.getSceneTree),
      ],
    };
  }
}
