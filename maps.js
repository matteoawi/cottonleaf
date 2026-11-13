for (const button of document.querySelectorAll('.map-toggle')) {
  const panel = document.getElementById(button.getAttribute('aria-controls'));
  const label = button.firstChild;

  button.addEventListener('click', () => {
    const open = panel.hidden;
    panel.hidden = !open;
    button.setAttribute('aria-expanded', String(open));
    label.textContent = open ? 'Nascondi mappa' : 'Mostra mappa';

    if (open && !panel.firstElementChild) {
      const map = document.createElement('iframe');
      map.title = panel.dataset.title;
      map.referrerPolicy = 'strict-origin-when-cross-origin';
      map.allowFullscreen = true;
      map.src = panel.dataset.src;
      panel.append(map);
    }
  });

  button.hidden = false;
}
