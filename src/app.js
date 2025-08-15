import { BADGES, badgeImg, badgeGroup } from './data/badges.js';
import STREAMERS from './data/streamers.js';
import GAMES from './data/games.js';
import BRANDS from './data/brands.js';
import MARKET from './data/market.js';
import CHANNEL_CATEGORIES from './data/channelCategories.js';

const $  = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
  const layout        = $('#layoutRoot');
  const content       = $('#content');
  const sidepanel     = $('#sidepanel');
  const sidepanelScroll = $('#sidepanelScroll');
  const membersSection = $('#membersSection');
  const sidepanelTitle= $('#sidepanel-title');
  const headerTitle   = $('#headerTitle');
  const sidebarHeader = $('#sidebarHeader');
  const rightToggle   = $('#rightToggle');
  const chatViewToggle= $('#chatViewToggle');
  const streamerToggle= $('#streamerToggle');
  const sideChatInputWrap = $('#sideChatInput');

  const activeQuestBox  = $('#activeQuestBox');
  const activeQuestName = $('#activeQuestName');
  const activeQuestBar  = $('#activeQuestBar');

  const rail = $('#streamerRail');
  rail.innerHTML = STREAMERS.map(s => `
    <div class="white__line" style="--dot:${s.color}">
      <div class="server__logo" title="${s.name}" data-streamer="${s.id}">
        <img src="${s.avatar}" alt="${s.name}">
      </div>
    </div>
  `).join('');

  let currentView = 'discover';
  let currentStreamer = null;
  let membersOpen = false;
  let chatFocus = false;
  let currentCampaign = null;
  let currentStreamerTab = null;
  let lastSidepanelMode = null;
  let sidepanelBackTarget = null;

  function setHeader(label){ headerTitle.textContent = label; }
  function setSidebarHeaderText(label){ sidebarHeader.firstChild.nodeValue = label + ' '; }
  function setMenuActive(view){
    $$('#noizMenu .chat__title').forEach(el=>{
      if (el.dataset.view === view) el.classList.remove('before-none'); else el.classList.add('before-none');
    });
  }
  function setStreamerTabActive(tab){
    const menu = $('#channelMenu');
    if (!menu) return;
    menu.querySelectorAll('.chat__title[data-stab]').forEach(el=>{
      if (el.dataset.stab === tab) el.classList.remove('before-none'); else el.classList.add('before-none');
    });
  }
  function setRightToggleIcon(kind){
    const icons = {
      quests: `<svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2l7 4v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-4z"/></svg>`,
      chat:   `<svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M4 4h16v10H7l-3 3V4z"/></svg>`,
      members:`<svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M14 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"/><path fill="currentColor" d="M2 20a8 8 0 0 1 16 0v1H2v-1z"/></svg>`
    };
    rightToggle.innerHTML = icons[kind] || icons.members;
  }
  function setStreamerToggleVisible(show){
    streamerToggle.classList.toggle('hide', !show);
    if (show) streamerToggle.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M4 4h16v10H7l-3 3V4z"/></svg>`;
  }
  function setChatViewToggleVisible(show){
    chatViewToggle.classList.toggle('hide', !show);
    if (show) chatViewToggle.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24"><path d="M3 5h18v4H3V5zm0 5h11v4H3v-4zm0 5h8v4H3v-4z" fill="currentColor"/></svg>`;
  }
  function setPanelTitle(txt){ sidepanelTitle.textContent = txt; }
  function setChatWidthWide(wide){ layout.classList.toggle('chat-wide', !!wide); }
  function showRightPanel(show){ membersOpen = !!show; layout.classList.toggle('members-collapsed', !membersOpen); }
  function ensureSideInputVisibility(){
    const showInput = currentView==='streamer' && currentStreamer?.online && membersOpen && !chatFocus && lastSidepanelMode==='livechat';
    sideChatInputWrap.classList.toggle('hide', !showInput);
  }
  function updateTopbarToggles(){
    const live = currentView==='streamer' && currentStreamer?.online;
    setChatViewToggleVisible(live);
    streamerToggle.classList.toggle('hide', !(live && !chatFocus));
    ensureSideInputVisibility();
  }
  function setActiveQuest(name, progress){
    if (name == null) { activeQuestBox.classList.add('hide'); return; }
    activeQuestBox.classList.remove('hide');
    activeQuestName.textContent = name || 'No active quest';
    activeQuestBar.style.width = Math.min(progress || 0, 100) + '%';
  }
  const originalMenuHTML = () => $('#noizMenu')?.outerHTML;
  let savedAppMenu = '';

  function renderStreamerSidebar(streamer, includeCategories=false){
    const sidebarChats = document.querySelector('.chat__names .chats');
    if (!sidebarChats) return;
    if (!savedAppMenu) savedAppMenu = originalMenuHTML() || '';

    const cats = CHANNEL_CATEGORIES[streamer.id] || [];
    const tabsHTML = `
      <div class="chat__category"><img src="down-arrow.svg" alt="">CHANNEL</div>
      <div class="chat__title" data-stab="profile"><svg width="20" height="20"><circle cx="10" cy="10" r="9" fill="currentColor"/></svg>Profile</div>
      <div class="chat__title before-none" data-stab="market"><svg width="20" height="20"><rect x="3" y="3" width="14" height="14" fill="currentColor"/></svg>Market</div>
      <div class="chat__title before-none" data-stab="vods"><svg width="20" height="20"><path d="M3 6h18v4H3zM3 14h12v4H3z" fill="currentColor"/></svg>VODs & Clips</div>
      <div class="chat__title before-none" data-stab="rules"><svg width="20" height="20"><path d="M6 4h12v2H6zM6 8h12v2H6zM6 12h8v2H6z" fill="currentColor"/></svg>Rules</div>
    `;

    const catsHTML = includeCategories ? cats.map(c => `
      <div class="chat__category"><img src="down-arrow.svg" alt="">${c.name}</div>
      ${c.channels.map(ch => `
        <div class="chat__title">
          <svg width="20" height="20" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" fill="currentColor"></circle></svg>
          # ${ch}
        </div>
      `).join('')}
    `).join('') : '';

    const html = `<div class="chats" id="channelMenu">${tabsHTML}${catsHTML}</div>`;
    sidebarChats.outerHTML = html;
    setSidebarHeaderText(`Channel — ${streamer.name}`);

    $('#channelMenu').addEventListener('click', (e)=>{
      const item = e.target.closest('.chat__title[data-stab]');
      if (!item) return;
      const tab = item.dataset.stab;
      openStreamerTab(streamer, tab);
    });

    setStreamerTabActive(currentStreamerTab);
  }

  function renderHomeSidebar(){
    const sidebarChats = document.querySelector('.chat__names .chats');
    if (!sidebarChats) return;
    if (!savedAppMenu) savedAppMenu = originalMenuHTML() || '';
    if (savedAppMenu) sidebarChats.outerHTML = savedAppMenu;
    setSidebarHeaderText('NOIZ — Home');
    bindAppMenu();
  }

  function renderMembersRoster(streamer){
    setPanelTitle('MEMBERS');
    membersSection.classList.remove('live-chat');
    lastSidepanelMode = 'members';
    sidepanel.innerHTML = Array.from({length:18}).map((_,i)=>`
      <div class="member__name__container" data-handle="@viewer${i+1}" data-avatar="https://picsum.photos/seed/mem${i}/40" data-status="${i%3===0 ? '● online' : '○ offline'}">
        <div class="member__avatar"><img src="https://picsum.photos/seed/mem${i}/40" alt=""></div>
        <div>
          <div>@viewer${i+1}</div>
          <div class="member__status">${i%3===0 ? '● online' : '○ offline'}</div>
        </div>
      </div>`).join('');
  }

  function renderCampaignSideQuests(brand){
    setPanelTitle('QUESTS');
    membersSection.classList.remove('live-chat');
    lastSidepanelMode = 'members';
    sidepanel.innerHTML = brand.quests.map(q=>`
      <div class="questrow">
        <div class="questrow__top">
          <div class="questrow__title">${q.title}</div>
          <div class="questrow__rewards">+${q.xp} XP • +${q.db} dB</div>
        </div>
        <div class="progress__track small"><div class="progress__fill" style="width:${q.progress}%"></div></div>
        <button class="quest__cta" data-track="${q.title}" data-progress="${q.progress}">Track</button>
      </div>
    `).join('');
  }

  function renderDiscover(){
    currentView = 'discover'; currentStreamer = null; chatFocus = false; currentCampaign = null; currentStreamerTab = null;
    setMenuActive('discover'); setHeader('NOIZ — Discover'); setRightToggleIcon('members');
    setStreamerToggleVisible(false); setPanelTitle('PANEL'); sidepanel.innerHTML='';
    setChatWidthWide(false); showRightPanel(false);
    renderHomeSidebar();
    setActiveQuest(null);
    membersSection.classList.remove('live-chat');
    updateTopbarToggles();

    let filter = 'all';
    const chips = [`<button class="chip active" data-g="all">All</button>`]
      .concat(GAMES.map(g=>`<button class="chip" data-g="${g.id}">${g.name}</button>`)).join('');

    function draw(){
      const filtered = (filter==='all') ? STREAMERS.filter(s=>s.online) : STREAMERS.filter(s=>s.online && s.game===filter);
      const cards = filtered.map(s=>{
        const g = GAMES.find(x=>x.id===s.game);
        return `
          <div class="card streamer" data-open="${s.id}">
            <img class="thumb" src="${g.cover}" alt="">
            <div class="streamer__row">
              <img class="avatar" src="${s.avatar}" alt="">
              <div class="meta">
                <div class="title namewrap"><span>${s.name}</span>${badgeGroup(s.badges || [], 14)}</div>
                <div class="sub">${g.name}</div>
              </div>
              <div class="pill pill-live">LIVE</div>
            </div>
          </div>`;
      }).join('');
      content.innerHTML = `<div class="carousel">${chips}</div><div class="grid grid-3">${cards}</div>`;
      $$('.carousel .chip').forEach(b=>b.onclick=()=>{ $$('.chip').forEach(c=>c.classList.remove('active')); b.classList.add('active'); filter=b.dataset.g; draw(); });
      $$('[data-open]').forEach(c=>c.onclick=()=>openStreamer(c.dataset.open));
    }
    draw();
  }

  function renderBrowse(gameId){
    currentView='browse'; currentStreamer=null; chatFocus=false; currentCampaign=null; currentStreamerTab = null;
    setMenuActive('browse'); setHeader('NOIZ — Browse'); setRightToggleIcon('members');
    setStreamerToggleVisible(false); setPanelTitle('PANEL'); sidepanel.innerHTML='';
    setChatWidthWide(false); showRightPanel(false);
    renderHomeSidebar();
    setActiveQuest(null);
    membersSection.classList.remove('live-chat');
    updateTopbarToggles();

    if(!gameId){
      content.innerHTML = `
        <h2 class="section-title">Browse Games</h2>
        <div class="grid grid-4">
          ${GAMES.map(g=>`
            <div class="card game" data-game="${g.id}">
              <img class="thumb" src="${g.cover}" alt="">
              <div class="card__body"><div class="title">${g.name}</div><div class="sub">Tap to view streamers</div></div>
            </div>`).join('')}
        </div>`;
      $$('.card.game').forEach(el=>el.onclick=()=>renderBrowse(el.dataset.game));
      return;
    }

    const g = GAMES.find(x=>x.id===gameId);
    const list = STREAMERS.filter(s=>s.game===gameId && s.online);
    content.innerHTML = `
      <div class="hero" style="background-image:url('${g.cover}')"><div class="hero__overlay"></div><div class="hero__title">${g.name}</div></div>
      <h2 class="section-title">Live Now</h2>
      <div class="grid grid-3">
        ${list.map(s=>`
          <div class="card streamer" data-open="${s.id}">
            <img class="thumb" src="${g.cover}" alt="">
            <div class="streamer__row">
              <img class="avatar" src="${s.avatar}" alt="">
              <div class="meta">
                <div class="title namewrap"><span>${s.name}</span>${badgeGroup(s.badges || [], 14)}</div>
                <div class="sub">${g.name}</div>
              </div>
              <div class="pill pill-live">LIVE</div>
            </div>
          </div>`).join('')}
      </div>`;
    $$('[data-open]').forEach(c=>c.onclick=()=>openStreamer(c.dataset.open));
  }

  function renderQuests(){
    currentView='quests'; currentStreamer=null; chatFocus=false; currentCampaign=null; currentStreamerTab = null;
    setMenuActive('quests'); setHeader('NOIZ — Quests'); setRightToggleIcon('quests');
    setStreamerToggleVisible(false); setPanelTitle('QUESTS'); showRightPanel(true);
    renderHomeSidebar();
    setActiveQuest(null);
    membersSection.classList.remove('live-chat');
    updateTopbarToggles();

    content.innerHTML = `
      <h2 class="section-title">Campaigns</h2>
      <div class="grid grid-2">
        ${BRANDS.map(b=>`
          <div class="card brand" data-campaign="${b.id}">
            <img class="banner" src="${b.banner}" alt="">
            <div class="card__body">
              <div class="title">${b.name}</div>
              <div class="sub">${b.quests.length} quests • ${calcCampaignProgress(b)}% progress</div>
            </div>
          </div>`).join('')}
      </div>
      <p class="hint">Click a campaign to view details, progress, and rewards.</p>
    `;

    sidepanel.innerHTML = `
      ${BRANDS.map(b=>`
        <div class="questrow">
          <div class="questrow__top">
            <div class="questrow__title">${b.name}</div>
            <div class="questrow__rewards">${b.quests.length} quests</div>
          </div>
          <div class="progress__track small"><div class="progress__fill" style="width:${calcCampaignProgress(b)}%"></div></div>
          <button class="quest__cta" data-open-campaign="${b.id}">Open</button>
        </div>
      `).join('')}
    `;

    $$('[data-campaign]').forEach(c=>c.onclick=()=>renderCampaign(c.dataset.campaign));
    $$('[data-open-campaign]').forEach(b=>b.onclick=()=>renderCampaign(b.dataset.openCampaign));
  }

  function calcCampaignProgress(brand){
    const total = brand.quests.reduce((a,q)=>a+q.progress,0);
    return Math.round(total / Math.max(1, brand.quests.length));
  }
  function progressToLevel(pct){
    if (pct >= 80) return 5;
    if (pct >= 60) return 4;
    if (pct >= 40) return 3;
    if (pct >= 20) return 2;
    return 1;
  }

  function renderCampaign(brandId){
    const brand = BRANDS.find(b=>b.id===brandId);
    if(!brand) return renderQuests();
    currentView='campaign'; currentCampaign = brand.id; currentStreamerTab = null;
    setHeader(`Quests — ${brand.name}`);
    setRightToggleIcon('quests');
    setPanelTitle('QUESTS');
    showRightPanel(true);

    const pct = calcCampaignProgress(brand);
    const level = progressToLevel(pct);

    content.innerHTML = `
      <div class="campaign__hero" style="background-image:url('${brand.banner}')">
        <div class="campaign__overlay"></div>
        <button class="backpill" id="backToCampaigns" title="Back to Campaigns">← Campaigns</button>
        <div class="campaign__head">
          <div class="campaign__title">${brand.name}</div>
          <div class="campaign__subtitle">${brand.quests.length} quests</div>
        </div>
      </div>

      <div class="campaign__progress">
        <div class="cp__label">Campaign Progress</div>
        <div class="progress__track large"><div class="progress__fill" style="width:${pct}%"></div></div>
        <div class="cp__pct">${pct}%</div>
        <div class="cp__level">Level ${level}</div>
      </div>

      <h3 class="section-title">Rewards</h3>
      <div class="rewards__carousel">
        ${brand.rewards.map(r=>{
          const unlocked = level >= (r.reqLevel || 1);
          return `
          <div class="reward__card ${unlocked ? 'unlocked' : 'locked'}">
            <img src="${r.img}" alt="">
            <div class="reward__title">${r.title}</div>
            <div class="reward__footer">
              <span class="lvlbadge">Req Lv ${r.reqLevel || 1}</span>
              <span class="lockstate">${unlocked ? 'Unlocked' : 'Locked'}</span>
            </div>
          </div>`;
        }).join('')}
      </div>
    `;

    renderCampaignSideQuests(brand);

    $('#backToCampaigns')?.addEventListener('click', renderQuests);

    sidepanel.addEventListener('click', (e)=>{
      const btn = e.target.closest('.quest__cta');
      if(!btn) return;
      if (btn.dataset.track){
        const prg = parseInt(btn.dataset.progress || '0', 10);
        setActiveQuest('Quest: ' + btn.dataset.track, prg);
      }
    });

    setMenuActive('quests');
  }

  function renderMarket(){
    currentView='market'; currentStreamer=null; chatFocus=false; currentCampaign=null; currentStreamerTab = null;
    setMenuActive('market'); setHeader('NOIZ — Market'); setRightToggleIcon('members');
    setStreamerToggleVisible(false); setPanelTitle('PANEL'); sidepanel.innerHTML='';
    setChatWidthWide(false); showRightPanel(false);
    renderHomeSidebar();
    setActiveQuest(null);
    membersSection.classList.remove('live-chat');
    updateTopbarToggles();

    const types = Array.from(new Set(MARKET.map(i=>i.type)));
    let typeFilter = 'All';

    function draw(){
      const items = MARKET.filter(i => typeFilter==='All' ? true : i.type===typeFilter);
      content.innerHTML = `
        <div class="market__head">
          <h2 class="section-title">Market</h2>
          <div class="market__filters">
            <label for="marketTypeFilter">Type</label>
            <select id="marketTypeFilter">
              <option ${typeFilter==='All'?'selected':''}>All</option>
              ${types.map(t=>`<option ${t===typeFilter?'selected':''}>${t}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="grid grid-4">
          ${items.map(listingCard).join('')}
        </div>
      `;

      $('#marketTypeFilter')?.addEventListener('change', (e)=>{
        typeFilter = e.target.value || 'All';
        draw();
      });

      bindRedeemButtons(content);
    }

    draw();
  }

  function openStreamerTab(streamer, tab){
    currentStreamerTab = tab;
    setStreamerTabActive(tab);

    if (tab === 'profile') return renderStreamerProfile(streamer);
    if (tab === 'market')  return renderStreamerMarket(streamer);
    if (tab === 'vods')    return renderStreamerVods(streamer);
    if (tab === 'rules')   return renderStreamerRules(streamer);
  }

  function renderStreamerProfile(s){
    setHeader(`${s.name} — Profile`);
    setChatWidthWide(false);
    const badges = badgeGroup(s.badges || [], 18);
    content.innerHTML = `
      <div class="hero" style="background-image:url('${s.banner || 'https://picsum.photos/seed/b/1200/360'}')">
        <div class="hero__overlay"></div>
        <div class="hero__title">${s.name}</div>
      </div>
      <div class="profile__wrap">
        <div class="profile__toprow">
          <img class="profile__avatar" src="${s.avatar}" alt="${s.name}">
          <div class="profile__topmeta">
            <div class="profile__handle">${s.name} ${badges}</div>
            <div class="profile__bio">${s.bio || 'No bio yet.'}</div>
          </div>
        </div>
        <div class="profile__stats">
          <div class="stat"><div class="stat__num">${(s.stats?.followers||0).toLocaleString()}</div><div class="stat__label">Followers</div></div>
          <div class="stat"><div class="stat__num">${(s.stats?.subs||0).toLocaleString()}</div><div class="stat__label">Subs</div></div>
          <div class="stat"><div class="stat__num">${(s.stats?.hours||0).toLocaleString()}</div><div class="stat__label">Hours Streamed</div></div>
        </div>
      </div>
    `;
  }

  function renderStreamerMarket(s){
    setHeader(`${s.name} — Market`);
    setChatWidthWide(false);
    const items = MARKET.filter(i=>i.seller.id === s.id);
    content.innerHTML = `
      <div class="market__head">
        <h2 class="section-title">Creator Market</h2>
        <div class="hint">${items.length} listing${items.length!==1?'s':''} from ${s.name}</div>
      </div>
      <div class="grid grid-4">
        ${items.length ? items.map(listingCard).join('') : `<div class="empty">No listings yet.</div>`}
      </div>
    `;
    bindRedeemButtons(content);
  }

  function renderStreamerVods(s){
    setHeader(`${s.name} — VODs & Clips`);
    setChatWidthWide(false);
    const thumbs = Array.from({length:8}).map((_,i)=>`https://picsum.photos/seed/${s.id}vod${i}/480/270`);
    content.innerHTML = `
      <h2 class="section-title">VODs & Clips</h2>
      <div class="grid grid-3">
        ${thumbs.map(src=>`
          <div class="card">
            <img class="thumb" src="${src}" alt="">
            <div class="card__body">
              <div class="title">Highlight</div>
              <div class="sub">${s.name} • 1${Math.floor(Math.random()*9)} min</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderStreamerRules(s){
    setHeader(`${s.name} — Rules`);
    setChatWidthWide(false);
    const rules = [
      'Be kind — zero harassment / hate.',
      'No spoilers without tags.',
      'Keep it PG-13; no slurs.',
      'Mods reserve the right to timeout/ban.',
    ];
    content.innerHTML = `
      <h2 class="section-title">Channel Rules</h2>
      <ul class="rules__list">
        ${rules.map(r=>`<li>${r}</li>`).join('')}
      </ul>
      <p class="hint">Violations may result in timeouts or bans.</p>
    `;
  }

  function listingCard(i){
    return `
      <div class="listing">
        <div class="listing__media">
          <img src="${i.img}" alt="${i.name}">
          <div class="listing__cost" title="Cost in dB">
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/></svg>
            <span>${i.costDb} dB</span>
          </div>
        </div>
        <div class="listing__body">
          <div class="listing__title">${i.name}</div>
          <div class="listing__meta">${i.type}</div>
        </div>
        <div class="listing__seller">
          <img class="seller__avatar" src="${i.seller.avatar}" alt="${i.seller.handle}">
          <span class="seller__handle">${i.seller.handle}</span>
          <button class="btn buy__btn" data-buy="${i.id}">Redeem</button>
        </div>
      </div>
    `;
  }
  function bindRedeemButtons(scope){
    scope.querySelectorAll('[data-buy]')?.forEach(btn=>{
      btn.addEventListener('click', ()=>{
        btn.textContent = 'Redeemed';
        btn.disabled = true;
        btn.classList.add('disabled');
      });
    });
  }

  function openStreamer(id){
    const s = STREAMERS.find(x=>x.id===id);
    if(!s) return;
    currentView = 'streamer'; currentStreamer = s; chatFocus = false; currentStreamerTab = null; lastSidepanelMode = null; sidepanelBackTarget = null;
    setMenuActive(null);
    setHeader(`${s.name} — ${s.online ? 'Live' : 'Offline'}`);
    setStreamerToggleVisible(true);

    if (s.online) {
      renderStreamerSidebar(s, false);
      setRightToggleIcon('chat'); setPanelTitle('LIVE CHAT');
      setChatWidthWide(true); showRightPanel(true);
      renderLivePlayer(s);
      renderLiveChat(s);
      if (s.activeQuest) setActiveQuest('Quest: ' + s.activeQuest.name, s.activeQuest.progress);
      else setActiveQuest(null);
    } else {
      renderStreamerSidebar(s, true);
      setRightToggleIcon('members'); setPanelTitle('MEMBERS');
      setChatWidthWide(false); showRightPanel(true);
      renderOfflineChat(s);
      renderMembersRoster(s);
      setActiveQuest(null);
    }
    updateTopbarToggles();
  }

  function renderLivePlayer(s){
    const g = GAMES.find(x=>x.id===s.game);
    const badges = badgeGroup(s.badges || [], 14);
    content.innerHTML = `
      <div class="player__container">
        <div class="video__area">
          <div class="video__placeholder">NOIZ Player — ${g?.name || ''}</div>
          <div class="video__badges"><span class="pill pill-live">LIVE</span></div>
        </div>
        <div class="stream__meta">
          <h1 class="stream__title">${s.name}</h1>
          <div class="stream__sub">
            <img src="${s.avatar}" class="creator__avatar" alt="">
            <div class="creator__block">
              <div class="creator__namewrap"><span class="creator__name">${s.name}</span> <span class="creator__badges">${badges}</span></div>
              <div class="creator__game">${g?.name || ''}</div>
            </div>
            <div class="actions__row">
              <button class="btn btn-primary">Follow</button>
              <button class="btn btn-success">⚡︎ Support</button>
              <button class="btn btn-ghost">Share</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /* ==== Live right-panel chat as message list with image badges + announcement ==== */
  function liveBadgeCodes(i){
    const set = [
      ['sub','vip'],
      ['vip'],
      ['mod'],
      ['sub']
    ];
    return set[i % set.length];
  }
  function renderLiveChat(s){
    membersSection.classList.add('live-chat');
    setPanelTitle('LIVE CHAT');
    lastSidepanelMode = 'livechat';

    const msgs = Array.from({length:12}).map((_,i)=>{
      const badges = badgeGroup(liveBadgeCodes(i), 16);
      return `
      <div class="chatmsg" data-handle="@user${i}" data-avatar="https://picsum.photos/seed/c${i}/35" data-status="● online">
        <img class="msg__avatar" src="https://picsum.photos/seed/c${i}/35" alt="">
        <div class="msg__body">
          <div class="msg__meta">
            <span class="namewrap"><span class="name clickable">@user${i}</span>${badges}</span>
            <span class="time">${String(12 + (i%12)).padStart(2,'0')}:${String(3*i%60).padStart(2,'0')}</span>
          </div>
          <div class="msg__text">Let’s gooo! #${i}</div>
        </div>
      </div>`;}).join('');

    const announcement = `
      <div class="chatmsg announcement">
        <div class="announce__icon">★</div>
        <div class="announce__text"><strong>Stream Announcement:</strong> Drops enabled for the next 60 minutes. Link your account to earn rewards!</div>
      </div>
    `;

    sidepanel.innerHTML = announcement + msgs;
    ensureSideInputVisibility();
  }

  /* ==== Live main chat (chat-focus mode) with image badges + sticky footer ==== */
  function renderLiveMainChat(s){
    content.innerHTML = `
      <div class="chatview">
        <div class="messages">
          <div class="message">
            <img class="chat__user__avatar" src="${s.avatar}" alt="">
            <div class="message__content">
              <h5 class="user__name namewrap"><span>${s.name}</span>${badgeGroup(s.badges || [], 16)}</h5>
              <p>Live chat focused. Player is hidden.</p>
            </div>
          </div>
          ${Array.from({length:10}).map((_,i)=>`
            <div class="message">
              <img class="chat__user__avatar" src="https://picsum.photos/seed/u${i}/45" alt="">
              <div class="message__content">
                <h5 class="user__name namewrap"><span>@fan${i}</span>${badgeGroup(liveBadgeCodes(i), 16)}</h5>
                <p>Vibes immaculate ${i}</p>
              </div>
            </div>`).join('')}
        </div>
        <div class="chatfooter">
          <input id="centerChatInput" class="textinput" type="text" placeholder="Send a message…" />
          <div class="chat__icons pill-icons">
            <svg width="22" height="22" viewBox="0 0 24 24" title="Emotes"><path fill="currentColor" d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2Zm-3.5 7A1.5 1.5 0 1 1 12 9.5 1.5 1.5 0 0 1 8.5 9Zm8 0A1.5 1.5 0 1 1 18 9.5 1.5 1.5 0 0 1 16.5 9ZM7 14a5 5 0 0 0 10 0H7Z"/></svg>
            <svg width="22" height="22" viewBox="0 0 24 24" title="Send a Gift"><path fill="currentColor" d="M20 7h-2.18a3 3 0 1 0-5.64-2H12a3 3 0 1 0-5.82 2H4a2 2 0 0 0-2 2v2h20V9a2 2 0 0 0-2-2ZM2 13v6a2 2 0 0 0 2 2h7v-8H2Zm11 8h7a2 2 0 0 0 2-2v-6h-9v8Z"/></svg>
          </div>
        </div>
      </div>
    `;
  }

  /* ==== Offline center chat with image badges + sticky footer ==== */
  function renderOfflineChat(s){
    membersSection.classList.remove('live-chat');
    lastSidepanelMode = 'members';
    content.innerHTML = `
      <div class="chatview">
        <div class="messages">
          <div class="message">
            <img class="chat__user__avatar" src="${s.avatar}" alt="">
            <div class="message__content">
              <h5 class="user__name namewrap"><span>${s.name}</span>${badgeGroup(s.badges || [], 16)}</h5>
              <p>Welcome to the channel! Leave a note while I'm offline.</p>
            </div>
          </div>
          <div class="message">
            <img class="chat__user__avatar" src="https://picsum.photos/seed/u2/45" alt="">
            <div class="message__content">
              <h5 class="user__name namewrap"><span>@fan</span>${badgeGroup(['sub'], 16)}</h5>
              <p>Can’t wait for the next stream!</p>
            </div>
          </div>
        </div>
        <div class="chatfooter">
          <input id="noteInput" class="textinput" type="text" placeholder="Leave a note for ${s.name}…" />
          <div class="chat__icons pill-icons">
            <svg width="22" height="22" viewBox="0 0 24 24" title="Emotes"><path fill="currentColor" d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2Zm-3.5 7A1.5 1.5 0 1 1 12 9.5 1.5 1.5 0 0 1 8.5 9Zm8 0A1.5 1.5 0 1 1 18 9.5 1.5 1.5 0 0 1 16.5 9ZM7 14a5 5 0 0 0 10 0H7Z"/></svg>
            <svg width="22" height="22" viewBox="0 0 24 24" title="Send a Gift"><path fill="currentColor" d="M20 7h-2.18a3 3 0 1 0-5.64-2H12a3 3 0 1 0-5.82 2H4a2 2 0 0 0-2 2v2h20V9a2 2 0 0 0-2-2ZM2 13v6a2 2 0 0 0 2 2h7v-8H2Zm11 8h7a2 2 0 0 0 2-2v-6h-9v8Z"/></svg>
          </div>
        </div>
      </div>
    `;
  }

  function buildMockUser(handle, avatar, status){
    return {
      handle,
      avatar,
      status: status || '● online',
      bio: 'Just vibing on NOIZ.',
      badges: ['founder','topgifter','day1'],
      followsSince: (2020 + Math.floor(Math.random()*4)),
      msgs: 100 + Math.floor(Math.random()*900),
    };
  }

  function renderMiniProfile(user){
    lastSidepanelMode = 'profile';
    ensureSideInputVisibility();
    setPanelTitle('PROFILE');
    membersSection.classList.remove('live-chat');

    sidepanel.innerHTML = `
      <div class="mini__header">
        <button class="mini__back" id="miniBack">← Back</button>
      </div>
      <div class="mini__profile">
        <img class="mini__avatar" src="${user.avatar}" alt="${user.handle}">
        <div class="mini__handle namewrap"><span>${user.handle}</span>${badgeGroup(user.badges || [], 18)}</div>
        <div class="mini__status">${user.status}</div>
        <div class="mini__bio">${user.bio}</div>

        <div class="mini__actions">
          <button class="btn btn-primary">Follow</button>
          <button class="btn btn-ghost">Message</button>
        </div>

        <div class="mini__stats">
          <div class="ministat">
            <div class="ministat__num">${user.msgs.toLocaleString()}</div>
            <div class="ministat__label">Messages</div>
          </div>
          <div class="ministat">
            <div class="ministat__num">${user.followsSince}</div>
            <div class="ministat__label">Since</div>
          </div>
        </div>

        <div class="mini__badges">${badgeGroup(user.badges || [], 18)}</div>
      </div>
    `;

    $('#miniBack')?.addEventListener('click', ()=>{
      if (sidepanelBackTarget === 'livechat' && currentStreamer?.online){
        renderLiveChat(currentStreamer);
      } else {
        if (currentStreamer) renderMembersRoster(currentStreamer);
      }
      ensureSideInputVisibility();
    });
  }

  /* Click on names to open mini profile (works for member rows and live chat messages) */
  sidepanelScroll.addEventListener('click', (e)=>{
    const row = e.target.closest('.member__name__container, .chatmsg');
    if (!row) return;

    sidepanelBackTarget = lastSidepanelMode;

    const handle = row.dataset.handle || row.querySelector('.name')?.textContent || '@user';
    const avatar = row.dataset.avatar || row.querySelector('.msg__avatar')?.src || 'https://picsum.photos/seed/u/48';
    const status = row.dataset.status || '● online';
    renderMiniProfile(buildMockUser(handle, avatar, status));
  });

  function bindAppMenu(){
    $('#noizMenu')?.addEventListener('click', (e)=>{
      const item = e.target.closest('.chat__title');
      if (!item) return;
      const view = item.dataset.view;
      if (view==='discover') return renderDiscover();
      if (view==='browse')   return renderBrowse();
      if (view==='quests')   return renderQuests();
      if (view==='market')   return renderMarket();
    });
  }
  bindAppMenu();

  $('#streamerRail')?.addEventListener('click', (e)=>{
    const el = e.target.closest('.server__logo');
    if (!el) return;
    const id = el.dataset.streamer;
    if (id) openStreamer(id);
  });

  rightToggle.addEventListener('click', ()=>{
    if (currentView==='streamer' && currentStreamer?.online && !chatFocus){
      showRightPanel(!membersOpen); updateTopbarToggles(); return;
    }
    showRightPanel(!membersOpen); updateTopbarToggles();
  });

  chatViewToggle.addEventListener('click', ()=>{
    if (!(currentView==='streamer' && currentStreamer?.online)) return;
    chatFocus = !chatFocus;
    if (chatFocus){
      renderStreamerSidebar(currentStreamer, true);
      layout.classList.add('chat-focus');
      setChatWidthWide(false);
      showRightPanel(false);
      setPanelTitle('PANEL');
      renderLiveMainChat(currentStreamer);
    } else {
      renderStreamerSidebar(currentStreamer, false);
      layout.classList.remove('chat-focus');
      setChatWidthWide(true);
      showRightPanel(true);
      renderLivePlayer(currentStreamer);
      renderLiveChat(currentStreamer);
    }
    updateTopbarToggles();
  });

  streamerToggle.addEventListener('click', ()=>{
    if (currentView==='streamer' && currentStreamer?.online && !chatFocus){
      showRightPanel(!membersOpen);
      updateTopbarToggles();
    }
  });

  /* === Badge Legend modal wiring === */
  const badgeModal = $('#badgeModal');
  const badgeLegendBtn = $('#badgeLegendBtn');
  function openBadgeModal(){
    const body = $('#badgeModalBody');
    body.innerHTML = Object.entries(BADGES).map(([k,b])=>{
      const icon = badgeImg(k, 18);
      return `<div class="legend__row"><span class="legend__icon">${icon}</span><div class="legend__meta"><div class="legend__label">${b.label}</div><div class="legend__desc">${b.desc||''}</div></div></div>`;
    }).join('');
    badgeModal.classList.remove('hidden');
    badgeModal.setAttribute('aria-hidden','false');
  }
  function closeBadgeModal(){
    badgeModal.classList.add('hidden');
    badgeModal.setAttribute('aria-hidden','true');
  }
  badgeLegendBtn?.addEventListener('click', openBadgeModal);
  badgeModal?.addEventListener('click', (e)=>{
    if (e.target.hasAttribute('data-close-modal')) closeBadgeModal();
  });
  document.addEventListener('keydown', (e)=>{ if (e.key==='Escape' && !badgeModal.classList.contains('hidden')) closeBadgeModal(); });

  document.addEventListener('keydown', (e)=>{
    if (e.key === 'ArrowLeft' && currentView === 'campaign') {
      renderQuests();
    }
  });

  document.querySelector('[data-nav="home"]')?.addEventListener('click', renderDiscover);
  renderDiscover();
