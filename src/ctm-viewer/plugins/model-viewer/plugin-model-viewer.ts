// 模型详情查看器

import { BoxGeometry, Mesh, MeshBasicMaterial, Object3D, Intersection } from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { CTMViewer } from "../..";
import { BasePlugin } from "../base-plugin";
import { DTRenderer } from "../../../dt-renderer";

import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

// 导入新添加的功能


const ModelViewerCanvasId = 'ctmViewer-plugin-model-viewer-canvas';
const ModelViewerDialogId = 'ctmViewer-plugin-model-viewer-dialog';

export interface PluginModelViewerConfig {
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
        position: number[];
        rotation: [number, number, number];
        scale: number[];
    }
}

export class PluginModelViewer extends BasePlugin {
    private renderer: DTRenderer | undefined;
    private isDialogOpen = false;
    private transformControls: TransformControls | undefined;
    private selectedObject: Object3D | undefined;


    constructor(ctmViewer: CTMViewer, private configs: PluginModelViewerConfig[]) {
        super(ctmViewer);
        /*测试
        this.createTestBox();
        */
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

    private getModelConfig(object: any): PluginModelViewerConfig {
        return object.userData?.plugin_ModelViewer;
    }
    /*测试box
    private createTestBox(){
        const boxGeometry = new BoxGeometry(1, 1, 1);
        const boxMaterial = new MeshBasicMaterial({ color: 0x00ff00 });
        const boxMesh = new Mesh(boxGeometry, boxMaterial);
        boxMesh.position.set(-1.1057027895716331,0,3.84258795908171);
        boxMesh.rotation.set(0, 2, 0);
        boxMesh.scale.set(1.5, 2.5, 2);
        boxMesh.visible = true;
        // Add TransformControls for the box
        if (this.ctmViewer.renderer?.camera && this.ctmViewer.renderer) {
            this.transformControls = new TransformControls(this.ctmViewer.renderer.camera, this.ctmViewer.renderer.renderer?.domElement);
            this.transformControls.attach(boxMesh);
            this.ctmViewer.renderer.scene?.add(this.transformControls);

            // Listen to change event to log the position
            document.addEventListener('keydown', (event) => {
                if (event.key === 'q' ) {
                    console.log(`Position: ${boxMesh.position.toArray()}`);
                }
            });

        }
        this.ctmViewer.renderer?.scene?.add(boxMesh);
        return boxMesh;
    }
   */
    private createTransparentBox(config: PluginModelViewerConfig) {
        const boxConfig = config.selector.box;
        if (!boxConfig) {
            return null;
        }

        const boxGeometry = new BoxGeometry(1, 1, 1);
        const boxMaterial = new MeshBasicMaterial();
        const boxMesh = new Mesh(boxGeometry, boxMaterial);
        boxMesh.position.fromArray(boxConfig.position);
        boxMesh.rotation.fromArray(boxConfig.rotation);
        boxMesh.scale.fromArray(boxConfig.scale);
        boxMesh.userData['plugin_ModelViewer'] = config;
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

        const modelConfig = this.getModelConfig(object2View);
        this.createDialog();
        this.initRenderer();
        this.loadModel(modelConfig);
    }

    private initRenderer() {
        const modelViewerCanvas = document.getElementById(ModelViewerCanvasId) as any;
        if (!modelViewerCanvas) {
            return;
        }

        this.renderer = new DTRenderer(ModelViewerCanvasId);
        this.renderer.renderer?.setClearAlpha(0.8);
        if (this.renderer.camera) {
            const orbitControls = new OrbitControls(this.renderer.camera, modelViewerCanvas);
            orbitControls.target.set(0, 0, 0);
            this.renderer.camera.position.set(0, 0, 1);
            this.renderer.onRender = () => {
                orbitControls.update();
            }
        }
    }

    private loadModel(modelConfig: PluginModelViewerConfig) {
        if (!this.renderer) {
            return;
        }

        const { source, position, rotation, scale } = modelConfig.model;

        const loader = new GLTFLoader();
        loader.load(source, (gltf) => {
            if (!gltf) {
                return;
            }
            const model = gltf.scene;
            model.position.fromArray(position);
            model.rotation.fromArray(rotation);
            model.scale.fromArray(scale);
            this.renderer?.scene?.add(model);
        }, () => { }, err => {
            console.error(err);
        });
    }

    private onClose = () => {
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

    private createDialog() {
        const dialog = document.createElement('div');
        dialog.id = ModelViewerDialogId;
        dialog.style.position = 'absolute';
        dialog.style.top = '0';
        dialog.style.left = '0';
        dialog.style.width = '100%';
        dialog.style.height = '100%';
        dialog.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        dialog.style.zIndex = '9999';
        dialog.style.display = 'flex';
        dialog.style.justifyContent = 'center';
        dialog.style.alignItems = 'center';

        const canvas = document.createElement('canvas');
        canvas.id = ModelViewerCanvasId;
        canvas.style.width = '80%';
        canvas.style.height = '80%';
        canvas.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
        canvas.style.cursor = 'default';
        canvas.style.borderRadius = '50px';
        dialog.appendChild(canvas);

        const closeBtn = document.createElement('div');
        closeBtn.innerHTML = '✖️';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '10px';
        closeBtn.style.right = '10px';
        closeBtn.style.width = '30px';
        closeBtn.style.height = '30px';
        closeBtn.style.lineHeight = '30px';
        closeBtn.style.fontSize = '30px';
        closeBtn.style.backgroundColor = 'rgba(255, 255, 255, 0)';
        closeBtn.style.cursor = 'pointer';
        closeBtn.addEventListener('click', this.onClose);
        dialog.appendChild(closeBtn);

        document.body.appendChild(dialog);
        this.isDialogOpen = true;
    }

    private removeDialog() {
        const canvas = document.getElementById(ModelViewerCanvasId);
        canvas?.remove();
        const dialog = document.getElementById(ModelViewerDialogId);
        dialog?.remove();
        this.isDialogOpen = false;
    }

    public override dispose(): void {
        this.onClose();
        this.ctmViewer.eventResolver?.removeClickEvent(this.onSelect);
        this.ctmViewer = null as any;
    }
}
