let _loaded = false;
let _loading = false;
const _queue: Array<() => void> = [];

export function ensureCloudinaryScript(cb: () => void): void {
  if (_loaded) { cb(); return; }
  _queue.push(cb);
  if (_loading) return;
  _loading = true;
  const s = document.createElement('script');
  s.src = 'https://upload-widget.cloudinary.com/global/all.js';
  s.async = true;
  s.onload = () => {
    _loaded = true;
    _loading = false;
    _queue.forEach((fn) => fn());
    _queue.length = 0;
  };
  document.head.appendChild(s);
}