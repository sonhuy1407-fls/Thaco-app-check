/* ════════════════════════════════════════════════════
   THACO AUTO – App Logic v2
   Fixed: navigation, splash→login persistence, finance calc
   ════════════════════════════════════════════════════ */

// ── State ─────────────────────────────────────────────────────
let currentPage = 'pg-splash';
const pageStack  = ['pg-splash'];
let finState     = { price: 799, dp: 30, term: 60, rate: 0.085 };

// ── Page navigation (NO CSS animation conflict) ────────────────
function navigate(targetId) {
  if (targetId === currentPage) return;

  const from = document.getElementById(currentPage);
  const to   = document.getElementById(targetId);
  if (!to) { showToast('⚠️ Trang đang được phát triển'); return; }

  // Hide current page
  if (from) {
    from.classList.remove('visible');
    from.classList.add('hidden');
  }

  // Show target page (no animation class to avoid the disappear bug)
  to.classList.remove('hidden');
  to.classList.add('visible');

  pageStack.push(targetId);
  currentPage = targetId;

  // Hide map loading once map page is visited
  if (targetId === 'pg-dealer') {
    setTimeout(() => {
      const loader = document.getElementById('map-loading');
      if (loader) loader.style.opacity = '0';
      setTimeout(() => { if (loader) loader.style.display = 'none'; }, 400);
    }, 2000);
  }
}

function goBack() {
  if (pageStack.length <= 1) return;
  pageStack.pop();
  const prev = pageStack[pageStack.length - 1];

  const from = document.getElementById(currentPage);
  const to   = document.getElementById(prev);

  if (from) { from.classList.remove('visible'); from.classList.add('hidden'); }
  if (to)   { to.classList.remove('hidden');   to.classList.add('visible'); }

  currentPage = prev;
}

// ── Bottom nav active state ────────────────────────────────────
function navActive(id) {
  document.querySelectorAll('.bn-item').forEach(b => b.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

// ── SPLASH → LOGIN  ────────────────────────────────────────────
// The key fix: we keep login page VISIBLE and never auto-navigate away
window.addEventListener('DOMContentLoaded', () => {
  // Animate splash progress bar
  const bar = document.getElementById('splash-progress');
  if (bar) {
    requestAnimationFrame(() => { bar.style.width = '100%'; });
  }

  // After 2.3 s: show login (no further auto-redirect)
  setTimeout(() => {
    navigate('pg-login');
  }, 2300);
});

// ── Login tab switch ───────────────────────────────────────────
function switchLoginTab(tab) {
  document.getElementById('lt-login').classList.toggle('active', tab === 'login');
  document.getElementById('lt-lookup').classList.toggle('active', tab === 'lookup');
  document.getElementById('lf-login').classList.toggle('hidden', tab !== 'login');
  document.getElementById('lf-lookup').classList.toggle('hidden', tab !== 'lookup');
}

// ── Toggle password ────────────────────────────────────────────
function togglePw(inputId, btn) {
  const inp = document.getElementById(inputId);
  inp.type = inp.type === 'password' ? 'text' : 'password';
  btn.textContent = inp.type === 'password' ? '👁' : '🙈';
}

// ── LOGIN ──────────────────────────────────────────────────────
function doLogin() {
  const phone = document.getElementById('f-phone').value.trim();
  const pass  = document.getElementById('f-pass').value.trim();
  if (!phone || !pass) { showToast('⚠️ Vui lòng nhập đầy đủ thông tin!'); return; }

  const btn = document.getElementById('btn-login');
  btn.textContent = '⏳ Đang đăng nhập...';
  btn.disabled = true;

  setTimeout(() => {
    btn.textContent = 'Đăng nhập →';
    btn.disabled = false;
    navigate('pg-home');
    showToast('✅ Đăng nhập thành công!');
  }, 1000);
}

function doSocialLogin(provider) {
  showToast(`🔗 Đang kết nối ${provider}...`);
  setTimeout(() => { navigate('pg-home'); showToast('✅ Đăng nhập thành công!'); }, 1200);
}

function doLookup() {
  const contract = document.getElementById('f-contract').value.trim();
  const cname    = document.getElementById('f-cname').value.trim();
  if (!contract || !cname) { showToast('⚠️ Vui lòng nhập đầy đủ thông tin!'); return; }
  showToast('🔍 Đang tra cứu...');
  setTimeout(() => { navigate('pg-order-tracking'); showToast('✅ Tìm thấy đơn hàng!'); }, 800);
}

// Enter key on login form
document.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    if (currentPage === 'pg-login') {
      const activeTab = document.querySelector('.ltab.active');
      if (activeTab && activeTab.id === 'lt-login') doLogin();
      else doLookup();
    } else if (currentPage === 'pg-chat') {
      chatSend();
    }
  }
});

// ── Car Detail tabs ────────────────────────────────────────────
function cdTab(el) {
  el.closest('.cd-tab-bar').querySelectorAll('.cd-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
}

// ── Service Booking ────────────────────────────────────────────
function selectSvcType(el, name) {
  document.querySelectorAll('.svc-type').forEach(s => s.classList.remove('selected'));
  el.classList.add('selected');
  showToast('✅ Chọn: ' + name);
}

function pickDate(el, day, date) {
  el.closest('.date-row').querySelectorAll('.date-opt').forEach(d => d.classList.remove('selected'));
  el.classList.add('selected');
}

function pickTime(el) {
  if (el.classList.contains('disabled')) return;
  el.closest('.time-grid').querySelectorAll('.time-opt').forEach(t => t.classList.remove('selected'));
  el.classList.add('selected');
}

function pickShowroom(el) {
  document.querySelectorAll('.showroom-opt').forEach(s => s.classList.remove('selected'));
  el.classList.add('selected');
}

function confirmBooking() {
  showModal('✅', 'Đặt lịch thành công!', 'TVBH sẽ gọi xác nhận trong vòng 15 phút. Lịch hẹn: Thứ 6, 06/06 lúc 9:00 tại Mazda Trường Chinh.');
}

// ── Finance Calculator ─────────────────────────────────────────
function calcFin() {
  const priceEl  = document.getElementById('sl-price');
  const amountEl = document.getElementById('fr-amount');
  const lblPrice = document.getElementById('lbl-price');
  const lblDp    = document.getElementById('lbl-dp');
  const dpAmt    = document.getElementById('dp-amount');

  if (priceEl) finState.price = parseInt(priceEl.value);

  const loanAmt     = finState.price * (1 - finState.dp / 100);
  const monthlyRate = finState.rate / 12;
  const n           = finState.term;
  const monthly     = (loanAmt * monthlyRate * Math.pow(1 + monthlyRate, n)) /
                      (Math.pow(1 + monthlyRate, n) - 1);

  if (amountEl) amountEl.textContent = `~${monthly.toFixed(1)} triệu/tháng`;
  if (lblPrice) lblPrice.textContent = `${finState.price} triệu`;
  if (lblDp)    lblDp.textContent    = `${finState.dp}%`;
  if (dpAmt)    dpAmt.textContent    = `Số tiền trả trước: ~${(finState.price * finState.dp / 100).toFixed(1)} triệu`;
  if (document.getElementById('lbl-term'))
    document.getElementById('lbl-term').textContent = `${finState.term} tháng`;
  if (document.getElementById('fr-note'))
    document.getElementById('fr-note').textContent =
      `Lãi suất 8.5%/năm · Vay ${loanAmt.toFixed(0)} triệu trong ${n} tháng`;
}

function selectFin(el, type, val) {
  const groupId = type === 'dp' ? 'dp-chips' : 'term-chips';
  document.getElementById(groupId).querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  if (type === 'dp')   finState.dp   = val;
  if (type === 'term') finState.term = val;
  calcFin();
}

// ── Map / Dealer ───────────────────────────────────────────────
function focusMap(dealerId) {
  showToast('📍 Đang hiển thị vị trí showroom...');
}

function openMaps(query) {
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  window.open(url, '_blank');
}

// ── Chat ───────────────────────────────────────────────────────
const autoReplies = [
  'Cảm ơn anh/chị! Tôi đang xem lại thông tin, vui lòng chờ một chút 🙏',
  'Xe Mazda CX-5 của anh/chị hiện đang ở bước kiểm định chất lượng tại nhà máy Chu Lai. Dự kiến xuất kho 25/06/2026.',
  'Tôi đã ghi nhận yêu cầu và sẽ phản hồi trong vòng 5 phút!',
  'Anh/chị có thể cung cấp số hợp đồng để tôi tra cứu nhanh hơn không ạ?',
];
let autoIdx = 0;

function chatSend(text) {
  const input = document.getElementById('chat-input');
  const msg   = text || (input ? input.value.trim() : '');
  if (!msg) return;
  if (input) input.value = '';

  const container = document.getElementById('chat-msgs');
  if (!container) return;

  // User bubble
  const userEl = document.createElement('div');
  userEl.className = 'msg-row user';
  userEl.innerHTML = `<div class="msg-bubble">${msg}</div>`;
  container.appendChild(userEl);
  container.scrollTop = container.scrollHeight;

  // Remove quick reply buttons
  const qrs = container.querySelector('.quick-replies');
  if (qrs) qrs.remove();

  // Agent reply after delay
  setTimeout(() => {
    const reply = autoReplies[autoIdx % autoReplies.length];
    autoIdx++;
    const agentEl = document.createElement('div');
    agentEl.className = 'msg-row agent';
    agentEl.innerHTML = `<div class="msg-av">🧑‍💼</div><div class="msg-bubble">${reply}</div>`;
    container.appendChild(agentEl);
    container.scrollTop = container.scrollHeight;
  }, 900);
}

// ── Toast ──────────────────────────────────────────────────────
let toastTimer = null;
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

// ── Modal ──────────────────────────────────────────────────────
function showModal(icon, title, desc) {
  document.getElementById('m-icon').textContent  = icon;
  document.getElementById('m-title').textContent = title;
  document.getElementById('m-desc').textContent  = desc;
  document.getElementById('modal-bg').classList.remove('hidden');
}
function closeModal() {
  document.getElementById('modal-bg').classList.add('hidden');
}

// ── Filter chips in buy-car ────────────────────────────────────
document.querySelectorAll('.filter-bar .chip').forEach(chip => {
  chip.addEventListener('click', function () {
    document.querySelectorAll('.filter-bar .chip').forEach(c => c.classList.remove('active'));
    this.classList.add('active');
  });
});

console.log('🚗 THACO Auto v2 initialized');
