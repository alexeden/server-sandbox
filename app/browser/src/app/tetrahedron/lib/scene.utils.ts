import { AmbientLight, Color, Object3D, PointLight } from 'three';

export const colors = {
  black: new Color('#000000'),
  blue: new Color('#00b7ff'),
  darkBlue: new Color('#00818f'),
  lightBlue: new Color('#00e4ff'),
  darkBrown: new Color('#3E2723'),
  darkGray: new Color('#303030'),
  gray: new Color('#393939'),
  orange: new Color('#ffab00'),
  green: new Color('#76ff03'),
  lightGray: new Color('#dddddd'),
  red: new Color('#ff2b35'),
  white: new Color('#ffffff'),
};

export interface SceneTreeNode {
  name: string;
  type: string;
  children: SceneTreeNode[];
}

export class SceneUtils {
  // Lights
  static createLights() {
    const ambientLight = new AmbientLight(0xffffff, 0.001);

    const pointLightLocations = [
      [100, 2000 - 50, 0],
      [100, 0, 2000],
      [100, -2000, 2000],
      [100, 2000, 2 * 2000],
      [-2000, 0, 0],
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

  // Debug
  static getSceneTree(obj: Object3D): SceneTreeNode {
    return {
      name: obj.name,
      type: obj.type,
      children: [...obj.children.map(SceneUtils.getSceneTree)],
    };
  }
}
