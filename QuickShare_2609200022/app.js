const opening = document.getElementById('opening');
const openInvitation = document.getElementById('openInvitation');
const invitationContent = document.getElementById('invitationContent');
const themeMusic = document.getElementById('themeMusic');
const musicToggle = document.getElementById('musicToggle');
const replayButton = document.getElementById('replayButton');
const replayClosing = document.getElementById('replayClosing');
const shareButton = document.getElementById('shareButton');
const copyAddress = document.getElementById('copyAddress');
const toast = document.getElementById('toast');
const scrollProgress = document.getElementById('scrollProgress');
const sparkleField = document.getElementById('sparkles');
const weekdayReveal = document.getElementById('weekdayReveal');
const dateCards = [...document.querySelectorAll('.date-card')];

let hasOpened = false;
let musicEnabled = true;
let toastTimer;
let fxContext;
let birdChorusPlayed = false;

themeMusic.volume = 0.58;
invitationContent.inert = true;

function createSparkles() {
  const fragment = document.createDocumentFragment();
  for (let index = 0; index < 34; index += 1) {
    const particle = document.createElement('span');
    particle.className = 'sparkle';
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${25 + Math.random() * 72}%`;
    particle.style.setProperty('--duration', `${4.5 + Math.random() * 5.5}s`);
    particle.style.setProperty('--delay', `${-Math.random() * 8}s`);
    particle.style.setProperty('--drift', `${-45 + Math.random() * 90}px`);
    fragment.appendChild(particle);
  }
  sparkleField.replaceChildren(fragment);
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('is-visible');
  toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2400);
}

async function startMusic() {
  if (!musicEnabled) return;
  try {
    await themeMusic.play();
    musicToggle.classList.remove('is-muted');
    musicToggle.setAttribute('aria-label', 'Pause music');
    musicToggle.title = 'Pause music';
  } catch {
    musicEnabled = false;
    musicToggle.classList.add('is-muted');
    musicToggle.setAttribute('aria-label', 'Play music');
    musicToggle.title = 'Play music';
  }
}

function ensureFxContext() {
  if (!fxContext) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) fxContext = new AudioContext();
  }
  if (fxContext?.state === 'suspended') fxContext.resume();
  return fxContext;
}

function playChime() {
  if (!musicEnabled) return;
  const context = ensureFxContext();
  if (!context) return;
  const now = context.currentTime;
  [659.25, 783.99, 987.77].forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, now + index * 0.12);
    gain.gain.exponentialRampToValueAtTime(0.075, now + index * 0.12 + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.12 + 1.7);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(now + index * 0.12);
    oscillator.stop(now + index * 0.12 + 1.8);
  });
}

function playBirdChorus() {
  if (!musicEnabled || birdChorusPlayed) return;
  const context = ensureFxContext();
  if (!context) return;
  birdChorusPlayed = true;
  const base = context.currentTime + 0.2;
  [0, 0.75, 1.55, 2.35, 3.55].forEach((offset, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const pan = context.createStereoPanner ? context.createStereoPanner() : null;
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(1750 + index * 95, base + offset);
    oscillator.frequency.exponentialRampToValueAtTime(3050 + index * 80, base + offset + 0.22);
    oscillator.frequency.exponentialRampToValueAtTime(2200 + index * 70, base + offset + 0.46);
    gain.gain.setValueAtTime(0.0001, base + offset);
    gain.gain.exponentialRampToValueAtTime(0.032, base + offset + 0.035);
    gain.gain.exponentialRampToValueAtTime(0.0001, base + offset + 0.5);
    if (pan) {
      pan.pan.value = index % 2 ? 0.45 : -0.45;
      oscillator.connect(gain).connect(pan).connect(context.destination);
    } else {
      oscillator.connect(gain).connect(context.destination);
    }
    oscillator.start(base + offset);
    oscillator.stop(base + offset + 0.52);
  });
}

async function openExperience() {
  if (hasOpened) return;
  hasOpened = true;
  ensureFxContext();
  startMusic();
  opening.classList.add('is-opening');
  invitationContent.setAttribute('aria-hidden', 'false');
  invitationContent.inert = false;

  window.setTimeout(() => {
    opening.classList.add('is-gone');
    opening.inert = true;
    document.body.classList.remove('is-locked');
    document.body.classList.add('is-open');
    document.querySelector('.hero-copy')?.classList.add('is-visible');
  }, 1150);
}

function resetExperience() {
  hasOpened = false;
  birdChorusPlayed = false;
  themeMusic.pause();
  themeMusic.currentTime = 0;
  musicEnabled = true;
  musicToggle.classList.remove('is-muted');
  musicToggle.setAttribute('aria-label', 'Pause music');
  musicToggle.title = 'Pause music';
  document.body.classList.remove('is-open');
  document.body.classList.add('is-locked');
  opening.classList.remove('is-opening', 'is-gone');
  opening.inert = false;
  invitationContent.setAttribute('aria-hidden', 'true');
  invitationContent.inert = true;
  dateCards.forEach(card => {
    card.classList.remove('is-flipped');
    card.setAttribute('aria-pressed', 'false');
  });
  weekdayReveal.classList.remove('is-visible');
  window.scrollTo({ top: 0, behavior: 'auto' });
  window.setTimeout(() => openInvitation.focus({ preventScroll: true }), 80);
}

openInvitation.addEventListener('click', openExperience);
replayButton.addEventListener('click', resetExperience);
replayClosing.addEventListener('click', resetExperience);

musicToggle.addEventListener('click', async () => {
  if (themeMusic.paused) {
    musicEnabled = true;
    ensureFxContext();
    await startMusic();
    showToast('Music on');
  } else {
    musicEnabled = false;
    themeMusic.pause();
    musicToggle.classList.add('is-muted');
    musicToggle.setAttribute('aria-label', 'Play music');
    musicToggle.title = 'Play music';
    showToast('Music paused');
  }
});

dateCards.forEach(card => {
  card.setAttribute('aria-pressed', 'false');
  card.addEventListener('click', () => {
    const nowFlipped = !card.classList.contains('is-flipped');
    card.classList.toggle('is-flipped', nowFlipped);
    card.setAttribute('aria-pressed', String(nowFlipped));
    if (dateCards.every(item => item.classList.contains('is-flipped'))) {
      weekdayReveal.classList.add('is-visible');
      playChime();
    } else {
      weekdayReveal.classList.remove('is-visible');
    }
  });
});

function updateCountdown() {
  const wedding = new Date('2026-10-22T19:00:00+05:30').getTime();
  const remaining = Math.max(0, wedding - Date.now());
  const day = 86_400_000;
  const hour = 3_600_000;
  const minute = 60_000;
  document.getElementById('days').textContent = String(Math.floor(remaining / day)).padStart(2, '0');
  document.getElementById('hours').textContent = String(Math.floor((remaining % day) / hour)).padStart(2, '0');
  document.getElementById('minutes').textContent = String(Math.floor((remaining % hour) / minute)).padStart(2, '0');
  document.getElementById('seconds').textContent = String(Math.floor((remaining % minute) / 1000)).padStart(2, '0');
}

updateCountdown();
window.setInterval(updateCountdown, 1000);

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('is-visible');
  });
}, { threshold: 0.14, rootMargin: '0px 0px -7% 0px' });

document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));

const sunriseObserver = new IntersectionObserver(entries => {
  if (entries.some(entry => entry.isIntersecting)) playBirdChorus();
}, { threshold: 0.34 });

sunriseObserver.observe(document.getElementById('closing'));

window.addEventListener('scroll', () => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
  scrollProgress.style.width = `${Math.min(100, Math.max(0, progress))}%`;
}, { passive: true });

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const field = document.createElement('textarea');
  field.value = text;
  field.setAttribute('readonly', '');
  field.style.position = 'fixed';
  field.style.opacity = '0';
  document.body.appendChild(field);
  field.select();
  document.execCommand('copy');
  field.remove();
}

copyAddress.addEventListener('click', async () => {
  const address = document.getElementById('venueAddress').textContent.trim();
  try {
    await copyText(address);
    showToast('Venue address copied');
  } catch {
    showToast('Please copy the venue address manually');
  }
});

shareButton.addEventListener('click', async () => {
  const data = {
    title: 'Aliya & Farman | Wedding Invitation',
    text: 'You are warmly invited to the wedding of Aliya Durafshan and Farman Khan on Thursday, 22 October 2026.',
    url: window.location.href
  };
  try {
    if (navigator.share) {
      await navigator.share(data);
      return;
    }
    await copyText(window.location.href);
    showToast('Invitation link copied');
  } catch (error) {
    if (error?.name !== 'AbortError') showToast('Please copy the link from your browser');
  }
});

createSparkles();
