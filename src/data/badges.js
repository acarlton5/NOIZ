export const BADGES = {
  sub:       { label:'Subscriber',  letter:'S', color:'#6c2cfc', desc:'Active subscription' },
  vip:       { label:'VIP',         letter:'V', color:'#00b8b6', desc:'Channel VIP' },
  mod:       { label:'Moderator',   letter:'M', color:'#3ceb18', desc:'Moderation privileges' },
  partner:   { label:'Partner',     letter:'P', color:'#ff5ab3', desc:'Official NOIZ partner' },
  verified:  { label:'Verified',    letter:'✓', color:'#5865f2', desc:'Verified identity' },
  drops:     { label:'Drops',       letter:'D', color:'#ff9f43', desc:'Drops enabled' },
  founder:   { label:'Founder',     letter:'F', color:'#b28cff', desc:'Early supporter' },
  topgifter: { label:'Top Gifter',  letter:'G', color:'#ffd84d', desc:'Top gift giver' },
  day1:      { label:'Day 1',       letter:'1', color:'#8bd3dd', desc:'OG member' },
};

export function badgeURI(letter, bg){
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'>
       <circle cx='10' cy='10' r='10' fill='${bg}'/>
       <text x='10' y='14' font-size='12' text-anchor='middle' fill='#ffffff' font-family='Rubik, Arial' font-weight='700'>${letter}</text>
     </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

export function badgeImg(code, size=16){
  const b = BADGES[code];
  if(!b) return '';
  const src = badgeURI(b.letter, b.color);
  return `<img class="badgeimg" src="${src}" width="${size}" height="${size}" alt="${b.label}" title="${b.label}">`;
}

export function badgeGroup(codes, size=16){
  if (!codes || !codes.length) return '';
  return `<span class="badges-img">${codes.map(c=>badgeImg(c, size)).join('')}</span>`;
}
