import { Component, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { DTRenderer } from '../../../../dt-renderer';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { PluginShopItemViewerConfig } from '../plugin-shopitem-viewer';
const ShopItemViewerCanvasId = 'ctmViewer-plugin-ShopItem-viewer-canvas';
const ShopItemViewerDialogId = 'ctmViewer-plugin-ShopItem-viewer-dialog';
import { MatDialog } from '@angular/material/dialog';
import { getShopItemlViewerConfigs, } from '../../../../configs';
// 点击图片弹窗大图功能
// import { Inject } from '@angular/core';
// import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CanvasTexture, MeshBasicMaterial, PlaneGeometry, Mesh, Object3D, BufferGeometry, LineBasicMaterial, Line, Vector3 } from 'three';

@Component({
  selector: 'app-item-detail',
  templateUrl: './item-detail.component.html',
  styleUrls: ['./item-detail.component.css'],
})
export class ItemDetailComponent implements AfterViewInit {

  @Input() modelConfig: any;
  @Output() close = new EventEmitter<void>();
  itemName: string = "";
  itemDescription: string = "";
  soldQuantity: String = '';
  images = [];
  comments: { author: string, content: string, date: string }[] = [];
  price: number = 0;
  // images: string[] = null;
  private renderer: DTRenderer | undefined;

  pauseOnHover = true;
  pauseOnFocus = true;

  isPreviewOpen = false;
  selectedImage = '';
  isCollapsed = false;
  constructor(public dialog: MatDialog) { }

  ngAfterViewInit() {

    this.itemName = this.modelConfig?.detail.name || '物品名字';
    this.itemDescription = this.formatDescription(this.modelConfig?.detail.description || '没有描述');
    this.soldQuantity = this.modelConfig?.detail.soldQuantity || '0';
    this.images = this.modelConfig?.images || [];
    this.comments = this.modelConfig?.comments || [];
    this.price = this.modelConfig?.detail.price || 0;
    // 初始化渲染器和加载模型
    this.initRenderer();
    this.loadModel(this.modelConfig);
  }

  onClose() {
    this.renderer?.dispose();
    this.close.emit();
  }

  onBuy() {
    // 购买逻辑
  }
  formatDescription(description: string): string {
    return description.replace(/\n/g, '<br>');
  }
  switchModel(color: string) {
    const sceneName = 'clearwater-store';
    getShopItemlViewerConfigs(sceneName).then(configs => {
      let newModelConfig;
      switch (color) {
        case 'orange':
          newModelConfig = configs[1];
          break;
        case 'black':
          newModelConfig = configs[2];
          break;
        case 'red':
          newModelConfig = configs[3];
          break;
      }
      if (newModelConfig) {
        this.renderer?.scene?.clear();
        this.initRenderer();
        this.loadModel(newModelConfig);
        // this.itemName = newModelConfig.detail.name;
        // this.itemDescription = newModelConfig.detail.description;
        // this.soldQuantity = newModelConfig.detail.soldQuantity;
        // this.images = newModelConfig.images || [];
        // this.comments = newModelConfig.comments || [];
      }
    });
  }
  // 点击图片弹窗大图功能
  // openImagePreview(image: string) {
  //   const dialogRef = this.dialog.open(ImageDialogComponent, {
  //     data: { imageSrc: image }
  //   });

  //   dialogRef.afterClosed().subscribe(result => {
  //     console.log('Dialog was closed');
  //   });
  // }

  // closeImagePreview() {
  //   this.isPreviewOpen = false;
  //   this.selectedImage = '';
  // }
  private initRenderer() {
    const shopItemViewerCanvas = document.getElementById(ShopItemViewerCanvasId) as any;
    if (!shopItemViewerCanvas) {
      return;
    }

    this.renderer = new DTRenderer(ShopItemViewerCanvasId);
    this.renderer.renderer?.setClearAlpha(0.8);
    if (this.renderer.camera) {
      const orbitControls = new OrbitControls(this.renderer.camera, shopItemViewerCanvas);
      orbitControls.target.set(0, 0, 0);
      this.renderer.camera.position.set(0, 0, 1);
      this.renderer.onRender = () => {
        orbitControls.update();
        this.updateLabels();

      }
    }
  }
  highlightButton(color: string) {
    const colors = ['orange', 'black', 'red'];
    colors.forEach(c => {
      const button = document.getElementById(`${c}-helmet`);
      if (button) {
        if (c === color) {
          button.classList.add('selected');
        } else {
          button.classList.remove('selected');
        }
      }
    });
  }
  private loadModel(modelConfig: PluginShopItemViewerConfig) {
    if (modelConfig.detail.color) {
      this.highlightButton(modelConfig.detail.color);
    }
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

      // 添加标注
      if (modelConfig.modelLabel) {
      for(const labelInfo of modelConfig.modelLabel) {
        const lineStartPoint = {x: labelInfo.lineStartPoint[0], y: labelInfo.lineStartPoint[1], z: labelInfo.lineStartPoint[2]};
        const labelPosition = { x: labelInfo.location[0], y: labelInfo.location[1], z: labelInfo.location[2] };
        const modelLocation = { x:  labelInfo.modelLocation[0], y: labelInfo.modelLocation[1], z: labelInfo.modelLocation[2] };
        this.addLabel(model, labelInfo.label, labelPosition,lineStartPoint,modelLocation, modelConfig.model.scale);
      }
    }
      
    }, () => { }, err => {
      console.error(err);
    });
  }
  private addLabel(model: Object3D, text: string, position: { x: number, y: number, z: number },labelPosition: { x: number, y: number, z: number }, modelPosition: { x: number, y: number, z: number },scale: number[]): Mesh {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Unable to get canvas context');
    }
    const fontSize = 16;
    context.font = `${fontSize}px Arial`;
    const textWidth = context.measureText(text).width;
    canvas.width = textWidth*1.1;
    canvas.height = fontSize*1.2;

    context.font = `${fontSize}px Arial`;
    context.fillStyle = 'rgba(255, 255, 255, 1)';
    context.fillText(text, 0, fontSize);

    const texture = new CanvasTexture(canvas);
    const material = new MeshBasicMaterial({ map: texture, transparent: true });
    const geometry = new PlaneGeometry(canvas.width / 600 / scale[0], canvas.height /600 / scale[1]);
    const mesh = new Mesh(geometry, material);
    mesh.position.set(position.x, position.y, position.z);
    this.addLine(model, labelPosition,modelPosition);
    model.add(mesh);

    return mesh;
  }

  private addLine(model: Object3D,  labelPosition: { x: number, y: number, z: number }, modelPosition: { x: number, y: number, z: number }) {
    const points = [];
    points.push(new Vector3(modelPosition.x,modelPosition.y,modelPosition.z));
    points.push(new Vector3(labelPosition.x, labelPosition.y, labelPosition.z)); 

    const geometry = new BufferGeometry().setFromPoints(points);
    const material = new LineBasicMaterial({ color: 0xffffff,linewidth: 100, });
    const line = new Line(geometry, material);
    model.add(line);
  }

  private updateLabels() {
    if (this.renderer && this.renderer.camera && this.renderer.scene) {
      this.renderer.scene.traverse((object) => {
        if (object instanceof Mesh && object.material instanceof MeshBasicMaterial) {
          if(this.renderer?.camera)
          object.lookAt(this.renderer.camera.position);
        }
      });
    }
  }
}

// 点击图片弹窗大图功能
// @Component({
//   selector: 'app-image-dialog',
//   template: `
//     <div class="image-dialog-content">
//       <img [src]="data.imageSrc" alt="Image Preview" class="image-preview"/>
//     </div>
//   `,
//   styles: [`
//     .image-dialog-content {
//       position: relative;
//       display: flex;
//       justify-content: center;
//       align-items: center;
//       padding: 20px;
//     }
//     .image-preview {
//       max-width: 100%;
//       max-height: 80vh;
//       object-fit: contain;
//     }
//   `]
// })
// export class ImageDialogComponent {
//   constructor(@Inject(MAT_DIALOG_DATA) public data: { imageSrc: string }) { }
// }