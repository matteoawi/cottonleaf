const track = document.querySelector('.gallery-track');
const controls = document.querySelector('.gallery-controls');
const previous = controls.querySelector('.gallery-prev');
const next = controls.querySelector('.gallery-next');

function updateGalleryControls() {
  const overflow = track.scrollWidth - track.clientWidth;
  controls.hidden = overflow <= 1;
  previous.disabled = track.scrollLeft <= 1;
  next.disabled = track.scrollLeft >= overflow - 1;
}

function scrollByPhoto(direction) {
  const [first, second] = track.querySelectorAll('li');
  track.scrollBy({ left: direction * (second.offsetLeft - first.offsetLeft) });
}

previous.addEventListener('click', () => scrollByPhoto(-1));
next.addEventListener('click', () => scrollByPhoto(1));
track.addEventListener('scroll', updateGalleryControls, { passive: true });
new ResizeObserver(updateGalleryControls).observe(track);
