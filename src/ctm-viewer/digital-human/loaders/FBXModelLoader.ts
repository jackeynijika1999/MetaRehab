/* eslint-disable */
import { Mesh, Object3D, Object3DEventMap, Group } from 'three';
import { DRACOLoader, FBXLoader } from 'three-stdlib';

import { IFileLoader } from './IFileLoader';

export interface FBXModelLoaderProps {
  path: string;
  dracoPath?: string;
}

export class FBXModelLoader implements IFileLoader {
  path: string;
  dracoLoader?: DRACOLoader;
  loader: FBXLoader;
  callback?: Function;
  isLoaded: Boolean = false;
  model?: Group<Object3DEventMap>;

  constructor(props: FBXModelLoaderProps) {
    this.path = props.path;
    this.loader = new FBXLoader();
    // if (props.dracoPath) {
    //   this.dracoLoader = new DRACOLoader();
    //   this.dracoLoader.setDecoderPath(props.dracoPath);
    //   this.loader.setDRACOLoader(this.dracoLoader);
    // }
    this.onLoad = this.onLoad.bind(this);
    this.onUpdate = this.onUpdate.bind(this);
    this.onError = this.onError.bind(this);
  }

  public getGLTF(): { scene: Group<Object3DEventMap> } | undefined {
    if (!this.model) {
      throw new Error('GLTFModelLoader model not loaded');
    }
    return { scene: this.model };
  }

  public load(callback: Function) {
    // console.log('GLTFModelLoader load')
    this.callback = callback;
    this.loader.load(this.path, this.onLoad, this.onUpdate, this.onError);
  }

  private onError(error: ErrorEvent) {
    console.log('GLTFModelLoader onError', error);
    throw new Error('Error loading file ' + this.path + ' ' + error);
  }

  private onLoad(model: Group<Object3DEventMap>) {
    // console.log('GLTFModelLoader onLoad')
    this.model = model;
    this.model.traverse((node) => {
      if ((node as Mesh).isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
    this.isLoaded = true;
    this.callback!();
  }

  private onUpdate(event: ProgressEvent) {
    // console.log('GLTFModelLoader onUpdate', event);
  }
}
