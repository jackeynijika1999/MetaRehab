import { AdditionalPhonemeInfo, EmotionBehaviorCode } from '@inworld/web-core';
import { Object3D, Object3DEventMap } from 'three';

import { BatchFileLoader } from '../loaders/BatchFileLoader';
import { GLTFModelLoader } from '../loaders/GLTFModelLoader';
import { ANIMATION_TYPE } from '../types/types';
import { AvatarAnimator } from './avatar-animator';
import { AvatarBehaviorToFacial } from './utils/avatar-behavior2facial';
import { AvatarAnimationType, AvatarConfiguration } from './avatar-configs';
import { FBXAnimationLoader } from '../loaders/FBXAnimationLoader';

export type AvatarProps = {
  avatarConfig: AvatarConfiguration;
  dracoURI: string;
  onLoad?: Function;
  onProgress?: Function;
};

export class Avatar {

  animationLoaders: { [key: string]: FBXAnimationLoader };
  animationsTalking: string[];
  animator?: AvatarAnimator;
  config: AvatarConfiguration;
  dracoURI: string;
  modelFile?: GLTFModelLoader;
  onLoad: Function;
  onProgress: Function;
  audio?: HTMLAudioElement;

  constructor(props: AvatarProps) {
    this.animationLoaders = {};
    this.animationsTalking = [];
    this.config = props.avatarConfig;
    this.dracoURI = props.dracoURI;
    this.onLoad = props.onLoad || (() => {
    });
    this.onProgress = props.onProgress || (() => {
    });
    this.onLoadAnimations = this.onLoadAnimations.bind(this);
    this.onLoadComplete = this.onLoadComplete.bind(this);
    this.onLoadProgress = this.onLoadProgress.bind(this);
    this.onLoadModel = this.onLoadModel.bind(this);
    this.init();
  }

  init() {
    this.loadModel();
  }

  getGLTF() {
    return this.modelFile?.getGLTF();
  }

  getModel(): Object3D<Object3DEventMap> | undefined {
    return this.getGLTF()?.scene.getObjectByName(this.config.avatar.modelInfo.avatarRootName);
  }

  getScene() {
    return this.getGLTF()?.scene;
  }

  loadAnimations() {
    for (const animationName in this.config.avatar.animations) {
      const animation: AvatarAnimationType =
        this.config.avatar.animations[animationName];
      if (animation.type === ANIMATION_TYPE.TALKING) {
        this.animationsTalking.push(animationName);
      }
      const fileURI: string = this.config.avatar.baseURIs.ANIMATIONS + animation.file;
      this.animationLoaders[animationName] = new FBXAnimationLoader({
        name: animationName,
        fileURI: fileURI,
      });
    }

    if (Object.keys(this.animationLoaders).length > 0) {
      const batchLoader = new BatchFileLoader({
        fileLoaders: this.animationLoaders,
        callback: this.onLoadAnimations,
        startProgress: 0,
        endProgress: 100,
        updateProgress: this.onLoadProgress,
      });
      batchLoader;
    } else {
      this.onLoadAnimations();
    }
  }

  loadModel() {
    const fileURI: string = this.config.avatar.baseURIs.MODELS + this.config.avatar.defaults.MODEL;
    this.modelFile = new GLTFModelLoader({ path: fileURI });
    this.modelFile.load(this.onLoadModel);
  }

  playAnimation(animation: string) {
    if (this.animator && this.animationLoaders[animation])
      this.animator.playAnimation(animation);
  }

  onLoadAnimations() {
    this.animator = new AvatarAnimator({
      animations: this.animationLoaders,
      animationsTalking: this.animationsTalking,
      defaultAnimation: this.config.avatar.defaults.IDLE_ANIMATION,
      defaultEmotion: this.config.avatar.defaults.EMOTION,
      model: this.getScene()!,
      modelInfo: this.config.avatar.modelInfo,
    });
    this.onLoadComplete();
  }

  onLoadComplete() {
    this.onLoad(this.config);
  }

  onLoadModel() {
    this.loadAnimations();
  }

  onLoadProgress(progress: number) {
    this.onProgress(progress);
  }

  setEmotion(event: EmotionBehaviorCode) {
    if (this.animator) {
      this.animator.setEmotion(AvatarBehaviorToFacial[event]);
    }
  }

  setPhonemes(phonemes: AdditionalPhonemeInfo[]) {
    if (this.animator) {
      this.animator.setPhonemes(phonemes);
    }
  }

  setFacialBlendShapes(blendshapes: number[][], morphScaler = 1) {
    if (this.animator) {
      this.animator.setFacialBlendshapes(blendshapes, morphScaler);
    }
  }

  clearFacialBlendShapes() {
    this.setFacialBlendShapes([]);
  }

  talk(audioBase64: string, blendshapes: number[][], morphScaler = 1) {
    if (this.audio) {
      this.audio.pause();
      this.audio = undefined;
    }

    if (audioBase64) {
      this.audio = new Audio('data:audio/wav;base64,' + audioBase64);
      this.audio?.play().catch(error => {
        console.error('Audio playback error:', error);
      });
      this.setFacialBlendShapes(blendshapes, morphScaler);
    }
  }

  stopTalking() {
    if (this.audio) {
      this.audio.pause();
      this.audio = undefined;
    }
    this.clearFacialBlendShapes();
  }

  setVisemeIdScript(script: { visemeID: number; time: number }[]) {
    if (this.animator) {
      this.animator.setVisemeIdScript(script);
    }
  }

  dispose() {
    this.stopTalking();
  }

  updateFrame(delta: number) {
    if (this.animator && this.animator.animatorReady) {
      this.animator.updateFrame(delta);
    }
  }
}
