(function () {
  'use strict';

  function initialize() {
    const section = document.getElementById('routes');
    const canvas = document.getElementById('route-map');
    if (!section || !canvas) return;
    const status = section.querySelector('[data-map-status]');
    const arabic = document.documentElement.lang.toLowerCase().startsWith('ar');
    const t = (ar, en) => arabic ? ar : en;
    const mapUnavailable = t('تعذّر تحميل الخريطة. يمكنك فتح المواقع والمسارات من البطاقات.', 'The map could not load. Use the links in the route cards.');
    const showStatus = (message) => {
      if (status) {
        status.textContent = message;
        status.hidden = !message;
      }
    };
    const L = window.L;
    const data = window.jubailRoutes;
    if (!L || !data || !data.warehouse || !Array.isArray(data.projects) || !data.projects.length) {
      showStatus(mapUnavailable);
      return;
    }

    const fallback = Array.from(canvas.childNodes);
    canvas.replaceChildren();
    const map = L.map(canvas, {
      crs: L.CRS.Simple,
      minZoom: -3,
      maxZoom: 2,
      zoomSnap: .25,
      scrollWheelZoom: false
    });
    const imageBounds = L.latLngBounds([[0, 0], [495, 640]]);
    map.fitBounds(imageBounds, {padding: [0, 0], maxZoom: 2, animate: false});
    map.setMaxBounds(imageBounds.pad(.3));
    const background = L.imageOverlay('assets/jubail-route-region.webp', imageBounds, {
      alt: t('خريطة منطقة الجبيل', 'Regional map of Jubail'),
      attribution: 'Esri and contributors · Roads © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    });
    function popup(name, url, directions) {
      const box = document.createElement('div');
      box.className = 'route-popup';
      box.dir = arabic ? 'rtl' : 'ltr';
      const title = document.createElement('strong');
      title.textContent = name;
      box.append(title);
      const links = [[url, t('فتح الموقع', 'Open location')], [directions, t('اتجاهات القيادة', 'Driving directions')]];
      for (const [href, text] of links) {
        if (!href) continue;
        const link = document.createElement('a');
        link.href = href;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = text;
        box.append(link);
      }
      return box;
    }

    function pin(point, label, color, symbol) {
      const icon = L.divIcon({className: 'route-pin', iconSize: [30, 30], iconAnchor: [15, 15], popupAnchor: [0, -14]});
      const marker = L.marker(point, {icon, title: label, alt: label}).addTo(map);
      const el = marker.getElement();
      el.style.setProperty('--pin-color', color);
      el.textContent = symbol;
      el.setAttribute('aria-label', label);
      return marker;
    }

    const warehouseLabel = t('مستودع الجبيل المركزي', 'Jubail Central Warehouse');
    const depot = pin(data.warehouse.point, warehouseLabel, '#242b74', t('م', 'W'));
    depot.bindPopup(popup(warehouseLabel, data.warehouse.url));
    const routes = new Map();
    const buttons = Array.from(section.querySelectorAll('button[data-route]'));
    const cards = section.querySelectorAll('[data-route-card]');

    function select(id) {
      const selected = routes.get(id);
      if (!selected && id !== 'all') return;
      map.closePopup();
      for (const [routeId, route] of routes) {
        const active = !selected || routeId === id;
        if (route.line) route.line.setStyle({weight: selected && active ? 6 : 4, opacity: active ? .9 : .20});
      }
      for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.route === id));
      for (const card of cards) card.classList.toggle('route-selected', card.dataset.routeCard === id);
      if (selected && selected.line) selected.line.bringToFront();
      map.fitBounds(selected ? selected.bounds : imageBounds, {padding: selected ? [20, 20] : [0, 0], maxZoom: 2, animate: false});
      if (selected) selected.marker.openPopup();
    }

    for (const [i, project] of data.projects.entries()) {
      const name = arabic ? project.nameAr : project.nameEn;
      const bounds = L.latLngBounds([data.warehouse.point, project.point]);
      const marker = pin(project.point, name, project.color, String(i + 1));
      marker.bindPopup(popup(name, project.url, project.directions));
      let line;
      if (Array.isArray(project.path) && project.path.length > 1) {
        line = L.polyline(project.path, {color: project.color, weight: 4, opacity: .9}).addTo(map);
        bounds.extend(line.getBounds());
        line.on('click', () => select(project.id));
      }
      routes.set(project.id, {line, marker, bounds});
      marker.on('click', () => select(project.id));
    }
    for (const button of buttons) {
      button.hidden = false;
      button.addEventListener('click', () => select(button.dataset.route));
    }
    const controls = section.querySelector('[data-map-controls]');
    if (controls) controls.hidden = false;
    background.once('error', () => {
      for (const button of buttons) button.hidden = true;
      if (controls) controls.hidden = true;
      map.remove();
      canvas.replaceChildren(...fallback);
      showStatus(mapUnavailable);
    });
    background.addTo(map);
    showStatus('');
    select('all');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, {once: true});
  else initialize();
})();
