const tabs = [...document.querySelectorAll('[data-tab]')];
const views = [...document.querySelectorAll('.view')];
const soundToggle = document.getElementById('soundToggle');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const gameShell = document.getElementById('gameShell');
const gameFrame = document.getElementById('scratchFrame');
const gameLoader = document.getElementById('gameLoader');
const fullscreenBackBtn = document.getElementById('fullscreenBackBtn');
const dialog = document.getElementById('soulDialog');
const dialogBody = document.getElementById('dialogBody');
const dialogClose = document.getElementById('dialogClose');

const souls = {
  red: { key:'red', title:'Red Soul', trait:'Determination', color:'#ff344b', copy:'The default soul style. Move freely in any direction with the arrow keys to avoid obstacles.' },
  blue: { key:'blue', title:'Blue Soul', trait:'Integrity', color:'#4f7cff', copy:'Move left and right normally, then use the up arrow to jump. This style uses platformer-like physics.' },
  green: { key:'green', title:'Green Soul', trait:'Kindness', color:'#4ee681', copy:'Your movement is replaced by defense. Use the arrow keys to turn a shield and block incoming attacks.' },
  purple: { key:'purple', title:'Purple Soul', trait:'Perseverance', color:'#a66bff', copy:'Move left and right, then use up and down to move along the next line. The result is a lane-based movement pattern.' },
  yellow: { key:'yellow', title:'Yellow Soul', trait:'Justice', color:'#ffd93d', copy:'Move similarly to the Red Soul and press Z to fire. This adds a shooting mechanic to the challenge.' },
  cyan: { key:'cyan', title:'Cyan Soul', trait:'Patience', color:'#36f6ff', copy:'This soul does not have dedicated playable mode in standard gameplay; Instead, its traits are expressed through attack mechanics.', game:'Stay completely still to avoid taking damage while they pass through your soul.' },
  orange: { key:'orange', title:'Orange Soul', trait:'Bravery', color:'#ff9a3c', copy:'This soul does not have dedicated playable mode in standard gameplay; Instead, its traits are expressed through attack mechanics.', game:'Keep moving continuously through them to prevent getting hurt.' }
};

let soundOn = false;
let audioCtx;

function blip(freq=420, duration=.035){
  if(!soundOn) return;
  try{
    audioCtx ??= new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type='square'; osc.frequency.value=freq;
    gain.gain.setValueAtTime(.025,audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+duration);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime+duration);
  }catch{}
}

function showTab(id){
  views.forEach(v=>v.classList.toggle('is-visible', v.dataset.view===id));
  document.querySelectorAll('.tab[data-tab]').forEach(t=>t.classList.toggle('is-active', t.dataset.tab===id));
  history.replaceState(null,'',`#${id}`);
  blip(440, .03);
  window.scrollTo({top:0,behavior:'smooth'});
}

tabs.forEach(el=>el.addEventListener('click',()=>showTab(el.dataset.tab)));

document.querySelectorAll('.soul-card, .soul-text-link').forEach(card=>{
  card.addEventListener('click',()=>{
    const s=souls[card.dataset.soul];
    dialogBody.innerHTML = `
      <div class="soul-dialog-body">
        <div class="dialog-soul" style="color:${s.color}">♥</div>
        <div class="dialog-title">${s.title}</div>
        <div class="dialog-sub">${s.trait}</div>
        <p class="dialog-copy">${s.copy}</p>
        <p class="dialog-copy"><span class="dialog-key">GAME</span> ${s.game || (s.key==='red'?'Open the Play tab to try it out.':s.key==='blue'?'Get 150 score in Red Soul to unlock.':s.key==='green'?'Get 150 score in Blue Soul to unlock.':s.key==='purple'?'Get 150 score in Green Soul to unlock.':'Get 150 score in Purple Soul to unlock.')}</p>
      </div>`;
    dialog.showModal(); blip(650,.05);
  });
});

dialogClose.addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{ if(e.target===dialog) dialog.close(); });

soundToggle.addEventListener('click',()=>{
  soundOn=!soundOn;
  soundToggle.textContent=soundOn?'🔊':'♫';
  soundToggle.setAttribute('aria-label', soundOn?'Turn UI sounds off':'Turn UI sounds on');
  blip(740,.04);
});

fullscreenBtn.addEventListener('click', async()=>{
  try{
    if(!document.fullscreenElement){
      if(gameShell.requestFullscreen) await gameShell.requestFullscreen();
      else if(gameShell.webkitRequestFullscreen) gameShell.webkitRequestFullscreen();
      else gameShell.classList.add('is-fullscreen');
    }else{
      await document.exitFullscreen();
    }
  }catch{
    gameShell.classList.toggle('is-fullscreen');
    updateFullscreenButton();
  }
});

fullscreenBackBtn.addEventListener('click', async()=>{
  try{
    if(document.fullscreenElement) await document.exitFullscreen();
  }catch{}
  gameShell.classList.remove('is-fullscreen');
  updateFullscreenButton();
  showTab('game');
});

function updateFullscreenButton(){
  const active = document.fullscreenElement===gameShell || gameShell.classList.contains('is-fullscreen');
  gameShell.classList.toggle('is-fullscreen', active);
  fullscreenBtn.textContent=active?'⛶ Exit fullscreen':'⛶ Fullscreen';
  fullscreenBackBtn.setAttribute('aria-hidden', active ? 'false' : 'true');
}

document.addEventListener('fullscreenchange', updateFullscreenButton);
document.addEventListener('webkitfullscreenchange', updateFullscreenButton);

gameFrame.addEventListener('load',()=>setTimeout(()=>gameLoader.classList.add('hidden'),450));

const hash = location.hash.replace('#','');
if(hash && document.getElementById(hash)) showTab(hash);
