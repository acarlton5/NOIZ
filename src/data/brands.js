const BRANDS = [
  { id:'respawn', name:'RESPAWN', banner:'https://picsum.photos/seed/respawn/1200/360',
    rewards:[
      { id:'r1', title:'200 XP',        img:'https://picsum.photos/seed/xp200/160/160',    reqLevel:1 },
      { id:'r2', title:'+150 dB',       img:'https://picsum.photos/seed/db150/160/160',    reqLevel:2 },
      { id:'r3', title:'Neon Frame',    img:'https://picsum.photos/seed/neonframe/160/160',reqLevel:3 },
      { id:'r4', title:'Sticker Pack',  img:'https://picsum.photos/seed/respawnstick/160/160', reqLevel:4 },
    ],
    quests:[
      { id:'q1', title:'Win 2 ranked matches', xp:200, db:150, progress:40 },
      { id:'q2', title:'Deal 5,000 damage',    xp:300, db:200, progress:70 },
      { id:'q3', title:'Top-5 placement',      xp:180, db:120, progress:20 },
    ]
  },
  { id:'hyper', name:'Hyper Cola', banner:'https://picsum.photos/seed/hyper/1200/360',
    rewards:[
      { id:'r5', title:'Profile Effect', img:'https://picsum.photos/seed/effect/160/160', reqLevel:2 },
      { id:'r6', title:'+100 dB',        img:'https://picsum.photos/seed/db100/160/160',  reqLevel:1 },
      { id:'r7', title:'XP 300',         img:'https://picsum.photos/seed/xp300/160/160',  reqLevel:3 },
    ],
    quests:[
      { id:'q4', title:'Clip a 30s highlight', xp:100, db:50, progress:10 },
      { id:'q5', title:'Top 3 finish',         xp:220, db:120, progress:0 },
    ]
  },
];

export default BRANDS;
