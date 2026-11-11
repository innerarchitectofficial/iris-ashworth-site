const mediaPlayers = document.querySelectorAll('.episode-page audio, .episode-page video');
for (const player of mediaPlayers) {
  player.addEventListener('play', () => {
    for (const other of mediaPlayers) {
      if (other !== player && !other.paused) other.pause();
    }
  });
  const disclosure = player.closest('details');
  disclosure?.addEventListener('toggle', () => {
    if (!disclosure.open) player.pause();
  });
}

// 회차 본문은 읽기와 화면 확대를 허용하며 일반적인 선택·복사·드래그를 제한합니다.
const story = document.querySelector('.episode-story');
document.addEventListener('contextmenu', event => event.preventDefault());
if (story) {
  story.addEventListener('dragstart', event => event.preventDefault());
  for (const type of ['copy', 'cut']) {
    document.addEventListener(type, event => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) return;
      for (let index = 0; index < selection.rangeCount; index++) {
        if (selection.getRangeAt(index).intersectsNode(story)) {
          event.preventDefault();
          return;
        }
      }
    });
  }
}
