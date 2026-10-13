/**
 * Immersion: the visitor carries the light, and the world answers.
 *
 * Progressive enhancement throughout. Without JavaScript the page is complete;
 * with prefers-reduced-motion it is complete and still. Nothing here blocks reading.
 *
 *   .lumen         (Atmosphere) follows the visitor's hand
 *   [data-light]   type whose highlight follows the light (sets --lx / --ly on it)
 *   [data-lit]     brightens as it nears the middle of the view, dims toward the edges
 *   [data-depth]   drifts with scroll and pointer; 0.1 feels near, 0.6 feels far.
 *                  It sets `transform` inline, so don't put it on an element that
 *                  animates its own transform: wrap that element instead.
 *   --deep         on <html>: 0 at the top of the page, 1 at the bottom
 */

const root = document.documentElement;
const still = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');

/** How dim a passage gets at the edge of the view (0 to 1). */
const DIMMEST = 0.38;
/** Fully lit within this distance of the focus line, as a fraction of the view height. */
const LIT_ZONE = 0.2;
/** Reaches DIMMEST at this distance. */
const DARK_ZONE = 0.62;

type Layer = { el: HTMLElement; depth: number; rest: number };

const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const smoothstep = (t: number) => t * t * (3 - 2 * t);

function immerse(): void {
  const lumen = document.querySelector<HTMLElement>('.lumen');
  const lightType = [...document.querySelectorAll<HTMLElement>('[data-light]')];
  const litBlocks = [...document.querySelectorAll<HTMLElement>('[data-lit]')];
  let layers: Layer[] = [];

  const hand = { x: innerWidth * 0.62, y: innerHeight * 0.38 };
  const light = { ...hand };
  let frame = 0;

  /** Where each depth layer sits at rest: the scroll position that centres it (0 above the fold). */
  const measure = () => {
    const elements = [...document.querySelectorAll<HTMLElement>('[data-depth]')];
    for (const el of elements) el.style.transform = '';
    layers = elements.map((el) => {
      const box = el.getBoundingClientRect();
      const home = box.top + scrollY + box.height / 2;
      const rest = home <= innerHeight ? 0 : home - innerHeight / 2;
      return { el, depth: Number(el.dataset.depth) || 0, rest };
    });
  };

  const settle = () => {
    for (const { el } of layers) el.style.transform = '';
    for (const el of litBlocks) el.style.opacity = '';
  };

  const render = () => {
    frame = 0;
    const deep = clamp01(scrollY / Math.max(1, root.scrollHeight - innerHeight));
    root.style.setProperty('--deep', deep.toFixed(4));
    if (still.matches) return;

    // The light eases toward the hand rather than snapping to it.
    light.x += (hand.x - light.x) * 0.14;
    light.y += (hand.y - light.y) * 0.14;
    if (lumen) {
      lumen.style.transform = `translate3d(${light.x.toFixed(1)}px, ${light.y.toFixed(1)}px, 0) translate(-50%, -50%)`;
    }

    // Read every box first, then write, so the browser lays out once per frame.
    const typeBoxes = lightType.map((el) => el.getBoundingClientRect());
    const litBoxes = litBlocks.map((el) => el.getBoundingClientRect());

    lightType.forEach((el, i) => {
      el.style.setProperty('--lx', `${(light.x - typeBoxes[i].left).toFixed(1)}px`);
      el.style.setProperty('--ly', `${(light.y - typeBoxes[i].top).toFixed(1)}px`);
    });

    // The focus line sits mid-view and slides lower near the end, so the last passage can be lit.
    const focus = innerHeight * (0.5 + 0.3 * smoothstep(clamp01((deep - 0.85) / 0.15)));
    litBlocks.forEach((el, i) => {
      const box = litBoxes[i];
      const distance = Math.abs(box.top + box.height / 2 - focus) / innerHeight;
      const dark = smoothstep(clamp01((distance - LIT_ZONE) / (DARK_ZONE - LIT_ZONE)));
      el.style.opacity = (1 - dark * (1 - DIMMEST)).toFixed(3);
    });

    const px = finePointer.matches ? (light.x / innerWidth - 0.5) * 2 : 0;
    const py = finePointer.matches ? (light.y / innerHeight - 0.5) * 2 : 0;
    for (const { el, depth, rest } of layers) {
      const x = -px * depth * 28;
      const y = (scrollY - rest) * depth - py * depth * 18;
      el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
    }

    // Keep easing until the light catches up with the hand.
    if (Math.abs(hand.x - light.x) > 0.5 || Math.abs(hand.y - light.y) > 0.5) queue();
  };

  const queue = () => {
    if (!frame) frame = requestAnimationFrame(render);
  };

  measure();
  queue();
  addEventListener('scroll', queue, { passive: true });
  addEventListener(
    'pointermove',
    (event) => {
      hand.x = event.clientX;
      hand.y = event.clientY;
      queue();
    },
    { passive: true },
  );
  new ResizeObserver(() => {
    measure();
    queue();
  }).observe(document.body);
  still.addEventListener('change', () => {
    settle();
    measure();
    queue();
  });
}

immerse();
