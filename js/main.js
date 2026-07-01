/* STACKLY — shared site behavior */

document.addEventListener('DOMContentLoaded', () => {

  /* Preloader */
  const pre = document.querySelector('.preloader');
  if(pre){
    window.addEventListener('load', () => setTimeout(()=>pre.classList.add('hide'), 350));
    setTimeout(()=>pre.classList.add('hide'), 1800); // fallback
  }

  /* AOS init */
  if(window.AOS){ AOS.init({ duration: 800, easing: 'ease-out-cubic', once: true, offset: 60 }); }

  /* Navbar scroll state */
  const nav = document.querySelector('.navbar');
  if(nav){
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 30);
    onScroll(); window.addEventListener('scroll', onScroll);
  }

  /* Hamburger */
  const burger = document.querySelector('.hamburger');
  const links = document.querySelector('.nav-links');
  if(burger && links){
    burger.addEventListener('click', () => {
      burger.classList.toggle('open');
      links.classList.toggle('open');
      document.body.style.overflow = burger.classList.contains('open') ? 'hidden' : '';
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      burger.classList.remove('open');
      links.classList.remove('open');
      document.body.style.overflow = '';
    }));
  }

  /* Magnetic buttons */
  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width/2, y = e.clientY - r.top - r.height/2;
      el.style.transform = `translate(${x*0.25}px, ${y*0.4}px)`;
    });
    el.addEventListener('mouseleave', () => el.style.transform = 'translate(0,0)');
  });

  /* Toast helper */
  window.showToast = (msg) => {
    let t = document.querySelector('.toast');
    if(!t){ t = document.createElement('div'); t.className='toast'; document.body.appendChild(t); }
    t.innerHTML = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(()=>t.classList.remove('show'), 2600);
  };

  /* ---------- Cart (localStorage) ---------- */
  const CART_KEY = 'stackly_cart';
  const getCart = () => JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  const setCart = (c) => { localStorage.setItem(CART_KEY, JSON.stringify(c)); updateCartCount(); };
  window.stacklyCart = {
    add(item){
      const cart = getCart();
      const existing = cart.find(i => i.id === item.id && i.size === item.size);
      if(existing){ existing.qty += item.qty || 1; } else { cart.push({...item, qty: item.qty || 1}); }
      setCart(cart);
      showToast(`<b>Added</b> — ${item.name} is in your bag`);
    },
    remove(id, size){ setCart(getCart().filter(i => !(i.id === id && i.size === size))); renderCartPage(); },
    updateQty(id, size, qty){
      const cart = getCart();
      const item = cart.find(i => i.id === id && i.size === size);
      if(item){ item.qty = Math.max(1, qty); setCart(cart); renderCartPage(); }
    },
    all(){ return getCart(); },
    clear(){ setCart([]); }
  };

  function updateCartCount(){
    const count = getCart().reduce((s,i)=>s+i.qty,0);
    document.querySelectorAll('.cart-count').forEach(el => el.textContent = count);
  }
  updateCartCount();

  /* Add-to-bag buttons on listing/product cards */
  document.querySelectorAll('[data-add-cart]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.stacklyCart.add({
        id: btn.dataset.id, name: btn.dataset.name, price: parseFloat(btn.dataset.price),
        img: btn.dataset.img, size: btn.dataset.size || 'M', qty: 1
      });
    });
  });

  /* Wishlist toggle */
  document.querySelectorAll('.wishlist-btn').forEach(btn => {
    btn.addEventListener('click', (e) => { e.preventDefault(); btn.classList.toggle('active'); });
  });

  /* Product tabs */
  document.querySelectorAll('.tab-nav button').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabs = btn.closest('.tabs');
      tabs.querySelectorAll('.tab-nav button').forEach(b=>b.classList.remove('active'));
      tabs.querySelectorAll('.tab-pane').forEach(p=>p.classList.remove('active'));
      btn.classList.add('active');
      tabs.querySelector(`#${btn.dataset.tab}`).classList.add('active');
    });
  });

  /* Size pills */
  document.querySelectorAll('.size-row').forEach(row => {
    row.addEventListener('click', e => {
      const pill = e.target.closest('.size-pill');
      if(!pill) return;
      row.querySelectorAll('.size-pill').forEach(p=>p.classList.remove('active'));
      pill.classList.add('active');
    });
  });

  /* Swatches */
  document.querySelectorAll('.swatch-row').forEach(row => {
    row.addEventListener('click', e => {
      const sw = e.target.closest('.swatch');
      if(!sw) return;
      row.querySelectorAll('.swatch').forEach(s=>s.classList.remove('active'));
      sw.classList.add('active');
    });
  });

  /* Quantity controls */
  document.querySelectorAll('.qty-control').forEach(ctrl => {
    const input = ctrl.querySelector('input');
    ctrl.querySelector('.qty-minus')?.addEventListener('click', () => input.value = Math.max(1, (+input.value||1) - 1));
    ctrl.querySelector('.qty-plus')?.addEventListener('click', () => input.value = (+input.value||1) + 1);
  });

  /* Product gallery thumbs */
  document.querySelectorAll('.pd-thumbs img').forEach(t => {
    t.addEventListener('click', () => {
      document.querySelectorAll('.pd-thumbs img').forEach(i=>i.classList.remove('active'));
      t.classList.add('active');
      document.querySelector('.main-img img').src = t.src;
    });
  });

  /* Checkout payment options */
  document.querySelectorAll('.payment-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.payment-option').forEach(o=>o.classList.remove('active'));
      opt.classList.add('active');
      opt.querySelector('input').checked = true;
    });
  });

  /* Forms: prevent real submit, show toast */
  document.querySelectorAll('form[data-demo-form]').forEach(f => {
    f.addEventListener('submit', e => {
      e.preventDefault();
      showToast(f.dataset.demoForm || 'Submitted — thank you!');
      if(f.dataset.redirect){ setTimeout(()=>location.href=f.dataset.redirect, 700); }
    });
  });

  /* Cart page render */
  if(document.querySelector('#cartPageRoot')) renderCartPage();
  if(document.querySelector('#orderSummaryRoot')) renderOrderSummary();

  function renderCartPage(){
    const root = document.querySelector('#cartPageRoot');
    if(!root) return;
    const cart = getCart();
    const empty = document.querySelector('#cartEmpty');
    const tableWrap = document.querySelector('#cartTableWrap');
    if(cart.length === 0){
      if(tableWrap) tableWrap.style.display = 'none';
      if(empty) empty.style.display = 'block';
      updateTotals([]);
      return;
    }
    if(empty) empty.style.display = 'none';
    if(tableWrap) tableWrap.style.display = 'block';
    root.innerHTML = cart.map(i => `
      <tr class="cart-row">
        <td>
          <div class="cart-item">
            <img src="${i.img}" alt="${i.name}">
            <div>
              <div class="name">${i.name}</div>
              <div class="opts">Size: ${i.size}</div>
            </div>
          </div>
        </td>
        <td class="amt">$${i.price.toFixed(2)}</td>
        <td>
          <div class="qty-control">
            <button class="qm" data-id="${i.id}" data-size="${i.size}">−</button>
            <input type="text" readonly value="${i.qty}">
            <button class="qp" data-id="${i.id}" data-size="${i.size}">+</button>
          </div>
        </td>
        <td class="amt">$${(i.price*i.qty).toFixed(2)}</td>
        <td><button class="remove-row" data-id="${i.id}" data-size="${i.size}">Remove</button></td>
      </tr>
    `).join('');
    root.querySelectorAll('.qm').forEach(b=>b.addEventListener('click', ()=>{
      const item = cart.find(i=>i.id===b.dataset.id && i.size===b.dataset.size);
      window.stacklyCart.updateQty(b.dataset.id, b.dataset.size, item.qty - 1);
    }));
    root.querySelectorAll('.qp').forEach(b=>b.addEventListener('click', ()=>{
      const item = cart.find(i=>i.id===b.dataset.id && i.size===b.dataset.size);
      window.stacklyCart.updateQty(b.dataset.id, b.dataset.size, item.qty + 1);
    }));
    root.querySelectorAll('.remove-row').forEach(b=>b.addEventListener('click', ()=>window.stacklyCart.remove(b.dataset.id, b.dataset.size)));
    updateTotals(cart);
  }

  function updateTotals(cart){
    const sub = cart.reduce((s,i)=>s+i.price*i.qty,0);
    const shipping = cart.length === 0 ? 0 : (sub > 150 ? 0 : 12);
    const tax = sub * 0.05;
    const total = sub + shipping + tax;
    const set = (sel,val) => document.querySelectorAll(sel).forEach(el=>el.textContent = `$${val.toFixed(2)}`);
    set('.sum-subtotal', sub); set('.sum-tax', tax); set('.sum-total', total);
    document.querySelectorAll('.sum-shipping').forEach(el => el.textContent = shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`);
  }

  function renderOrderSummary(){
    const root = document.querySelector('#orderSummaryRoot');
    const cart = getCart();
    root.innerHTML = cart.map(i => `
      <div class="mini-item">
        <img src="${i.img}" alt="${i.name}">
        <div class="meta">${i.name}<small>Size ${i.size} · Qty ${i.qty}</small></div>
        <div>$${(i.price*i.qty).toFixed(2)}</div>
      </div>
    `).join('') || '<p style="color:var(--ink-soft);font-size:.9rem;">Your bag is empty.</p>';
    updateTotals(cart);
  }

  /* FAQ accordion */
  document.querySelectorAll('.faq-q').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.closest('.faq-item');
      const wasOpen = item.classList.contains('open');
      item.parentElement.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if(!wasOpen) item.classList.add('open');
    });
  });

  /* Footer year */
  document.querySelectorAll('.year').forEach(el => el.textContent = new Date().getFullYear());

});