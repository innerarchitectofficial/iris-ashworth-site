(() => {
  'use strict';
  // 화면 예약 공개용입니다. 정적 저장소의 원본 파일 접근을 차단하지는 않습니다.
  // 모든 시각은 UTC 오프셋이 있는 ISO 문자열로 지정합니다.
  const entries = [...document.querySelectorAll('[data-release-at]')];
  const gates = [...document.querySelectorAll('[data-release-gate]')];
  let timer;

  function initShorts(root) {
    for (const details of root.querySelectorAll('[data-youtube-id]')) {
      const holder = details.querySelector('.youtube-player');
      const removePlayer = () => holder.replaceChildren();
      details.addEventListener('toggle', () => {
        if (!details.open) { removePlayer(); return; }
        for (const media of root.querySelectorAll('audio, video')) media.pause();
        if (holder.firstChild) return;
        if (!/^https?:$/.test(location.protocol)) {
          holder.textContent = '쇼츠는 업로드된 홈페이지에서 재생할 수 있습니다.';
          return;
        }
        const player = document.createElement('iframe');
        player.title = '제5화 장면 쇼츠';
        player.width = '320';
        player.height = '569';
        player.referrerPolicy = 'strict-origin-when-cross-origin';
        player.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        player.allowFullscreen = true;
        player.src = 'https://www.youtube.com/embed/' + encodeURIComponent(details.dataset.youtubeId) + '?playsinline=1&rel=0';
        holder.append(player);
      });
      for (const media of root.querySelectorAll('audio, video')) {
        media.addEventListener('play', () => {
          details.open = false;
          removePlayer();
        });
      }
    }
  }

  function update() {
    clearTimeout(timer);
    const now = Date.now();
    let next = Infinity;
    for (const entry of entries) {
      const at = Date.parse(entry.dataset.releaseAt);
      const available = Number.isFinite(at) && now >= at;
      if (!available && Number.isFinite(at)) next = Math.min(next, at);
      if (entry.dataset.releaseHref) {
        if (available) {
          entry.href = entry.dataset.releaseHref;
          entry.removeAttribute('aria-disabled');
          entry.removeAttribute('tabindex');
        } else {
          entry.removeAttribute('href');
          entry.setAttribute('aria-disabled', 'true');
          entry.setAttribute('tabindex', '-1');
        }
        for (const label of entry.querySelectorAll('[data-release-pending]')) {
          label.textContent = available ? label.dataset.releaseOpen : label.dataset.releasePending;
        }
      }
    }
    for (const gate of gates) {
      const at = Date.parse(gate.dataset.releaseAt);
      if (!Number.isFinite(at) || now < at || gate.dataset.released) continue;
      const template = document.getElementById(gate.dataset.releaseTemplate);
      const target = document.getElementById(gate.dataset.releaseTarget);
      if (!template || !target) continue;
      target.append(template.content.cloneNode(true));
      template.remove();
      gate.dataset.released = 'true';
      gate.hidden = true;
      initShorts(target);
      const script = document.createElement('script');
      script.src = 'episode-media.js';
      document.body.append(script);
    }
    if (Number.isFinite(next)) timer = setTimeout(update, Math.min(60000, Math.max(100, next - now)));
  }
  document.addEventListener('visibilitychange', update);
  window.addEventListener('pageshow', update);
  update();
})();
