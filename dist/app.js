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
  const mapImage=$('.map-photo');
  let frame=0,lastTime=0,progress=0,cameraX=0,cameraY=0;
  const set=(el,name,value)=>el.style.setProperty(name,value);
  const smooth=t=>{const v=clamp(t);return v*v*(3-2*v);};
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
      const p=progress,isMobile=mobile.matches;
      // A continuous camera curve follows the river; there are no chapter jumps.
      const descent=smooth((p-.07)/.76);
      const scale=reduced.matches?1:mix(1.035,isMobile?1.27:1.42,descent);
      const photoRatio=mapImage.naturalWidth&&mapImage.naturalHeight?mapImage.naturalWidth/mapImage.naturalHeight:(isMobile?2/3:1.5);
      const worldW=w*1.02,worldH=vh*1.02;
      const photoW=Math.max(worldW,worldH*photoRatio),photoH=Math.max(worldH,worldW/photoRatio);
      set(journey,'--photo-width',photoW+'px');set(journey,'--photo-height',photoH+'px');
      const route=smooth((p-.12)/.72);
      const landX=isMobile?mix(.59,.34,route):mix(.57,.38,route);
      const landY=mix(.29,.73,route);
      // Bound against the covered photograph, including its cropped surplus.
      const maxX=Math.max(0,(photoW*scale-w)/2-2),maxY=Math.max(0,(photoH*scale-vh)/2-2);
      const targetX=reduced.matches?0:clamp((.5-landX)*photoW*scale,-maxX,maxX);
      const targetY=reduced.matches?0:clamp((.5-landY)*photoH*scale,-maxY,maxY);
      // Re-bound the interpolated camera too: changing viewport or reversing the
      // zoom must never reveal the empty edge of the image.
      cameraX=clamp(mix(cameraX,targetX,smoothing*.7),-maxX,maxX);
      cameraY=clamp(mix(cameraY,targetY,smoothing*.7),-maxY,maxY);
      set(journey,'--camera-scale',scale);set(journey,'--camera-x',cameraX+'px');set(journey,'--camera-y',cameraY+'px');
      const opening=smooth(p/.47),exit=smooth((p-.88)/.12);
      set(journey,'--near-scale',mix(1.04,2.65,opening));
      set(journey,'--near-x',-w*.15*opening+'px');set(journey,'--near-y',-vh*.22*opening+'px');
      set(journey,'--near-opacity',reduced.matches?0:1-smooth((p-.08)/.38));
      set(journey,'--distant-scale',mix(1.1,1.65,opening));
      set(journey,'--distant-x',w*.07*opening+'px');set(journey,'--distant-y',vh*.11*opening+'px');
      set(journey,'--distant-opacity',reduced.matches?0:.65*(1-smooth((p-.13)/.46)));
      set(journey,'--haze-opacity',reduced.matches?0:.94*(1-smooth(p/.28)));
      set(journey,'--exit-opacity',reduced.matches?0:exit);
      set(journey,'--journey-progress',p);
      if(Math.abs(progress-target)>.0003||Math.abs(cameraX-targetX)>.15||Math.abs(cameraY-targetY)>.15)requestRender();
    } else {progress=target;lastTime=0;}
    if(!reduced.matches){
      const h=hero.getBoundingClientRect();if(h.bottom>0&&h.top<vh){const p=clamp(-h.top/vh);set(hero,'--hero-y',`${p*vh*.12}px`);set(hero,'--hero-rise',`${p*50}px`);set(hero,'--hero-opacity',1-clamp(p*1.15));}
      const i=idea.getBoundingClientRect();if(i.bottom>0&&i.top<vh){const p=clamp((vh*.2-i.top)/Math.max(1,i.height-vh*.75));words.forEach((word,n)=>{word.style.opacity=String(.18+.82*clamp((p*1.3-n/words.length)*5));});set(idea,'--idea-line',clamp(p));}
      const e=ending.getBoundingClientRect();if(e.bottom>0&&e.top<vh)set(ending,'--ending-y',`${-clamp((vh-e.top)/(vh+e.height))*vh*.09}px`);
    }
    const current=toneSections.find(el=>{const r=el.getBoundingClientRect();return r.top<=50&&r.bottom>50;});
    header.classList.toggle('dark',current?.dataset.tone==='dark'||(current===journey&&!reduced.matches&&(progress<.28||progress>.95)));
  }
  function requestRender(){if(!frame)frame=requestAnimationFrame(render);}
  addEventListener('scroll',requestRender,{passive:true});addEventListener('resize',requestRender);
  reduced.addEventListener('change',()=>{progress=0;requestRender();});mobile.addEventListener('change',requestRender);
  requestRender();

  const nav=$('#navigation'),toggle=$('.menu-toggle');let closing=false;
  toggle.addEventListener('click',()=>{nav.showModal();document.body.classList.add('locked');toggle.setAttribute('aria-expanded','true');requestAnimationFrame(()=>nav.classList.add('visible'));});
  function closeNav(after){if(closing)return;closing=true;nav.classList.remove('visible');setTimeout(()=>{nav.close();document.body.classList.remove('locked');toggle.setAttribute('aria-expanded','false');closing=false;after?.();requestRender();},reduced.matches?0:400);}
  $('.menu-close').addEventListener('click',()=>closeNav());nav.addEventListener('cancel',e=>{e.preventDefault();closeNav();});
  $$('.navigation nav a').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();closeNav(()=>{$(a.getAttribute('href')).scrollIntoView({behavior:reduced.matches?'instant':'smooth'});history.replaceState(null,'',a.getAttribute('href'));});}));
})();
