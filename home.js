const header = document.querySelector('.site-header');
const hero = document.querySelector('.hero');
new ResizeObserver(() => {
  hero.style.setProperty('--site-header-height', `${header.getBoundingClientRect().height}px`);
}).observe(header);

const track = document.querySelector('.gallery-track');
const controls = document.querySelector('.gallery-controls');
const previous = controls.querySelector('.gallery-prev');
const next = controls.querySelector('.gallery-next');
const progress = document.querySelector('.gallery-progress');

function updateGalleryControls() {
  const overflow = track.scrollWidth - track.clientWidth;
  controls.hidden = overflow <= 1;
  progress.hidden = controls.hidden;
  const offset = Math.abs(track.scrollLeft);
  previous.disabled = offset <= 1;
  next.disabled = offset >= overflow - 1;
  progress.style.setProperty('--gallery-offset', `${100 * offset / track.scrollWidth}%`);
  progress.style.setProperty('--gallery-visible', track.clientWidth / track.scrollWidth);
}

function scrollByPhoto(direction) {
  const [first, second] = track.querySelectorAll('li');
  track.scrollBy({ left: direction * (second.offsetLeft - first.offsetLeft) });
}

previous.addEventListener('click', () => scrollByPhoto(-1));
next.addEventListener('click', () => scrollByPhoto(1));
track.addEventListener('scroll', updateGalleryControls, { passive: true });
new ResizeObserver(updateGalleryControls).observe(track);
