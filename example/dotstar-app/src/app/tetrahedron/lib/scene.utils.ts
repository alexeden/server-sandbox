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
  darkGray: new Color('#323232'),
  gray: new Color('#aaaaaa'),
  orange: new Color('#ffab00'),
  green: new Color('#76ff03'),
  lightGray: new Color('#dddddd'),
  red: new Color('#ff2b35'),
  white: new Color('#ffffff'),
};

export enum SceneConst {
  FieldLength = 400,
  FieldHeight = 400,
  FieldWidth = 400,
  CameraX = -80,
  CameraY = 300,
  CameraZ = 500,
  CameraMaxDistance = 600,
}

export interface SceneTreeNode {
  name: string;
  type: string;
  children: SceneTreeNode[];
}

export class SceneUtils {
  // Camera
  static createCamera() {
    const camera = new PerspectiveCamera(60, 1, 10, 2 * SceneConst.CameraMaxDistance);
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
    controls.setTarget(100, SceneConst.FieldHeight / 3, 0);

    return controls;
  }

  // Lights
  static createLights() {
    const ambientLight = new AmbientLight(0xffffff, 0.6);

    const pointLightLocations = [
      [100, SceneConst.FieldHeight - 50, 0],
      [100, 0, SceneConst.FieldHeight],
      [100, 0, SceneConst.FieldHeight],
      [100, SceneConst.FieldHeight, 2 * SceneConst.FieldHeight],
      [-SceneConst.FieldHeight, 0, 0],
    ];

    const pointLights = pointLightLocations.map(([x, y, z]) => {
      const light = new PointLight(colors.white, 0.9, 0);
      light.decay = 0.1;
      light.position.set(x, y, z);
      light.castShadow = true;

      return light;
    });

    return [ambientLight, ...pointLights];
  }

  // Platform (Floor + Grids)
  static createScenePlatform() {
    const floor = new Mesh(
      new PlaneBufferGeometry(2 * SceneConst.FieldWidth, 2 * SceneConst.FieldLength, 1, 1),
      new MeshPhongMaterial({ color: colors.white, emissive: colors.black })
    );
    floor.receiveShadow = true;

    return [floor];
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
