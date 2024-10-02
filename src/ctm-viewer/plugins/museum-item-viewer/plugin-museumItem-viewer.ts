import { BasePlugin } from "../base-plugin";
import { BoxGeometry, Mesh, MeshBasicMaterial, Object3D, Intersection } from "three";
import { CTMViewer } from "../..";
import { DTRenderer } from "../../../dt-renderer";
import { ViewContainerRef } from "@angular/core";
import { MuseumItemDetailComponent } from "./museum-item-detail/museum-item-detail.component";

import { PluginAgent } from '../agent/plugin-agent';

const MuseumItemViewerCanvasId = 'ctmViewer-plugin-MuseumItem-viewer-canvas';
const MuseumItemViewerDialogId = 'ctmViewer-plugin-MuseumItem-viewer-dialog';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { getAudioAndBlendshapes } from "./utils_getAnB";


export interface PluginMuseumItemViewerConfig {
    selector: {
        box?: {
            position: number[];
            rotation: [number, number, number];
            scale: number[];
        },
        name?: string;
    }
    model: {
        source: string;
        videoSource?: string; //
        position: number[];
        rotation: [number, number, number];
        scale: number[];
    }
    detail: {
        name: string;
        description: string;
        category: string;
        era: string;
    }
    agentDescription: {
        audioFileName: string;
        blendshapeFileName: string;
    };
}
export class PluginMuseumItemViewer extends BasePlugin {
    private renderer: DTRenderer | undefined;
    private isDialogOpen = false;
    private vcr!: ViewContainerRef;

    //测试
    private transformControls: TransformControls | undefined;
    private selectedObject: Object3D | undefined;

    constructor(ctmViewer: CTMViewer, private configs: PluginMuseumItemViewerConfig[], vcr: ViewContainerRef) {
        super(ctmViewer);
        this.vcr = vcr;
        //测试
        // this.createTestBox();

        this.configs.forEach(config => {
            if (config.selector.box) {
                const box = this.createTransparentBox(config);
                if (box) {
                    this.ctmViewer.renderer?.scene?.add(box);
                }
            }
        });
        this.ctmViewer.eventResolver?.addClickEvent(this.onSelect);
    }
    private getModelConfig(object: any): PluginMuseumItemViewerConfig {
        return object.userData?.plugin_MuseumItemViewer;
    }
    // 测试box
    // private createTestBox(){
    //     const boxGeometry = new BoxGeometry(1, 1, 1);
    //     const boxMaterial = new MeshBasicMaterial({ color: 0x00ff00 });
    //     const boxMesh = new Mesh(boxGeometry, boxMaterial);
    //     boxMesh.position.set(-1.1057027895716331,0,3.84258795908171);
    //     boxMesh.rotation.set(0, 2, 0);
    //     boxMesh.scale.set(0.3, 0.3, 0.3);
    //     boxMesh.visible = true;
    //     // Add TransformControls for the box
    //     if (this.ctmViewer.renderer?.camera && this.ctmViewer.renderer) {
    //         this.transformControls = new TransformControls(this.ctmViewer.renderer.camera, this.ctmViewer.renderer.renderer?.domElement);
    //         this.transformControls.attach(boxMesh);
    //         this.ctmViewer.renderer.scene?.add(this.transformControls);
    //
    //         // Listen to change event to log the position
    //         document.addEventListener('keydown', (event) => {
    //             if (event.key === 'q' ) {
    //                 console.log(`Position: ${boxMesh.position.toArray()}`);
    //             }
    //         });
    //       // 监听 TransformControls 的 change 事件，实时打印盒子的位置
    //         this.transformControls.addEventListener('change', () => {
    //           console.log(`TransformControls Updated Position: ${boxMesh.position.toArray()}`);
    //       });
    //
    //     }
    //
    //     this.ctmViewer.renderer?.scene?.add(boxMesh);
    //     return boxMesh;
    // }

    private createTransparentBox(config: PluginMuseumItemViewerConfig) {
        const boxConfig = config.selector.box;
        if (!boxConfig) {
            return null;
        }

        const boxGeometry = new BoxGeometry(1, 1, 1);
        const boxMaterial = new MeshBasicMaterial({ color: 0x00ff00 });
        const boxMesh = new Mesh(boxGeometry, boxMaterial);
        boxMesh.position.fromArray(boxConfig.position);
        boxMesh.rotation.fromArray(boxConfig.rotation);
        boxMesh.scale.fromArray(boxConfig.scale);
        boxMesh.userData['plugin_MuseumItemViewer'] = config;
        boxMesh.visible = false;

        return boxMesh;
    }
    private onSelect = (event: MouseEvent, intersections: Intersection<Object3D>[]) => {
        if (this.isDialogOpen) {
            return;
        }
        const object2View = intersections.find(intersect => this.getModelConfig(intersect.object))?.object;
        if (!object2View) {
            return;
        }
        this.ctmViewer.renderPaused = true;
        if (this.ctmViewer.controls) {
            this.ctmViewer.controls.enabled = false;
        }

        const museumItemConfig = this.getModelConfig(object2View);
        this.createDialog(museumItemConfig);
    }

    private onClose = () => {
        // 停止播放视频
        const videoElement = document.getElementById('museum-item-video') as HTMLVideoElement;
        if (videoElement) {
          videoElement.pause();
          videoElement.currentTime = 0; // 将视频进度重置
        }
        // 遍历插件列表，检查是否存在 PluginAgent
        for (const plugin of this.ctmViewer.plugins) {
            if (plugin instanceof PluginAgent) {
                plugin.stopTalking();
                break;
            }
        }
        this.renderer?.dispose();
        this.renderer = undefined;
        this.removeDialog();

        if (this.ctmViewer.renderPaused) {
            this.ctmViewer.renderPaused = false;
        }
        if (this.ctmViewer.controls) {
            this.ctmViewer.controls.enabled = true;
        }
    }


    private async createDialog(modelConfig: PluginMuseumItemViewerConfig) {
        const componentRef = this.vcr.createComponent(MuseumItemDetailComponent);
        componentRef.instance.modelConfig = modelConfig;
        componentRef.instance.close.subscribe(() => {
            this.onClose();
            componentRef.destroy();

            // 关闭对话框时停止说话
            for (const plugin of this.ctmViewer.plugins) {
                if (plugin instanceof PluginAgent) {
                    plugin.stopTalking();
                    break;
                }
            }
        });
        this.isDialogOpen = true;

      // 替换为视频播放
      const videoElement = document.createElement('video');
      videoElement.id = 'museum-item-video';
      videoElement.controls = true;
      videoElement.autoplay = true;
      videoElement.src = '/Users/jackey/Documents/metarehablab/src/assets/leg1/leg1.MP4'; // 指定你的视频路径
      videoElement.style.width = '50%'; // 设定视频宽度
      videoElement.style.height = '100%'; // 设定视频高度

      const container = document.getElementById(MuseumItemViewerCanvasId); // 替换原来的 canvas
      if (container) {
        container.appendChild(videoElement); // 将视频元素添加到容器中
      }

        // 检查并使用 agentDescription
        if (modelConfig.agentDescription) {
            const { audioFileName, blendshapeFileName } = modelConfig.agentDescription;
            if (audioFileName && blendshapeFileName) {
                try {
                    const { audioBase64, blendshapes } = await getAudioAndBlendshapes(audioFileName, blendshapeFileName);

                    // 遍历插件列表，检查是否存在 PluginAgent 并让它说话
                    for (const plugin of this.ctmViewer.plugins) {
                        if (plugin instanceof PluginAgent) {
                            plugin.talk(audioBase64, blendshapes);
                            break;
                        }
                    }
                } catch (error) {
                    console.error('加载音频和 blendshapes 时出错:', error);
                }
            }
        }
    }

    private removeDialog() {
        const canvas = document.getElementById(MuseumItemViewerCanvasId);
        canvas?.remove();
        const dialog = document.getElementById(MuseumItemViewerDialogId);
        dialog?.remove();
        this.isDialogOpen = false;
    }
    public override dispose(): void {
        this.onClose();
        this.ctmViewer.eventResolver?.removeClickEvent(this.onSelect);
        this.ctmViewer = null as any;
    }
}
