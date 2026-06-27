/**
 * AudioWorklet processor: converts Float32 audio samples to Int16 PCM.
 *
 * Runs in the AudioWorklet context (separate thread from main/offscreen page).
 * Posts each 128-sample chunk as a transferred ArrayBuffer so no data is copied.
 *
 * Registered as 'pcm-extractor'. Usage:
 *   await audioCtx.audioWorklet.addModule(chrome.runtime.getURL('offscreen/audio-processor.js'));
 *   const node = new AudioWorkletNode(audioCtx, 'pcm-extractor');
 *   node.port.onmessage = (e) => ws.send(e.data); // e.data is ArrayBuffer
 */
class PcmExtractorProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const channel = inputs[0]?.[0];
    if (!channel || channel.length === 0) return true;

    const int16 = new Int16Array(channel.length);
    for (let i = 0; i < channel.length; i++) {
      // Clamp to Int16 range and convert from Float32 [-1, 1]
      int16[i] = Math.max(-32768, Math.min(32767, Math.round(channel[i] * 32768)));
    }

    // Transfer ownership of the buffer to avoid copying
    this.port.postMessage(int16.buffer, [int16.buffer]);
    return true;
  }
}

registerProcessor('pcm-extractor', PcmExtractorProcessor);
