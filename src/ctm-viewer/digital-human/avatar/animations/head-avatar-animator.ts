import { SkinnedMesh, Euler } from "three";
import { AvatarFacial } from "../facial/avatar-facial";
import * as TWEEN from "@tweenjs/tween.js";

const ANIMATION_DURATION = 3000;

export class HeadAvatarAnimator {
    headMesh: SkinnedMesh;
    facial: AvatarFacial;
    rotationTween?: TWEEN.Tween<Euler>;
    isRandomMoveHead = true;

    constructor(headMesh: SkinnedMesh, facial: AvatarFacial) {
        this.headMesh = headMesh;
        this.facial = facial;
    }

    rotateHead(destination: { x: number, y: number, z: number }) {
        if (this.rotationTween) {
            this.rotationTween.stop();
            this.rotationTween = undefined;
        }
        this.rotationTween = new TWEEN.Tween(this.headMesh.skeleton.bones[1].rotation)
            .to({ x: destination.x / 2, y: destination.y / 2, z: destination.z / 2 }, ANIMATION_DURATION)
            .easing(TWEEN.Easing.Cubic.Out)
            .onComplete(() => {
                this.rotationTween = undefined;
            })
            .start();
        new TWEEN.Tween(this.headMesh.skeleton.bones[2].rotation)
            .to({ x: destination.x / 2, y: destination.y / 2, z: destination.z / 2 }, ANIMATION_DURATION)
            .easing(TWEEN.Easing.Cubic.Out)
            .start();
    }

    randomMoveHead() {
        if (!this.isRandomMoveHead || this.rotationTween) {
            return;
        }

        if (Math.random() < 0.5) {
            return;
        }

        const destination = {
            x: Math.random() * 0.2 - 0.05,
            y: Math.random() * 0.2 - 0.1,
            z: Math.random() * 0.2 - 0.1
        };
        this.rotateHead(destination);
    }

    get isMoveEnd() {
        return !this.rotationTween;
    }

    update(delta: number) {
        TWEEN.update();
        this.randomMoveHead();
    }
}