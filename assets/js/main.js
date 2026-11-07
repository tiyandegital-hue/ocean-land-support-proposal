// Ocean and Land Support — shared interactions. No tracking, no invented data.
// Mobile nav
(function(){
  var btn=document.querySelector('.menu-btn'), nav=document.getElementById('main-nav');
  if(btn&&nav){btn.addEventListener('click',function(){var open=nav.classList.toggle('open');btn.setAttribute('aria-expanded',open?'true':'false');});}
  // Reveal on scroll; rest state visible if JS fails (elements start visible in CSS? .reveal starts hidden only via JS-added class handling below)
  var els=document.querySelectorAll('.reveal'); els.forEach(function(e){e.classList.add('pre');});
  if(!('IntersectionObserver' in window)||window.matchMedia('(prefers-reduced-motion: reduce)').matches){els.forEach(function(e){e.classList.add('in');e.classList.remove('pre');});return;}
  var io=new IntersectionObserver(function(entries){entries.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');en.target.classList.remove('pre');io.unobserve(en.target);}});},{threshold:.12});
  els.forEach(function(e){io.observe(e);});
})();
// Cookie banner — governs analytics only. WhatsApp entry point stays persistent.
(function(){
  var banner=document.getElementById('cookie-banner');
  if(!banner) return;
  var consent=null; try{consent=localStorage.getItem('ols_consent');}catch(e){}
  if(!consent){banner.classList.add('show');}
  function set(v){try{localStorage.setItem('ols_consent',v);}catch(e){} banner.classList.remove('show');}
  var a=document.getElementById('cookie-accept'), d=document.getElementById('cookie-decline');
  if(a) a.addEventListener('click',function(){set('accepted');});
  if(d) d.addEventListener('click',function(){set('declined');});
})();
// Package selector (home + packages pages)
(function(){
  var toggles=document.querySelectorAll('[data-package-toggle]');
  toggles.forEach(function(toggle){
    var buttons=toggle.querySelectorAll('button[data-package]');
    var cards=document.querySelectorAll('[data-package-card]');
    var summary=document.getElementById('package-summary');
    function select(name){
      buttons.forEach(function(b){b.setAttribute('aria-pressed', b.getAttribute('data-package')===name ? 'true':'false');});
      cards.forEach(function(c){c.classList.toggle('selected', c.getAttribute('data-package-card')===name);});
      if(summary){summary.textContent = name==='comprehensive' ? 'Selected: Comprehensive — full management across the disciplines listed below.' : 'Selected: Tailored — a personalised package based on your needs.';}
      try{sessionStorage.setItem('ols_package',name);}catch(e){}
      var link=document.getElementById('package-enquiry-link');
      if(link){link.href='enquiry.html?package='+encodeURIComponent(name);}
    }
    buttons.forEach(function(b){b.addEventListener('click',function(){select(b.getAttribute('data-package'));});});
    var saved=null; try{saved=sessionStorage.getItem('ols_package');}catch(e){}
    var q=new URLSearchParams(location.search).get('package');
    if(q==='comprehensive'||q==='tailored') select(q); else if(saved) select(saved);
  });
})();
// Enquiry wizard
(function(){
  var form=document.getElementById('enquiry-wizard');
  if(!form) return;
  var steps=[...form.querySelectorAll('.wizard-step')];
  var current=0, data={need:'',disciplines:[],package:''};
  var bar=document.getElementById('wizard-bar'), prog=document.getElementById('wizard-progress');
  var q=new URLSearchParams(location.search);
  if(q.get('package')==='comprehensive'||q.get('package')==='tailored'){data.package=q.get('package');}
  if(q.get('need')){data.need=q.get('need');}
  function show(i){
    current=i;
    steps.forEach(function(s,idx){s.hidden = idx!==i;});
    if(bar) bar.style.width=((i+1)/steps.length*100)+'%';
    if(prog) prog.textContent='Step '+(i+1)+' of '+steps.length;
    var first=steps[i].querySelector('button, input, select, textarea');
    if(first) first.focus({preventScroll:true});
    window.scrollTo({top:form.getBoundingClientRect().top+window.scrollY-90,behavior:'smooth'});
  }
  function setChoice(group,btn){
    var val=btn.getAttribute('data-value');
    if(group==='need'){data.need=val; form.querySelectorAll('[data-group="need"]').forEach(function(b){b.setAttribute('aria-pressed', b===btn?'true':'false');});}
    else{var idx=data.disciplines.indexOf(val);
      if(idx>-1){data.disciplines.splice(idx,1);btn.setAttribute('aria-pressed','false');}
      else{data.disciplines.push(val);btn.setAttribute('aria-pressed','true');}}
  }
  form.querySelectorAll('.choice').forEach(function(b){
    b.addEventListener('click',function(){setChoice(b.getAttribute('data-group'),b);});
    if(b.getAttribute('data-group')==='need' && b.getAttribute('data-value')===data.need){b.setAttribute('aria-pressed','true');}
  });
  form.querySelectorAll('[data-next]').forEach(function(b){
    b.addEventListener('click',function(){
      if(current===0 && !data.need){alert('Please choose what needs managing — Yacht, Home, Both or Concierge.');return;}
      if(current===1 && data.disciplines.length===0){alert('Please pick at least one discipline, or choose “Not sure yet”.');return;}
      if(current===1){fillSummary();}
      show(Math.min(current+1,steps.length-1));
    });
  });
  form.querySelectorAll('[data-back]').forEach(function(b){b.addEventListener('click',function(){show(Math.max(current-1,0));});});
  function fillSummary(){
    var set=function(id,v){var el=document.getElementById(id); if(el) el.textContent=v||'—';};
    set('sum-need',data.need);
    set('sum-disciplines',data.disciplines.join(', ')||'Not sure yet');
    set('sum-package',data.package? (data.package.charAt(0).toUpperCase()+data.package.slice(1)) : 'To discuss');
  }
  function validField(input){
    var wrap=input.closest('.field'); var ok=true;
    if(input.required && !input.value.trim()) ok=false;
    if(input.type==='email' && input.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) ok=false;
    if(wrap) wrap.classList.toggle('invalid',!ok);
    return ok;
  }
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var name=document.getElementById('f-name'), email=document.getElementById('f-email');
    var consent=document.getElementById('f-consent');
    var ok=validField(name)&&validField(email);
    var consentWrap=consent?consent.closest('.consent'):null;
    if(!consent||!consent.checked){ok=false; if(consentWrap) consentWrap.style.color='#8B2E2E';}
    else if(consentWrap) consentWrap.style.color='';
    if(!ok) return;
    fillSummary();
    var sNeed2=document.getElementById('sum-need2'); if(sNeed2) sNeed2.textContent=data.need||'—';
    var sName=document.getElementById('sum-name'); if(sName) sName.textContent=name.value.trim();
    var sEmail=document.getElementById('sum-email'); if(sEmail) sEmail.textContent=email.value.trim();
    var sTime=document.getElementById('sum-timeline'); var tl=document.getElementById('f-timeline'); if(sTime) sTime.textContent=tl&&tl.value?tl.value:'Not specified';
    // Demo only: no data leaves the browser. In production this would send to OLS.
    try{sessionStorage.setItem('ols_wizard_state',JSON.stringify({need:data.need,disciplines:data.disciplines,package:data.package}));}catch(err){}
    document.getElementById('wizard-form-view').hidden=true;
    var conf=document.getElementById('wizard-confirmation'); if(conf) conf.hidden=false;
    var wa=document.getElementById('wa-continue');
    if(wa){var msg='Hello Ocean and Land Support — I would like to enquire about '+(data.need||'management')+'.'; wa.setAttribute('data-prefill',msg);}
    window.scrollTo({top:0,behavior:'smooth'});
  });
  ['f-name','f-email'].forEach(function(id){var el=document.getElementById(id); if(el) el.addEventListener('input',function(){validField(el);});});
  show(0);
})();
