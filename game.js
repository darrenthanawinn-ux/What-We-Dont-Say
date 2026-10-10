'use strict';
/* WHAT WE DON'T SAY — a choice-driven narrative game. No dependencies. */
const $=s=>document.querySelector(s), clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const LS={get:(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}},set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const CFG=Object.assign({speed:3,music:5,sfx:6,fx:true},LS.get('wwds_cfg',{}));
const MS=[70,45,28,14,0];
let G=null;
const T={typing:false,lines:[],i:0,timer:null,full:'',el:null,pos:0,sc:null};

/* ---------- AUDIO ---------- */
const MOODS={calm:{n:[110,164.8,220,277.2],f:600,h:0},warm:{n:[130.8,164.8,196,261.6],f:900,h:0},tense:{n:[98,116.5,147,185],f:450,h:.12},dread:{n:[82.4,87.3,123.5,130.8],f:320,h:.3},hope:{n:[146.8,185,220,293.7],f:1100,h:0}};
const A={ctx:null,
init(){
  if(this.ctx){if(this.ctx.state==='suspended')this.ctx.resume();return}
  const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
  const c=this.ctx=new C();
  this.mg=c.createGain();this.mg.connect(c.destination);
  this.sg=c.createGain();this.sg.connect(c.destination);
  const f=this.filt=c.createBiquadFilter();f.type='lowpass';f.frequency.value=600;f.Q.value=2;
  const pg=this.pulse=c.createGain();pg.gain.value=.8;f.connect(pg);pg.connect(this.mg);
  this.oscs=[0,1,2,3].map(i=>{const o=c.createOscillator();o.type=i%2?'triangle':'sawtooth';o.detune.value=(i-1.5)*7;const g=c.createGain();g.gain.value=.18;o.connect(g);g.connect(f);o.start();return o});
  const l=c.createOscillator();l.frequency.value=.07;const lg=c.createGain();lg.gain.value=220;l.connect(lg);lg.connect(f.frequency);l.start();
  const h=c.createOscillator();h.frequency.value=1.15;this.hg=c.createGain();this.hg.gain.value=0;h.connect(this.hg);this.hg.connect(pg.gain);h.start();
  this.vol();this.mood(this.cur||'calm');
},
vol(){if(!this.ctx)return;this.mg.gain.value=CFG.music/10*.22;this.sg.gain.value=CFG.sfx/10*.5},
mood(m){this.cur=m;if(!this.ctx)return;const d=MOODS[m]||MOODS.calm,t=this.ctx.currentTime;
  this.oscs.forEach((o,i)=>o.frequency.setTargetAtTime(d.n[i],t,1.6));
  this.filt.frequency.setTargetAtTime(d.f,t,1.5);this.hg.gain.setTargetAtTime(d.h,t,1.5)},
tone(f,d=.12,type='sine',v=.3,slide=0){if(!this.ctx)return;const c=this.ctx,t=c.currentTime,o=c.createOscillator(),g=c.createGain();
  o.type=type;o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,f+slide),t+d);
  g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(this.sg);o.start(t);o.stop(t+d+.02)},
tick(){this.tone(900+Math.random()*200,.025,'square',.04)},
click(){this.tone(520,.08,'triangle',.25,-200)},
good(){this.tone(660,.3,'sine',.2);setTimeout(()=>this.tone(880,.4,'sine',.18),90)},
bad(){this.tone(180,.4,'sawtooth',.18,-90)},
glitch(){for(let i=0;i<4;i++)setTimeout(()=>this.tone(100+Math.random()*900,.06,'square',.1),i*45)},
sting(){this.tone(60,1.4,'sine',.5,-20)}};

/* ---------- PARTICLES ---------- */
const FX={c:null,x:null,p:[],mood:'calm',
init(){this.c=$('#fx');this.x=this.c.getContext('2d');const rs=()=>{this.c.width=innerWidth;this.c.height=innerHeight};rs();addEventListener('resize',rs);
  for(let i=0;i<70;i++)this.p.push({x:Math.random(),y:Math.random(),r:Math.random()*2+.5,s:Math.random()*.0004+.0001,a:Math.random()*6});
  const loop=()=>{this.draw();requestAnimationFrame(loop)};loop()},
draw(){const {x,c}=this;x.clearRect(0,0,c.width,c.height);const st=G?G.m/12:0,col=this.mood==='dread'?'255,90,110':this.mood==='warm'||this.mood==='hope'?'255,220,160':'190,170,255';
  this.p.forEach(p=>{p.a+=.02;p.y-=p.s*(1+st*4);p.x+=Math.sin(p.a)*.0003*(1+st*6);if(p.y<-.02){p.y=1.02;p.x=Math.random()}
    x.fillStyle=`rgba(${col},${.15+.25*Math.abs(Math.sin(p.a))})`;x.beginPath();x.arc(p.x*c.width,p.y*c.height,p.r,0,6.3);x.fill()})}};

/* ---------- STORY ---------- */
const S={};
const sc=(id,o)=>{S[id]=o};
const J='Jun',P='Priya',TH='Theo';
const visits=g=>['visJun','visPri','visHale'].filter(k=>g.f[k]).length;
const ending=g=>{const f=g.f.final;if(f==='deny')return'e_denial';if(f==='dani')return'e_hollow';if(f==='walk')return'e_fracture';return(g.t>=5&&g.r.jun+g.r.pri>=3)?'e_truth':'e_rebuild'};

/* ACT I */
sc('a1_tower',{act:'ACT I|Middle School Echoes',bg:'dusk',mood:'warm',t:[
 "The last bell of eighth grade rang forty minutes ago. None of us went home.",
 "The old water tower behind Marlow Middle still holds the day's heat. Four of us on the catwalk, legs dangling, Jun's speaker playing something tinny and soft.",
 "Priya counts what we have left: nine weeks until high school. Theo swears he'll be famous by October. Jun says nothing, thumbnail scraping at a bottle cap.",
 "There should be five of us up here. Nobody mentions the empty space on the left, where Wren always sat.",
 "Theo clears his throat. “Okay. It's time. The Pact.”"],
 c:[{x:"Take the bottle cap and swear first.",e:{t:1,m:1,theo:1},f:{sworefirst:1},n:'a1_pact'},
    {x:"Say you're not sure this is a good idea.",e:{t:-1,m:1,jun:1,pri:1},f:{doubted:1},n:'a1_pact'},
    {x:"Crack a joke to break the tension.",e:{s:1,theo:1},n:'a1_pact'}]});

sc('a1_pact',{bg:'dusk',mood:'tense',t:[
 "Theo scratches it into the cap with his house key, tongue between his teeth, like a kid doing homework. Four rules.",
 "“One. We never talk about the quarry. Two. We never talk about that night. Three. Wren moved to her dad's in Oregon — that's all anyone needs to know.”",
 "“Four,” says Jun, very quietly. “Whatever any of us remember, we remember it the same way.”",
 "Priya's hands won't stop shaking. Jun is looking at you — not at the cap, at you — the way you'd watch a glass near the edge of a table.",
 [g=>g.f.sworefirst,"Your own voice was the first to say “I swear.” It came out steady. That bothers you more than it should."],
 [g=>g.f.doubted,"You said you weren't sure. Theo rolled his eyes, but Jun's shoulders dropped an inch, like he'd been waiting for someone to say it."]],
 c:[{x:"Put an arm around Priya.",e:{pri:2,t:1},n:'a1_summer'},
    {x:"Ask Jun if he's okay.",e:{jun:2,m:1},f:{junwatching:1},n:'a1_summer'},
    {x:"Pocket the bottle cap. Someone should keep it.",e:{m:1,theo:-1},f:{cap:1},n:'a1_summer'}]});

sc('a1_summer',{bg:'night',mood:'calm',t:[
 "Summer is a long held breath. We text less every week. Priya sends photos of her dog. Theo goes quiet. Jun never answers.",
 "You sleep badly. Some nights you wake up with your hands wet and no idea why.",
 "The night before high school, your phone lights the ceiling.",
 ">Unknown: see you tomorrow. you haven't forgotten, have you? — W"],
 c:[{x:"Reply: “Who is this?”",e:{m:1},f:{replied:1},n:'a2_hall'},
    {x:"Delete it and block the number.",e:{m:1},f:{blocked:1},n:'a2_hall'},
    {x:"Screenshot it and send it to Priya.",e:{t:1,pri:1},f:{toldpri:1},n:'a2_hall'}]});

/* ACT II */
sc('a2_hall',{act:'ACT II|The High School Fracture',bg:'hall',mood:'tense',t:[
 "Westbrook High is two thousand people and one long fluorescent hallway. By second period our group has been scattered across four different schedules.",
 "On the steps you collide with Dani Voss, a freshman who already has eleven thousand followers and a laugh like a verdict. “Marlow, right? You've got a look. Like someone who knows where the bodies are.”",
 "She means it as a joke. You laugh half a second too late.",
 [g=>g.f.replied,"Your phone buzzes: no reply to your message. Just a read receipt, timestamped 3:11 AM."],
 "At lunch the cafeteria sorts itself like iron filings. Theo is already at Dani's table, waving you over with both arms. Jun and Priya sit alone at the end of a long bench, saving two seats."],
 c:[{x:"Sit with Jun and Priya.",e:{t:1,jun:1,pri:1,s:-1},f:{loyal:1},n:'a2_text'},
    {x:"Join Theo at Dani's table.",e:{s:2,theo:1,jun:-1,pri:-1,t:-1},f:{dani:1},n:'a2_text'},
    {x:"Eat alone in the library.",e:{s:-1,m:-1},f:{alone:1},n:'a2_text'}]});

sc('a2_text',{bg:'phone',mood:'tense',t:[
 [g=>g.f.loyal,"Jun slides you a fry without looking up. Priya is almost laughing. For a second it's June again, and nothing happened."],
 [g=>g.f.dani,"Dani's table laughs at everything Theo says. Across the room Jun and Priya watch you like you've changed zip codes."],
 [g=>g.f.alone,"The library smells like dust and radiator heat. Safe. Quiet. Wrong."],
 "Your phone vibrates against your leg.",
 ">W: proud of you. day one. room 214 at 3:15. he's expecting you.",
 "You never told anyone about a meeting."],
 c:[{x:"Go to room 214.",e:{t:1},n:'a2_hale'},
    {x:"Ignore it. Whoever it is can wait.",e:{m:1,s:1},f:{skiphale:1},n:'a2_hale'}]});

sc('a2_hale',{bg:'warm',mood:'warm',t:[
 [g=>g.f.skiphale,"You manage exactly one day. Next morning Mr. Hale is at your locker, tired kind eyes, a mug that says WORLD'S OKAYEST COUNSELOR. “Room 214. Walk with me.”"],
 [g=>!g.f.skiphale,"Room 214 smells like coffee and old paper. Mr. Hale, the counselor, has tired kind eyes and a mug that says WORLD'S OKAYEST COUNSELOR."],
 "“Welcome to Kindred,” he says. “A year-long peer program. Twelve freshmen, weekly circles, something called a memory map. You were selected from the survey you filled out in June.”",
 "You don't remember a survey. Then you see the roster on the whiteboard: Jun. Priya. Theo. Dani Voss. Your name, in his handwriting.",
 "“Think of it as a place to put things down,” Hale says. “Even the things you've stopped carrying on purpose. Even the Eastern Ledge.”",
 "The room tilts. Nobody outside the four of us has ever heard that name."],
 c:[{x:"“How do you know that name?”",e:{m:1,t:-1},f:{confronted:1},n:'a2_circle'},
    {x:"Say nothing. Watch his face.",e:{m:1},f:{observed:1},n:'a2_circle'},
    {x:"Smile and say you're excited to join.",e:{s:1,t:1},f:{joinedproj:1},n:'a2_circle'}]});

sc('a2_circle',{bg:'warm',mood:'tense',t:[
 "First circle. Hale hands out paper and pencils. “Draw the place that mattered most to you last year. Don't explain it.”",
 "Jun draws the water tower, every rivet. Priya draws a bedroom with the light on. Theo draws nothing and calls it ‘minimalism.’ Dani draws a swimming pool, laughing.",
 "Your pencil is already moving."],
 c:[{x:"Draw the water tower. Safe.",e:{m:-1},n:'a2_rumor'},
    {x:"Draw the quarry. All of it.",e:{m:2,t:1,jun:-1},f:{drewquarry:1},n:'a2_rumor'},
    {x:"Leave the page blank.",e:{m:1,theo:1},n:'a2_rumor'}]});

sc('a2_rumor',{bg:'hall',mood:'tense',t:[
 "October. The leaves outside turn the color of old bruises, and the friend group stops being a group and becomes four people who happen to know each other.",
 "In the cafeteria Dani leans across the table. “Okay, random. Someone from Marlow said a girl in your grade, like, died at a quarry?”",
 "The noise around you drops out. Theo laughs, too loud. “She moved to Oregon, Dani. Jeez.”",
 "Priya goes white. Her chair scrapes the floor. Jun is staring at you, not at her."],
 c:[{x:"Go after Priya. Tell Dani to shut up.",e:{pri:2,theo:-2,s:-2,t:1},n:'a2_jun'},
    {x:"Laugh along with Theo.",e:{s:2,theo:1,pri:-2,t:-2,m:1},f:{laughed:1},n:'a2_jun'},
    {x:"Calmly tell Dani the story's wrong. End of conversation.",e:{s:-1,t:2,jun:1,m:1},n:'a2_jun'}]});

sc('a2_jun',{bg:'night',mood:'tense',t:[
 "Rain on the bus shelter. Walking home from Kindred you see Jun sitting under the light, thumbs flying.",
 "He's holding two phones. One has a cracked screen and a faded sticker you almost recognize. The thread header reads: W.",
 "He sees you. His face does something complicated, and the cracked phone vanishes into his hoodie."],
 c:[{x:"Follow him when he leaves.",e:{m:2,jun:-1},f:{followedjun:1},n:'a2_party'},
    {x:"“Who's W, Jun?”",e:{jun:1,t:1,m:1},f:{askedjun:1},n:'a2_party'},
    {x:"Pretend you saw nothing.",e:{m:1},n:'a2_party'}]});

sc('a2_party',{bg:'party',mood:'tense',t:[
 [g=>g.f.askedjun,"“My cousin,” Jun had said. “It's my cousin.” He is the worst liar you have ever loved."],
 "Halloween at Dani's. Bass in the floorboards, someone dressed as a cartoon banana, red cups going hand to hand.",
 "On the porch Theo is swaying, face wet. He grabs your jacket. “You don't even remember, do you? You were the one who —”",
 "Dani hauls him off by the arm. Priya appears out of the dark in a pale ghost costume, the only person here who looks like she means it.",
 "“I need to show you something,” she whispers. “Not here.”"],
 c:[{x:"Leave with Priya.",e:{pri:1,t:1},f:{priyaclue:1},n:'a2_glitch'},
    {x:"Stay and make Theo finish his sentence.",e:{theo:1,m:2,s:1},f:{theoclue:1},n:'a2_glitch'},
    {x:"Walk home alone.",e:{m:1,t:-1},n:'a2_glitch'}]});

sc('a2_glitch',{bg:'phone',mood:'dread',t:[
 "3:07 AM. Your phone lights up with a photo from W.",
 "Five of us at the lip of a stone ledge, night-blue and grinning. Wren in the middle. Jun. Priya. Theo.",
 "And you — hair wet, in a red jacket you don't own.",
 "%The time stamp reads 06/14, 9:41 PM. The night you remember lying in bed with a 103 fever, listening to rain.",
 "%You were sick. You were home. You were home. You were —",
 "The picture refuses to be wrong."],
 c:[{x:"Zoom in on your own face.",e:{m:2},f:{zoomed:1},n:'hub'},
    {x:"It's edited. It has to be edited.",e:{m:1,t:-1},f:{denied1:1},n:'hub'}]});

sc('hub',{bg:'night',mood:'dread',t:[
 "Winter Formal is next weekend. You have time for the truth, but not all of it, and not forever.",
 [g=>visits(g)===0,"Three doors. Pick one."],
 [g=>visits(g)===1,"One door open. Two left."],
 [g=>visits(g)===2,"Two doors behind you. You know enough to stop pretending."],
 [g=>visits(g)===3,"Every door is open now. Only one place left to go."]],
 c:[{x:"Confront Jun about the second phone.",if:g=>!g.f.visJun,n:'t_jun',e:{}},
    {x:"Go to Priya's house. She has something to show you.",if:g=>!g.f.visPri,n:'t_pri',e:{}},
    {x:"Stay after circle and corner Mr. Hale.",if:g=>!g.f.visHale,n:'t_hale',e:{}},
    {x:"Enough. Go to the quarry.",if:g=>visits(g)>=2,n:'a3_quarry',e:{}}]});

sc('t_jun',{bg:'night',mood:'tense',t:[
 "Jun's bedroom, 11 PM. He doesn't deny it. He puts the cracked phone on the desk between you like surrendering a weapon.",
 "“I bought it in June. I made her account from her old handle. You were walking around saying ‘Oregon’ like a word you'd practiced. You stopped sleeping. Hale said if you ever remembered, it had to be gently.”",
 "“I wanted it to come from me instead of some stranger. I'm sorry it felt like being haunted.”",
 "His voice breaks on the last word."],
 c:[{x:"“Thank you for not letting me disappear.”",e:{jun:2,t:1},f:{visJun:1},n:'hub'},
    {x:"“You lied to me for four months.”",e:{jun:-2,m:1},f:{visJun:1},n:'hub'},
    {x:"“Was I there that night, Jun?”",e:{m:2,jun:1},f:{visJun:1,askedwas:1},n:'hub'}]});

sc('t_pri',{bg:'warm',mood:'dread',t:[
 "Priya's room: the lamp on, the dog asleep on the rug, her laptop open to a file named DO_NOT_OPEN.",
 "“I never deleted it,” she says. “I couldn't.”",
 "%Forty-one seconds. Wet stone. Five silhouettes. A voice bright and brittle that sounds exactly like yours: “Do it, Wren. You said you would. Three. Two —”",
 "%Then a sound that doesn't stop. Then the picture swings away and goes dark.",
 "Priya is crying without making any noise. “You ran. We found you in your kitchen washing your hands, saying you'd been sick all night. You believed it. So we decided: if you needed it that way, we'd keep it that way.”",
 "“The Pact was never to protect us. It was to protect you.”"],
 c:[{x:"Hold Priya while you both shake.",e:{pri:2,t:2,m:1},f:{visPri:1},n:'hub'},
    {x:"Push the laptop away. “Turn it off.”",e:{pri:-1,m:2},f:{visPri:1,denied2:1},n:'hub'},
    {x:"“What happened to Wren?”",e:{m:1,t:1},f:{visPri:1},n:'hub'}]});

sc('t_hale',{bg:'warm',mood:'tense',t:[
 "After the others leave, Mr. Hale doesn't pretend to be surprised.",
 "“Wren Castellan is my niece,” he says. “She's alive. It took a long time, and some of it still hurts, but she's alive. She asked me to bring the four of you into one room.”",
 "“Kindred isn't an experiment. Though I understand why it felt like one. Your parents signed the surveys. Dani is here because she's the kind of person you'd lie to — I needed to see who you'd be when you weren't safe.”",
 "It's both kind and not kind, and he knows it."],
 c:[{x:"“Thank you for telling me.”",e:{t:1,m:-1},f:{visHale:1},n:'hub'},
    {x:"“You used us.”",e:{t:-1,m:1,s:1},f:{visHale:1},n:'hub'},
    {x:"“Can I see her?”",e:{t:2,m:1},f:{visHale:1,askwren:1},n:'hub'}]});

/* ACT III */
sc('a3_quarry',{act:'ACT III|The Eastern Ledge',bg:'quarry',mood:'dread',t:[
 "The quarry at night is enormous and perfectly still. Black water. A wire fence someone has cut open and tied shut again.",
 "In your backpack: a red jacket you pulled from the back of your closet yesterday. It still smells like river water.",
 [g=>g.r.jun>=1,"Jun's bike is already there, leaning on the fence."],
 [g=>g.r.pri>=1,"Priya stands at the edge of the light, holding her own elbows."],
 [g=>g.r.theo>=1,"Theo is sitting on the cold stone, not drunk now, not loud."],
 [g=>g.r.jun<1&&g.r.pri<1&&g.r.theo<1,"You're alone. Whatever happens, it will happen the way you've done everything lately — quietly."],
 "You step onto the Eastern Ledge.",
 "%It's not a memory. It's a door that was never shut."],
 c:[{x:"Let it come.",n:'a3_flash',e:{m:1}}]});

sc('a3_flash',{bg:'memory',mood:'dread',t:[
 "%June 14th. You were the one with the camera. You were the loud one. You were the one who said ‘dare you.’",
 "%Wren laughed, shook her head, said no twice. You said ‘you promised.’ She wore her red jacket. She lent it to you when you got cold.",
 "%‘Three. Two —’ The stone was wet from the afternoon rain.",
 "%The sound. The camera falling. Four people screaming her name down into the dark.",
 "%You ran. You ran until your lungs were fire. You washed your hands in the kitchen sink until they stopped feeling like yours.",
 "%And by morning the story had sewn itself shut: a fever, a bed, the rain on the window. A kinder version, one you could survive.",
 "The quarry is quiet again. Everyone who loves you is standing very, very still."],
 c:[{x:"“It was me. I dared her.”",e:{m:2,t:2},f:{accepted:1},n:'a3_circle'},
    {x:"“No. That's not what happened.”",e:{m:2,t:-2},f:{denied:1},n:'a3_circle'},
    {x:"“It was an accident. We were kids.”",e:{m:1,t:1},f:{bargain:1},n:'a3_circle'}]});

sc('a3_circle',{bg:'stage',mood:'tense',t:[
 "Winter Formal, the empty auditorium after the dance. Mr. Hale has arranged the Kindred chairs in a circle under a single work light.",
 "Jun, Priya, Theo, Dani, a dozen others. Everyone has been told something. Everyone is waiting.",
 "The back doors open. A girl walks in with a cane and short, newly grown hair, slowly, like every step is a negotiation.",
 "Wren stops in front of you. She is smaller than you remember, and so much more present.",
 "“You still have my jacket.”",
 "She isn't smiling and she isn't angry. “I don't remember the fall,” she says. “I remember you counting. I need to hear you say it out loud. I think we both do.”"],
 c:[{x:"“I dared you. I filmed it. I ran. I am so sorry.”",if:g=>g.f.accepted||g.f.bargain||g.t>=4,e:{t:1},f:{final:'truth'},n:g=>ending(g)},
    {x:"“I wasn't there. I was sick. I was home.”",e:{m:2,t:-2},f:{final:'deny'},n:g=>ending(g)},
    {x:"Look at Dani's friends, and let the crowd carry you out.",if:g=>g.s>=3,e:{s:1,t:-1},f:{final:'dani'},n:g=>ending(g)},
    {x:"Turn and walk out of the auditorium.",e:{t:-1,m:1},f:{final:'walk'},n:g=>ending(g)}]});

/* ENDINGS */
sc('e_truth',{act:'ENDING|What the Water Kept',bg:'light',mood:'hope',end:true,id:'truth',t:[
 "You say it. All of it. It doesn't come out in order, and it doesn't come out brave, but it comes out.",
 "Wren is quiet for a long time. Then: “Thank you. I'm not ready to forgive you. But I'm ready to stand next to you while I decide.”",
 "Spring. The four of you plus one on the water tower, legs dangling, a new bottle cap between you with one rule scratched into it: we say it out loud.",
 "The memory has gaps and probably always will. Jun texts you from his own number now. Your hands stay dry at night.",
 "Some promises keep a secret. The better ones keep a person."]});
sc('e_rebuild',{act:'ENDING|A Smaller Pact',bg:'dusk',mood:'warm',end:true,id:'rebuild',t:[
 "You say it. The words are true. They land unevenly, and not everyone catches them.",
 "Wren nods once and leaves with Hale, and you understand that the road back is long and you've only walked the first step.",
 "Over the next year some friendships heal. Some don't. Theo transfers in the spring. Priya sits beside you at lunch, less afraid every month.",
 "You carry the red jacket in your bag until June. Then you leave it on a bench near the water tower where somebody who needs it might find it.",
 "It's not forgiveness. It's the first honest thing you've built since eighth grade."]});
sc('e_denial',{act:'ENDING|Static',bg:'dark',mood:'dread',end:true,id:'denial',t:[
 "“I wasn't there.” The words come out smooth and polished, because you've practiced them for months.",
 "Wren looks at you the way you look at a photograph of a stranger. She walks out with her cane tapping a slow rhythm.",
 "Jun's texts stop. Priya moves tables. Hale closes the project and the room goes dark.",
 "Years later you still wake at 3 AM with wet hands and a countdown behind your teeth.",
 "%Three. Two —",
 "If you listen closely, the static in the room sounds like water."]});
sc('e_hollow',{act:'ENDING|Applause',bg:'party',mood:'dread',end:true,id:'hollow',t:[
 "The crowd parts for you. Someone claps. Then everyone claps, because that's what the room does when someone important leaves.",
 "By spring you're the name people say with a smile. Dani's table is your table. Wren becomes a rumor, then a joke, then nothing.",
 "Every Friday at 3:15 your phone buzzes with a single message from W. You never open it. You never delete it.",
 "You are exactly as popular as you wanted to be. The silence you walk inside of is perfectly sound-proofed."]});
sc('e_fracture',{act:'ENDING|Fault Lines',bg:'night',mood:'dread',end:true,id:'fracture',t:[
 "The doors swing shut behind you. Nobody follows. That's the loudest part.",
 "Theo's phone gets passed around. Someone has the video. By Monday the whole school knows a version of the story, none of them the true one.",
 "Hale's project ends. Your parents move you to a school across town.",
 "The memory finds you anyway — two in the morning, on a bus, forehead on the cold window, all at once and completely alone.",
 "It's not too late. Doors you've already walked through can still be knocked on. But you'll have to be the one to turn around."]});

/* ---------- STATE / ENGINE ---------- */
const newState=n=>({scene:'a1_tower',name:n,s:0,m:0,t:0,r:{jun:0,pri:0,theo:0},f:{}});
const NAMES={jun:'Jun',pri:'Priya',theo:'Theo'};
let bgFlip=false;
function setBg(b){const A_=$('#bgA'),B_=$('#bgB'),n=bgFlip?A_:B_,o=bgFlip?B_:A_;n.className='bg on b-'+b;o.classList.remove('on');bgFlip=!bgFlip}
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(toast.h);toast.h=setTimeout(()=>e.classList.remove('on'),2200)}
function banner(a,cb){const[k,t]=a.split('|'),b=$('#banner');b.innerHTML=`<small>${k}</small><h2>${t}</h2>`;b.classList.add('on');A.sting();setTimeout(()=>{b.classList.remove('on');setTimeout(cb,700)},2600)}
function updateStress(){document.documentElement.style.setProperty('--v',(G.m/12).toFixed(2));$('#stage').classList.toggle('jit',CFG.fx&&G.m>=8)}
function snapshot(){return JSON.parse(JSON.stringify(G))}
function autosave(){LS.set('wwds_auto',{g:snapshot(),time:Date.now()})}

function show(id){
  const s=S[id];if(!s){console.error('Missing scene',id);return}
  G.scene=id;T.sc=s;autosave();
  setBg(s.bg||'night');A.mood(s.mood||'calm');FX.mood=s.mood||'calm';updateStress();
  $('#choices').innerHTML='';$('#text').innerHTML='';$('#cont').classList.remove('on');
  const go=()=>{T.lines=s.t.map(x=>Array.isArray(x)?(x[0](G)?x[1]:null):x).filter(Boolean).map(x=>x.split('{n}').join(G.name));T.i=0;typeIn(T.lines[T.i++])};
  if(s.act)banner(s.act,go);else go();
}
function typeIn(raw){
  clearInterval(T.timer);
  const tx=$('#text');[...tx.children].forEach(p=>p.classList.add('old'));while(tx.children.length>5)tx.removeChild(tx.firstChild);
  let cls='',s=raw;if(raw[0]==='%'){cls='mem';s=raw.slice(1)}else if(raw[0]==='>'){cls='msg';s=raw.slice(1)}
  const p=document.createElement('p');if(cls)p.className=cls;tx.appendChild(p);
  if(cls==='mem'){A.glitch();if(CFG.fx)A.sting()}else if(cls==='msg')A.good();
  $('#cont').classList.remove('on');T.el=p;T.full=s;T.pos=0;
  const ms=MS[CFG.speed-1];
  if(!ms){p.textContent=s;lineDone();return}
  T.typing=true;
  T.timer=setInterval(()=>{T.pos++;p.textContent=s.slice(0,T.pos);if(T.pos%3===0)A.tick();tx.parentElement.scrollTop=tx.parentElement.scrollHeight;
    if(T.pos>=s.length){clearInterval(T.timer);T.typing=false;lineDone()}},ms);
}
function lineDone(){const b=$('#box');b.scrollTop=b.scrollHeight;if(T.i>=T.lines.length)setTimeout(showChoices,250);else $('#cont').classList.add('on')}
function advance(){
  A.init();
  if(!G||!$('#panel').hidden||$('#game').hidden)return;
  if(T.typing){clearInterval(T.timer);T.typing=false;T.el.textContent=T.full;lineDone();return}
  if(T.i<T.lines.length&&!$('#cont').classList.contains('off'))typeIn(T.lines[T.i++]);
}
function showChoices(){
  const s=T.sc,box=$('#choices');if(box.children.length)return;
  $('#cont').classList.remove('on');
  if(s.end){return showEnd(s)}
  s.c.filter(c=>!c.if||c.if(G)).forEach((c,i)=>{
    const b=document.createElement('button');b.className='ch';b.style.animationDelay=i*.12+'s';b.innerHTML=`<b>${i+1}</b>${c.x.split('{n}').join(G.name)}`;
    b.onclick=()=>choose(c);box.appendChild(b)});
}
function choose(c){
  A.init();A.click();$('#choices').innerHTML='';
  const e=c.e||{};
  G.s=clamp(G.s+(e.s||0),-6,12);G.m=clamp(G.m+(e.m||0),0,12);G.t=clamp(G.t+(e.t||0),-6,12);
  let hint=null;
  ['jun','pri','theo'].forEach(k=>{const d=e[k]||0;if(d){G.r[k]=clamp(G.r[k]+d,-6,8);if(!hint)hint=d>0?`${NAMES[k]} will remember that.`:`${NAMES[k]} noticed.`}});
  if(c.f)Object.assign(G.f,c.f);
  if(hint)toast(hint);else if(e.m>=2)toast('Your pulse is loud in your ears.');else if(e.t>=2)toast('Something steadies.');
  if(hint&&hint.includes('remember'))A.good();else if(hint||e.m>=2)A.bad();
  show(typeof c.n==='function'?c.n(G):c.n);
}
function showEnd(s){
  const found=LS.get('wwds_end',{});found[s.id]=1;LS.set('wwds_end',found);
  const bar=(l,v,lo,hi)=>`<div class="bar"><i>${l}</i><div><u style="width:${Math.round((v-lo)/(hi-lo)*100)}%"></u></div></div>`;
  const e=document.createElement('div');e.id='endcard';
  e.innerHTML=`<h3>${s.act.split('|')[1]}</h3>${bar('Social Standing',G.s,-6,12)}${bar('Mental Stress',G.m,0,12)}${bar('Trust',G.t,-6,12)}${bar('Bond: Jun',G.r.jun,-6,8)}${bar('Bond: Priya',G.r.pri,-6,8)}${bar('Bond: Theo',G.r.theo,-6,8)}
  <p style="color:var(--dim);font-size:13px;margin:8px 0">Endings found: ${Object.keys(found).length} / 5</p>
  <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="sm" id="eAgain">Play again</button><button class="sm" id="eMenu">Main menu</button></div>`;
  $('#choices').appendChild(e);
  $('#eAgain').onclick=()=>{startNew(G.name)};$('#eMenu').onclick=toMenu;
  A.good();
}

/* ---------- MENUS / PANELS ---------- */
function panel(html){const p=$('#panel');p.innerHTML=`<div class="card">${html}</div>`;p.hidden=false}
function closePanel(){$('#panel').hidden=true}
function slotRow(i,mode){
  const d=i==='auto'?LS.get('wwds_auto',null):LS.get('wwds_slot'+i,null);
  const label=i==='auto'?'Autosave':'Slot '+i;
  const info=d?`${d.g.name} — ${d.g.scene.startsWith('a1')?'Act I':d.g.scene.startsWith('a3')||d.g.scene.startsWith('e_')?'Act III':'Act II'}<small>${new Date(d.time).toLocaleString()}</small>`:'<small>Empty</small>';
  const canSave=mode==='save'&&i!=='auto',canLoad=mode==='load'&&d;
  return `<div class="slot"><div><b>${label}</b> ${info}</div>${canSave||canLoad?`<button class="sm" data-slot="${i}">${mode==='save'?'Save':'Load'}</button>`:''}</div>`;
}
function openSlots(mode){
  panel(`<h2>${mode==='save'?'SAVE':'LOAD'}</h2>${['auto',1,2,3].map(i=>slotRow(i,mode)).join('')}<div class="btns"><button class="sm" id="pClose">Close</button></div>`);
  $('#pClose').onclick=closePanel;
  document.querySelectorAll('[data-slot]').forEach(b=>b.onclick=()=>{
    const i=b.dataset.slot;
    if(mode==='save'){LS.set('wwds_slot'+i,{g:snapshot(),time:Date.now()});toast('Saved to slot '+i);openSlots('save')}
    else{const d=i==='auto'?LS.get('wwds_auto'):LS.get('wwds_slot'+i);G=JSON.parse(JSON.stringify(d.g));closePanel();startPlay();show(G.scene)}});
}
function openSettings(){
  panel(`<h2>SETTINGS</h2>
  <div class="row">Text speed<input type="range" id="sSpd" min="1" max="5" value="${CFG.speed}"></div>
  <div class="row">Music volume<input type="range" id="sMus" min="0" max="10" value="${CFG.music}"></div>
  <div class="row">Sound effects<input type="range" id="sSfx" min="0" max="10" value="${CFG.sfx}"></div>
  <div class="row">Screen effects (jitter)<input type="checkbox" id="sFx" ${CFG.fx?'checked':''}></div>
  <p style="color:var(--dim);font-size:13px">Controls: click / Space / Enter to advance, number keys to choose, Esc to close menus.</p>
  <div class="btns"><button class="sm" id="pClose">Close</button></div>`);
  const sv=()=>{CFG.speed=+$('#sSpd').value;CFG.music=+$('#sMus').value;CFG.sfx=+$('#sSfx').value;CFG.fx=$('#sFx').checked;LS.set('wwds_cfg',CFG);A.init();A.vol();if(G)updateStress()};
  ['#sSpd','#sMus','#sSfx','#sFx'].forEach(s=>$(s).oninput=sv);$('#pClose').onclick=closePanel;
}
function openName(){
  panel(`<h2>NEW GAME</h2><p>What's your name?</p><input type="text" id="nm" maxlength="14" value="Alex"><div class="btns"><button class="sm" id="pClose">Cancel</button><button class="sm" id="nGo">Begin</button></div>`);
  $('#pClose').onclick=closePanel;$('#nm').focus();
  const go=()=>{const n=$('#nm').value.trim()||'Alex';closePanel();startNew(n)};
  $('#nGo').onclick=go;$('#nm').onkeydown=e=>{if(e.key==='Enter')go();e.stopPropagation()};
}
function startPlay(){$('#menu').hidden=true;$('#game').hidden=false;A.init();A.vol()}
function startNew(n){G=newState(n);startPlay();show('a1_tower')}
function toMenu(){G=null;closePanel();$('#game').hidden=true;$('#menu').hidden=false;$('#banner').classList.remove('on');document.documentElement.style.setProperty('--v',0);setBg('menu');A.mood('calm');FX.mood='calm';
  const f=Object.keys(LS.get('wwds_end',{})).length;$('#found').textContent=f?`Endings found: ${f} / 5`:''}

/* ---------- INIT ---------- */
FX.init();
$('#bNew').onclick=()=>{A.init();openName()};
$('#bLoad').onclick=()=>{A.init();openSlots('load')};
$('#bSet').onclick=()=>{A.init();openSettings()};
$('#tSave').onclick=()=>openSlots('save');$('#tLoad').onclick=()=>openSlots('load');
$('#tSet').onclick=openSettings;$('#tMenu').onclick=toMenu;
$('#box').onclick=advance;
addEventListener('keydown',e=>{
  if(e.key==='Escape'){closePanel();return}
  if(!G||!$('#panel').hidden)return;
  if(e.key===' '||e.key==='Enter'){e.preventDefault();advance()}
  else if(/^[1-9]$/.test(e.key)){const b=document.querySelectorAll('.ch')[+e.key-1];if(b)b.click()}
});
toMenu();
