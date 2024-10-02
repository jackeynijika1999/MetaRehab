// import { Component, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
// import { DTRenderer } from '../../../../dt-renderer';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// import { PluginMuseumItemViewerConfig } from '../plugin-museumItem-viewer';
// import { MatDialog } from '@angular/material/dialog';
// import { getMuseumItemViewerConfigs } from '../../../../configs';
// const MuseumItemViewerCanvasId = 'ctmViewer-plugin-MuseumItem-viewer-canvas';
// const MuseumItemViewerDialogId = 'ctmViewer-plugin-MuseumItem-viewer-dialog';
//
// @Component({
//   selector: 'app-museum-item-detail',
//   templateUrl: './museum-item-detail.component.html',
//   styleUrl: './museum-item-detail.component.css'
// })
// export class MuseumItemDetailComponent implements AfterViewInit{
//   @Input() modelConfig: any;
//   @Output() close = new EventEmitter<void>();
//   itemName: string = "";
//   itemDescription: string = "";
//   itemCategory: string = "";
//   itemEra: string = "";
//   private renderer: DTRenderer | undefined;
//
//   ngAfterViewInit() {
//     this.itemName = this.modelConfig?.detail.name || '物品名字';
//     this.itemDescription = this.formatDescription(this.modelConfig?.detail.description || '没有描述');
//     this.itemCategory = this.modelConfig?.detail.category || '未知类别';
//     this.itemEra = this.modelConfig?.detail.era || '未知时代';
//     // // 初始化渲染器和加载模型
//     this.initRenderer();
//     this.loadModel(this.modelConfig);
//   }
//   private initRenderer() {
//     const MuseumItemViewerCanvas = document.getElementById(MuseumItemViewerCanvasId) as any;
//     if (!MuseumItemViewerCanvas) {
//       return;
//     }
//
//     this.renderer = new DTRenderer(MuseumItemViewerCanvasId);
//     this.renderer.renderer?.setClearAlpha(0.8);
//     if (this.renderer.camera) {
//       const orbitControls = new OrbitControls(this.renderer.camera,MuseumItemViewerCanvas);
//       orbitControls.target.set(0, 0, 0);
//       this.renderer.camera.position.set(0, 0, 1);
//       this.renderer.onRender = () => {
//         orbitControls.update();
//         // this.updateLabels();
//
//       }
//     }
//   }
//   private loadModel(modelConfig: PluginMuseumItemViewerConfig) {
//     if (!this.renderer) {
//       return;
//     }
//
//     const { source, position, rotation, scale } = modelConfig.model;
//
//     const loader = new GLTFLoader();
//     loader.load(source, (gltf) => {
//       if (!gltf) {
//         return;
//       }
//       const model = gltf.scene;
//       model.position.fromArray(position);
//       model.rotation.fromArray(rotation);
//       model.scale.fromArray(scale);
//       this.renderer?.scene?.add(model);
//
//       // 添加标注
//       // if (modelConfig.modelLabel) {
//       // for(const labelInfo of modelConfig.modelLabel) {
//       //   const lineStartPoint = {x: labelInfo.lineStartPoint[0], y: labelInfo.lineStartPoint[1], z: labelInfo.lineStartPoint[2]};
//       //   const labelPosition = { x: labelInfo.location[0], y: labelInfo.location[1], z: labelInfo.location[2] };
//       //   const modelLocation = { x:  labelInfo.modelLocation[0], y: labelInfo.modelLocation[1], z: labelInfo.modelLocation[2] };
//       //   this.addLabel(model, labelInfo.label, labelPosition,lineStartPoint,modelLocation, modelConfig.model.scale);
//       // }
//     // }
//
//     }, () => { }, err => {
//       console.error(err);
//     });
//   }
//   onClose() {
//     this.renderer?.dispose();
//     this.close.emit();
//   }
//   formatDescription(description: string): string {
//     return description.replace(/\n/g, '<br>');
//   }
// }
import { Component, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { PluginMuseumItemViewerConfig } from '../plugin-museumItem-viewer';

@Component({
  selector: 'app-museum-item-detail',
  templateUrl: './museum-item-detail.component.html',
  styleUrls: ['./museum-item-detail.component.css']
})
export class MuseumItemDetailComponent implements AfterViewInit {
  @Input() modelConfig: any;
  @Output() close = new EventEmitter<void>();

  itemName: string = "";
  itemDescription: string = "";
  itemCategory: string = "";
  itemEra: string = "";
  videoSource: string = ""; // 新增字段，用于存储视频源路径

  ngAfterViewInit() {
    this.itemName = this.modelConfig?.detail.name || '物品名字';
    this.itemDescription = this.formatDescription(this.modelConfig?.detail.description || '没有描述');
    this.itemCategory = this.modelConfig?.detail.category || '未知类别';
    this.itemEra = this.modelConfig?.detail.era || '未知时代';

    // 从配置中获取视频路径
    this.videoSource = this.modelConfig?.model?.videoSource || 'assets/default-video.mp4'; // 提供默认视频路径

    // 加载视频
    this.loadVideo();
  }

  private loadVideo() {
    // 获取 video 元素
    const videoElement = document.getElementById('museum-item-video') as HTMLVideoElement;
    if (videoElement) {
      videoElement.src = this.videoSource;  // 设置视频源
      videoElement.load();  // 加载视频
      // videoElement.play();  // 自动播放视频
    }
  }

  onClose() {
    // 停止视频播放
    const videoElement = document.getElementById('museum-item-video') as HTMLVideoElement;
    if (videoElement) {
      videoElement.pause();
      videoElement.currentTime = 0;  // 重置视频时间
    }

    // 关闭对话框的其他逻辑
    this.close.emit();
  }
  playVideo() {
    const videoElement = document.getElementById('museum-item-video') as HTMLVideoElement;
    if (videoElement && videoElement.paused) {
      videoElement.play();
    }
  }


  formatDescription(description: string): string {
    return description.replace(/\n/g, '<br>');
  }
}
