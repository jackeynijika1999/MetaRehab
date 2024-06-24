import { MathUtils, SkinnedMesh } from 'three';

export interface AvatarEyesProps {
  modelMesh: SkinnedMesh;
}

const EYES_CLOSED = ['eyeBlinkLeft', 'eyeBlinkRight']; // ['EyeBlink_L', 'EyeBlink_R']
const BLINK_SPEED = 1;
const BLINK_THRESH = 100;

export class AvatarEyes {
  elapsdTime: number;
  modelMesh: SkinnedMesh;
  eyesClosedIndexs: number[] = [];

  constructor(props: AvatarEyesProps) {
    this.elapsdTime = 0;
    this.eyesClosedIndexs = [];
    this.modelMesh = props.modelMesh;
    // Iterate through blendshape names in order to find the beginning of the
    // viseme sequence (viseme_sil + 14 next)
    for (let i = 0; i < this.modelMesh.userData['targetNames']?.length; i++) {
      if (EYES_CLOSED.includes(this.modelMesh.userData['targetNames'][i])) {
        this.eyesClosedIndexs.push(i);
      }
    }
  }

  updateFrame(delta: number) {
    // Blinking Animation
    if (this.modelMesh) {
      this.elapsdTime += delta;
      let eyeClosedVal = MathUtils.clamp(
        Math.sin(this.elapsdTime * BLINK_SPEED) * BLINK_THRESH -
        BLINK_THRESH +
        1,
        0,
        1,
      );

      this.eyesClosedIndexs.forEach((index) => {
        this.modelMesh.morphTargetInfluences![index] = eyeClosedVal;
      });
    }
  }
}
