(() => {
  const cards=[...document.querySelectorAll('.world-card')];
  const articles=[...document.querySelectorAll('.world-detail')];
  const filters=[...document.querySelectorAll('[data-world-filter]')];
  const search=document.querySelector('#world-search');
  const more=document.querySelector('#world-more');
  const empty=document.querySelector('#world-empty');
  const status=document.querySelector('#world-status');
  const browser=document.querySelector('#world-browser');
  let group='all', expanded=false;
  let current=articles.find(a=>a.id===location.hash.slice(1))?.id || articles[0].id;
  const visibleCards=()=>cards.filter(card=>(group==='all'||card.dataset.category===group) && card.textContent.toLocaleLowerCase().includes(search.value.trim().toLocaleLowerCase()));
  function select(id,scroll=false,updateHistory=false) {
    if(!articles.some(article=>article.id===id))return;
    current=id;
    articles.forEach(article=>article.hidden=article.id!==id);
    cards.forEach(card=>{if(card.hash==='#'+id)card.setAttribute('aria-current','true');else card.removeAttribute('aria-current');});
    if(updateHistory && location.hash!=='#'+id)history.pushState(null,'','#'+id);
    if(scroll){const article=articles.find(a=>a.id===id);article.focus({preventScroll:true});article.scrollIntoView({block:'start',behavior:'instant'});}
  }
  function refresh(syncHistory=true) {
    const results=visibleCards();
    const activeIndex=results.findIndex(card=>card.hash==='#'+current);
    const showAll=expanded || Boolean(search.value.trim()) || activeIndex>=6;
    cards.forEach(card=>card.hidden=!results.includes(card)||(!showAll && results.indexOf(card)>=6));
    more.hidden=results.length<=6 || Boolean(search.value.trim());
    more.textContent=showAll?'목록 접기':`세계관 전체 보기 (${results.length})`;
    more.setAttribute('aria-expanded',String(showAll));
    empty.hidden=results.length>0;
    filters.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.worldFilter===group)));
    document.querySelector('#world-count').textContent=`${results.length}개의 이야기`;
    if(!results.length){articles.forEach(a=>a.hidden=true);return;}
    if(!results.some(card=>card.hash==='#'+current)) current=results[0].hash.slice(1);
    select(current);
    if(syncHistory && location.hash && location.hash!=='#'+current)history.replaceState(null,'','#'+current);
  }
  filters.forEach(button=>button.addEventListener('click',()=>{group=button.dataset.worldFilter;expanded=false;refresh();status.textContent=`${button.textContent}, ${visibleCards().length}개 항목`; }));
  cards.forEach(card=>card.addEventListener('click',event=>{event.preventDefault();select(card.hash.slice(1),true,true);}));
  document.querySelectorAll('[data-world-next]').forEach(link=>link.addEventListener('click',event=>{
    event.preventDefault();group='all';search.value='';expanded=false;current=link.hash.slice(1);refresh(false);select(current,true,true);
  }));
  document.querySelectorAll('[data-world-back]').forEach(link=>link.addEventListener('click',event=>{
    event.preventDefault();const card=cards.find(c=>c.hash==='#'+current);card?.focus({preventScroll:true});browser.scrollIntoView({block:'start',behavior:'instant'});
  }));
  document.querySelector('#world-search-tools').hidden=cards.length<=6;
  document.querySelector('.world-filters').hidden=false;
  search.addEventListener('input',()=>{refresh();status.textContent=`${visibleCards().length}개 항목을 찾았습니다.`;});
  more.addEventListener('click',()=>{expanded=more.getAttribute('aria-expanded')!=='true';if(!expanded){current=visibleCards()[0].hash.slice(1);}refresh();});
  window.addEventListener('popstate',()=>{const id=location.hash.slice(1);if(articles.some(a=>a.id===id)){group='all';search.value='';current=id;refresh();select(id,true);}else{group='all';search.value='';current=articles[0].id;refresh();browser.scrollIntoView({block:'start',behavior:'instant'});}});
  refresh();
  if(location.hash && articles.some(a=>a.id===location.hash.slice(1)))select(location.hash.slice(1),true);
})();
