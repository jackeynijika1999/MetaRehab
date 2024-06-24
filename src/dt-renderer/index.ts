// 3dgs based Digital Twin renderer

import { WebGLRenderer, PerspectiveCamera, Scene, DirectionalLight, Group, Clock, AmbientLight } from 'three';
import { VRButton } from './vr-button';
import { LumaSplatsSource, LumaSplatsThree } from '@lumaai/luma-web';
import { isMobile } from '../utils/device';

export const OVERLAY_DOM_ID = 'ctm-dt-overlay';

export class DTRenderer {
    public canvas: HTMLCanvasElement | undefined;
    public renderer: WebGLRenderer | undefined;
    public scene: Scene | undefined;
    public camera: PerspectiveCamera | undefined;
    public cameraWrapper = new Group();
    public onRender: () => void = () => { };

    public splat: LumaSplatsThree | undefined;

    public paused = false;
    public VRBtn: HTMLElement | undefined;
    public clock = new Clock();

    constructor(domId: string) {
        this.canvas = document.getElementById(domId) as HTMLCanvasElement;
        if (!this.canvas) {
            return;
        }

        this.initThree();
        this.adaptDevice();
        this.renderLoop();

        window.addEventListener('resize', this.resize);
    }

    private initThree() {
        if (!this.canvas) {
            return;
        }

        this.renderer = new WebGLRenderer({
            canvas: this.canvas,
            antialias: false
        });
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight, false);

        this.scene = new Scene();
        this.camera = new PerspectiveCamera(45, this.canvas.clientWidth / this.canvas.clientHeight, 0.1, 1000);
        this.cameraWrapper.add(this.camera);
        this.scene.add(this.cameraWrapper);

        const ambientLight = new AmbientLight(0xffffff, 1);
        const directionalLight1 = new DirectionalLight(0xffffff, 1);
        directionalLight1.position.set(1, 1, 1);
        const directionalLight2 = new DirectionalLight(0xffffff, 1);
        directionalLight2.position.set(-1, -1, -1);
        this.scene.add(ambientLight, directionalLight1, directionalLight2);
    }

    private setupXRBtn() {
        if (!this.renderer || !this.canvas) {
            return;
        }
        this.renderer.xr.enabled = true;

        this.VRBtn = VRButton.createButton(this.renderer, {
            optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking', 'layers', 'dom-overlay'],
            domOverlay: { root: document.getElementById(OVERLAY_DOM_ID) }
        });
        this.canvas.parentElement?.appendChild(this.VRBtn);
    }

    public loadSplats(lumaSource: LumaSplatsSource) {
        if (!this.scene) {
            return;
        }

        if (this.splat) {
            this.splat.dispose();
            this.scene.remove(this.splat);
            this.splat = undefined;
        }

        this.splat = new LumaSplatsThree({
            source: lumaSource,
            enableThreeShaderIntegration: false,
        });
        this.scene.add(this.splat);

        return this.splat;
    }

    private adaptDevice() {
        if (!this.renderer || !this.camera) {
            return;
        }

        if (isMobile()) {
            this.renderer.setPixelRatio(0.8);
        } else {
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.setupXRBtn(); // TODO: VR
        }
    }

    public dispose() {
        this.splat?.dispose();
        this.splat = undefined;

        this.renderer?.clear();
        this.renderer?.dispose();
        this.renderer = undefined;

        this.scene?.traverse((child) => {
            if ((child as any).dispose) {
                (child as any).dispose();
            }
        });
        this.scene = undefined;

        this.VRBtn?.remove();

        window.removeEventListener('resize', this.resize);
        this.canvas = undefined;
        this.onRender = () => { };
    }

    private renderLoop() {
        this.renderer?.setAnimationLoop(() => {
            if (this.paused) {
                return;
            }

            this.onRender();
            if (this.scene && this.camera) {
                this.renderer?.render(this.scene, this.camera);
            }
        })
    }

    private resize = () => {
        if (!this.canvas || !this.renderer || !this.camera) {
            return;
        }

        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height, false);
    }
}
