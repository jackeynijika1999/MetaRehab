// Cultural Tourism Metaverse Platform Viewer

import { LumaSplatsSource } from '@lumaai/luma-web';
import { DTRenderer, OVERLAY_DOM_ID } from '../dt-renderer';
import { isMobile, isVRDevice } from '../utils/device';
import { PCControls } from './controls/pc-controls';
import { MobileControls } from './controls/mobile-controls';
import { EventResolver } from './events/event-resolver';
import { BasePlugin } from './plugins/base-plugin';
import { VRControls } from './controls/vr-controls';
import { PluginNPCConfig } from './plugins/npc/plugin-npc';
import { PluginAgentConfig } from './plugins/agent/plugin-agent';
import { PluginMuseumItemViewerConfig } from "./plugins/museum-item-viewer/plugin-museumItem-viewer";

const OVERLAY_CONTAINER_DOM_ID = 'ctm-viewer-overlay-container';

export interface CTMViewerConfig {
    gs?: {
        source: LumaSplatsSource,
        position?: [number, number, number];
        rotation?: [number, number, number];
        scale?: [number, number, number];
    }
    camera?: {
        posotion?: [number, number, number];
        lookAt?: [number, number, number];
    }
    npc?: PluginNPCConfig[]
    agent?: PluginAgentConfig
    agentDescription?: PluginMuseumItemViewerConfig
}

export class CTMViewer {
    public renderer: DTRenderer | undefined;
    public eventResolver: EventResolver | undefined;
    public plugins: BasePlugin[] = [];

    private pcControls: PCControls | undefined;
    private mobileControls: MobileControls | undefined;
    private vrControls: VRControls | undefined;
    private _renderPaused = false;

    constructor(domId: string, private config: CTMViewerConfig) {
        this.initOverlay(domId);
        this.renderer = new DTRenderer(domId);
        this.renderer.onRender = this.onRender;
        this.eventResolver = new EventResolver(this.renderer);

        if (config.gs?.source) {
            const splat = this.renderer.loadSplats(config.gs.source);
            if (config.gs.position) {
                splat?.position.set(...config.gs.position);
            }
            if (config.gs.rotation) {
                splat?.rotation.set(...config.gs.rotation);
            }
            if (config.gs.scale) {
                splat?.scale.set(...config.gs.scale);
            }
        }

        if (config.camera?.posotion) {
            this.renderer.camera?.position.set(...config.camera.posotion);
        }
        if (config.camera?.lookAt) {
            this.renderer.camera?.lookAt(...config.camera.lookAt);
        }
        this.initControls();
    }

    private async initControls() {
        if (this.renderer?.camera && this.renderer.canvas) {
            if (await isVRDevice()) {
                this.renderer.camera.updateMatrixWorld();
                this.vrControls = new VRControls(this.renderer, this.renderer.camera.matrixWorld.clone());
            } else {
                if (isMobile()) {
                    this.mobileControls = new MobileControls(this.renderer.canvas, this.renderer.camera);
                } else {
                    this.pcControls = new PCControls(this.renderer.camera, this.renderer.canvas);
                    this.pcControls.onLock = () => {
                        this.eventResolver!.forceCanvasMiddleClick = true;
                    };
                    this.pcControls.onUnlock = () => {
                        this.eventResolver!.forceCanvasMiddleClick = false;
                    };
                }
            }
        }
    }

    private initOverlay(canvasDomID: string) {
        const overlayDom = document.createElement('div');
        overlayDom.id = OVERLAY_DOM_ID;
        overlayDom.style.pointerEvents = 'none';
        overlayDom.style.position = 'absolute';
        overlayDom.style.top = '0';
        overlayDom.style.left = '0';
        overlayDom.style.width = '100%';
        overlayDom.style.height = '100vh';

        const overlayContainerDom = document.createElement('div');
        overlayContainerDom.id = OVERLAY_CONTAINER_DOM_ID;
        overlayContainerDom.style.position = 'relative';
        overlayContainerDom.style.width = '100%';
        overlayContainerDom.style.height = '100%';
        overlayDom.appendChild(overlayContainerDom);

        document.getElementById(canvasDomID)?.parentElement?.appendChild(overlayDom);
    }

    public getOverlayContainerDom() {
        return document.getElementById(OVERLAY_CONTAINER_DOM_ID);
    }

    public addPlugins(plugin: BasePlugin) {
        this.plugins.push(plugin);
    }
    public removePlugins(plugin: BasePlugin) {
        plugin?.dispose();
        this.plugins = this.plugins.filter(p => p !== plugin);
    }
    public removeAllPlugins() {
        this.plugins.forEach(p => {
            this.removePlugins(p);
        });
        this.plugins = [];
    }

    private onRender = () => {
        const delta = this.renderer!.clock.getDelta();
        this.pcControls?.update();
        this.mobileControls?.update();
        this.vrControls?.update();
        this.plugins.forEach(p => {
            p.update(delta);
        });
    }

    get renderPaused() {
        return this._renderPaused;
    }
    set renderPaused(val) {
        this._renderPaused = !!val;

        if (this.renderer) {
            this.renderer.paused = this.renderPaused;
        }
    }

    get controls() {
        return this.pcControls || this.mobileControls || this.vrControls;
    }

    dispose() {
        this.removeAllPlugins();
        this.renderer?.dispose();
        this.renderer = undefined;
        this.pcControls?.dispose();
        this.pcControls = undefined;
        this.mobileControls?.dispose();
        this.mobileControls = undefined;
        this.vrControls?.dispose();
        this.vrControls = undefined;
    }
}
