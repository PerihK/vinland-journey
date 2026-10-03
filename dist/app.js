(() => {
  'use strict';
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
  const mix=(a,b,t)=>a+(b-a)*t;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const mobile=matchMedia('(max-width:650px)');
  document.documentElement.classList.add('js');
  setTimeout(()=>document.documentElement.classList.add('intro-done'),1800);
  const reveals=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('seen');reveals.unobserve(e.target);}}),{threshold:.12});
  $$('.reveal').forEach(el=>reveals.observe(el));

  // Preserve the original text and line breaks while revealing individual words.
  const wordHeading=$('.word-reveal');
  const walker=document.createTreeWalker(wordHeading,NodeFilter.SHOW_TEXT);
  const textNodes=[];while(walker.nextNode())textNodes.push(walker.currentNode);
  textNodes.forEach(node=>{const fragment=document.createDocumentFragment();node.textContent.split(/(\s+)/).forEach(part=>{if(!part)return;if(/\s/.test(part)){fragment.append(document.createTextNode(part));return;}const span=document.createElement('span');span.className='word';span.textContent=part;fragment.append(span);});node.replaceWith(fragment);});
  const words=$$('.word-reveal .word');
  const hero=$('.hero'), idea=$('.idea'), journey=$('.journey'), ending=$('.beginning'), header=$('#header');
  const toneSections=$$('[data-tone]');
  const points=$$('.map-point');
  const card=$('#place-card'), pointGroup=$('.map-points');
  const places={
    shore:{title:'Берег',image:'shore',kicker:'У воды',caption:'Слышать тишину',description:'Здесь не нужно никуда спешить. Можно просто смотреть на воду — и дать мыслям успокоиться.',alt:'Тихий берег северной реки с травой и маленькими цветами',x:.28,y:.75,panY:-.10},
    fields:{title:'Поля',image:'fields',kicker:'На земле',caption:'Вырастить что-то живое',description:'Сажать, а не отнимать. Делить урожай, а не границы. Простая работа, в которой появляется смысл.',alt:'Зелёно-золотые поля и тропинка к морю',x:.83,y:.35,panY:-.08},
    home:{title:'Дом',image:'home',kicker:'Рядом с другими',caption:'Быть нужным',description:'Место у общего стола. Тёплый хлеб. Люди, перед которыми не нужно быть сильнее. Достаточно быть собой.',alt:'Простой деревянный дом с зелёной крышей и садом в северной долине',x:.90,y:.28,panY:0}
  };
  const keys=Object.keys(places);
  let selected='shore', pictureToken=0;
  let frame=0, lastTime=0, progress=0, cameraX=0, cameraY=0;
  let arrived=false;
  const set=(el,name,value)=>el.style.setProperty(name,value);

  function setArrival(enabled){
    if(arrived===enabled)return;
    arrived=enabled;journey.classList.toggle('arrived',enabled);
    card.inert=!enabled;pointGroup.inert=!enabled;$('.skip-flight').inert=enabled;$('.journey-continue').tabIndex=enabled?0:-1;
  }
  card.inert=true;pointGroup.inert=true;$('.journey-continue').tabIndex=-1;
  function render(time){
    frame=0;
    const vh=innerHeight,w=journey.clientWidth;
    const step=lastTime?clamp((time-lastTime)/16.67,.3,3):1;lastTime=time;
    const j=journey.getBoundingClientRect();
    const visible=j.top<vh&&j.bottom>0;
    const target=reduced.matches?1:clamp(-j.top/Math.max(1,j.height-vh));
    const smoothing=reduced.matches?1:1-Math.pow(.88,step);
    progress=mix(progress,target,smoothing);
    if(Math.abs(progress-target)<.0003)progress=target;
    if(visible){
      const p=progress, explore=reduced.matches?1:clamp((p-.54)/.21);
      const baseScale=1.04+.38*clamp(p/.75);
      const scale=reduced.matches?1:baseScale+explore*.08;
      const data=places[selected];
      // Clamp the camera to the photograph bounds so no blank edges can enter view.
      const photoRatio=1672/941;
      const worldW=w*1.04,worldH=vh*1.04;
      const photoW=Math.max(worldW,worldH*photoRatio);
      const desiredX=mobile.matches?(0.5-data.x)*photoW*.30:(0.44*w-(w*.5+(data.x-.5)*photoW*scale));
      const maxX=(worldW*scale-w)/2;
      const maxY=(worldH*scale-vh)/2;
      const targetX=reduced.matches?0:clamp(desiredX,-maxX,maxX)*explore;
      const targetY=reduced.matches?0:clamp(data.panY*vh,-maxY,maxY)*explore;
      cameraX=mix(cameraX,targetX,smoothing);cameraY=mix(cameraY,targetY,smoothing);
      set(journey,'--camera-scale',scale);set(journey,'--camera-x',`${cameraX}px`);set(journey,'--camera-y',`${cameraY}px`);
      set(journey,'--cloud-x',`${-w*p*.45}px`);set(journey,'--cloud-y',`${-vh*p*.55}px`);set(journey,'--cloud-scale',1.15+p*.55);
      set(journey,'--cloud-opacity',1-clamp((p-.13)/.50));set(journey,'--far-opacity',.65*(1-clamp((p-.20)/.56)));
      set(journey,'--far-x',`${w*p*.26}px`);set(journey,'--far-y',`${vh*p*.32}px`);
      set(journey,'--flight-opacity',1-clamp((p-.12)/.24));set(journey,'--flight-rise',`${p*60}px`);
      set(journey,'--explore-opacity',explore);set(journey,'--explore-rise',`${(1-explore)*30}px`);
      set(journey,'--skip-opacity',1-explore);set(journey,'--journey-progress',p);
      setArrival(explore>.85);
      if(!mobile.matches){
        const photoH=Math.max(worldH,worldW/photoRatio);
        points.forEach(point=>{const spot=places[point.dataset.place];const x=w/2+(spot.x-.5)*photoW*scale+cameraX;const y=vh/2+(spot.y-.5)*photoH*scale+cameraY;point.style.left=`${x}px`;point.style.top=`${y}px`;point.style.visibility=x<32||x>w-32||y<110||y>vh-70?'hidden':'visible';});
      } else points.forEach(point=>{point.style.removeProperty('left');point.style.removeProperty('top');point.style.removeProperty('visibility');});
      if(Math.abs(progress-target)>.0003||Math.abs(cameraX-targetX)>.15||Math.abs(cameraY-targetY)>.15)requestRender();
    } else {progress=target;lastTime=0;}
    if(!reduced.matches){
      const h=hero.getBoundingClientRect();if(h.bottom>0&&h.top<vh){const p=clamp(-h.top/vh);set(hero,'--hero-y',`${p*vh*.12}px`);set(hero,'--hero-rise',`${p*50}px`);set(hero,'--hero-opacity',1-clamp(p*1.15));}
      const i=idea.getBoundingClientRect();if(i.bottom>0&&i.top<vh){const p=clamp((vh*.2-i.top)/Math.max(1,i.height-vh*.75));words.forEach((word,n)=>{word.style.opacity=String(.18+.82*clamp((p*1.3-n/words.length)*5));});set(idea,'--idea-line',clamp(p));}
      const e=ending.getBoundingClientRect();if(e.bottom>0&&e.top<vh)set(ending,'--ending-y',`${-clamp((vh-e.top)/(vh+e.height))*vh*.09}px`);
    }
    const current=toneSections.find(el=>{const r=el.getBoundingClientRect();return r.top<=50&&r.bottom>50;});
    header.classList.toggle('dark',current?.dataset.tone==='dark'||(current===journey&&progress<.55));
  }
  function requestRender(){if(!frame)frame=requestAnimationFrame(render);}
  addEventListener('scroll',requestRender,{passive:true});addEventListener('resize',requestRender);
  reduced.addEventListener('change',()=>{progress=0;requestRender();});mobile.addEventListener('change',requestRender);
  requestRender();

  async function selectPlace(key){
    selected=key;const data=places[key],token=++pictureToken;
    $$('[data-place]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.place===key)));
    requestRender();
    const image=$('#place-image');image.style.opacity='0';
    await new Promise(resolve=>setTimeout(resolve,reduced.matches?0:200));
    if(token!==pictureToken)return;
    image.src=`/assets/${data.image}.webp`;image.alt=data.alt;
    $('#place-title').textContent=data.title;$('#place-kicker').textContent=data.kicker;$('#place-caption').textContent=data.caption;$('#place-description').textContent=data.description;
    try{await image.decode();}catch{}
    if(token===pictureToken)image.style.opacity='1';
  }
  $$('[data-place]').forEach(b=>b.addEventListener('click',()=>selectPlace(b.dataset.place)));
  $('.place-next').addEventListener('click',()=>selectPlace(keys[(keys.indexOf(selected)+1)%keys.length]));

  const nav=$('#navigation'),toggle=$('.menu-toggle');let closing=false;
  toggle.addEventListener('click',()=>{nav.showModal();document.body.classList.add('locked');toggle.setAttribute('aria-expanded','true');requestAnimationFrame(()=>nav.classList.add('visible'));});
  function closeNav(after){if(closing)return;closing=true;nav.classList.remove('visible');setTimeout(()=>{nav.close();document.body.classList.remove('locked');toggle.setAttribute('aria-expanded','false');closing=false;after?.();requestRender();},reduced.matches?0:400);}
  $('.menu-close').addEventListener('click',()=>closeNav());nav.addEventListener('cancel',e=>{e.preventDefault();closeNav();});
  $$('.navigation nav a').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();closeNav(()=>{$(a.getAttribute('href')).scrollIntoView({behavior:reduced.matches?'instant':'smooth'});history.replaceState(null,'',a.getAttribute('href'));});}));
})();
