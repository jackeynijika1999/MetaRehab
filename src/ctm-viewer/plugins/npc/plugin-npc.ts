// AI NPC

import { CTMViewer } from "../..";
import { BasePlugin } from "../base-plugin";
import { Avatar } from "../../digital-human/avatar/avatar";
import { MOCK_TALKING_POLYU1, MOCK_TALKING_POLYU2 } from '../agent/mock-voice-data';
import { AvatarConfiguration } from "../../digital-human/avatar/avatar-configs";

export interface PluginNPCConfig {
    position?: [number, number, number];
    rotation?: [number, number, number];
    scale?: [number, number, number];
    avatarConfig: AvatarConfiguration;
}

export class PluginNPC extends BasePlugin {
    // TODO: support multiple NPCs
    avatar: Avatar | undefined;
    private mockVoiceIndex = 0;

    constructor(ctmViewer: CTMViewer, private configs: PluginNPCConfig[]) {
        super(ctmViewer);
        this.initAvatar();
        this.listenKeyboard();
    }

    private initAvatar() {
        this.avatar = new Avatar({
            avatarConfig: this.configs[0].avatarConfig,
            dracoURI: '/assets/draco-gltf/',
            onLoad: () => {
                const avatarMesh = this.avatar?.getModel();
                if (avatarMesh) {
                    this.ctmViewer.renderer?.scene?.add(avatarMesh);
                    avatarMesh.scale.set(...this.configs[0].scale || [1, 1, 1]);
                    avatarMesh.position.set(...this.configs[0].position || [0, 0, 0]);
                    avatarMesh.rotation.set(...this.configs[0].rotation || [0, 0, 0]);
                }

                avatarMesh?.traverse((child: any) => {
                    if (child.name === 'AvatarRightCornea' || child.name === 'AvatarLeftCornea') {
                        child.material.opacity = 0.3;
                    }
                });
            },
        });
    }

    talk(audioWAVBaase64: string, blendshapes: number[][]) {
        this.avatar?.talk(audioWAVBaase64, blendshapes, 1);
    }

    // 测试用代码
    private testTalking() {
        const talkData = [
            MOCK_TALKING_POLYU1, MOCK_TALKING_POLYU2
        ];
        if (this.avatar && talkData[this.mockVoiceIndex]) {
            this.talk('', talkData[this.mockVoiceIndex++]);
        }
    }

    public override dispose(): void {
        this.removeKeyboardListener();
        this.ctmViewer = null as any;
    }

    override update(delta: number) {
        this.avatar?.updateFrame(delta);
    }

    private listenKeyboard() {
        document.addEventListener('keydown', this.onPressKey);
    }
    private removeKeyboardListener() {
        document.removeEventListener('keydown', this.onPressKey);
    }

    private onPressKey = (event: KeyboardEvent) => {
        switch (event.key) {
            case 'r':
            case 'R': {
                // voice recognition
                // this.testTalking();
                break;
            }
        }
    }
}