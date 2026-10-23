/* ABISHEK STUDIO — lightweight interactive neon effects.
   No framework migration; designed to coexist with the existing gallery scripts. */
(() => {
  "use strict";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hero = document.querySelector("#hero");
  if (!hero) return;

  // Decorative canvas is behind the hero content and never captures clicks.
  if (!document.querySelector("#neon-particles")) {
    const canvas = document.createElement("canvas");
    canvas.id = "neon-particles";
    canvas.setAttribute("aria-hidden", "true");
    Object.assign(canvas.style, {
      position:"absolute", inset:"0", width:"100%", height:"100%",
      pointerEvents:"none", zIndex:"0", opacity:"0.78"
    });
    hero.prepend(canvas);
    const ctx = canvas.getContext("2d");
    if (ctx) {
      let w=0, h=0, dpr=1, raf=0, visible=true;
      let mx=-1000, my=-1000;
      let particles=[];
      const count=()=>Math.min(72, Math.max(24, Math.floor(w/18)));
      function resize() {
        const rect=hero.getBoundingClientRect();
        w=rect.width; h=rect.height;
        dpr=Math.min(window.devicePixelRatio||1,1.5);
        canvas.width=Math.max(1,Math.round(w*dpr));
        canvas.height=Math.max(1,Math.round(h*dpr));
        ctx.setTransform(dpr,0,0,dpr,0,0);
        particles=Array.from({length:count()},()=>({
          x:Math.random()*w,y:Math.random()*h,
          vx:(Math.random()-.5)*.34,vy:(Math.random()-.5)*.34,
          r:Math.random()*1.5+.5
        }));
        if (!reduceMotion && visible) start();
        else paint(true);
      }
      function paint(staticFrame=false) {
        ctx.clearRect(0,0,w,h);
        for (const p of particles) {
          if (!reduceMotion && !staticFrame) {
            p.x+=p.vx; p.y+=p.vy;
            if(p.x<0||p.x>w)p.vx*=-1;
            if(p.y<0||p.y>h)p.vy*=-1;
          }
          ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
          ctx.fillStyle="#00f5ff"; ctx.shadowBlur=8; ctx.shadowColor="#00f5ff"; ctx.fill();
          const dx=p.x-mx,dy=p.y-my,dist=Math.hypot(dx,dy);
          if(dist<125) {
            ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(mx,my);
            ctx.strokeStyle="rgba(0,245,255,"+(0.17*(1-dist/125))+")";
            ctx.lineWidth=.7;ctx.stroke();
          }
        }
        ctx.shadowBlur=0;
      }
      function loop() {
        if (!visible || reduceMotion) { raf=0; paint(true); return; }
        paint(false); raf=requestAnimationFrame(loop);
      }
      function start(){if(!raf && visible && !reduceMotion) raf=requestAnimationFrame(loop);}
      hero.addEventListener("pointermove",e=>{
        const r=hero.getBoundingClientRect();mx=e.clientX-r.left;my=e.clientY-r.top;
      },{passive:true});
      hero.addEventListener("pointerleave",()=>{mx=-1000;my=-1000;},{passive:true});
      document.addEventListener("visibilitychange",()=>{
        visible=!document.hidden;
        if(!visible && raf){cancelAnimationFrame(raf);raf=0;}
        if(visible)start();
      });
      window.addEventListener("resize",resize,{passive:true});
      if("ResizeObserver" in window) new ResizeObserver(resize).observe(hero);
      resize();
    }
  }

  // Gentle 3D tilt only for pointer devices; don't compete with mobile scrolling.
  if (!reduceMotion && window.matchMedia("(hover:hover) and (pointer:fine)").matches) {
    document.querySelectorAll("#gallery .g-card").forEach(card=>{
      if(card.dataset.neonTiltReady) return;
      card.dataset.neonTiltReady="1";
      card.addEventListener("pointermove",e=>{
        const r=card.getBoundingClientRect();
        if(!r.width||!r.height)return;
        const x=(e.clientX-r.left)/r.width;
        const y=(e.clientY-r.top)/r.height;
        card.style.transform="perspective(900px) rotateX("+((.5-y)*6)+"deg) rotateY("+((x-.5)*6)+"deg) translateY(-2px)";
      });
      card.addEventListener("pointerleave",()=>{card.style.transform="";});
    });
  }

  // Reveal section content with GSAP if already loaded; no hidden-by-default content.
  if (!reduceMotion && window.gsap && window.ScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);
    window.gsap.utils.toArray("#about .wrap, #portfolio .wrap, #projects .wrap, #testimonials .wrap, #contact .wrap")
      .forEach(section=>{
        if(section.dataset.neonRevealReady)return;
        section.dataset.neonRevealReady="1";
        window.gsap.from(section,{
          y:24,opacity:0,duration:.7,ease:"power2.out",
          scrollTrigger:{trigger:section,start:"top 88%",once:true}
        });
      });
  }
})();
