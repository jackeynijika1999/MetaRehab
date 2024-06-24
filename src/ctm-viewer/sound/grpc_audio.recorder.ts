import { arrayBufferToBase64 } from "./sound-utils";

export class GrpcAudioRecorder {
  private static SAMPLE_RATE_HZ = 16000;
  private static BUFFER_SIZE_BYTES = 2048;
  private static INTERVAL_TIMEOUT_MS = 200;

  private currentMediaStream: MediaStream | null = null;

  processor: ScriptProcessorNode | null = null;

  private leftChannel: Float32Array[] = [];
  private recordingLength = 0;
  private interval: ReturnType<typeof setInterval> | null = null;
  private listener: ((base64AudioChunk: string, rawAudioChunk: Int16Array) => void) | null = null;

  stopConvertion() {
    if (!this.currentMediaStream) {
      return;
    }

    this.currentMediaStream.getTracks().forEach((track) => track.stop());
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.processor?.disconnect();

    this.currentMediaStream = null;
    this.processor = null;
    this.leftChannel = [];
    this.recordingLength = 0;
    this.interval = null;
    this.listener = null;
  }

  isRecording() {
    return this.interval != null;
  }

  // Consumes stream that is coming out of local webrtc loopback and converts it to the messages for the server.
  async startConvertion(
    listener: (base64AudioChunk: string, rawAudioChunk: Int16Array) => void,
  ) {
    this.listener = listener;
    const context = new AudioContext({
      sampleRate: GrpcAudioRecorder.SAMPLE_RATE_HZ,
    });
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
    const source = context.createMediaStreamSource(stream);

    // need to keep track of this two in order to properly disconnect later on;
    this.currentMediaStream = stream;
    this.processor = context.createScriptProcessor(
      GrpcAudioRecorder.BUFFER_SIZE_BYTES,
      /* input channels = */ 1,
      /* output channels = */ 1,
    );

    source.connect(this.processor);
    this.processor.connect(context.destination);
    this.processor.onaudioprocess = this.onAudioProcess;
    this.interval = setInterval(
      () => this.intervalFunction(this.listener!),
      GrpcAudioRecorder.INTERVAL_TIMEOUT_MS,
    );
  }

  private mergeBuffers(channelBuffer: Float32Array[], recordingLength: number) {
    const result = new Float32Array(recordingLength);
    let offset = 0;

    for (let i = 0; i < channelBuffer.length; i++) {
      result.set(channelBuffer[i], offset);
      offset += channelBuffer[i].length;
    }

    return Array.prototype.slice.call(result);
  }

  private onAudioProcess = (e: AudioProcessingEvent) => {
    const samples = e.inputBuffer.getChannelData(0);
    // we clone the samples to not loose them
    this.leftChannel.push(new Float32Array(samples));
    this.recordingLength += GrpcAudioRecorder.BUFFER_SIZE_BYTES;
  };

  private intervalFunction = (listener: (base64AudioChunk: string, rawAudioChunk: Int16Array) => void) => {
    const PCM32fSamples = this.mergeBuffers(
      this.leftChannel,
      this.recordingLength,
    );
    // reset "buffer" on each iteration
    this.leftChannel = [];
    this.recordingLength = 0;

    // convert to Int16 (we are working in LINEAR16 currently)
    const PCM16iSamples = Int16Array.from(
      PCM32fSamples,
      (k) => 32767 * Math.min(1, k),
    );

    listener?.(arrayBufferToBase64(PCM16iSamples.buffer), PCM16iSamples);
  };
}
