  /* ---------------- live bot stats ---------------- */
  // Update this to your real stats endpoint once it's live.
  const STATS_API_URL = "/api/stats";
  const STATS_REFRESH_MS = 60000; // re-fetch every 60s

  function formatStat(n){
    if (typeof n !== 'number') return n;
    return n.toLocaleString('en-GB');
  }

  async function refreshStats(){
    try {
      const res = await fetch(STATS_API_URL, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Stats API returned ${res.status}`);
      const data = await res.json();

      document.querySelectorAll('[data-stat]').forEach(el => {
        const key = el.getAttribute('data-stat');
        if (data[key] !== undefined && data[key] !== null) {
          el.textContent = formatStat(data[key]);
        }
      });
    } catch (err) {
      // API not live yet (or unreachable) — page keeps showing the static
      // fallback numbers already in the HTML, so this fails silently.
      console.warn('Live stats unavailable, showing fallback numbers:', err.message);
    }
  }

  refreshStats();
  setInterval(refreshStats, STATS_REFRESH_MS);

  /* ---------------- live threat log ---------------- */
  // Placeholder — wire this up to a real events feed (e.g. via websocket
  // or polling an endpoint) when one exists. Left empty for now so the
  // console shows no fake/simulated activity.

  /* ---------------- vortex canvas ---------------- */
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.getElementById('vortex-canvas');
  const ctx = canvas.getContext('2d');
  const CX = canvas.width/2, CY = canvas.height/2;
  const CORE_R = 46;
  const RING_R = 130;

  function rand(a,b){ return a + Math.random()*(b-a); }

  class Particle{
    constructor(){ this.reset(true); }
    reset(initial){
      this.radius = initial ? rand(CORE_R+40, 440) : rand(400,460);
      this.angle = rand(0, Math.PI*2);
      this.speedBase = rand(0.0028, 0.006);
      this.isThreat = Math.random() < 0.22;
      this.size = this.isThreat ? rand(2.6,3.6) : rand(1.3,2.3);
      this.state = 'inbound'; // inbound -> neutralized -> (fade out) or -> absorbed
      this.life = 1;
      this.ejectAngle = rand(0, Math.PI*2);
      this.ejectDist = 0;
    }
    update(){
      if(this.state === 'inbound'){
        const speed = this.speedBase * (1 + (460-this.radius)/460*2.4);
        this.angle += speed;
        this.radius -= rand(0.35,0.7);
        if(this.isThreat && this.radius <= RING_R){
          this.state = 'neutralized';
          this.life = 1;
        } else if(!this.isThreat && this.radius <= CORE_R){
          this.state = 'absorbed';
          this.life = 1;
        }
      } else if(this.state === 'neutralized'){
        this.ejectDist += 2.6;
        this.radius += 2.6;
        this.angle += 0.01;
        this.life -= 0.018;
        if(this.life <= 0) this.reset(false);
      } else if(this.state === 'absorbed'){
        this.life -= 0.06;
        if(this.life <= 0) this.reset(false);
      }
    }
    draw(){
      const x = CX + Math.cos(this.angle)*this.radius;
      const y = CY + Math.sin(this.angle)*this.radius*0.94;
      let color, alpha;
      if(this.state === 'inbound'){
        color = this.isThreat ? '255,138,61' : '125,107,255';
        alpha = 0.55 + (1 - this.radius/460)*0.4;
      } else if(this.state === 'neutralized'){
        color = '52,228,196';
        alpha = this.life*0.9;
      } else {
        color = '52,228,196';
        alpha = this.life*0.6;
      }
      ctx.beginPath();
      ctx.fillStyle = `rgba(${color},${Math.max(alpha,0)})`;
      ctx.arc(x,y,this.size,0,Math.PI*2);
      ctx.fill();
    }
  }

  const particles = Array.from({length: reduceMotion ? 0 : 90}, () => new Particle());

  function drawCore(t){
    const pulse = 1 + Math.sin(t/700)*0.05;
    const grad = ctx.createRadialGradient(CX,CY,0,CX,CY,CORE_R*2.4*pulse);
    grad.addColorStop(0,'rgba(52,228,196,0.55)');
    grad.addColorStop(0.4,'rgba(52,228,196,0.14)');
    grad.addColorStop(1,'rgba(52,228,196,0)');
    ctx.beginPath();
    ctx.fillStyle = grad;
    ctx.arc(CX,CY,CORE_R*2.4*pulse,0,Math.PI*2);
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = 'rgba(52,228,196,0.5)';
    ctx.lineWidth = 1.4;
    ctx.setLineDash([3,7]);
    ctx.arc(CX,CY,RING_R,0,Math.PI*2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.fillStyle = 'rgba(52,228,196,0.9)';
    ctx.arc(CX,CY,CORE_R*0.22,0,Math.PI*2);
    ctx.fill();
  }

  function frame(t){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    drawCore(t);
    for(const p of particles){ p.update(); p.draw(); }
    if(!reduceMotion) requestAnimationFrame(frame);
  }
  if(!reduceMotion){
    requestAnimationFrame(frame);
  } else {
    drawCore(0);
  }

  /* ---------------- scroll reveals ---------------- */
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(en=>{
      if(en.isIntersecting){ en.target.classList.add('visible'); io.unobserve(en.target); }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
