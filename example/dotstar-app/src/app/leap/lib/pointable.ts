import { Vector3 } from 'three';
import * as leap from './types';

/**
 * Constructs a Pointable object.
 *
 * An uninitialized pointable is considered invalid.
 * Get valid Pointable objects from a Frame or a Hand object.
 *
 * @class Pointable
 * @memberof Leap
 * @classdesc
 * The Pointable class reports the physical characteristics of a detected
 * finger or tool.
 *
 * Both fingers and tools are classified as Pointable objects. Use the
 * Pointable.tool property to determine whether a Pointable object represents a
 * tool or finger. The Leap classifies a detected entity as a tool when it is
 * thinner, straighter, and longer than a typical finger.
 *
 * Note that Pointable objects can be invalid, which means that they do not
 * contain valid tracking data and do not correspond to a physical entity.
 * Invalid Pointable objects can be the result of asking for a Pointable object
 * using an ID from an earlier frame when no Pointable objects with that ID
 * exist in the current frame. A Pointable object created from the Pointable
 * constructor is also invalid. Test for validity with the Pointable.valid
 * property.
 */

export class LeapPointable {
  readonly direction: Vector3;
  readonly handId: number;
  readonly id: number;
  readonly length: number;
  readonly stabilizedTipPosition: Vector3;
  readonly timeVisible: number;
  readonly tipPosition: Vector3;
  readonly tipVelocity: Vector3;
  readonly tool: boolean;
  readonly touchDistance: number;
  readonly touchZone: leap.TouchZone;
  readonly width: number;


  protected constructor(
    data: leap.PointableData
  ) {
    this.direction = new Vector3(...data.direction);
    this.handId = data.handId;
    this.id = data.id;
    this.length = data.length;
    this.stabilizedTipPosition = new Vector3(...data.stabilizedTipPosition);
    this.timeVisible = data.timeVisible;
    this.tipPosition = new Vector3(...data.tipPosition);
    this.tipVelocity = new Vector3(...data.tipVelocity);
    this.touchDistance = data.touchDistance;
    this.touchZone = data.touchZone || 'none';
    this.width = data.width;
  }

  toString() {
    return 'Pointable [ id:' + this.id + ' ' + this.length + 'mmx | width:' + this.width + 'mm | direction:' + this.direction + ' ]';
  }
}
