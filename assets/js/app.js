(() => {
  const $ = (s, c=document) => c.querySelector(s);
  const $$ = (s, c=document) => [...c.querySelectorAll(s)];
  const products = window.AE_PRODUCTS || [];
  const esc = (s='') => String(s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const norm = (s='') => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();

  function icon(name){
    const paths = {
      arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
      share:'<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4"/>'
    };
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.arrow}</svg>`;
  }

  function toast(msg){
    let el = $('#ae-toast');
    if(!el){ el=document.createElement('div'); el.id='ae-toast'; el.className='toast'; document.body.appendChild(el); }
    el.textContent=msg; el.classList.add('show'); clearTimeout(window.__aeToast); window.__aeToast=setTimeout(()=>el.classList.remove('show'),1800);
  }

  async function share(url, title='AchadoEsperto'){
    try{
      if(navigator.share){ await navigator.share({title,url}); }
      else { await navigator.clipboard.writeText(url); toast('Link copiado!'); }
    }catch(e){ if(e.name!=='AbortError') toast('Não foi possível compartilhar agora.'); }
  }

  function absolute(path){ try{return new URL(path, location.href).href}catch{return path} }

  function renderProducts(list){
    const grid = $('#products-grid'); if(!grid) return;
    grid.replaceChildren();
    list.forEach(p => {
      const a = document.createElement('article'); a.className='product-card';
      a.innerHTML = `
        <a class="product-media" href="${esc(p.productUrl)}" aria-label="Ver ${esc(p.name)}">
          <span class="badge">${esc(p.badge)}</span>
          <img class="product-card-image" src="${esc(p.images[0])}" alt="${esc(p.name)}" loading="lazy" decoding="async" width="800" height="600" style="object-fit:${esc(p.cardFit||'contain')};object-position:${esc(p.cardPosition||'center')}">
        </a>
        <div class="product-body">
          <span class="product-cat">${esc(p.category)}</span>
          <a href="${esc(p.productUrl)}" class="product-title">${esc(p.name)}</a>
          <p class="product-desc">${esc(p.shortDescription)}</p>
          <div class="product-footer">
            <a class="primary-btn" href="${esc(p.affiliateUrl)}" target="_blank" rel="nofollow sponsored noopener noreferrer">Ver oferta ${icon('arrow')}</a>
            <button class="icon-btn share-product" data-url="${esc(p.productUrl)}" data-title="${esc(p.name)}" aria-label="Compartilhar ${esc(p.name)}">${icon('share')}</button>
          </div>
        </div>`;
      const cardImg=a.querySelector('.product-card-image');
      if(cardImg){cardImg.addEventListener('error',()=>{a.classList.add('image-error');cardImg.remove();});}
      grid.appendChild(a);
    });
    const empty=$('#empty-state'); if(empty) empty.style.display = list.length ? 'none':'block';
    $$('.share-product',grid).forEach(btn=>btn.addEventListener('click',()=>share(absolute(btn.dataset.url),btn.dataset.title)));
  }

  function initCatalog(){
    if(!$('#products-grid')) return;
    const categories=['Todos',...new Set(products.map(p=>p.category))];
    const chipWrap=$('#category-chips'); let active='Todos'; let query='';
    categories.forEach(cat=>{ const b=document.createElement('button'); b.className='chip'+(cat==='Todos'?' active':''); b.textContent=cat; b.type='button'; b.addEventListener('click',()=>{active=cat; $$('.chip',chipWrap).forEach(x=>x.classList.toggle('active',x===b)); apply();}); chipWrap.appendChild(b); });
    const input=$('#product-search'); if(input) input.addEventListener('input',e=>{query=e.target.value; apply();});
    function apply(){ const q=norm(query.trim()); renderProducts(products.filter(p => (active==='Todos'||p.category===active) && (!q || norm([p.name,p.category,p.description,...p.tags].join(' ')).includes(q)))); }
    apply();
  }

  function initProduct(){
    if(!location.pathname.startsWith('/produto')) return;
    const params=new URLSearchParams(location.search);
    const last=location.pathname.split('/').filter(Boolean).pop();
    const slug=params.get('id') || params.get('slug') || (last && last!=='produto' ? last : '');
    const p=products.find(x=>x.slug===slug||x.id===slug);
    const content=$('#product-content'), notFound=$('#product-not-found'), details=$('#details-card');
    if(!p){ if(content) content.style.display='none'; if(details) details.style.display='none'; if(notFound) notFound.style.display='block'; return; }
    document.title=`${p.name} | AchadoEsperto`;
    const descMeta=document.querySelector('meta[name="description"]'); if(descMeta) descMeta.content=p.shortDescription||p.description;
    $('#breadcrumb-category').textContent=p.category; $('#breadcrumb-name').textContent=p.name;
    $('#product-badge').textContent=`✦ ${p.badge||'AchadoEsperto'}`; $('#product-name').textContent=p.name; $('#product-description').textContent=p.description;
    const buy=$('#buy-link'), mobile=$('#mobile-buy-link');
    [buy,mobile].forEach(a=>{a.href=p.affiliateUrl;a.target='_blank';a.rel='nofollow sponsored noopener noreferrer';});
    const pills=$('#spec-pills'); pills.replaceChildren(); Object.values(p.specs).slice(0,3).forEach(v=>{const span=document.createElement('span');span.className='spec-pill';span.textContent=v;pills.appendChild(span);});
    const main=$('#main-product-image'); const thumbs=$('#product-thumbs'); thumbs.replaceChildren();
    const setMainImage=(src)=>{main.classList.remove('image-load-error');main.alt=p.name;main.src=src;};
    main.decoding='async'; main.style.objectFit=p.galleryFit||'contain';
    main.addEventListener('load',()=>main.classList.remove('image-load-error'));
    main.addEventListener('error',()=>{main.alt='Imagem indisponível';main.classList.add('image-load-error');});
    p.images.forEach((src,i)=>{ const b=document.createElement('button'); b.className='thumb'+(i===0?' active':''); b.type='button'; b.setAttribute('aria-label',`Ver imagem ${i+1}`); const img=document.createElement('img'); img.src=src; img.alt=`${p.name} – ângulo ${i+1}`; img.loading='lazy'; img.decoding='async'; img.addEventListener('error',()=>b.classList.add('thumb-error')); b.appendChild(img); b.addEventListener('click',()=>{setMainImage(src); $('.thumb',thumbs).forEach(x=>x.classList.remove('active')); b.classList.add('active');}); thumbs.appendChild(b); });
    if(p.images.length) setMainImage(p.images[0]);
    const spec=$('#spec-table tbody'); spec.replaceChildren(); Object.entries(p.specs).forEach(([k,v])=>{ const tr=document.createElement('tr'); const td1=document.createElement('td'), td2=document.createElement('td'), strong=document.createElement('strong'); td1.textContent=k; strong.textContent=v; td2.appendChild(strong); tr.append(td1,td2); spec.appendChild(tr); });
    const benefits=$('#benefits'); benefits.replaceChildren(); p.benefits.forEach(([title,txt])=>{ const d=document.createElement('div'); d.className='benefit'; const i=document.createElement('i'); i.textContent='✓'; const wrap=document.createElement('div'); const strong=document.createElement('strong'); strong.textContent=title; const span=document.createElement('span'); span.textContent=txt; wrap.append(strong,span); d.append(i,wrap); benefits.appendChild(d); });
    $$('.share-current').forEach(btn=>btn.addEventListener('click',()=>share(location.href,p.name)));
  }

  document.addEventListener('DOMContentLoaded',()=>{initCatalog();initProduct();});
})();