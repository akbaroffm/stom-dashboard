export const loadImage = (name) =>
  new URL(`../assets/images/png/${name}`, import.meta.url).href;
export const loadSvg = (name) =>
  new URL(`../assets/images/svg/${name}.svg`, import.meta.url).href;
