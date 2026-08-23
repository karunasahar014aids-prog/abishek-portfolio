gsap.registerPlugin(ScrollTrigger);

/* ============================================================
   MODAL SCROLL LOCK (shared by all modals: gallery, feedback
   form, feedback view)
   ------------------------------------------------------------
   Locks both <html> and <body> (not just body — some browsers
   scroll the html element instead) and uses a counter so that
   if one modal opens while another is technically still
   closing, they don't stomp on each other's unlock. Also blocks
   wheel/touch scroll on the backdrop itself so the page behind
   a blurred modal never scrolls — only the modal box (which has
   its own overflow-y:auto) scrolls.
============================================================ */
let modalLockCount = 0;
function lockPageScroll(){
  modalLockCount++;
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
}
function unlockPageScroll(){
  modalLockCount = Math.max(0, modalLockCount - 1);
  if(modalLockCount === 0){
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  }
}
function preventBackdropScroll(backdropEl, boxSelector){
  const block = e=>{
    if(!e.target.closest(boxSelector)) e.preventDefault();
  };
  backdropEl.addEventListener('wheel', block, { passive:false });
  backdropEl.addEventListener('touchmove', block, { passive:false });
}

/* ============================================================
   SUPABASE CONFIG (Feedback System)
   ------------------------------------------------------------
   Fill these in with your own Supabase project values:
   Project Settings → API → Project URL / anon public key.

   Create the table with this SQL in the Supabase SQL editor:

   create table feedbacks (
     id uuid primary key default gen_random_uuid(),
     full_name text not null,
     phone text,
     email text,
     rating int not null check (rating between 1 and 5),
     message text not null,
     created_at timestamptz default now()
   );
   alter table feedbacks enable row level security;
   create policy "public read" on feedbacks for select using (true);
   create policy "public insert" on feedbacks for insert with check (true);

   Until these are filled in, the feedback form still works using an
   in-memory list for this browser session only, so the page never breaks.
============================================================ */
const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

let sb = null;
try{
  if (window.supabase && SUPABASE_URL.startsWith('http')) {
    sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
}catch(err){ console.warn('Supabase not configured yet, using local fallback.', err); }

/* ============ DATA ============ */
const galleryData = [
  {cat:'street',title:'City Skyline Silhouette',loc:'Pappakovil',date:'2024',desc:'Candid street photography frame.',story:'',img:'images/gallery/street-1.jpeg',h:520},
  {cat:'street',title:'Evening Commute',loc:'Pappakovil',date:'2024',desc:'Candid street photography frame.',story:'',img:'images/gallery/street-2.jpeg',h:480},
  {cat:'street',title:'Rain Reflections',loc:'Pappakovil',date:'2024',desc:'Candid street photography frame.',story:'',img:'images/gallery/street-3.jpeg',h:560},
  {cat:'street',title:'Golden Hour Walk',loc:'Pappakovil',date:'2024',desc:'Candid street photography frame.',story:'',img:'images/gallery/street-4.jpeg',h:500},
  {cat:'street',title:'Market Crowd',loc:'Pappakovil',date:'2024',desc:'Candid street photography frame.',story:'',img:'images/gallery/street-5.jpeg',h:540},
  {cat:'street',title:'Quiet Alley',loc:'Pappakovil',date:'2024',desc:'Candid street photography frame.',story:'',img:'images/gallery/street-6.jpeg',h:480},
  {cat:'street',title:'Street Vendor',loc:'Pappakovil',date:'2024',desc:'Candid street photography frame.',story:'',img:'images/gallery/street-7.jpeg',h:600},
  {cat:'street',title:'Passing Shadows',loc:'Pappakovil',date:'2024',desc:'Candid street photography frame.',story:'',img:'images/gallery/street-8.jpeg',h:510},
  {cat:'street',title:'Morning Rush',loc:'Pappakovil',date:'2024',desc:'Candid street photography frame.',story:'',img:'images/gallery/street-9.jpeg',h:470},
  {cat:'street',title:'Neon Signs at Night',loc:'Pappakovil',date:'2024',desc:'Candid street photography frame.',story:'',img:'images/gallery/street-10.jpeg',h:590},
  {cat:'street',title:'Candid Conversation',loc:'Pappakovil',date:'2024',desc:'Candid street photography frame.',story:'',img:'images/gallery/street-11.jpeg',h:530},
  {cat:'street',title:'Between Buildings',loc:'Pappakovil',date:'2024',desc:'Candid street photography frame.',story:'',img:'images/gallery/street-12.jpeg',h:500},
  {cat:'street',title:'Light and Shadow Play',loc:'Pappakovil',date:'2024',desc:'Candid street photography frame.',story:'',img:'images/gallery/street-13.jpeg',h:560},
  {cat:'street',title:'Crosswalk Moment',loc:'Pappakovil',date:'2024',desc:'Candid street photography frame.',story:'',img:'images/gallery/street-14.jpeg',h:480},
  {cat:'street',title:'Local Life',loc:'Pappakovil',date:'2024',desc:'Candid street photography frame.',story:'',img:'images/gallery/street-15.jpeg',h:540},
  {cat:'street',title:'Framed by Windows',loc:'Pappakovil',date:'2024',desc:'Candid street photography frame.',story:'',img:'images/gallery/street-16.jpeg',h:510},
  {cat:'street',title:'Everyday Motion',loc:'Pappakovil',date:'2024',desc:'Candid street photography frame.',story:'',img:'images/gallery/street-17.jpeg',h:560},
  {cat:'street',title:'Street Corner Story',loc:'Pappakovil',date:'2024',desc:'Candid street photography frame.',story:'',img:'images/gallery/street-18.jpeg',h:490},
  {cat:'street',title:'Fading Light',loc:'Pappakovil',date:'2024',desc:'Candid street photography frame.',story:'',img:'images/gallery/street-19.jpeg',h:550},
  {cat:'covers',title:'English Subject Cover',loc:'Studio',date:'2024',desc:'Notebook cover design for school subject branding.',story:'',img:'images/covers/covers-1.jpeg',h:540},
  {cat:'covers',title:'Computer Science Cover',loc:'Studio',date:'2024',desc:'Notebook cover design for school subject branding.',story:'',img:'images/covers/covers-2.jpeg',h:540},
  {cat:'covers',title:'Hindi Subject Cover',loc:'Studio',date:'2024',desc:'Notebook cover design for school subject branding.',story:'',img:'images/covers/covers-3.jpeg',h:540},
  {cat:'covers',title:'Jotter Notes Cover',loc:'Studio',date:'2024',desc:'Notebook cover design for school subject branding.',story:'',img:'images/covers/covers-4.jpeg',h:540},
  {cat:'covers',title:'Mathematics Cover',loc:'Studio',date:'2024',desc:'Notebook cover design for school subject branding.',story:'',img:'images/covers/covers-5.jpeg',h:560},
  {cat:'covers',title:'Science Subject Cover',loc:'Studio',date:'2024',desc:'Notebook cover design for school subject branding.',story:'',img:'images/covers/covers-6.jpeg',h:520},
  {cat:'covers',title:'Tamil Subject Cover',loc:'Studio',date:'2024',desc:'Notebook cover design for school subject branding.',story:'',img:'images/covers/covers-7.jpeg',h:540},
  {cat:'covers',title:'Social Science Cover',loc:'Studio',date:'2024',desc:'Notebook cover design for school subject branding.',story:'',img:'images/covers/covers-8.jpeg',h:560},
  {cat:'covers',title:'General Notes Cover',loc:'Studio',date:'2024',desc:'Notebook cover design for school subject branding.',story:'',img:'images/covers/covers-9.jpeg',h:500},
  {cat:'covers',title:'Art & Craft Cover',loc:'Studio',date:'2024',desc:'Notebook cover design for school subject branding.',story:'',img:'images/covers/covers-10.jpeg',h:540},
  {cat:'covers',title:'Practical Notebook Cover',loc:'Studio',date:'2024',desc:'Notebook cover design for school subject branding.',story:'',img:'images/covers/covers-11.jpeg',h:560},
  {cat:'covers',title:'Homework Diary Cover',loc:'Studio',date:'2024',desc:'Notebook cover design for school subject branding.',story:'',img:'images/covers/covers-12.jpeg',h:520},
   {cat:'posters',title:'Admission Poster 1',loc:'Studio',date:'2025',desc:'Admissions poster design for college/course promotion.',story:'',img:'images/posters/poster-1.jpeg',h:560},
  {cat:'posters',title:'Admission Poster 2',loc:'Studio',date:'2025',desc:'Admissions poster design for college/course promotion.',story:'',img:'images/posters/poster-2.jpeg',h:550},
  {cat:'posters',title:'Admission Poster 3',loc:'Studio',date:'2025',desc:'Admissions poster design for college/course promotion.',story:'',img:'images/posters/poster-3.jpeg',h:530},
  {cat:'posters',title:'Admission Poster 4',loc:'Studio',date:'2025',desc:'Admissions poster design for college/course promotion.',story:'',img:'images/posters/poster-4.jpeg',h:540},
  {cat:'posters',title:'Admission Poster 5',loc:'Studio',date:'2025',desc:'Admissions poster design for college/course promotion.',story:'',img:'images/posters/poster-5.jpeg',h:600},
  {cat:'posters',title:'Admission Poster 6',loc:'Studio',date:'2025',desc:'Admissions poster design for college/course promotion.',story:'',img:'images/posters/poster-6.jpeg',h:550},
  {cat:'posters',title:'Admission Poster 7',loc:'Studio',date:'2025',desc:'Admissions poster design for college/course promotion.',story:'',img:'images/posters/poster-7.jpeg',h:510},
  {cat:'posters',title:'Admission Poster 8',loc:'Studio',date:'2025',desc:'Admissions poster design for college/course promotion.',story:'',img:'images/posters/poster-8.jpeg',h:550},
  {cat:'posters',title:'Admission Poster 9',loc:'Studio',date:'2025',desc:'Admissions poster design for college/course promotion.',story:'',img:'images/posters/poster-9.jpeg',h:520},
  {cat:'posters',title:'Admission Poster 10',loc:'Studio',date:'2025',desc:'Admissions poster design for college/course promotion.',story:'',img:'images/posters/poster-10.jpeg',h:550},
  {cat:'posters',title:'Admission Poster 11',loc:'Studio',date:'2025',desc:'Admissions poster design for college/course promotion.',story:'',img:'images/posters/poster-11.jpeg',h:500},
  {cat:'posters',title:'Admission Poster 12',loc:'Studio',date:'2025',desc:'Admissions poster design for college/course promotion.',story:'',img:'images/posters/poster-12.jpeg',h:510},
  {cat:'posters',title:'Admission Poster 13',loc:'Studio',date:'2025',desc:'Admissions poster design for college/course promotion.',story:'',img:'images/posters/poster-13.jpeg',h:580},
  {cat:'posters',title:'Admission Poster 14',loc:'Studio',date:'2025',desc:'Admissions poster design for college/course promotion.',story:'',img:'images/posters/poster-14.jpeg',h:530},
  {cat:'posters',title:'Admission Poster 15',loc:'Studio',date:'2025',desc:'Admissions poster design for college/course promotion.',story:'',img:'images/posters/poster-15.jpeg',h:560},
  {cat:'posters',title:'Admission Poster 16',loc:'Studio',date:'2025',desc:'Admissions poster design for college/course promotion.',story:'',img:'images/posters/poster-16.jpeg',h:560},
  {cat:'posters',title:'Admission Poster 17',loc:'Studio',date:'2025',desc:'Admissions poster design for college/course promotion.',story:'',img:'images/posters/poster-17.jpeg',h:510},
  {cat:'posters',title:'Admission Poster 18',loc:'Studio',date:'2025',desc:'Admissions poster design for college/course promotion.',story:'',img:'images/posters/poster-18.jpeg',h:530},
  {cat:'posters',title:'Admission Poster 19',loc:'Studio',date:'2025',desc:'Admissions poster design for college/course promotion.',story:'',img:'images/posters/poster-19.jpeg',h:530},
  {cat:'posters',title:'Admission Poster 20',loc:'Studio',date:'2025',desc:'Admissions poster design for college/course promotion.',story:'',img:'images/posters/poster-20.jpeg',h:510},
  {cat:'posters',title:'Admission Poster 21',loc:'Studio',date:'2025',desc:'Admissions poster design for college/course promotion.',story:'',img:'images/posters/poster-21.jpeg',h:480},
  {cat:'posters',title:'Admission Poster 22',loc:'Studio',date:'2025',desc:'Admissions poster design for college/course promotion.',story:'',img:'images/posters/poster-22.jpeg',h:540},
  {cat:'posters',title:'Admission Poster 23',loc:'Studio',date:'2025',desc:'Admissions poster design for college/course promotion.',story:'',img:'images/posters/poster-23.jpeg',h:560},
  {cat:'posters',title:'Admission Poster 24',loc:'Studio',date:'2025',desc:'Admissions poster design for college/course promotion.',story:'',img:'images/posters/poster-24.jpeg',h:540},
  {cat:'posters',title:'Admission Poster 25',loc:'Studio',date:'2025',desc:'Admissions poster design for college/course promotion.',story:'',img:'images/posters/poster-25.jpeg',h:530},
  {cat:'posters',title:'Admission Poster 26',loc:'Studio',date:'2025',desc:'Admissions poster design for college/course promotion.',story:'',img:'images/posters/poster-26.jpeg',h:480},
  {cat:'posters',title:'Admission Poster 27',loc:'Studio',date:'2025',desc:'Admissions poster design for college/course promotion.',story:'',img:'images/posters/poster-27.jpeg',h:500},
  {cat:'posters',title:'Admission Poster 28',loc:'Studio',date:'2025',desc:'Admissions poster design for college/course promotion.',story:'',img:'images/posters/poster-28.jpeg',h:520},
  {cat:'posters',title:'Admission Poster 29',loc:'Studio',date:'2025',desc:'Admissions poster design for college/course promotion.',story:'',img:'images/posters/poster-29.jpeg',h:540},
  {cat:'posters',title:'Admission Poster 30',loc:'Studio',date:'2025',desc:'Admissions poster design for college/course promotion.',story:'',img:'images/posters/poster-30.jpeg',h:550},
  {cat:'posters',title:'Admission Poster 31',loc:'Studio',date:'2025',desc:'Admissions poster design for college/course promotion.',story:'',img:'images/posters/poster-31.jpeg',h:500},
  {cat:'posters',title:'Admission Poster 32',loc:'Studio',date:'2025',desc:'Admissions poster design for college/course promotion.',story:'',img:'images/posters/poster-32.jpeg',h:580},
  {cat:'posters',title:'Admission Poster 33',loc:'Studio',date:'2025',desc:'Admissions poster design for college/course promotion.',story:'',img:'images/posters/poster-33.jpeg',h:500},
  {cat:'posters',title:'Admission Poster 34',loc:'Studio',date:'2025',desc:'Admissions poster design for college/course promotion.',story:'',img:'images/posters/poster-34.jpeg',h:580},
  {cat:'posters',title:'Admission Poster 35',loc:'Studio',date:'2025',desc:'Admissions poster design for college/course promotion.',story:'',img:'images/posters/poster-35.jpeg',h:510},
  {cat:'posters',title:'Admission Poster 36',loc:'Studio',date:'2025',desc:'Admissions poster design for college/course promotion.',story:'',img:'images/posters/poster-36.jpeg',h:550},
  {cat:'posters',title:'Admission Poster 37',loc:'Studio',date:'2025',desc:'Admissions poster design for college/course promotion.',story:'',img:'images/posters/poster-37.jpeg',h:480},
  {cat:'posters',title:'Admission Poster 38',loc:'Studio',date:'2025',desc:'Admissions poster design for college/course promotion.',story:'',img:'images/posters/poster-38.jpeg',h:480},
  {cat:'posters',title:'Admission Poster 39',loc:'Studio',date:'2025',desc:'Admissions poster design for college/course promotion.',story:'',img:'images/posters/poster-39.jpeg',h:480},
  {cat:'posters',title:'Admission Poster 40',loc:'Studio',date:'2025',desc:'Admissions poster design for college/course promotion.',story:'',img:'images/posters/poster-40.jpeg',h:550},
  {cat:'posters',title:'Admission Poster 41',loc:'Studio',date:'2025',desc:'Admissions poster design for college/course promotion.',story:'',img:'images/posters/poster-41.jpeg',h:510},
  {cat:'picsarts',title:'Digital Art 1',loc:'Studio',date:'2025',desc:'Digital art and photo manipulation piece.',story:'',img:'images/picsarts/picsart-1.jpeg',h:540},
  {cat:'picsarts',title:'Digital Art 2',loc:'Studio',date:'2025',desc:'Digital art and photo manipulation piece.',story:'',img:'images/picsarts/picsart-2.jpeg',h:560},
  {cat:'picsarts',title:'Digital Art 3',loc:'Studio',date:'2025',desc:'Digital art and photo manipulation piece.',story:'',img:'images/picsarts/picsart-3.jpeg',h:500},
  {cat:'picsarts',title:'Digital Art 4',loc:'Studio',date:'2025',desc:'Digital art and photo manipulation piece.',story:'',img:'images/picsarts/picsart-4.jpeg',h:530},
  {cat:'picsarts',title:'Digital Art 5',loc:'Studio',date:'2025',desc:'Digital art and photo manipulation piece.',story:'',img:'images/picsarts/picsart-5.jpeg',h:550},
];
const categories = ['all','street','covers','picsarts','posters'];const projectsData = [
  {title:'Nordr Apparel Lookbook',role:'Lead Photographer',img:'photo-1441974231531-c6227db76b6e',desc:'Full lookbook shot across three alpine locations in one week for an outdoor apparel launch.',software:'Lightroom, Capture One',duration:'4 weeks',client:'Nordr Apparel'},
  {title:'Wildflower Festival 2024',role:'Lead Photographer',img:'photo-1492684223066-81342ee5ff30',desc:'Three-day event coverage delivering same-day social content and a full recap gallery.',software:'Lightroom, Premiere Pro',duration:'3 days on-site',client:'Wildflower Festival'},
  {title:'Ember & Salt Menu Launch',role:'Photographer',img:'photo-1476224203421-9ac39bcb3327',desc:'Editorial food photography for a full spring menu across print and digital.',software:'Capture One, Photoshop',duration:'2 weeks',client:'Ember & Salt Kitchen'},
];

const skillsData = [
  {name:'Photography',pct:96,desc:'Weddings, editorial & landscape work.'},
  {name:'Digital Art',pct:88,desc:'Composite imagery & retouching.'},
  {name:'Photoshop',pct:90,desc:'Retouching & composite imagery.'},
  {name:'Illustrator',pct:82,desc:'Vector illustration & prints.'},
  {name:'Premiere Pro',pct:78,desc:'Wedding films & event recaps.'},
  {name:'Cover page',pct:99,desc:'modurn pages & coverse'},
  {name:'street-Photography',pct:90,desc:'street photographpy & preserving emotions'},
   {name:'posters design',pct:95,desc:'modurn pages & coverse'},
];

const IMG = (id,w=800,q=80) => id.startsWith('images/') ? id : `https://images.unsplash.com/${id}?w=${w}&q=${q}&auto=format&fit=crop`;
function withFallback(el, seed){ el.onerror = function(){ this.onerror=null; this.src = `https://picsum.photos/seed/${seed}/900/1100`; }; }

/* ============ SKILLS ============ */
const skillsGrid = document.getElementById('skills-grid');
skillsData.forEach((s)=>{
  const r = 42, c = 2*Math.PI*r;
  const div = document.createElement('div');
  div.className = 'skill-card reveal';
  div.innerHTML = `
    <div class="skill-ring">
      <svg viewBox="0 0 104 104">
        <circle class="bg-c" cx="52" cy="52" r="${r}"></circle>
        <circle class="fg-c" cx="52" cy="52" r="${r}" stroke-dasharray="${c}" stroke-dashoffset="${c}" data-offset="${c - (s.pct/100)*c}"></circle>
      </svg>
      <div class="skill-pct">${s.pct}%</div>
    </div>
    <div class="skill-name">${s.name}</div>
    <div class="skill-desc">${s.desc}</div>`;
  skillsGrid.appendChild(div);
});

/* ============ FILTER BAR ============ */
const filterBar = document.getElementById('filter-bar');
categories.forEach((c,i)=>{
  const b = document.createElement('button');
  b.className = 'filter-btn' + (i===0?' active':'');
  b.textContent = c.charAt(0).toUpperCase()+c.slice(1);
  b.dataset.cat = c;
  filterBar.appendChild(b);
});

/* ============================================================
   FAVORITES (per-device, stored in localStorage)
   ------------------------------------------------------------
   Each gallery photo gets a stable id (its index in galleryData,
   which never changes at runtime). We keep a simple array of
   favorited ids in localStorage under FAV_KEY. Every time a card
   is rendered we check this array and paint the heart red if the
   photo is already a favorite — so it survives reloads, tab
   closes, and repeat visits on that same browser/device.
============================================================ */
const FAV_KEY = 'portfolio_favorites_v1';
function getFavorites(){
  try{ return JSON.parse(localStorage.getItem(FAV_KEY)) || []; }
  catch(err){ return []; }
}
function saveFavorites(arr){
  try{ localStorage.setItem(FAV_KEY, JSON.stringify(arr)); }
  catch(err){ console.warn('Could not save favorites to localStorage.', err); }
}
function isFavorited(gid){ return getFavorites().includes(gid); }
function toggleFavorite(gid){
  const favs = getFavorites();
  const i = favs.indexOf(gid);
  if(i === -1) favs.push(gid); else favs.splice(i,1);
  saveFavorites(favs);
  return favs.includes(gid);
}

/* ============ GALLERY ============ */
const gallery = document.getElementById('gallery');
let visibleCount = 8;
let currentFilteredList = galleryData.slice();
let currentModalIndex = -1; // index within currentFilteredList

function renderGallery(filter){
  gallery.innerHTML = '';
  currentFilteredList = filter==='all'
  ? categories.filter(c=>c!=='all').map(c=> galleryData.find(g=>g.cat===c)).filter(Boolean)
  : galleryData.filter(g => g.cat===filter);
  const items = currentFilteredList.slice(0, visibleCount);
  items.forEach((g)=>{
    const gid = galleryData.indexOf(g); // stable id — never changes across filters/reloads
    const favActive = isFavorited(gid);
    const card = document.createElement('div');
    card.className = 'g-card reveal';
    card.dataset.idx = currentFilteredList.indexOf(g);
    card.dataset.gid = gid;
    card.innerHTML = `
      <div class="g-card-img">
        <img src="${IMG(g.img,700)}" style="height:${g.h}px;object-fit:cover;" alt="${g.title}" loading="lazy">
        <button class="g-fav-badge${favActive?' favorited':''}" data-act="favorite" aria-label="Favorite this photo">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="${favActive?'currentColor':'none'}" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5 5 0 00-7.1 0L12 6.3l-1.7-1.7a5 5 0 00-7.1 7.1L12 21l8.8-9.3a5 5 0 000-7.1z"/></svg>
        </button>
        <div class="g-overlay">
          <div class="g-cat">${g.cat}</div>
          <div class="g-title">${g.title}</div>
          <div class="g-loc"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 6-9 12-9 12S3 16 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>${g.loc} · ${g.date}</div>
        </div>
      </div>
      <div class="g-dots"><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg></div>
      <div class="g-menu">
        <button data-act="view"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>View Details</button>
        <button data-act="share"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>Share</button>
        <button data-act="download"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg>Download</button>
        <button class="fav-menu-item${favActive?' favorited':''}" data-act="favorite"><svg width="14" height="14" viewBox="0 0 24 24" fill="${favActive?'currentColor':'none'}" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5 5 0 00-7.1 0L12 6.3l-1.7-1.7a5 5 0 00-7.1 7.1L12 21l8.8-9.3a5 5 0 000-7.1z"/></svg>${favActive?'Favorited':'Favorite'}</button>
      </div>`;
    const img = card.querySelector('img');
    withFallback(img, 'gal-'+gid);
    gallery.appendChild(card);
  });
  document.getElementById('load-more-btn').style.display =
    currentFilteredList.length > visibleCount ? 'inline-flex':'none';
  refreshRevealTargets();
  bindMagnetic();
}
renderGallery('all');

filterBar.addEventListener('click', e=>{
  const btn = e.target.closest('.filter-btn'); if(!btn) return;
  filterBar.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  visibleCount = 8;
  renderGallery(btn.dataset.cat);
});
document.getElementById('load-more-btn').addEventListener('click', ()=>{
  visibleCount += 8;
  const active = filterBar.querySelector('.filter-btn.active').dataset.cat;
  renderGallery(active);
});

function setFavUI(card, active){
  const badge = card.querySelector('.g-fav-badge');
  const menuItem = card.querySelector('.fav-menu-item');
  [badge, menuItem].forEach(btn=>{
    if(!btn) return;
    btn.classList.toggle('favorited', active);
    btn.querySelector('svg').setAttribute('fill', active ? 'currentColor' : 'none');
  });
  if(menuItem) menuItem.lastChild.textContent = active ? 'Favorited' : 'Favorite';
}

gallery.addEventListener('click', e=>{
  const dots = e.target.closest('.g-dots');
  const favBadge = e.target.closest('.g-fav-badge');
  const menuBtn = e.target.closest('.g-menu button');
  const card = e.target.closest('.g-card');

  if(favBadge){
    e.stopPropagation();
    const active = toggleFavorite(parseInt(card.dataset.gid));
    setFavUI(card, active);
    return;
  }
  if(dots){
    e.stopPropagation();
    const menu = card.querySelector('.g-menu');
    document.querySelectorAll('.g-menu.open').forEach(m=>{ if(m!==menu) m.classList.remove('open'); });
    menu.classList.toggle('open');
    return;
  }
  if(menuBtn){
    e.stopPropagation();
    card.querySelector('.g-menu').classList.remove('open');
    if(menuBtn.dataset.act==='view') openModal(parseInt(card.dataset.idx));
    else if(menuBtn.dataset.act==='share') shareItem(currentFilteredList[parseInt(card.dataset.idx)]);
    else if(menuBtn.dataset.act==='download') downloadItem(currentFilteredList[parseInt(card.dataset.idx)]);
    else if(menuBtn.dataset.act==='favorite'){
      const active = toggleFavorite(parseInt(card.dataset.gid));
      setFavUI(card, active);
    }
    return;
  }
  if(card){ openModal(parseInt(card.dataset.idx)); }
});
document.addEventListener('click', e=>{
  if(!e.target.closest('.g-menu') && !e.target.closest('.g-dots')){
    document.querySelectorAll('.g-menu.open').forEach(m=>m.classList.remove('open'));
  }
});
function shareItem(g){
  const url = window.location.href.split('#')[0] + '#portfolio';
  if(navigator.share){ navigator.share({title:g.title, text:g.desc, url}); }
  else if(navigator.clipboard){ navigator.clipboard.writeText(url); }
}
function downloadItem(g){
  const a = document.createElement('a');
  a.href = IMG(g.img, 1600, 90);
  a.download = g.title.replace(/\s+/g,'-').toLowerCase()+'.jpg';
  a.target = '_blank';
  a.rel = 'noopener';
  a.click();
}

/* ============ IMAGE MODAL (with keyboard nav + related) ============ */
const backdrop = document.getElementById('modal-backdrop');
function openModal(i){
  currentModalIndex = i;
  const g = currentFilteredList[i];
  if(!g) return;
  document.getElementById('modal-img').src = IMG(g.img,1000);
  withFallback(document.getElementById('modal-img'), 'modal-'+galleryData.indexOf(g));
  document.getElementById('modal-cat').textContent = g.cat;
  document.getElementById('modal-title').textContent = g.title;
  document.getElementById('modal-desc').textContent = g.desc;
  document.getElementById('modal-story').textContent = g.story;
  const specs = document.getElementById('modal-specs');
  const specList = [
    ['Location', g.loc], ['Date', g.date], ...(g.client ? [['Client', g.client]] : []),
    ...(g.camera ? [['Camera', g.camera],['Lens', g.lens],['ISO', g.iso],['Aperture', g.aperture],['Shutter Speed', g.shutter]] : [])
  ];
  specs.innerHTML = specList.map(([l,v])=>`<div class="spec-item"><div class="spec-label">${l}</div><div class="spec-val">${v}</div></div>`).join('');
  document.getElementById('modal-tags').innerHTML = (g.tags||[]).map(t=>`<span class="tag">#${t}</span>`).join('');

  const related = currentFilteredList.filter((x)=> x.cat===g.cat && x!==g).slice(0,6);
  const row = document.getElementById('modal-related-row');
  row.innerHTML = related.map(r=>{
    const idx = currentFilteredList.indexOf(r);
    return `<img src="${IMG(r.img,140)}" data-idx="${idx}" alt="${r.title}" loading="lazy">`;
  }).join('') || '<span style="font-size:13px;color:var(--text-light);">No related photos in this category yet.</span>';
  row.querySelectorAll('img').forEach(img=>{
    withFallback(img, 'rel-'+img.dataset.idx);
    img.addEventListener('click', ()=> openModal(parseInt(img.dataset.idx)));
  });

  if(!backdrop.classList.contains('open')) lockPageScroll();
  backdrop.classList.add('open');
}
function closeModal(){ backdrop.classList.remove('open'); unlockPageScroll(); currentModalIndex=-1; }
function modalNext(){ if(currentModalIndex<0) return; openModal((currentModalIndex+1) % currentFilteredList.length); }
function modalPrev(){ if(currentModalIndex<0) return; openModal((currentModalIndex-1+currentFilteredList.length) % currentFilteredList.length); }

document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-next').addEventListener('click', modalNext);
document.getElementById('modal-prev').addEventListener('click', modalPrev);
backdrop.addEventListener('click', e=>{ if(e.target===backdrop) closeModal(); });
preventBackdropScroll(backdrop, '#modal');
document.addEventListener('keydown', e=>{
  if(!backdrop.classList.contains('open')) return;
  if(e.key==='Escape') closeModal();
  if(e.key==='ArrowRight') modalNext();
  if(e.key==='ArrowLeft') modalPrev();
});

/* ============ PROJECTS ============ */
const projGrid = document.getElementById('projects-grid');
projectsData.forEach((p,i)=>{
  const div = document.createElement('div');
  div.className = 'p-card reveal';
  div.innerHTML = `
    <div class="p-cover"><img src="${IMG(p.img,700)}" alt="${p.title}" loading="lazy"></div>
    <div class="p-body">
      <div class="p-role">${p.role}</div>
      <h3 class="p-title">${p.title}</h3>
      <p class="p-desc">${p.desc}</p>
      <div class="p-meta"><span>${p.software}</span><span>${p.duration}</span></div>
      <a href="#" class="p-link">View Case Study <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg></a>
    </div>`;
  withFallback(div.querySelector('img'), 'proj-'+i);
  projGrid.appendChild(div);
});

/* ============================================================
   FEEDBACK SYSTEM (Supabase, in-memory fallback)
============================================================ */
let localFeedbacks = []; // session-only fallback if Supabase isn't configured
let currentFeedbackList = [];
let currentFeedbackViewIdx = -1;

function initials(name){
  return name.trim().split(/\s+/).slice(0,2).map(n=>n[0]?.toUpperCase()).join('') || '?';
}
function formatDate(d){
  const date = new Date(d);
  return date.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
}
function renderFeedback(list){
  const grid = document.getElementById('feedback-grid');
  const empty = document.getElementById('feedback-empty');
  grid.innerHTML = '';
  currentFeedbackList = list;
  if(!list.length){ empty.classList.add('show'); return; }
  empty.classList.remove('show');
  list.forEach((f, i)=>{
    const stars = Array.from({length:f.rating}).map(()=>`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1z"/></svg>`).join('');
    const card = document.createElement('div');
    card.className = 'fb-card';
    card.dataset.idx = i;
    card.style.animationDelay = (i*0.06)+'s';
    card.innerHTML = `
      <div class="fb-card-dots"><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg></div>
      <div class="fb-card-menu">
        <button data-act="view"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>View Full</button>
        <button data-act="delete"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0l-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6h16z"/></svg>Delete</button>
      </div>
      <div class="fb-stars">${stars}</div>
      <p class="fb-quote">"${f.message}"</p>
      <div class="fb-person">
        <div class="fb-avatar">${initials(f.full_name || f.name)}</div>
        <div>
          <div class="fb-name">${f.full_name || f.name}</div>
          <div class="fb-date">${formatDate(f.created_at || f.date || Date.now())}${f.phone ? ' · '+f.phone : ''}</div>
        </div>
      </div>`;
    grid.appendChild(card);
  });
  refreshRevealTargets();
  updateFbArrows();
}

/* horizontal scroll arrows for the feedback carousel */
const fbGrid = document.getElementById('feedback-grid');
const fbLeftBtn = document.getElementById('fb-scroll-left');
const fbRightBtn = document.getElementById('fb-scroll-right');
function fbScrollAmount(){
  const card = fbGrid.querySelector('.fb-card');
  const gap = 22;
  return card ? card.getBoundingClientRect().width + gap : 320;
}
function updateFbArrows(){
  if(!fbGrid) return;
  const maxScroll = fbGrid.scrollWidth - fbGrid.clientWidth;
  fbLeftBtn.disabled = fbGrid.scrollLeft <= 4;
  fbRightBtn.disabled = fbGrid.scrollLeft >= maxScroll - 4;
  const hasOverflow = maxScroll > 4;
  fbLeftBtn.style.display = hasOverflow ? '' : 'none';
  fbRightBtn.style.display = hasOverflow ? '' : 'none';
}
fbLeftBtn?.addEventListener('click', ()=> fbGrid.scrollBy({ left: -fbScrollAmount(), behavior:'smooth' }));
fbRightBtn?.addEventListener('click', ()=> fbGrid.scrollBy({ left: fbScrollAmount(), behavior:'smooth' }));
fbGrid?.addEventListener('scroll', updateFbArrows);
window.addEventListener('resize', updateFbArrows);

/* 3-dot menu on each feedback card: View Full / Delete */
fbGrid?.addEventListener('click', e=>{
  const dots = e.target.closest('.fb-card-dots');
  const menuBtn = e.target.closest('.fb-card-menu button');
  const card = e.target.closest('.fb-card');
  if(dots){
    e.stopPropagation();
    const menu = card.querySelector('.fb-card-menu');
    document.querySelectorAll('.fb-card-menu.open').forEach(m=>{ if(m!==menu) m.classList.remove('open'); });
    menu.classList.toggle('open');
    return;
  }
  if(menuBtn){
    e.stopPropagation();
    card.querySelector('.fb-card-menu').classList.remove('open');
    const idx = parseInt(card.dataset.idx);
    if(menuBtn.dataset.act==='view') openFbView(idx);
    else if(menuBtn.dataset.act==='delete') openFbView(idx, true);
  }
});
document.addEventListener('click', e=>{
  if(!e.target.closest('.fb-card-menu') && !e.target.closest('.fb-card-dots')){
    document.querySelectorAll('.fb-card-menu.open').forEach(m=>m.classList.remove('open'));
  }
});

/* ===== feedback view modal (View Full + Delete-with-PIN) ===== */
const fbViewBackdrop = document.getElementById('fb-view-backdrop');
const fbDeletePanel = document.getElementById('fb-delete-panel');
function openFbView(idx, openDeletePanel){
  const f = currentFeedbackList[idx];
  if(!f) return;
  currentFeedbackViewIdx = idx;
  const stars = Array.from({length:f.rating}).map(()=>`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1z"/></svg>`).join('');
  document.getElementById('fb-view-stars').innerHTML = stars;
  document.getElementById('fb-view-quote').textContent = `"${f.message}"`;
  document.getElementById('fb-view-avatar').textContent = initials(f.full_name || f.name);
  document.getElementById('fb-view-name').textContent = f.full_name || f.name;
  document.getElementById('fb-view-date').textContent = formatDate(f.created_at || f.date || Date.now()) + (f.phone ? ' · '+f.phone : '');
  document.getElementById('fb-delete-pin').value = '';
  document.getElementById('fb-delete-error').textContent = '';
  fbDeletePanel.classList.toggle('open', !!openDeletePanel);
  fbViewBackdrop.classList.add('open');
  lockPageScroll();
}
function closeFbView(){
  fbViewBackdrop.classList.remove('open');
  unlockPageScroll();
  fbDeletePanel.classList.remove('open');
  currentFeedbackViewIdx = -1;
}
document.getElementById('fb-view-close').addEventListener('click', closeFbView);
fbViewBackdrop.addEventListener('click', e=>{ if(e.target===fbViewBackdrop) closeFbView(); });
preventBackdropScroll(fbViewBackdrop, '#fb-view-modal');
document.addEventListener('keydown', e=>{ if(e.key==='Escape' && fbViewBackdrop.classList.contains('open')) closeFbView(); });

document.getElementById('fb-delete-trigger').addEventListener('click', ()=>{
  fbDeletePanel.classList.toggle('open');
  document.getElementById('fb-delete-pin').focus();
});

document.getElementById('fb-delete-confirm').addEventListener('click', async ()=>{
  const f = currentFeedbackList[currentFeedbackViewIdx];
  const errorEl = document.getElementById('fb-delete-error');
  const pinInput = document.getElementById('fb-delete-pin');
  const pin = pinInput.value.trim();
  if(!f) return;
  if(!/^\d{4}$/.test(pin)){
    errorEl.textContent = 'Enter the 4-digit PIN you set when posting.';
    return;
  }
  const btn = document.getElementById('fb-delete-confirm');
  btn.disabled = true;
  btn.textContent = 'Checking...';
  const ok = await deleteFeedback(f, pin);
  btn.disabled = false;
  btn.textContent = 'Confirm Delete';
  if(ok){
    closeFbView();
    await loadFeedback();
  } else {
    errorEl.textContent = 'That PIN doesn\'t match — check the PIN you set when you posted it.';
  }
});

async function deleteFeedback(f, pin){
  if(sb && f.id && !String(f.id).startsWith('local-')){
    try{
      const { data, error } = await sb.rpc('delete_feedback', { feedback_id: f.id, submitted_pin: pin });
      if(error) throw error;
      return data === true;
    }catch(err){ console.warn('Supabase delete failed.', err); return false; }
  }
  // local fallback (session-only feedback)
  if(f._localPin && f._localPin === pin){
    localFeedbacks = localFeedbacks.filter(x=>x!==f);
    return true;
  }
  return false;
}

async function loadFeedback(){
  if(sb){
    try{
      const { data, error } = await sb.from('feedbacks')
        .select('id, full_name, phone, email, rating, message, created_at')
        .order('created_at', { ascending:false });
      if(error) throw error;
      renderFeedback(data || []);
      return;
    }catch(err){ console.warn('Supabase read failed, showing local fallback.', err); }
  }
  renderFeedback(localFeedbacks);
}
async function submitFeedback(payload){
  if(sb){
    try{
      const { data, error } = await sb.from('feedbacks').insert([payload]).select();
      if(error) throw error;
      await loadFeedback();
      return true;
    }catch(err){
      console.warn('Supabase insert failed, saving locally for this session instead.', err);
    }
  }
  localFeedbacks.unshift({
    ...payload,
    id: 'local-' + Date.now(),
    _localPin: payload.pin_hash, // stored in-memory only, for this session's fallback delete
    created_at: new Date().toISOString()
  });
  renderFeedback(localFeedbacks);
  return true;
}
loadFeedback();

/* feedback modal open/close */
const fbBackdrop = document.getElementById('fb-modal-backdrop');
document.getElementById('open-feedback-btn').addEventListener('click', ()=>{
  fbBackdrop.classList.add('open');
  lockPageScroll();
  document.getElementById('fb-form').style.display='';
  document.getElementById('fb-success').classList.remove('show');
});
function closeFbModal(){ fbBackdrop.classList.remove('open'); unlockPageScroll(); }
document.getElementById('fb-modal-close').addEventListener('click', closeFbModal);
fbBackdrop.addEventListener('click', e=>{ if(e.target===fbBackdrop) closeFbModal(); });
preventBackdropScroll(fbBackdrop, '#fb-modal');
document.addEventListener('keydown', e=>{ if(e.key==='Escape' && fbBackdrop.classList.contains('open')) closeFbModal(); });

/* star rating input */
const starButtons = document.querySelectorAll('#fb-star-input .star');
const ratingInput = document.getElementById('fb-rating');
starButtons.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const val = parseInt(btn.dataset.val);
    ratingInput.value = val;
    starButtons.forEach(b=> b.classList.toggle('active', parseInt(b.dataset.val) <= val));
  });
});

/* feedback form submit */
document.getElementById('fb-form').addEventListener('submit', async function(e){
  e.preventDefault();
  const errorEl = document.getElementById('fb-error');
  const name = document.getElementById('fb-name').value.trim();
  const phone = document.getElementById('fb-phone').value.trim();
  const email = document.getElementById('fb-email').value.trim();
  const message = document.getElementById('fb-message').value.trim();
  const pin = document.getElementById('fb-pin').value.trim();
  const rating = parseInt(ratingInput.value);

  if(!name || !message || !rating){
    errorEl.textContent = 'Please add your name, a star rating, and a short message.';
    return;
  }
  if(!/^[0-9+\-\s]{7,15}$/.test(phone)){
    errorEl.textContent = 'Please add a valid phone number.';
    return;
  }
  if(!/^\d{4}$/.test(pin)){
    errorEl.textContent = 'Please set a 4-digit PIN — you\'ll need it later to delete this feedback.';
    return;
  }
  errorEl.textContent = '';
  const btn = document.getElementById('fb-submit-btn');
  btn.textContent = 'Submitting...';
  btn.disabled = true;

  await submitFeedback({ full_name:name, phone, email:email||null, rating, message, pin_hash: pin });

  btn.disabled = false;
  btn.innerHTML = 'Submit Feedback <svg class="icon-send" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>';
  this.style.display = 'none';
  document.getElementById('fb-success').classList.add('show');
  setTimeout(()=>{
    closeFbModal();
    this.reset();
    this.style.display='';
    document.getElementById('fb-success').classList.remove('show');
    starButtons.forEach(b=>b.classList.remove('active'));
    ratingInput.value = 0;
  }, 1800);
});

/* ============================================================
   CONTACT FORM (Supabase, in-memory fallback)
   ------------------------------------------------------------
   Create the table with this SQL in the Supabase SQL editor:

   create table contacts (
     id uuid primary key default gen_random_uuid(),
     name text not null,
     email text not null,
     project_type text,
     message text not null,
     created_at timestamptz default now()
   );
   alter table contacts enable row level security;
   create policy "public insert" on contacts for insert with check (true);
   -- no public "select" policy on purpose: only you (via the Supabase
   -- dashboard / service role) can read submitted leads.
============================================================ */
let localContacts = [];
async function submitContact(payload){
  if(sb){
    try{
      const { error } = await sb.from('contacts').insert([payload]);
      if(error) throw error;
      return true;
    }catch(err){ console.warn('Supabase insert failed, saving locally for this session instead.', err); }
  }
  localContacts.push({ ...payload, created_at: new Date().toISOString() });
  return true;
}

document.getElementById('contact-form').addEventListener('submit', async function(e){
  e.preventDefault();
  const name = document.getElementById('cf-name').value.trim();
  const email = document.getElementById('cf-email').value.trim();
  const type = document.getElementById('cf-type').value;
  const message = document.getElementById('cf-message').value.trim();
  if(!name || !email || !message) return;

  await submitContact({ name, email, project_type:type, message });

  this.style.display = 'none';
  document.getElementById('form-success').classList.add('show');
});

/* ============================================================
   LOADER + PAGE INIT
============================================================ */
window.addEventListener('load', ()=>{
  const pctEl = document.getElementById('loader-pct');
  let p = 0;
  const t = setInterval(()=>{
    p += Math.random()*18;
    if(p>=100){ p=100; clearInterval(t); }
    pctEl.textContent = Math.floor(p)+'%';
  }, 90);

  const tl = gsap.timeline({ delay: 0.9, onComplete: initPage });
  tl.to('.shutter-blade', { scale: 0, transformOrigin:'75px 75px', duration:.9, ease:'power3.inOut', stagger:.03 })
    .to('#loader', { opacity:0, duration:.6, ease:'power2.inOut', pointerEvents:'none' }, '-=.3')
    .set('#loader', { display:'none' });
});

let pageInitialized = false;
function initPage(){
  document.getElementById('year').textContent = new Date().getFullYear();

  const lenis = new Lenis({ duration:1.1, easing:(t)=>Math.min(1,1.001-Math.pow(2,-10*t)) });
  function raf(time){ lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time)=>{ lenis.raf(time*1000); });
  gsap.ticker.lagSmoothing(0);

  playHeroEntrance();

  /* skill rings animate in */
  document.querySelectorAll('.skill-ring .fg-c').forEach(c=>{
    gsap.to(c, { strokeDashoffset: c.dataset.offset, duration:1.6, ease:'power3.out',
      scrollTrigger:{ trigger:c, start:'top 85%' } });
  });

  refreshRevealTargets();
  bindMagnetic();
  bindRipple();
  ScrollTrigger.refresh();
  pageInitialized = true;
}

/* ------------------------------------------------------------
   HERO ENTRANCE (bug fix)
   Root cause of the "ABISHEK gets clipped after navigating back"
   bug: the reveal tween previously animated to `yPercent:-110`.
   Since the CSS starting position is already `translateY(110%)`
   (i.e. yPercent 110), animating to -110 flew the text straight
   through its correct resting position (0) and out the far side,
   so on certain reflows/refreshes only part of the glyph box
   stayed inside the `overflow:hidden` line wrapper.
   Fix: always resolve to yPercent(0), guard against being run
   twice, and clear the inline transform once finished so no
   stale transform value can ever re-clip the title.
------------------------------------------------------------ */
function playHeroEntrance(){
  const spans = document.querySelectorAll('.hero-title .line span');
  gsap.killTweensOf(spans);
  gsap.set(spans, { yPercent:110 });

  gsap.to(spans, {
    yPercent: 0,
    duration: 1,
    ease: 'power4.out',
    delay: .1
    // clearProps removed — it was reverting to the CSS translateY(110%) after finishing
  });

  gsap.fromTo('.hero-eyebrow, .hero-role, .hero-desc, .hero-btns',
    { y:24, opacity:0 },
    { y:0, opacity:1, duration:.9, stagger:.08, ease:'power3.out', delay:.35, clearProps:'transform' });

  gsap.fromTo('#hero-visual', { scale:.88, opacity:0 }, { scale:1, opacity:1, duration:1.2, ease:'power3.out', delay:.3 });
  gsap.fromTo('.float-icon', { scale:0, opacity:0 }, { scale:1, opacity:1, duration:.7, stagger:.12, ease:'back.out(2)', delay:1 });
}

/* If this page is ever embedded in an SPA/router where #hero can be
   remounted, calling window.replayHeroEntrance() re-runs the fixed,
   idempotent animation safely, any number of times. */
window.replayHeroEntrance = playHeroEntrance;

function refreshRevealTargets(){
  document.querySelectorAll('.reveal').forEach(el=>{
    if(el.dataset.revealed) return;
    gsap.set(el,{opacity:0,y:36});
    ScrollTrigger.create({
      trigger:el, start:'top 90%',
      onEnter:()=>{ gsap.to(el,{opacity:1,y:0,duration:.9,ease:'power3.out'}); el.dataset.revealed='1'; }
    });
  });
}

/* ============ NAV ============ */
const header = document.getElementById('site-header');
window.addEventListener('scroll', ()=>{ header.classList.toggle('scrolled', window.scrollY>40); });

const sections = ['hero','about','skills','portfolio','projects','testimonials','contact'];
const navLinks = document.querySelectorAll('.nav-link');
window.addEventListener('scroll', ()=>{
  let current = 'hero';
  sections.forEach(id=>{
    const el = document.getElementById(id);
    if(el && window.scrollY >= el.offsetTop - window.innerHeight*0.4) current = id;
  });
  navLinks.forEach(l=> l.classList.toggle('active', l.dataset.target===current));
});

/* mobile menu */
const burger = document.getElementById('burger-btn');
const mmenu = document.getElementById('mobile-menu');
burger.addEventListener('click', ()=> mmenu.classList.add('open'));
document.getElementById('mm-close').addEventListener('click', ()=> mmenu.classList.remove('open'));
mmenu.querySelectorAll('a').forEach(a=> a.addEventListener('click', ()=> mmenu.classList.remove('open')));

/* about cards accordion */
document.querySelectorAll('.a-card').forEach(card=>{
  const body = card.querySelector('.a-body');
  if(card.dataset.open==='true'){ card.classList.add('open'); body.style.maxHeight = body.scrollHeight+40+'px'; }
  card.addEventListener('click', ()=>{
    const isOpen = card.classList.contains('open');
    document.querySelectorAll('.a-card').forEach(c=>{
      c.classList.remove('open'); c.querySelector('.a-body').style.maxHeight = 0;
    });
    if(!isOpen){ card.classList.add('open'); body.style.maxHeight = body.scrollHeight+40+'px'; }
  });
});

/* counters */
document.querySelectorAll('.counter-num').forEach(el=>{
  const target = +el.dataset.count;
  const numEl = el.querySelector('.n');
  ScrollTrigger.create({
    trigger:el, start:'top 90%', once:true,
    onEnter:()=>{ gsap.to({v:0},{ v:target, duration:1.8, ease:'power2.out',
      onUpdate:function(){ numEl.textContent = Math.floor(this.targets()[0].v); } }); }
  });
});

/* ============ CURSOR ============ */
const cDot = document.getElementById('cursor-dot');
const cRing = document.getElementById('cursor-ring');
let mx=0,my=0, rx=0, ry=0;
window.addEventListener('mousemove', e=>{ mx=e.clientX; my=e.clientY; cDot.style.left=mx+'px'; cDot.style.top=my+'px'; });
gsap.ticker.add(()=>{ rx += (mx-rx)*0.16; ry += (my-ry)*0.16; cRing.style.left=rx+'px'; cRing.style.top=ry+'px'; });

function bindCursorTargets(){
  document.querySelectorAll('a, button, .g-card, .magnetic, input, textarea, select').forEach(el=>{
    if(el.dataset.cursorBound) return;
    el.dataset.cursorBound='1';
    el.addEventListener('mouseenter', ()=> cRing.classList.add('big'));
    el.addEventListener('mouseleave', ()=> cRing.classList.remove('big'));
  });
  document.querySelectorAll('.g-card').forEach(el=>{
    if(el.dataset.cursorViewBound) return;
    el.dataset.cursorViewBound='1';
    el.addEventListener('mouseenter', ()=> cRing.classList.add('view'));
    el.addEventListener('mouseleave', ()=> cRing.classList.remove('view'));
  });
}
bindCursorTargets();
new MutationObserver(bindCursorTargets).observe(document.body,{childList:true,subtree:true});

/* ============ MAGNETIC BUTTONS ============ */
function bindMagnetic(){
  document.querySelectorAll('.magnetic').forEach(btn=>{
    if(btn.dataset.magBound) return;
    btn.dataset.magBound='1';
    btn.addEventListener('mousemove', e=>{
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width/2;
      const y = e.clientY - r.top - r.height/2;
      gsap.to(btn, { x:x*0.35, y:y*0.35, duration:.4, ease:'power3.out' });
    });
    btn.addEventListener('mouseleave', ()=>{ gsap.to(btn,{x:0,y:0,duration:.5,ease:'elastic.out(1,0.4)'}); });
  });
}

/* ============ RIPPLE CLICK EFFECT ============ */
function bindRipple(){
  document.querySelectorAll('.btn').forEach(btn=>{
    if(btn.dataset.rippleBound) return;
    btn.dataset.rippleBound='1';
    btn.style.position = btn.style.position || 'relative';
    btn.addEventListener('click', e=>{
      const r = btn.getBoundingClientRect();
      const dot = document.createElement('span');
      const size = Math.max(r.width, r.height);
      dot.className = 'ripple-dot';
      dot.style.width = dot.style.height = size+'px';
      dot.style.left = (e.clientX - r.left - size/2)+'px';
      dot.style.top = (e.clientY - r.top - size/2)+'px';
      btn.appendChild(dot);
      setTimeout(()=> dot.remove(), 650);
    });
  });
}
new MutationObserver(()=>{ bindMagnetic(); bindRipple(); }).observe(document.body,{childList:true,subtree:true});

/* ============ HERO PARALLAX ON MOUSE ============ */
const heroPortrait = document.getElementById('hero-portrait');
window.addEventListener('mousemove', e=>{
  if(window.innerWidth<=980 || !heroPortrait) return;
  const x = (e.clientX/window.innerWidth - .5)*24;
  const y = (e.clientY/window.innerHeight - .5)*24;
  gsap.to(heroPortrait, { x:x, y:y, duration:.8, ease:'power2.out' });
});

/* ============ FLOATING PARTICLES ============ */
(function initParticles(){
  const visual = document.getElementById('hero-visual');
  if(!visual) return;
  for(let i=0;i<14;i++){
    const p = document.createElement('div');
    p.className='hero-particle';
    const size = Math.random()*5+2;
    p.style.width=size+'px'; p.style.height=size+'px';
    p.style.left = Math.random()*100+'%';
    p.style.top = Math.random()*100+'%';
    visual.appendChild(p);
    gsap.to(p, { y: (Math.random()*80-40), x:(Math.random()*80-40), opacity: Math.random()*.5+.2,
      duration: Math.random()*4+3, repeat:-1, yoyo:true, ease:'sine.inOut', delay: Math.random()*2 });
  }
})();

/* ABISHEK LIVE ADMIN GALLERY FIX v3 */
(function(){
  const SUPABASE_URL = 'https://jaryhmtzzassnzomtsch.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_7VIks8jFhtcJtJOMzI5CKA_fPLazRUA';

  async function loadAdminPhotos(){
    if(!window.supabase || typeof window.supabase.createClient !== 'function') return;
    try{
      const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      const { data, error } = await client
        .from('posters')
        .select('id,title,category,location,date,description,image_url,display_order,published')
        .eq('published', true)
        .not('image_url', 'is', null)
        .order('display_order', { ascending: true });
      if(error) throw error;
      if(!Array.isArray(data) || !data.length) return;

      const existing = new Set(galleryData.map(item => item.img));
      const categories = ['street','covers','picsarts','posters'];

      data.forEach((item, index) => {
        if(!item.image_url || existing.has(item.image_url)) return;
        galleryData.push({
          cat: categories.includes(String(item.category || '').toLowerCase()) ? String(item.category).toLowerCase() : 'posters',
          title: item.title || 'New Photograph',
          loc: item.location || 'Studio',
          date: item.date || new Date().getFullYear(),
          desc: item.description || 'Photography portfolio work.',
          story: '',
          img: item.image_url,
          h: 520,
          liveId: item.id || ('admin-' + index)
        });
      });

      const active = document.querySelector('.filter-btn.active');
      const filter = active ? active.dataset.cat : 'all';
      if(typeof renderGallery === 'function') renderGallery(filter);
      if(typeof refreshRevealTargets === 'function') refreshRevealTargets();
      if(typeof bindMagnetic === 'function') bindMagnetic();
    }catch(err){
      console.warn('Admin gallery sync failed:', err);
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', () => setTimeout(loadAdminPhotos, 300));
  }else{
    setTimeout(loadAdminPhotos, 300);
  }
})();
