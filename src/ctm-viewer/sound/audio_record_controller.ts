import { CTMViewer } from "../index";
import { GrpcAudioRecorder } from "./grpc_audio.recorder";
import { arrayBufferToBase64, int16ArrayFlatten } from "./sound-utils";

export class AudioRecordController {
    private static instance: AudioRecordController | null = null;
    private ctmViewer: CTMViewer;
    private recordingImg: HTMLImageElement | null = null;
    private grpcAudioRecorder: GrpcAudioRecorder;
    private audioChunks: {
        base64: string[],
        raw: Int16Array[]
    } = {
            base64: [],
            raw: []
        };
    private overlay: HTMLElement | null = null;
    private subscribers: ((data: { base64: string, raw: Int16Array }) => void)[] = [];
    private isRKeyPressed = false;

    private constructor(ctmViewer: CTMViewer) {
        this.ctmViewer = ctmViewer;
        this.grpcAudioRecorder = new GrpcAudioRecorder();
        this.initializeOverlayImage();
        this.listenKeyboard();
    }

    public static getAudioControllerInstance(ctmViewer: CTMViewer): AudioRecordController {
        if (!AudioRecordController.instance) {
            AudioRecordController.instance = new AudioRecordController(ctmViewer);
        }
        return AudioRecordController.instance;
    }

    private initializeOverlayImage() {
        this.overlay = this.ctmViewer.getOverlayContainerDom();
        if (this.overlay) {
            this.recordingImg = document.createElement('img');
            this.recordingImg.style.position = 'absolute';
            this.recordingImg.style.bottom = '50px';
            this.recordingImg.style.left = '50%';
            this.recordingImg.style.width = '300px';
            this.recordingImg.style.transform = 'translateX(-50%)';
            this.recordingImg.style.opacity = '0.8';
            this.overlay.appendChild(this.recordingImg);
        }
    }

    private listenKeyboard() {
        document.addEventListener('keydown', this.onPressKey);
        document.addEventListener('keyup', this.onReleaseKey);
    }

    private removeKeyboardListener() {
        document.removeEventListener('keydown', this.onPressKey);
        document.removeEventListener('keyup', this.onReleaseKey);
    }

    private onPressKey = (event: KeyboardEvent) => {
        if (event.key === 'r' || event.key === 'R') {
            if (!this.isRKeyPressed) {
                this.isRKeyPressed = true;
                this.startRecording();
            }
        }
    }

    private onReleaseKey = (event: KeyboardEvent) => {
        if (event.key === 'r' || event.key === 'R') {
            this.isRKeyPressed = false;
            const data = this.endRecording();
            this.notifySubscribers(data);
        }
    }

    private startRecording() {
        if (this.recordingImg) {
            this.recordingImg.src = 'assets/loading_gif/audio-speaking.gif';
            this.grpcAudioRecorder.startConvertion((base64Audiochunk: string, rawAudioChunk: Int16Array) => {
                this.audioChunks.base64.push(base64Audiochunk);
                this.audioChunks.raw.push(rawAudioChunk);
            });
        }
    }

    private endRecording() {
        if (!this.recordingImg) {
            return {
                base64: '',
                raw: new Int16Array()
            };
        }

        this.recordingImg.src = 'assets/loading_gif/audio-loading.gif';
        this.grpcAudioRecorder.stopConvertion();
        const completeRaw = int16ArrayFlatten(this.audioChunks.raw);
        const completeBase64 = arrayBufferToBase64(completeRaw.buffer);
        this.audioChunks.base64 = [];
        this.audioChunks.raw = [];

        return {
            base64: completeBase64,
            raw: completeRaw
        };
    }

    public endLoading() {
        if (this.recordingImg) {
            this.recordingImg.src = '';
        }
    }

    /**
     * 注册语音监听事件，当用户完成录音后，会调用callback函数
     * @param callback 传递语音数据：pcm的base64编码和Int16Array格式的二进制数据
     */
    public subscribe(callback: (data: { base64: string, raw: Int16Array }) => void) {
        this.subscribers.push(callback);
    }

    public unsubscribe(callback: (data: { base64: string, raw: Int16Array }) => void) {
        this.subscribers = this.subscribers.filter(sub => sub !== callback);
    }

    private notifySubscribers(data: { base64: string, raw: Int16Array }) {
        this.subscribers.forEach(callback => callback(data));
    }

    public dispose() {
        this.removeKeyboardListener();
        if (this.overlay && this.recordingImg) {
            this.overlay?.removeChild(this.recordingImg);
            this.recordingImg = null;
        }
        AudioRecordController.instance = null;
    }
}