// コードナビ：録音用 AudioWorklet。音声スレッドで直接取り込むので、画面の処理が重くても音が欠けない。
class CnCap extends AudioWorkletProcessor {
  constructor(o) {
    super();
    const p = o.processorOptions || {};
    this.n = p.n || 1; this.si = p.si ?? -1; this.vi = p.vi ?? -1;
    this.B = 4096; this.k = 0; this.total = 0; this.i0 = -1; this.lv = 0; this.on = false;
    this.buf = Array.from({length:this.n}, () => new Int16Array(this.B));
    this.port.onmessage = e => {
      if (e.data === 'start') this.on = true;
      else if (e.data === 'stop') { this.flush(); this.on = false; this.port.postMessage({done:true, i0:this.i0, len:this.total}); }
    };
  }
  flush() {
    if (!this.k) return;
    const out = this.buf.map(b => b.slice(0, this.k));
    this.port.postMessage({ch:out, lv:this.lv}, out.map(a => a.buffer));
    this.k = 0; this.lv = 0;
  }
  process(inputs) {
    if (!this.on) return true;
    const inp = inputs[0] || [], L = inp[0] ? inp[0].length : 128;
    for (let c = 0; c < this.n; c++) {
      const x = inp[c], b = this.buf[c];
      if (x) for (let i = 0; i < L; i++) { const v = x[i]; b[this.k + i] = (v < -1 ? -1 : v > 1 ? 1 : v) * 32767; }
      else b.fill(0, this.k, this.k + L);
    }
    if (this.i0 < 0 && this.si >= 0 && inp[this.si]) {
      const s = inp[this.si];
      for (let i = 0; i < L; i++) if (s[i] > .5) { this.i0 = this.total + i; this.port.postMessage({i0:this.i0}); break; }
    }
    if (this.vi >= 0 && inp[this.vi]) { const v = inp[this.vi]; for (let i = 0; i < L; i += 4) { const a = v[i] < 0 ? -v[i] : v[i]; if (a > this.lv) this.lv = a; } }
    this.k += L; this.total += L;
    if (this.k + 128 > this.B) this.flush();
    return true;
  }
}
registerProcessor('cn-cap', CnCap);
