// 模型详情查看器

import { BoxGeometry, Mesh, MeshBasicMaterial, Object3D, Intersection } from "three";
import { CTMViewer } from "../..";
import { BasePlugin } from "../base-plugin";
import { DTRenderer } from "../../../dt-renderer";
import { ViewContainerRef } from "@angular/core";
//测试box
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
const ShopItemViewerCanvasId = 'ctmViewer-plugin-ShopItem-viewer-canvas';
const ShopItemViewerDialogId = 'ctmViewer-plugin-ShopItem-viewer-dialog';

import { ItemDetailComponent } from './item-detail/item-detail.component';


export interface PluginShopItemViewerConfig {
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
    detail: {
        name: string;
        description: string;
        quantityInStock: number;
        price: number;
        soldQuantity: string;
        color?: string;
    }
    images?: string[];
    comments?: {author: string, content: string, date: string}[];
    modelLabel?:
        {
         label: string,
         location:[number,number,number]
         lineStartPoint:[number,number,number],
         modelLocation:[number,number,number]
        }[];
     
}

export class PluginShopItemViewer extends BasePlugin {
    private renderer: DTRenderer | undefined;
    private isDialogOpen = false;
    private  vcr!: ViewContainerRef;
    /* 测试
    private transformControls: TransformControls | undefined;
    private selectedObject: Object3D | undefined;
    */
    constructor(ctmViewer: CTMViewer, private configs: PluginShopItemViewerConfig[], vcr: ViewContainerRef) {
        super(ctmViewer);
        this.vcr = vcr;
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

    private getModelConfig(object: any): PluginShopItemViewerConfig {
        return object.userData?.plugin_ShopItemViewer;
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
    private createTransparentBox(config: PluginShopItemViewerConfig) {
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
        boxMesh.userData['plugin_ShopItemViewer'] = config;
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

        const shopItemConfig = this.getModelConfig(object2View);
        this.createDialog(shopItemConfig);
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

    private createDialog(modelConfig: PluginShopItemViewerConfig) {
        const componentRef = this.vcr.createComponent(ItemDetailComponent);
        componentRef.instance.modelConfig = modelConfig;
        componentRef.instance.close.subscribe(() => {
          this.onClose();
          componentRef.destroy();
        });
        this.isDialogOpen = true;
    }
    
    private removeDialog() {
        const canvas = document.getElementById(ShopItemViewerCanvasId);
        canvas?.remove();
        const dialog = document.getElementById(ShopItemViewerDialogId);
        dialog?.remove();
        this.isDialogOpen = false;
    }

    public override dispose(): void {
        this.onClose();
        this.ctmViewer.eventResolver?.removeClickEvent(this.onSelect);
        this.ctmViewer = null as any;
    }
}