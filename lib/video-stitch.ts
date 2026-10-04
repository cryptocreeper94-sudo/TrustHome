/**
 * In-browser walkthrough builder.
 *
 * Plays the agent's clips back-to-back onto a canvas and records the result
 * with MediaRecorder — no upload, no server, no API keys. Optional extras:
 * a title card over the opening seconds, a background song, and a voiceover.
 *
 * Runs in real time (a 90-second set of clips takes ~90 seconds to build),
 * so the screen must stay open while it works.
 */

export interface MediaItem {
  file: File;
  kind: 'video' | 'image';
  /** Video: its length. Photo: how long to show it. */
  seconds: number;
}

export interface StitchOptions {
  clips: MediaItem[];
  music?: Blob | null;
  voice?: Blob | null;
  title?: string;
  subtitle?: string;
  onProgress?: (fraction: number, label: string) => void;
}

export function mediaKind(file: File): 'video' | 'image' {
  if (file.type.startsWith('image/') || /\.(jpe?g|png|heic|heif|webp|gif)$/i.test(file.name)) return 'image';
  return 'video';
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error(`"${file.name}" could not be opened. Try a JPG or PNG photo.`)); };
    img.src = url;
  });
}

function drawImageZoom(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number, progress: number) {
  const iw = img.naturalWidth || w;
  const ih = img.naturalHeight || h;
  // Fill the frame when the shapes are close; otherwise fit with black bars.
  const cover = Math.max(w / iw, h / ih);
  const contain = Math.min(w / iw, h / ih);
  const base = cover / contain < 1.35 ? cover : contain;
  const zoom = 1 + 0.08 * Math.min(1, Math.max(0, progress)); // slow push-in
  const dw = iw * base * zoom;
  const dh = ih * base * zoom;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
}

export interface StitchResult {
  blob: Blob;
  url: string;
  mimeType: string;
  ext: 'mp4' | 'webm';
  seconds: number;
}

export function videoBuilderSupported(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  const canvas = document.createElement('canvas') as HTMLCanvasElement & { captureStream?: unknown };
  return typeof (window as any).MediaRecorder !== 'undefined' && typeof canvas.captureStream === 'function';
}

/** Opens the OS file picker. Resolves [] if the user cancels. */
export function pickLocalFiles(accept: string, multiple: boolean): Promise<File[]> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.multiple = multiple;
    input.style.display = 'none';
    input.onchange = () => {
      const files = input.files ? Array.from(input.files) : [];
      document.body.removeChild(input);
      resolve(files);
    };
    document.body.appendChild(input);
    input.click();
  });
}

/** Reads a clip's duration without playing it. */
export function readClipDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const v = document.createElement('video');
    v.preload = 'metadata';
    v.muted = true;
    const url = URL.createObjectURL(file);
    const done = (d: number) => { URL.revokeObjectURL(url); resolve(Number.isFinite(d) ? d : 0); };
    v.onloadedmetadata = () => done(v.duration);
    v.onerror = () => done(0);
    v.src = url;
  });
}

function pickMimeType(): { mimeType: string; ext: 'mp4' | 'webm' } {
  const MR = (window as any).MediaRecorder;
  const candidates: Array<[string, 'mp4' | 'webm']> = [
    ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'mp4'],
    ['video/mp4', 'mp4'],
    ['video/webm;codecs=vp9,opus', 'webm'],
    ['video/webm;codecs=vp8,opus', 'webm'],
    ['video/webm', 'webm'],
  ];
  for (const [type, ext] of candidates) {
    if (MR.isTypeSupported?.(type)) return { mimeType: type, ext };
  }
  return { mimeType: '', ext: 'webm' };
}

function waitFor(el: HTMLMediaElement, event: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const ok = () => { cleanup(); resolve(); };
    const bad = () => { cleanup(); reject(new Error('A clip could not be played. Try a different video file.')); };
    const cleanup = () => { el.removeEventListener(event, ok); el.removeEventListener('error', bad); };
    el.addEventListener(event, ok, { once: true });
    el.addEventListener('error', bad, { once: true });
  });
}

function drawContain(ctx: CanvasRenderingContext2D, video: HTMLVideoElement, w: number, h: number) {
  const vw = video.videoWidth || w;
  const vh = video.videoHeight || h;
  const scale = Math.min(w / vw, h / vh);
  const dw = vw * scale;
  const dh = vh * scale;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(video, (w - dw) / 2, (h - dh) / 2, dw, dh);
}

function drawTitle(ctx: CanvasRenderingContext2D, w: number, h: number, title: string, subtitle: string, alpha: number) {
  if (alpha <= 0 || (!title && !subtitle)) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  const grad = ctx.createLinearGradient(0, h * 0.55, 0, h);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, 'rgba(0,0,0,0.75)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, h * 0.55, w, h * 0.45);
  const base = Math.round(Math.min(w, h) * 0.065);
  const pad = Math.round(w * 0.06);
  ctx.textBaseline = 'alphabetic';
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 12;
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `800 ${base}px Inter, -apple-system, Helvetica, Arial, sans-serif`;
  const titleY = subtitle ? h - pad - base * 0.9 : h - pad;
  if (title) ctx.fillText(title, pad, titleY, w - pad * 2);
  if (subtitle) {
    ctx.font = `600 ${Math.round(base * 0.55)}px Inter, -apple-system, Helvetica, Arial, sans-serif`;
    ctx.fillStyle = '#5EEAD4';
    ctx.fillText(subtitle, pad, h - pad, w - pad * 2);
  }
  ctx.restore();
}

export async function stitchClips(opts: StitchOptions): Promise<StitchResult> {
  const { clips, music, voice, onProgress } = opts;
  const title = (opts.title || '').trim();
  const subtitle = (opts.subtitle || '').trim();
  if (!clips.length) throw new Error('Add at least one clip or photo.');
  if (!videoBuilderSupported()) throw new Error('This browser cannot build videos. Please use Safari or Chrome.');

  // One <video> element for every clip — iOS only lets an element play with sound
  // after a tap, so we unlock it once (inside the button press) and reuse it.
  const video = document.createElement('video');
  video.playsInline = true;
  video.setAttribute('playsinline', '');
  video.preload = 'auto';
  video.crossOrigin = 'anonymous';

  const AC: typeof AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
  const ac = new AC();
  // Must happen before the first `await` so it still counts as part of the tap.
  const firstVideo = clips.find((c) => c.kind === 'video');
  if (firstVideo) {
    video.src = URL.createObjectURL(firstVideo.file);
    video.play().then(() => video.pause()).catch(() => {});
  }
  await ac.resume().catch(() => {});
  const dest = ac.createMediaStreamDestination();

  if (firstVideo) {
    try {
      const src = ac.createMediaElementSource(video);
      const clipGain = ac.createGain();
      clipGain.gain.value = voice ? 0.25 : music ? 0.6 : 1;
      src.connect(clipGain).connect(dest);
    } catch {
      video.muted = true; // fall back to silent clips rather than failing
    }
  }

  const durations = clips.map((c) => Math.max(0.5, c.seconds || (c.kind === 'image' ? 4 : 0)));
  const total = durations.reduce((a, b) => a + b, 0) || clips.length;

  // Size the output from the first item (cap the long side at 1280 for phones).
  let vw = 1280;
  let vh = 720;
  if (clips[0].kind === 'video') {
    if (video.readyState < 1) await waitFor(video, 'loadedmetadata');
    vw = video.videoWidth || vw;
    vh = video.videoHeight || vh;
  } else {
    const img0 = await loadImage(clips[0].file);
    vw = img0.naturalWidth || vw;
    vh = img0.naturalHeight || vh;
  }
  const scale = Math.min(1, 1280 / Math.max(vw, vh));
  const W = Math.round((vw * scale) / 2) * 2;
  const H = Math.round((vh * scale) / 2) * 2;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  const startBuffer = async (blob: Blob | null | undefined, gain: number, loop: boolean, delay: number) => {
    if (!blob) return null;
    try {
      const buf = await ac.decodeAudioData(await blob.arrayBuffer());
      const node = ac.createBufferSource();
      node.buffer = buf;
      node.loop = loop;
      const g = ac.createGain();
      g.gain.value = gain;
      node.connect(g).connect(dest);
      return { node, delay };
    } catch {
      throw new Error('That audio file could not be read. Try an MP3 or M4A file.');
    }
  };
  const musicNode = await startBuffer(music, voice ? 0.18 : 0.35, true, 0);
  const voiceNode = await startBuffer(voice, 1, false, 0.4);

  const canvasStream = (canvas as any).captureStream(30) as MediaStream;
  const tracks = [...canvasStream.getVideoTracks(), ...dest.stream.getAudioTracks()];
  const stream = new MediaStream(tracks);
  const { mimeType, ext } = pickMimeType();
  const recorder = new MediaRecorder(stream, mimeType ? { mimeType, videoBitsPerSecond: 5_000_000 } : undefined);
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
  const stopped = new Promise<void>((resolve) => { recorder.onstop = () => resolve(); });

  let elapsedBefore = 0;
  let raf = 0;
  const startedAt = performance.now();
  let current: { kind: 'video' } | { kind: 'image'; img: HTMLImageElement; start: number; dur: number } | null = null;
  const itemTime = () => {
    if (!current) return 0;
    if (current.kind === 'video') return video.currentTime || 0;
    return Math.min(current.dur, (performance.now() - current.start) / 1000);
  };
  const loop = () => {
    if (current?.kind === 'video') drawContain(ctx, video, W, H);
    else if (current?.kind === 'image') drawImageZoom(ctx, current.img, W, H, itemTime() / current.dur);
    const t = (performance.now() - startedAt) / 1000;
    const alpha = t < 0.6 ? t / 0.6 : t < 4 ? 1 : t < 5 ? 5 - t : 0;
    drawTitle(ctx, W, H, title, subtitle, alpha);
    const overall = Math.min(0.99, (elapsedBefore + itemTime()) / total);
    onProgress?.(overall, 'Building your video…');
    raf = requestAnimationFrame(loop);
  };

  try {
    recorder.start(1000);
    const t0 = ac.currentTime;
    musicNode?.node.start(t0 + musicNode.delay);
    voiceNode?.node.start(t0 + voiceNode.delay);
    raf = requestAnimationFrame(loop);

    for (let i = 0; i < clips.length; i++) {
      const item = clips[i];
      onProgress?.(elapsedBefore / total, `Item ${i + 1} of ${clips.length}`);
      if (item.kind === 'image') {
        const img = await loadImage(item.file);
        current = { kind: 'image', img, start: performance.now(), dur: durations[i] };
        await new Promise((r) => setTimeout(r, durations[i] * 1000));
      } else {
        if (item !== firstVideo || video.readyState < 2) {
          if (item !== firstVideo) {
            URL.revokeObjectURL(video.src);
            video.src = URL.createObjectURL(item.file);
          }
          if (video.readyState < 2) await waitFor(video, 'loadeddata');
        }
        video.currentTime = 0;
        current = { kind: 'video' };
        const ended = waitFor(video, 'ended');
        try {
          await video.play();
        } catch {
          video.muted = true;
          await video.play();
        }
        await ended;
      }
      elapsedBefore += durations[i];
    }
    if (video.src) URL.revokeObjectURL(video.src);
  } finally {
    cancelAnimationFrame(raf);
    try { musicNode?.node.stop(); } catch { /* not started */ }
    try { voiceNode?.node.stop(); } catch { /* not started */ }
    if (recorder.state !== 'inactive') recorder.stop();
  }

  await stopped;
  canvasStream.getTracks().forEach((t) => t.stop());
  ac.close().catch(() => {});
  onProgress?.(1, 'Done');

  const type = (mimeType || `video/${ext}`).split(';')[0];
  const blob = new Blob(chunks, { type });
  return { blob, url: URL.createObjectURL(blob), mimeType: type, ext, seconds: Math.round(total) };
}

/** Simple voice recorder for the voiceover option (web). */
export async function startVoiceRecording(): Promise<{ stop: () => Promise<Blob> }> {
  if (!navigator.mediaDevices?.getUserMedia) throw new Error('This browser cannot record audio.');
  const mic = await navigator.mediaDevices.getUserMedia({ audio: true });
  const MR = (window as any).MediaRecorder;
  const type = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm'].find((t) => MR.isTypeSupported?.(t)) || '';
  const rec: MediaRecorder = new MR(mic, type ? { mimeType: type } : undefined);
  const chunks: BlobPart[] = [];
  rec.ondataavailable = (e: BlobEvent) => { if (e.data.size) chunks.push(e.data); };
  rec.start();
  return {
    stop: () => new Promise<Blob>((resolve) => {
      rec.onstop = () => {
        mic.getTracks().forEach((t) => t.stop());
        resolve(new Blob(chunks, { type: (type || 'audio/webm').split(';')[0] }));
      };
      rec.stop();
    }),
  };
}

export function formatSeconds(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.round(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
}
