/* =========================================================
   IMAGES
   Put your photos in the /images folder and list the filenames
   below. They appear in the order you write them here.

   The first few (HERO_COUNT) rotate in the homepage panel.
   All of them fill the gallery and lightbox on the work page.
   ========================================================= */
const IMAGE_FOLDER = 'images/web/';

const IMAGES = [
    'work-1.jpg',
    'work-2.jpg',
    'work-3.jpg',
    'work-4.jpg',
    'work-5.jpg',
    'work-6.jpg',
    'work-7.jpg',
    'work-8.jpg',
    'work-9.jpg',
    'work-10.jpg',
    'work-11.jpg',
    'work-12.jpg'
];

/* lightbox state — declared here so the builders below can fill it */
let gallerySrcs = [];
let lbIndex = 0;

/* how many of them rotate in the homepage panel */
const HERO_COUNT = 5;
/* seconds each homepage image stays up */
const HERO_HOLD = 4.4;

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- homepage: rotating panel ---------- */
function buildHero(files) {
    const frame = document.getElementById('shot-frame');
    const dots = document.getElementById('shot-dots');
    if (!frame || !files.length) return;

    const list = files.slice(0, HERO_COUNT);
    const total = list.length * HERO_HOLD * 1000;

    list.forEach((name, i) => {
        const img = document.createElement('img');
        img.src = IMAGE_FOLDER + name;
        img.alt = i === 0 ? 'Recent client work' : '';
        img.loading = i === 0 ? 'eager' : 'lazy';
        frame.appendChild(img);

        if (dots) {
            const bar = document.createElement('i');
            dots.appendChild(bar);
        }

        if (prefersReduced || list.length === 1) {
            if (i === 0) { img.style.opacity = '1'; img.style.transform = 'none'; }
            return;
        }

        const share = 100 / list.length;          /* % of the cycle each image owns */
        const fade = share * 0.16;

        img.animate([
            { opacity: 0, transform: 'scale(1.07)', offset: 0 },
            { opacity: 1, offset: fade / 100 },
            { opacity: 1, offset: (share - fade) / 100 },
            { opacity: 0, transform: 'scale(1.0)', offset: share / 100 },
            { opacity: 0, transform: 'scale(1.0)', offset: 1 }
        ], { duration: total, iterations: Infinity, delay: i * HERO_HOLD * 1000, easing: 'linear' });

        if (dots) {
            dots.children[i].animate([
                { '--fill': 0, offset: 0 }
            ], { duration: 1 });
            const bar = dots.children[i];
            bar.style.setProperty('--dur', total + 'ms');
            const inner = document.createElement('b');
            bar.appendChild(inner);
            inner.animate([
                { transform: 'scaleX(0)', offset: 0 },
                { transform: 'scaleX(1)', offset: (share - fade) / 100 },
                { transform: 'scaleX(0)', offset: share / 100 },
                { transform: 'scaleX(0)', offset: 1 }
            ], { duration: total, iterations: Infinity, delay: i * HERO_HOLD * 1000, easing: 'linear' });
        }
    });
}

/* ---------- work page: gallery ---------- */
function buildGallery(files) {
    const grid = document.getElementById('gallery');
    if (!grid || !files.length) return;

    files.forEach((name, i) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'shot';

        const img = document.createElement('img');
        img.src = IMAGE_FOLDER + name;
        img.alt = 'Project photo ' + (i + 1);
        img.loading = 'lazy';

        const label = document.createElement('span');
        label.textContent = String(i + 1).padStart(2, '0');

        btn.append(img, label);
        btn.addEventListener('click', () => { lbIndex = i; openLightbox(btn); });
        grid.appendChild(btn);
    });

    gallerySrcs = files.map(n => IMAGE_FOLDER + n);
}

/* ---------- mobile nav ---------- */
const burger = document.getElementById('burger');
const navLinks = document.getElementById('nav-links');

if (burger && navLinks) {
    burger.addEventListener('click', () => {
        const open = navLinks.classList.toggle('open');
        burger.setAttribute('aria-expanded', String(open));
        burger.textContent = open ? 'Close' : 'Menu';
    });
}

function closeNav() {
    if (!navLinks) return;
    navLinks.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    burger.textContent = 'Menu';
}

if (burger && navLinks) {
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape' || !navLinks.classList.contains('open')) return;
        const inside = navLinks.contains(document.activeElement);
        closeNav();
        if (inside) burger.focus();   // the link it was on is about to be hidden
    });
}

/* ---------- pause control for the ticker and the homepage panel ----------
   Both move for well over five seconds, so WCAG 2.2.2 wants a way to stop
   them. One button, in the ticker, which the fixed nav keeps on screen. */
const ticker = document.querySelector('.ticker');
if (ticker && !prefersReduced) {
    const pause = document.createElement('button');
    pause.type = 'button';
    pause.className = 'ticker-pause';
    pause.setAttribute('aria-pressed', 'false');
    pause.setAttribute('aria-label', 'Pause animation');
    pause.textContent = '❚❚';
    // A sibling, not a child: the ticker is aria-hidden.
    ticker.parentNode.insertBefore(pause, ticker.nextSibling);

    const setPaused = (paused) => {
        ticker.classList.toggle('is-paused', paused);
        pause.setAttribute('aria-pressed', String(paused));
        pause.textContent = paused ? '▶' : '❚❚';
        const frame = document.getElementById('shot-frame');
        const dots = document.getElementById('shot-dots');
        [frame, dots].forEach(el => {
            if (el && el.getAnimations) el.getAnimations({ subtree: true }).forEach(a => paused ? a.pause() : a.play());
        });
        try { localStorage.setItem('ld-motion-paused', paused ? '1' : ''); } catch (e) { /* private mode */ }
    };
    pause.addEventListener('click', () => setPaused(pause.getAttribute('aria-pressed') !== 'true'));
    let saved = '';
    try { saved = localStorage.getItem('ld-motion-paused') || ''; } catch (e) { /* private mode */ }
    if (saved) window.addEventListener('load', () => setPaused(true));
}

/* ---------- scroll reveal ---------- */
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length) {
    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in');
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => io.observe(el));
}

/* ---------- FAQ accordion ---------- */
document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
        const item = btn.parentElement;
        const open = item.classList.toggle('open');
        btn.setAttribute('aria-expanded', String(open));
    });
});

/* ---------- gallery lightbox ---------- */

/* The tile that opened it, so focus goes back there on close. Passed in
   rather than read from activeElement: Safari doesn't focus a tapped button. */
let lbOpener = null;
let lbScrollY = 0;

function openLightbox(opener) {
    const lb = document.getElementById('lightbox');
    if (!lb || lb.classList.contains('active')) return;
    lbOpener = opener || document.activeElement;
    lb.classList.add('active');
    updateLightboxImage();
    // iOS Safari scrolls the page behind overflow:hidden; pin it instead.
    lbScrollY = window.scrollY;
    document.body.style.top = (-lbScrollY) + 'px';
    document.body.classList.add('is-locked');
    lb.querySelector('.lb-close').focus();
}

function closeLightbox() {
    const lb = document.getElementById('lightbox');
    if (!lb || !lb.classList.contains('active')) return;
    lb.classList.remove('active');
    document.body.classList.remove('is-locked');
    document.body.style.top = '';
    window.scrollTo({ top: lbScrollY, behavior: 'instant' });   // html has smooth scrolling
    if (lbOpener) lbOpener.focus();
}

function changeLightboxImage(direction) {
    if (!gallerySrcs.length) return;
    lbIndex = (lbIndex + direction + gallerySrcs.length) % gallerySrcs.length;
    updateLightboxImage();
}

function updateLightboxImage() {
    const img = document.getElementById('lightbox-img');
    img.src = gallerySrcs[lbIndex];
    img.alt = 'Project photo ' + (lbIndex + 1);
    document.getElementById('lightbox-counter').textContent = (lbIndex + 1) + ' / ' + gallerySrcs.length;
}

const lbEl = document.getElementById('lightbox');
if (lbEl) {
    lbEl.addEventListener('click', function (e) {
        if (e.target === this) closeLightbox();
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeLightbox();
        } else if (lbEl.classList.contains('active')) {
            if (e.key === 'ArrowLeft') changeLightboxImage(-1);
            if (e.key === 'ArrowRight') changeLightboxImage(1);
            if (e.key === 'Tab') {
                // Keep Tab inside the viewer.
                const f = [...lbEl.querySelectorAll('button')];
                const first = f[0], last = f[f.length - 1];
                if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
                else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
        }
    });
}

/* ---------- contact form ---------- */
async function handleContactSubmit(event) {
    event.preventDefault();

    const submitBtn = document.getElementById('contact-submit-btn');
    const messageDiv = document.getElementById('contact-form-message');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');

    const formData = new FormData();
    formData.append('access_key', '185459f3-8b9c-442f-a764-b8c3136bfae4');
    formData.append('name', document.getElementById('contact-name').value);
    formData.append('email', document.getElementById('contact-email').value);
    formData.append('message', document.getElementById('contact-message').value);
    formData.append('subject', 'New Contact Form Submission from Lucidly Digital');
    formData.append('from_name', 'Lucidly Digital Website');

    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';
    messageDiv.className = 'form-msg';

    try {
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();

        if (data.success) {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'conversion', {
                    'send_to': 'G-9BZCXRPLGC',
                    'event_category': 'Contact',
                    'event_label': 'Form Submission'
                });
            }
            window.location.href = 'thank-you.html';
        } else {
            throw new Error('Failed to send message');
        }
    } catch (error) {
        messageDiv.className = 'form-msg error';
        messageDiv.textContent = "That didn't send. Email hello@lucidlydigital.com and we'll pick it up from there.";
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
    }
}

/* ---------- build image-driven sections ---------- */
buildHero(IMAGES);
buildGallery(IMAGES);
