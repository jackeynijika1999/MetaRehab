import { AdditionalPhonemeInfo, EmotionBehaviorCode } from '@inworld/web-core';
import { AnimationMixer, LoopPingPong, Object3D, SkinnedMesh } from 'three';

import { AvatarFacial } from './facial/avatar-facial';
import { AvatarBehaviorToFacial } from './utils/avatar-behavior2facial';
import { HeadAvatarAnimator } from './animations/head-avatar-animator';
import { FBXAnimationLoader } from '../loaders/FBXAnimationLoader';
import { ModelInfoType } from './avatar-configs';

export type AvatarAnimatorProps = {
  animations: { [key: string]: FBXAnimationLoader };
  animationsTalking: string[];
  defaultAnimation: string;
  defaultEmotion: EmotionBehaviorCode;
  model: Object3D;
  modelInfo: ModelInfoType;
};

const ANIMATION_FADE_TIME_S = 0.5;
const END_TALKING_DEBOUNCE_TIME_MS = 500;

export class AvatarAnimator {
  animations: { [key: string]: FBXAnimationLoader };
  animationMixer?: AnimationMixer;
  animatorReady: boolean;
  facial?: AvatarFacial;
  headAvatarAnimator?: HeadAvatarAnimator;
  idleTimeout: any;
  lastClipName: string | null;
  lastTalkingClipName: string | null;
  modelMesh?: SkinnedMesh;
  phonemeData: AdditionalPhonemeInfo[];
  props: AvatarAnimatorProps;
  talkingCountDown: number;

  constructor(props: AvatarAnimatorProps) {
    this.animatorReady = false;
    this.props = props;
    this.phonemeData = [];
    this.animations = props.animations;
    this.lastClipName = null;
    this.lastTalkingClipName = null;
    this.talkingCountDown = 0;
    this.playStill = this.playStill.bind(this);
    this.startIdleAnimation = this.startIdleAnimation.bind(this);
    this.startTalkingAnimation = this.startTalkingAnimation.bind(this);
    this.init();
  }

  init() {
    if (this.props.model) {
      this.props.model.traverse((child) => {
        if (child.name === this.props.modelInfo.avatarRootName) {
          this.modelMesh = child as SkinnedMesh;
          this.modelMesh.traverse((subChild) => {
            if (
              subChild.name === this.props.modelInfo.avatarHeadName
            ) {
              this.facial = new AvatarFacial({
                modelMesh: subChild as SkinnedMesh,
              });
              this.facial.setEmotion(
                AvatarBehaviorToFacial[this.props.defaultEmotion],
              );
              this.animationMixer = new AnimationMixer(this.modelMesh!);
              this.headAvatarAnimator = new HeadAvatarAnimator(
                subChild as SkinnedMesh,
                this.facial,
              );
              setTimeout(this.startIdleAnimation, END_TALKING_DEBOUNCE_TIME_MS);
              this.animatorReady = true;
              return;
            }
          });
        }
      });
      if (!this.modelMesh)
        throw new Error(
          'Error there was an error processing the model file in AvatarAnimator',
        );
      if (!this.facial)
        throw new Error('Error Wolf3D_Head not found in AvatarAnimator');
    } else {
      throw new Error('Error: Model not found');
    }
  }

  getTalkingClipName() {
    // At least 2 animations are needed to randomly choose one
    if (this.props.animationsTalking.length < 2) return '';
    return this.props.animationsTalking[
      Math.floor(Math.random() * this.props.animationsTalking.length)
    ];
  }

  playAnimation(animation: string) {
    if (this.animationMixer) {
      if (this.lastClipName) {
        this.animationMixer
          .clipAction(this.animations[this.lastClipName].animationClip!)
          .fadeOut(ANIMATION_FADE_TIME_S);
      }

      const animationClip = this.animations[animation].animationClip;
      if (animationClip) {
        this.animationMixer
          .clipAction(animationClip)
          .reset()
          .fadeIn(ANIMATION_FADE_TIME_S)
          .setLoop(LoopPingPong, 20)
          .play();
        this.lastClipName = animation;
      }
    }
  }

  playStill(fadeInTime: number) {
    if (
      this.talkingCountDown > 0 ||
      this.lastClipName === this.props.defaultAnimation
    ) {
      return;
    }
    if (this.animationMixer) {
      if (this.lastClipName) {
        this.animationMixer
          .clipAction(this.animations[this.lastClipName].animationClip!)
          .fadeOut(ANIMATION_FADE_TIME_S);
      }
      let clipName = this.props.defaultAnimation;
      if (this.animations[clipName]?.animationClip) {
        const durationSeconds = this.animations[clipName].animationClip!.duration;
        this.animationMixer
          .clipAction(this.animations[clipName].animationClip!)
          .reset()
          .fadeIn(fadeInTime)
          .play();
        this.lastClipName = clipName;
        this.idleTimeout = setTimeout(
          this.startIdleAnimation,
          durationSeconds * 1000,
        );
      }
    }
  }

  setEmotion(emotion: string) {
    if (this.animatorReady && emotion) {
      this.facial?.setEmotion(emotion);
    }
  }

  setPhonemes(phonemes: AdditionalPhonemeInfo[]) {
    if (this.animatorReady && phonemes.length > 0) {
      this.phonemeData = phonemes;
      this.talkingCountDown += phonemes.length;
      this.facial?.setPhonemes(phonemes);
      this.startTalkingAnimation();
    }
  }

  setFacialBlendshapes(blendshapes: number[][], morphScaler = 1) {
    this.facial?.setFacialBlendshapes(blendshapes, morphScaler);
    if (blendshapes.length) {
      this.talkingCountDown = blendshapes.length;
      this.startTalkingAnimation();
    } else {
      this.talkingCountDown = -1;
    }
  }

  setVisemeIdScript(script: { visemeID: number; time: number }[]) {
    this.facial?.setVisemeIdScript(script);
    this.talkingCountDown += script.length;
    this.startTalkingAnimation();
  }

  startIdleAnimation() {
    this.playStill(0.5);
  }

  startTalkingAnimation() {
    let clipName = '';
    while (!clipName || clipName === this.lastTalkingClipName) {
      clipName = this.getTalkingClipName();
      if (!clipName) {
        return;
      }
    }

    if (this.idleTimeout) {
      clearTimeout(this.idleTimeout);
      this.idleTimeout = undefined;
    }

    if (this.animationMixer) {
      if (this.lastClipName) {
        this.animationMixer
          .clipAction(this.animations[this.lastClipName].animationClip!)
          .fadeOut(ANIMATION_FADE_TIME_S);
      }
      if (this.animations[clipName].animationClip) {
        this.animationMixer
          .clipAction(this.animations[clipName].animationClip!)
          .reset()
          .fadeIn(ANIMATION_FADE_TIME_S)
          .setLoop(LoopPingPong, 20)
          .play();
        this.lastClipName = clipName;
        this.lastTalkingClipName = clipName;
      }
    }
  }

  updateFrame(delta: number) {
    this.facial?.updateFrame(delta);
    this.headAvatarAnimator?.update(delta);

    if (this.animationMixer instanceof AnimationMixer) {
      this.animationMixer.update(delta);
    }

    if (this.talkingCountDown > 0) {
      this.talkingCountDown -= 0.9999; // Not Integer to make sure the timing "count down < 0" can happen only once per sentence.
    }
    if (this.talkingCountDown < 0) {
      this.talkingCountDown = 0;
      this.facial?.setEmotion(this.props.defaultEmotion);
      setTimeout(this.startIdleAnimation, END_TALKING_DEBOUNCE_TIME_MS);
    }
  }
}
