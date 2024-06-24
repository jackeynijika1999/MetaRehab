// AI代理助手

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CTMViewer } from "../..";
import { BasePlugin } from "../base-plugin";
import { DTRenderer } from "../../../dt-renderer";
import { Avatar } from "../../digital-human/avatar/avatar";
import { MOCK_TALKING_HELLO1, MOCK_TALKING_JSY1, MOCK_TALKING_TK1, TALKING_HELLO1_WAV } from "./mock-voice-data";
import { AvatarConfiguration } from '../../digital-human/avatar/avatar-configs';

const AgentViewerCanvasId = 'ctmViewer-plugin-Agent-canvas';
const AgentViewerDialogId = 'ctmViewer-plugin-Agent-dialog';

export interface PluginAgentConfig {
    avatarConfig: AvatarConfiguration;
    position?: [number, number, number];
    rotation?: [number, number, number];
    scale?: [number, number, number];
    open: boolean;
}

export class PluginAgent extends BasePlugin {
    private renderer: DTRenderer | undefined;
    avatar: Avatar | undefined;
    isDialogOpen = false;
    private mockVoiceIndex = 0;

    constructor(ctmViewer: CTMViewer, private configs: PluginAgentConfig) {
        super(ctmViewer);
        this.listenKeyboard();
        if (configs.open) {
            this.openAgent();
        }
    }

    openAgent() {
        if (!this.isDialogOpen) {
            this.createDialog();
            this.initRenderer();
            this.initAvatar();
        }
    }

    private initAvatar() {
        this.avatar = new Avatar({
            avatarConfig: this.configs.avatarConfig,
            dracoURI: '/assets/draco-gltf/',
            onLoad: () => {
                const avatarMesh = this.avatar?.getModel();
                if (avatarMesh) {
                    this.renderer?.scene?.add(avatarMesh);
                    avatarMesh.position.set(...this.configs.position || [0, 0, 0]);
                    avatarMesh.rotation.set(...this.configs.rotation || [0, 0, 0]);
                    avatarMesh.scale.set(...this.configs.scale || [1, 1, 1]);

                    setTimeout(() => {
                        this.talk(TALKING_HELLO1_WAV, MOCK_TALKING_HELLO1);
                    });
                }
            },
        });
    }

    talk(audioWAVBaase64: string, blendshapes: number[][]) {
        this.avatar?.talk(audioWAVBaase64, blendshapes, 0.4);
    }

    stopTalking() {
        if (this.avatar) {
            this.avatar.stopTalking();
        }
    }

    // 测试用代码
    private testTalking() {
        const talkData = [
            MOCK_TALKING_JSY1, MOCK_TALKING_TK1
        ];
        if (this.avatar && talkData[this.mockVoiceIndex]) {
            this.talk('', talkData[this.mockVoiceIndex++]);
        }
    }

    private initRenderer() {
        const modelViewerCanvas = document.getElementById(AgentViewerCanvasId) as any;
        if (!modelViewerCanvas) {
            return;
        }

        this.renderer = new DTRenderer(AgentViewerCanvasId);
        this.renderer.renderer?.setClearAlpha(0);
        this.renderer.VRBtn?.remove();
        if (this.renderer.camera) {
            const orbitControls = new OrbitControls(this.renderer.camera, modelViewerCanvas);
            orbitControls.target.set(0, 0, 0);
            this.renderer.camera.position.set(0, 0, 1);
            this.renderer.onRender = () => {
                orbitControls.update();
            }
        }

        this.renderer.onRender = () => {
            this.avatar?.updateFrame(this.renderer!.clock.getDelta());
        }
    }

    closeAgent() {
        if (this.isDialogOpen) {
            this.avatar?.dispose();
            this.avatar = undefined;
            this.renderer?.dispose();
            this.renderer = undefined;
            this.removeDialog();
        }
    }

    private onClose = () => {
        this.closeAgent();
    }

    private createDialog() {
        const dialog = document.createElement('div');
        dialog.id = AgentViewerDialogId;
        dialog.style.position = 'absolute';
        dialog.style.top = '10px';
        dialog.style.left = '10px';
        dialog.style.width = '300px';
        dialog.style.height = '300px';
        dialog.style.background = 'radial-gradient(rgba(0, 0, 0, 1), rgba(0, 0, 0, 0))';
        dialog.style.boxShadow = '0 0 40px rgba(0, 0, 0, 0.9)';
        dialog.style.borderRadius = '100px';
        dialog.style.zIndex = '9999';
        dialog.style.display = 'flex';
        dialog.style.justifyContent = 'center';
        dialog.style.alignItems = 'center';

        const canvas = document.createElement('canvas');
        canvas.id = AgentViewerCanvasId;
        canvas.style.width = '95%';
        canvas.style.height = '95%';
        canvas.style.backgroundColor = 'rgba(255, 255, 255, 0)';
        canvas.style.cursor = 'default';
        canvas.style.borderRadius = '50px';
        dialog.appendChild(canvas);

        document.body.appendChild(dialog);
        this.isDialogOpen = true;
    }

    private removeDialog() {
        const canvas = document.getElementById(AgentViewerCanvasId);
        canvas?.remove();
        const dialog = document.getElementById(AgentViewerDialogId);
        dialog?.remove();
        this.isDialogOpen = false;
    }

    public override dispose(): void {
        this.onClose();
        this.removeKeyboardListener();
        this.ctmViewer = null as any;
    }

    private listenKeyboard() {
        document.addEventListener('keydown', this.onPressKey);
    }
    private removeKeyboardListener() {
        document.removeEventListener('keydown', this.onPressKey);
    }

    private onPressKey = (event: KeyboardEvent) => {
        console.log('press key', event)
        switch (event.key) {
            case 'h':
            case 'H': {
                if (this.isDialogOpen) {
                    this.closeAgent();
                } else {
                    this.openAgent();
                }
                break;
            }
            case 'r':
            case 'R': {
                // voice recognition
                // this.testTalking();
                break;
            }
        }
    }
}
