/* ============================================================
   UniMap — 한국 대학 3D 지도
   deck.gl v8 + MapLibre GL
   ============================================================ */

'use strict';

// ── 상수 ──────────────────────────────────────────────────────
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
const INITIAL_VIEW_STATE = {
  longitude: 127.5,
  latitude: 36.5,
  zoom: 6.5,
  pitch: 50,
  bearing: -10,
};

const MAX_LAND = Math.max(...UNIVERSITIES.map(u => u.landSize));
const MIN_LAND = Math.min(...UNIVERSITIES.map(u => u.landSize));

function calcHeight(landSize) {
  const t = (landSize - MIN_LAND) / (MAX_LAND - MIN_LAND);
  return 40000 + t * 260000; // 미터 단위
}

function calcRadius(landSize) {
  const t = (landSize - MIN_LAND) / (MAX_LAND - MIN_LAND);
  return 800 + t * 3200; // 미터
}

function typeColor(type, alpha) {
  const a = alpha !== undefined ? alpha : 220;
  return type === '국립'
    ? [34, 197, 94, a]
    : [245, 158, 11, a];
}

// ── 상태 ──────────────────────────────────────────────────────
let deckInstance = null;
let activeFilter = 'all';
let selectedId = null;
let listOpen = false;
let filteredData = [...UNIVERSITIES];

// ── deck.gl 초기화 ────────────────────────────────────────────
function initDeck() {
  const {DeckGL, ColumnLayer} = deck;
  
  deckInstance = new DeckGL({
    container: 'map',
    mapStyle: MAP_STYLE,
    initialViewState: INITIAL_VIEW_STATE,
    controller: true,
    layers: [],
  });

  renderLayers();
}

// ── 레이어 렌더링 ─────────────────────────────────────────────
function renderLayers() {
  if (!deckInstance) return;

  const {ColumnLayer} = deck;
  const tooltip = document.getElementById('map-tooltip');

  const columnLayer = new ColumnLayer({
    id: 'universities',
    data: filteredData,
    diskResolution: 6,
    radius: d => calcRadius(d.landSize),
    elevationScale: 1,
    getElevation: d => calcHeight(d.landSize),
    getPosition: d => [d.lng, d.lat],
    getFillColor: d => {
      const base = typeColor(d.type);
      if (selectedId !== null && d.id !== selectedId) {
        return [base[0], base[1], base[2], 60];
      }
      return base;
    },
    getLineColor: d => typeColor(d.type, 180),
    lineWidthMinPixels: 1,
    pickable: true,
    autoHighlight: true,
    highlightColor: [255, 255, 255, 50],
    extruded: true,
    material: {
      ambient: 0.4,
      diffuse: 0.6,
      shininess: 32,
      specularColor: [60, 64, 70],
    },
    transitions: {
      getElevation: 400,
      getFillColor: 300,
    },
    onHover: (info) => {
      const {object, x, y} = info;
      if (object) {
        tooltip.innerHTML = buildTooltip(object);
        tooltip.style.left = (x + 14) + 'px';
        tooltip.style.top = (y - 10) + 'px';
        tooltip.classList.add('map-tooltip--visible');
        tooltip.setAttribute('aria-hidden', 'false');
      } else {
        tooltip.classList.remove('map-tooltip--visible');
        tooltip.setAttribute('aria-hidden', 'true');
      }
    },
    onClick: (info) => {
      if (info.object) openPanel(info.object);
    },
  });

  deckInstance.setProps({layers: [columnLayer]});
}

// ── 툴팁 HTML ─────────────────────────────────────────────────
function buildTooltip(u) {
  return `
    <div class="tooltip-name">${u.name}</div>
    <div class="tooltip-campus">${u.campus}</div>
    <div class="tooltip-stats">
      <div class="tooltip-stat">경쟁률 <strong>${u.avgCompetition}:1</strong></div>
      <div class="tooltip-stat">면적 <strong>${(u.landSize / 10000).toFixed(0)}ha</strong></div>
    </div>
  `;
}

// ── 상세 패널 ─────────────────────────────────────────────────
function openPanel(u) {
  selectedId = u.id;
  renderLayers();

  const panel = document.getElementById('side-panel');
  const content = document.getElementById('panel-content');

  content.innerHTML = buildPanelHTML(u);
  panel.classList.add('side-panel--open');
  panel.setAttribute('aria-hidden', 'false');

  // 지도 중심 이동
  if (deckInstance) {
    const {FlyToInterpolator} = deck;
    deckInstance.setProps({
      initialViewState: {
        longitude: u.lng,
        latitude: u.lat,
        zoom: 13,
        pitch: 55,
        bearing: -10,
        transitionDuration: 800,
        transitionInterpolator: new FlyToInterpolator(),
      },
    });
  }

  // 목록 활성 항목 표시
  document.querySelectorAll('.list-item').forEach(el => {
    el.classList.toggle('list-item--active', el.dataset.id == u.id);
  });
}

function closePanel() {
  selectedId = null;
  renderLayers();
  const panel = document.getElementById('side-panel');
  panel.classList.remove('side-panel--open');
  panel.setAttribute('aria-hidden', 'true');
  document.querySelectorAll('.list-item').forEach(el => el.classList.remove('list-item--active'));
}

function buildPanelHTML(u) {
  const badgeClass = u.type === '국립' ? 'panel-badge--national' : 'panel-badge--private';
  const tuitionFmt = (u.tuition / 10000).toFixed(0);
  const landFmt = (u.landSize / 10000).toFixed(0);
  const maxComp = Math.max(...u.departments.map(d => d.competition));

  const deptRows = u.departments.map(d => {
    const pct = Math.round((d.competition / maxComp) * 100);
    return `
      <tr>
        <td class="dept-name">${d.name}</td>
        <td>
          <div class="competition-bar">
            <div class="competition-bar__track">
              <div class="competition-bar__fill" style="width:${pct}%"></div>
            </div>
            <span class="competition-bar__val">${d.competition}</span>
          </div>
        </td>
        <td style="text-align:right;color:var(--text-muted);font-size:12px">${d.capacity}명</td>
      </tr>
    `;
  }).join('');

  return `
    <div class="panel-header">
      <div class="panel-badge ${badgeClass}">${u.type}</div>
      <h2 class="panel-title">${u.name}</h2>
      <div class="panel-campus">${u.campus}</div>
      <a class="panel-link" href="${u.website}" target="_blank" rel="noopener noreferrer">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.2"/>
          <path d="M7 1.5c-1.5 0-2.5 2.46-2.5 5.5s1 5.5 2.5 5.5 2.5-2.46 2.5-5.5-1-5.5-2.5-5.5z" stroke="currentColor" stroke-width="1.2"/>
          <path d="M1.5 7h11" stroke="currentColor" stroke-width="1.2"/>
        </svg>
        홈페이지 방문
      </a>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-card__label">평균 경쟁률</div>
        <div class="stat-card__value">${u.avgCompetition}<span class="stat-card__unit">:1</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-card__label">연간 등록금</div>
        <div class="stat-card__value">${tuitionFmt}<span class="stat-card__unit">만원</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-card__label">캠퍼스 면적</div>
        <div class="stat-card__value">${landFmt}<span class="stat-card__unit">ha</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-card__label">학과 수</div>
        <div class="stat-card__value">${u.departments.length}<span class="stat-card__unit">개</span></div>
      </div>
    </div>

    <ul class="info-list" aria-label="기본 정보">
      <li class="info-list__item">
        <span class="info-list__label">설립형태</span>
        <span class="info-list__value">${u.type}</span>
      </li>
      <li class="info-list__item">
        <span class="info-list__label">개교기념일</span>
        <span class="info-list__value">${u.founded}</span>
      </li>
      <li class="info-list__item">
        <span class="info-list__label">주소</span>
        <span class="info-list__value">${u.address}</span>
      </li>
      <li class="info-list__item">
        <span class="info-list__label">좌표</span>
        <span class="info-list__value">${u.lat}°N, ${u.lng}°E</span>
      </li>
    </ul>

    <div class="section-title">학과별 경쟁률 / 모집인원</div>
    <table class="dept-table" aria-label="학과 정보">
      <thead>
        <tr>
          <th>학과명</th>
          <th>경쟁률</th>
          <th style="text-align:right">모집</th>
        </tr>
      </thead>
      <tbody>${deptRows}</tbody>
    </table>
  `;
}

// ── 목록 패널 ─────────────────────────────────────────────────
function renderList() {
  const body = document.getElementById('list-body');
  const countEl = document.getElementById('list-count');
  countEl.textContent = filteredData.length + '개';

  body.innerHTML = filteredData.map(u => {
    const iconClass = u.type === '국립' ? 'list-item__icon--national' : 'list-item__icon--private';
    const emoji = u.type === '국립' ? '🏛️' : '🎓';
    return `
      <div class="list-item" role="listitem" data-id="${u.id}" tabindex="0"
           aria-label="${u.name} ${u.campus}">
        <div class="list-item__icon ${iconClass}">${emoji}</div>
        <div class="list-item__info">
          <div class="list-item__name">${u.name}</div>
          <div class="list-item__meta">${u.campus} · ${u.type}</div>
        </div>
        <div class="list-item__competition">${u.avgCompetition}:1</div>
      </div>
    `;
  }).join('');

  body.querySelectorAll('.list-item').forEach(el => {
    const handler = () => {
      const u = UNIVERSITIES.find(x => x.id == el.dataset.id);
      if (u) openPanel(u);
    };
    el.addEventListener('click', handler);
    el.addEventListener('keydown', e => { 
      if (e.key === 'Enter' || e.key === ' ') { 
        e.preventDefault(); 
        handler(); 
      } 
    });
  });
}

function toggleList() {
  listOpen = !listOpen;
  const panel = document.getElementById('list-panel');
  const btn = document.getElementById('toggle-list');
  panel.classList.toggle('list-panel--open', listOpen);
  panel.setAttribute('aria-hidden', String(!listOpen));
  btn.classList.toggle('icon-btn--active', listOpen);
}

// ── 검색 ──────────────────────────────────────────────────────
function initSearch() {
  const input = document.getElementById('search-input');
  const dropdown = document.getElementById('search-dropdown');

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { dropdown.hidden = true; return; }

    const results = [];
    UNIVERSITIES.forEach(u => {
      if (u.name.toLowerCase().includes(q) || u.campus.toLowerCase().includes(q)) {
        results.push({ type: 'university', u, label: u.name, sub: u.campus });
      }
      u.departments.forEach(d => {
        if (d.name.toLowerCase().includes(q)) {
          results.push({ type: 'dept', u, label: d.name, sub: u.name });
        }
      });
    });

    if (!results.length) { dropdown.hidden = true; return; }

    const badgeClass = r => r.u.type === '국립' ? 'search-item__badge--national' : 'search-item__badge--private';

    dropdown.innerHTML = results.slice(0, 8).map((r, i) => `
      <div class="search-item" role="option" tabindex="0" data-idx="${i}"
           aria-label="${r.label} ${r.sub}">
        <span class="search-item__badge ${badgeClass(r)}">${r.u.type}</span>
        <span class="search-item__name">${highlight(r.label, q)}</span>
        <span class="search-item__sub">${r.sub}</span>
      </div>
    `).join('');

    dropdown.hidden = false;

    dropdown.querySelectorAll('.search-item').forEach((el, i) => {
      const r = results[i];
      const handler = () => {
        input.value = r.label;
        dropdown.hidden = true;
        openPanel(r.u);
      };
      el.addEventListener('click', handler);
      el.addEventListener('keydown', e => { if (e.key === 'Enter') handler(); });
    });
  });

  document.addEventListener('click', e => {
    if (!input.closest('.search-box').contains(e.target)) {
      dropdown.hidden = true;
    }
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Escape') { dropdown.hidden = true; input.blur(); }
  });
}

function highlight(text, q) {
  const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(re, '<mark style="background:rgba(59,130,246,0.3);color:inherit;border-radius:2px">$1</mark>');
}

// ── 필터 ──────────────────────────────────────────────────────
function initFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.filter;
      document.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.toggle('filter-btn--active', b.dataset.filter === activeFilter);
        b.setAttribute('aria-pressed', String(b.dataset.filter === activeFilter));
      });
      applyFilter();
    });
  });
}

function applyFilter() {
  filteredData = activeFilter === 'all'
    ? [...UNIVERSITIES]
    : UNIVERSITIES.filter(u => u.type === activeFilter);

  document.getElementById('count-num').textContent = filteredData.length;
  renderLayers();
  renderList();

  if (selectedId !== null && !filteredData.find(u => u.id === selectedId)) {
    closePanel();
  }
}

// ── 이벤트 바인딩 ─────────────────────────────────────────────
function bindEvents() {
  document.getElementById('panel-close').addEventListener('click', closePanel);
  document.getElementById('toggle-list').addEventListener('click', toggleList);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (document.getElementById('side-panel').classList.contains('side-panel--open')) {
        closePanel();
      } else if (listOpen) {
        toggleList();
      }
    }
  });
}

// ── 앱 시작 ───────────────────────────────────────────────────
function init() {
  console.log('UniMap 초기화 시작...');
  console.log('대학 데이터:', UNIVERSITIES.length, '개');
  
  try {
    initDeck();
    initSearch();
    initFilters();
    bindEvents();
    renderList();
    console.log('UniMap 초기화 완료!');
  } catch (e) {
    console.error('초기화 오류:', e);
  }
}

document.addEventListener('DOMContentLoaded', init);
