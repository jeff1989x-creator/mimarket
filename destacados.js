(() => {
  const destacados = document.getElementById('dest');
  const lista = document.getElementById('list');
  if (!destacados || !lista) return;

  const iconosDestacados = {
    23588: '🍺', 19802: '🥚', 16098: '🍚', 21796: '🍗',
    21384: '🍞', 15524: '🍌', 17335: '🥤', 15969: '💧',
    23393: '🍅', 21798: '🍗', 22664: '🥫', 21667: '🥤',
  };
  const porCodigo = new Map();
  const porNombre = new Map();

  function marcoFoto(archivo, clase, icono = '') {
    const marco = document.createElement('div');
    marco.className = clase;
    marco.setAttribute('aria-hidden', 'true');
    marco.textContent = icono;
    if (!archivo) return marco;

    const imagen = document.createElement('img');
    imagen.alt = '';
    imagen.width = 320;
    imagen.height = 224;
    imagen.loading = 'lazy';
    imagen.decoding = 'async';
    imagen.addEventListener('error', () => {
      if (icono) imagen.remove();
      else marco.remove();
    }, { once: true });
    imagen.src = archivo;
    marco.append(imagen);
    return marco;
  }

  function mostrarCarruseles() {
    for (const tarjeta of destacados.querySelectorAll('.dcard')) {
      const codigo = tarjeta.querySelector('[data-inc]')?.dataset.inc;
      const archivo = porCodigo.get(codigo);
      const icono = tarjeta.closest('[data-k="d"]') ? iconosDestacados[codigo] : '';
      if ((!archivo && !icono) || tarjeta.querySelector('.dcard-photo')) continue;
      tarjeta.querySelector('.nm')?.before(marcoFoto(archivo, 'dcard-photo', icono));
    }
  }

  function mostrarLista() {
    for (const fila of lista.querySelectorAll('.prod')) {
      const nombre = fila.querySelector('.n');
      if (!nombre || fila.querySelector('.prod-photo')) continue;
      const codigo = fila.querySelector('[data-inc]')?.dataset.inc;
      const archivo = codigo ? porCodigo.get(codigo) : porNombre.get(nombre.textContent.trim());
      if (archivo) nombre.before(marcoFoto(archivo, 'prod-photo'));
    }
  }

  async function iniciarFotos() {
    const respuesta = await fetch('img/catalogo/fotos.json', { cache: 'no-cache' });
    if (!respuesta.ok) return;
    const { fotos } = await respuesta.json();
    for (const [codigo, registro] of Object.entries(fotos || {})) {
      const { archivo, nombre } = registro || {};
      if (typeof nombre !== 'string' || !/^\d+$/.test(codigo)
        || !/^img\/(catalogo|destacados)\/[a-z0-9-]+\.webp$/.test(archivo)) continue;
      porCodigo.set(codigo, archivo);
      if (porNombre.has(nombre)) porNombre.set(nombre, null);
      else porNombre.set(nombre, archivo);
    }
    mostrarCarruseles();
    mostrarLista();
    new MutationObserver(mostrarCarruseles).observe(destacados, { childList: true });
    new MutationObserver(mostrarLista).observe(lista, { childList: true });
  }

  iniciarFotos().catch(() => {});

  const nota = document.querySelector('main > section > .note');
  if (nota) {
    const creditos = document.createElement('a');
    creditos.className = 'photo-credits';
    creditos.href = 'img/catalogo/creditos.html';
    creditos.target = '_blank';
    creditos.rel = 'noopener';
    creditos.textContent = 'Créditos de fotos';
    nota.append(' · ', creditos);
  }
})();
