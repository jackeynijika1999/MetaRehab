// AI代理助手

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CTMViewer } from "../..";
import { BasePlugin } from "../base-plugin";
import { DTRenderer } from "../../../dt-renderer";
import { Avatar } from "../../digital-human/avatar/avatar";
import { MOCK_TALKING_HELLO1, MOCK_TALKING_JSY1, MOCK_TALKING_TK1, TALKING_HELLO1_WAV } from "./mock-voice-data";
import { AvatarConfiguration } from '../../digital-human/avatar/avatar-configs';
import {AudioRecordController} from "../../sound/audio_record_controller";
import { io } from 'socket.io-client';

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
  private audioController: AudioRecordController | undefined;
  avatar: Avatar | undefined;
  isDialogOpen = false;
  private mockVoiceIndex = 0;

  constructor(ctmViewer: CTMViewer, private configs: PluginAgentConfig) {
    super(ctmViewer);
    this.listenKeyboard();
    this.audioController = AudioRecordController.getAudioControllerInstance(ctmViewer);
    if (configs.open) {
      this.openAgent();
    }
  }

  openAgent() {
    if (!this.isDialogOpen) {
      this.createDialog();
      this.initRenderer();
      this.initAvatar();
      this.audioController?.subscribe(this.handleAudioData);
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
            this.talk(TALKING_HELLO1_WAV, MOCK_TALKING_HELLO1, false);
          });
        }
      },
    });
  }

  talk(audioWAVBase64: string, blendshapes: number[][], muteAudio: boolean = false) {
    console.log('Talking with blendshapes:', blendshapes);
    if (this.avatar) {
      this.avatar.talk(audioWAVBase64, blendshapes, 0.4, muteAudio);

    }
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
      this.talk('', talkData[this.mockVoiceIndex++], true);
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
      this.audioController?.unsubscribe(this.handleAudioData);
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
    }
  }

  private audioQueue: { audioWAVBase64: string, blendshapes: any[] }[] = [];
  private isPlayingAudio = false;


// 在 handleAudioData 方法中添加记录语音录入结束时间的代码
  private handleAudioData = async (data: { base64: string, raw: Int16Array }) => {
    const socket = io('http://127.0.0.1:1234');

    const recordingEndTime = new Date(); // 记录语音录入结束的时间

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      socket.emit('gpt-talk', {base64_audio: data.base64});
    });

    // 在 gpt-talk-response 事件中添加打印时间间隔的代码
    socket.on('gpt-talk-response', (response: any) => {
      if (response.error) {
        console.error('Error in gpt-talk-response:', response.error);
        socket.disconnect();
        return;
      }

      if (response.info) {
        console.log('Received partial response:', response);
      } else {
        const audioWAVBase64 = response.audio_base64;
        const blendshapes = response.blendshapes;

        if (audioWAVBase64 && blendshapes) {
          console.log('Received audio data and blendshapes:', response);
          this.enqueueAudio({audioWAVBase64, blendshapes});

          const firstAudioReceivedTime = new Date(); // 记录第一个语音片段接收的时间
          const timeDifference = (firstAudioReceivedTime.getTime() - recordingEndTime.getTime()) / 1000;
          console.log(`Time from recording end to first audio output: ${timeDifference} seconds`);
        }
      }

      if (response.complete) {
        socket.disconnect();
      }
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    setTimeout(() => {
      this.audioController?.endLoading();
    }, 3000);
  };

  private async enqueueAudio(audioData: { audioWAVBase64: string, blendshapes: any[] }) {
    console.log('Audio data enqueued:', audioData);
    this.audioQueue.push(audioData);
    if (!this.isPlayingAudio) {
      this.isPlayingAudio = true;
      console.log('Start playing next audio.');
      await this.playNextAudio();
    }
  }

  private async playNextAudio() {
    if (this.audioQueue.length === 0) {
      this.isPlayingAudio = false;
      console.log('No more audio to play.');
      return;
    }

    const audioData = this.audioQueue.shift();
    if (!audioData) {
      this.isPlayingAudio = false;
      console.log('No audio data found.');
      return;
    }

    console.log('Playing audio:', audioData.audioWAVBase64.substring(0, 30) + '...');

    try {
      console.log('Calling playAudio.');
      await this.playAudio(audioData.audioWAVBase64, audioData.blendshapes);
    } catch (error) {
      console.error('Audio playback error:', error);
      this.isPlayingAudio = false;
    }
  }

  private async playAudio(base64Audio: string, blendshapes: any[]) {
    console.log('Creating new AudioContext');
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    const audioBuffer = await audioContext.decodeAudioData(this.base64ToArrayBuffer(base64Audio));
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;

    source.connect(audioContext.destination);

    console.log('Audio playback started at:', new Date().toISOString());


    this.talk('', blendshapes);

    source.start(0);

    await new Promise<void>((resolve) => {
      source.onended = async () => {
        console.log('Audio playback ended at:', new Date().toISOString());
        await audioContext.close(); // 确保音频上下文关闭
        resolve();
      };
    });

    console.log('Promise resolved for audio playback.');
    console.log('Calling playNextAudio after delay');

    setTimeout(async () => {
      await this.playNextAudio(); // 播放结束后调用 playNextAudio，确保每个音频片段间有足够间隔
    }, 200); // 加入200毫秒的间隔
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
}
