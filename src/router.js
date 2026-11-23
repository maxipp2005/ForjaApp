// Enrutado por hash (#/vista/sub/id): funciona en GitHub Pages y abriendo el archivo directamente.
export const parse = () => {
  const [view = 'hoy', sub = '', id = ''] = location.hash.replace(/^#\/?/, '').split('/').map(decodeURIComponent);
  return { view: view || 'hoy', sub, id };
};
export const go = (...parts) => { location.hash = '#/' + parts.filter(Boolean).map(encodeURIComponent).join('/'); };
