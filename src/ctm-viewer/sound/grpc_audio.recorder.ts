import {arrayBufferToBase64} from "./sound-utils";

export class GrpcAudioRecorder {
  private static SAMPLE_RATE_HZ = 16000;
  private static BUFFER_SIZE_BYTES = 2048;
  private static INTERVAL_TIMEOUT_MS = 200;

  private currentMediaStream: MediaStream | null = null;
  private audioWorkletNode: AudioWorkletNode | null = null;
  private leftChannel: Float32Array[] = [];
  private recordingLength = 0;
  private interval: ReturnType<typeof setInterval> | null = null;
  private listener: ((base64AudioChunk: string, rawAudioChunk: Int16Array) => void) | null = null;

  async startConvertion(
    listener: (base64AudioChunk: string, rawAudioChunk: Int16Array) => void,
  ) {
    this.listener = listener;

    try {
      const context = new AudioContext({
        sampleRate: GrpcAudioRecorder.SAMPLE_RATE_HZ,
      });
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      const source = context.createMediaStreamSource(stream);

      // 加载 AudioWorkletProcessor
      await context.audioWorklet.addModule('audio-worklet-processor.js');
      this.audioWorkletNode = new AudioWorkletNode(context, 'audio-processor');

      // 监听来自 AudioWorklet 的消息
      this.audioWorkletNode.port.onmessage = (event) => {
        const samples = event.data;
        this.leftChannel.push(new Float32Array(samples));
        this.recordingLength += GrpcAudioRecorder.BUFFER_SIZE_BYTES;
      };

      source.connect(this.audioWorkletNode);
      this.audioWorkletNode.connect(context.destination);

      this.interval = setInterval(
        () => this.intervalFunction(this.listener!),
        GrpcAudioRecorder.INTERVAL_TIMEOUT_MS,
      );
    } catch (err) {
      console.error('录音初始化失败:', err);
      // @ts-ignore
      if (err.name === 'AbortError') {
        console.error('用户中途取消了请求');
      } else { // @ts-ignore
        if (err.name === 'NotAllowedError') {
                console.error('用户未授予麦克风权限');
              }
      }
    }
  }

  stopConvertion() {
    if (!this.currentMediaStream) {
      return;
    }

    this.currentMediaStream.getTracks().forEach((track) => track.stop());
    if (this.interval) {
      clearInterval(this.interval);
    }
    if (this.audioWorkletNode) {
      this.audioWorkletNode.disconnect();
    }

    this.currentMediaStream = null;
    this.audioWorkletNode = null;
    this.leftChannel = [];
    this.recordingLength = 0;
    this.interval = null;
    this.listener = null;
  }

  private intervalFunction = (listener: (base64AudioChunk: string, rawAudioChunk: Int16Array) => void) => {
    const PCM32fSamples = this.mergeBuffers(
      this.leftChannel,
      this.recordingLength,
    );
    this.leftChannel = [];
    this.recordingLength = 0;

    const PCM16iSamples = Int16Array.from(
      PCM32fSamples,
      (k) => 32767 * Math.min(1, k),
    );

    listener?.(arrayBufferToBase64(PCM16iSamples.buffer), PCM16iSamples);
  };

  private mergeBuffers(channelBuffer: Float32Array[], recordingLength: number) {
    const result = new Float32Array(recordingLength);
    let offset = 0;

    for (let i = 0; i < channelBuffer.length; i++) {
      result.set(channelBuffer[i], offset);
      offset += channelBuffer[i].length;
    }

    return Array.prototype.slice.call(result);
  }
}
