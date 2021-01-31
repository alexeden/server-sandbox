import { vec3 } from 'gl-matrix';
import { Pointable } from './pointable';
import { Bone } from './bone';
import { Triple, FingerType, FingerData, BoneType } from './types';


/**
 * Constructs a Finger object.
 *
 * An uninitialized finger is considered invalid.
 * Get valid Finger objects from a Frame or a Hand object.
 *
 * @class Finger
 * @memberof Leap
 * @classdesc
 * The Finger class reports the physical characteristics of a finger.
 *
 * Both fingers and tools are classified as Pointable objects. Use the
 * Pointable.tool property to determine whether a Pointable object represents a
 * tool or finger. The Leap classifies a detected entity as a tool when it is
 * thinner, straighter, and longer than a typical finger.
 *
 * Note that Finger objects can be invalid, which means that they do not
 * contain valid tracking data and do not correspond to a physical entity.
 * Invalid Finger objects can be the result of asking for a Finger object
 * using an ID from an earlier frame when no Finger objects with that ID
 * exist in the current frame. A Finger object created from the Finger
 * constructor is also invalid. Test for validity with the Pointable.valid
 * property.
 */

export class Finger extends Pointable {
  readonly tool = false;
  readonly bases: Array<Triple<vec3>>;
  readonly btipPosition: vec3;
  readonly carpPosition: vec3;
  readonly dipPosition: vec3;
  readonly mcpPosition: vec3;
  readonly pipPosition: vec3;
  readonly extended: boolean;
  readonly type: FingerType;

  readonly positions: vec3[];
  readonly bones: Bone[];
  readonly metacarpal: Bone;
  readonly proximal: Bone;
  readonly medial: Bone;
  readonly distal: Bone;

  static fromData(data: FingerData) {
    return new Finger(data);
  }

  private constructor(
    data: FingerData
  ) {
    super(data);
    this.bases = data.bases.map(basis => basis.map(base => vec3.fromValues(...base))) as Array<Triple<vec3>>;
    this.btipPosition = vec3.fromValues(...data.btipPosition);
    this.dipPosition = vec3.fromValues(...data.dipPosition);
    this.pipPosition = vec3.fromValues(...data.pipPosition);
    this.mcpPosition = vec3.fromValues(...data.mcpPosition);
    this.carpPosition = vec3.fromValues(...data.carpPosition);
    this.extended = data.extended;
    this.type = data.type;
    this.positions = [this.carpPosition, this.mcpPosition, this.pipPosition, this.dipPosition, this.tipPosition];

    this.metacarpal = new Bone(
      BoneType.metacarpal,
      this.bases![0],
      this.carpPosition,
      this.mcpPosition,
      this.width
    );

    this.proximal = new Bone(
      BoneType.proximal,
      this.bases![1],
      this.mcpPosition,
      this.pipPosition,
      this.width
    );

    this.medial = new Bone(
       BoneType.medial,
       this.bases![2],
       this.pipPosition,
       this.dipPosition,
       this.width
    );

    this.distal = new Bone(
      BoneType.distal,
      this.bases![3],
      this.dipPosition,
      this.btipPosition,
      this.width
    );

    this.bones = [this.metacarpal, this.proximal, this.medial, this.distal];
  }

  toString() {
    return `Finger [ id:${  this.id  } ${  this.length  }mmx | width:${  this.width  }mm | direction:${  this.direction  } ]`;
  }

}
