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
    shore:{title:'Берег',image:'shore',kicker:'У воды',description:'Только вода, ветер и время. Здесь можно никуда не спешить.',alt:'Естественный галечный берег северной реки',x:.18,y:.36,mx:.22,my:.35},
    fields:{title:'Поля',image:'fields',kicker:'На земле',description:'Земля, которой хватает. Вырастить урожай и разделить его с теми, кто рядом.',alt:'Небольшие поля в северной долине',x:.43,y:.66,mx:.51,my:.46},
    home:{title:'Дом',image:'home',kicker:'Рядом с другими',description:'Дверь открыта. За общим столом есть место для каждого.',alt:'Небольшой деревянный дом под травяной крышей',x:.35,y:.51,mx:.76,my:.58}
  };
  const keys=Object.keys(places);
  const mapImage=$('.map-photo');
  let selected='shore', pictureToken=0, scrollChapter=0, manualChoice=null;
  let frame=0,lastTime=0,progress=0,cameraX=0,cameraY=0;
  let arrived=false;
  const set=(el,name,value)=>el.style.setProperty(name,value);
  const smooth=t=>{const v=clamp(t);return v*v*(3-2*v);};
  function setArrival(enabled){
    arrived=enabled;journey.classList.toggle('arrived',enabled);
    card.inert=!enabled;pointGroup.inert=!enabled;$('.journey-continue').tabIndex=enabled?0:-1;
  }
  setArrival(false);
  mapImage.addEventListener('load',requestRender);
  function render(time){
    frame=0;
    const vh=journey.querySelector('.journey-sticky').clientHeight,w=journey.clientWidth;
    const step=lastTime?clamp((time-lastTime)/16.67,.3,3):1;lastTime=time;
    const j=journey.getBoundingClientRect();
    const visible=j.top<innerHeight&&j.bottom>0;
    const target=reduced.matches?1:clamp(-j.top/Math.max(1,j.height-vh));
    const smoothing=reduced.matches?1:1-Math.pow(.91,step);
    progress=mix(progress,target,smoothing);
    if(Math.abs(progress-target)<.0003)progress=target;
    if(visible){
      const p=progress,explore=reduced.matches?1:smooth((p-.28)/.12);
      // Each place unfolds through scrolling. Clicking a flag is an optional shortcut.
      const chapter=reduced.matches?0:(p<.53?0:p<.76?1:2);
      if(chapter!==scrollChapter){scrollChapter=chapter;manualChoice=null;}
      const active=manualChoice||keys[chapter];
      if(active!==selected)selectPlace(active);
      const scale=reduced.matches?1:1.01+.14*smooth(p/.88);
      const data=places[selected],isMobile=mobile.matches;
      const photoRatio=mapImage.naturalWidth&&mapImage.naturalHeight?mapImage.naturalWidth/mapImage.naturalHeight:(isMobile?2/3:2);
      const worldW=w*1.02,worldH=vh*1.02;
      const photoW=Math.max(worldW,worldH*photoRatio),photoH=Math.max(worldH,worldW/photoRatio);
      const landX=isMobile?data.mx:data.x,landY=isMobile?data.my:data.y;
      const desiredX=(isMobile?.48:.44)*w-(w*.5+(landX-.5)*photoW*scale);
      const desiredY=(isMobile?.43:.52)*vh-(vh*.5+(landY-.5)*photoH*scale);
      const maxX=(worldW*scale-w)/2,maxY=(worldH*scale-vh)/2;
      const targetX=reduced.matches?0:clamp(desiredX,-maxX,maxX)*explore;
      const targetY=reduced.matches?0:clamp(desiredY,-maxY,maxY)*explore;
      // Re-bound the interpolated camera too: changing viewport or reversing the
      // zoom must never reveal the empty edge of the image.
      cameraX=clamp(mix(cameraX,targetX,smoothing*.7),-maxX,maxX);
      cameraY=clamp(mix(cameraY,targetY,smoothing*.7),-maxY,maxY);
      set(journey,'--camera-scale',scale);set(journey,'--camera-x',cameraX+'px');set(journey,'--camera-y',cameraY+'px');
      const flight=smooth(p/.32);
      set(journey,'--cloud-x',-w*flight*.24+'px');set(journey,'--cloud-y',-vh*flight*.38+'px');set(journey,'--cloud-scale',1+flight*.15);
      set(journey,'--cloud-opacity',.83*(1-smooth((p-.015)/.28)));set(journey,'--far-opacity',.42*(1-smooth(p/.33)));
      set(journey,'--far-x',w*flight*.2+'px');set(journey,'--far-y',vh*flight*.3+'px');
      set(journey,'--explore-opacity',explore);set(journey,'--explore-rise',(1-explore)*35+'px');set(journey,'--journey-progress',p);
      setArrival(explore>.85);
      points.forEach((point,n)=>{
        const spot=places[point.dataset.place],sx=isMobile?spot.mx:spot.x,sy=isMobile?spot.my:spot.y;
        const x=w/2+(sx-.5)*photoW*scale+cameraX,y=vh/2+(sy-.5)*photoH*scale+cameraY;
        const entry=reduced.matches?1:smooth((p-(.15+n*.035))/.17);
        point.style.left=clamp(x,25,w-25)+'px';point.style.top=clamp(y,170,isMobile?vh*.62:vh-100)+'px';
        point.classList.toggle('flipped',x>w*.68);
        set(point,'--flag-opacity',entry);set(point,'--flag-rise',(1-entry)*55+'px');
      });
      if(Math.abs(progress-target)>.0003||Math.abs(cameraX-targetX)>.15||Math.abs(cameraY-targetY)>.15)requestRender();
    } else {progress=target;lastTime=0;}
    if(!reduced.matches){
      const h=hero.getBoundingClientRect();if(h.bottom>0&&h.top<vh){const p=clamp(-h.top/vh);set(hero,'--hero-y',`${p*vh*.12}px`);set(hero,'--hero-rise',`${p*50}px`);set(hero,'--hero-opacity',1-clamp(p*1.15));}
      const i=idea.getBoundingClientRect();if(i.bottom>0&&i.top<vh){const p=clamp((vh*.2-i.top)/Math.max(1,i.height-vh*.75));words.forEach((word,n)=>{word.style.opacity=String(.18+.82*clamp((p*1.3-n/words.length)*5));});set(idea,'--idea-line',clamp(p));}
      const e=ending.getBoundingClientRect();if(e.bottom>0&&e.top<vh)set(ending,'--ending-y',`${-clamp((vh-e.top)/(vh+e.height))*vh*.09}px`);
    }
    const current=toneSections.find(el=>{const r=el.getBoundingClientRect();return r.top<=50&&r.bottom>50;});
    header.classList.toggle('dark',current?.dataset.tone==='dark'||(current===journey&&progress<.23));
  }
  function requestRender(){if(!frame)frame=requestAnimationFrame(render);}
  addEventListener('scroll',requestRender,{passive:true});addEventListener('resize',requestRender);
  reduced.addEventListener('change',()=>{progress=0;requestRender();});mobile.addEventListener('change',requestRender);
  requestRender();

  async function selectPlace(key){
    selected=key;const data=places[key],token=++pictureToken;
    points.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.place===key)));
    $('#place-count').textContent=String(keys.indexOf(key)+1).padStart(2,'0');
    const image=$('#place-image');image.style.opacity='0';
    await new Promise(resolve=>setTimeout(resolve,reduced.matches?0:160));
    if(token!==pictureToken)return;
    image.src='/assets/'+data.image+'.webp';image.alt=data.alt;
    $('#place-title').textContent=data.title;$('#place-kicker').textContent=data.kicker;$('#place-description').textContent=data.description;
    try{await image.decode();}catch{}
    if(token===pictureToken)image.style.opacity='1';
  }
  points.forEach(b=>b.addEventListener('click',()=>{manualChoice=b.dataset.place;selectPlace(manualChoice);requestRender();}));

  const nav=$('#navigation'),toggle=$('.menu-toggle');let closing=false;
  toggle.addEventListener('click',()=>{nav.showModal();document.body.classList.add('locked');toggle.setAttribute('aria-expanded','true');requestAnimationFrame(()=>nav.classList.add('visible'));});
  function closeNav(after){if(closing)return;closing=true;nav.classList.remove('visible');setTimeout(()=>{nav.close();document.body.classList.remove('locked');toggle.setAttribute('aria-expanded','false');closing=false;after?.();requestRender();},reduced.matches?0:400);}
  $('.menu-close').addEventListener('click',()=>closeNav());nav.addEventListener('cancel',e=>{e.preventDefault();closeNav();});
  $$('.navigation nav a').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();closeNav(()=>{$(a.getAttribute('href')).scrollIntoView({behavior:reduced.matches?'instant':'smooth'});history.replaceState(null,'',a.getAttribute('href'));});}));
})();
