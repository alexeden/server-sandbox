import { Object3D } from 'three';
import { Pixel } from '../lib';

export class PixelModel extends Object3D {

  constructor(
    readonly pixel: Pixel
  ) {
    super();
    this.id = this.pixel.i;

  }
}
