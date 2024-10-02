class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.leftChannel = [];
  }

  process(inputs) {
    const input = inputs[0];
    if (input && input.length > 0) {
      const samples = input[0]; // 获取第一通道的音频数据
      this.port.postMessage(samples); // 发送音频数据到主线程
    }
    return true; // 返回 true 以继续处理
  }
}

registerProcessor('audio-processor', AudioProcessor);
