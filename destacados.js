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
  let cargandoFotos = false;

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
      if (icono) {
        imagen.remove();
        marco.dataset.archivo = '';
      } else marco.remove();
    }, { once: true });
    imagen.src = archivo;
    marco.append(imagen);
    return marco;
  }

  function mostrarFoto(tarjeta, nombre, archivo, clase, icono = '') {
    const anterior = tarjeta.querySelector(`.${clase}`);
    if (!archivo && !icono) {
      anterior?.remove();
      return;
    }

    const ruta = archivo || '';
    if (anterior?.dataset.archivo === ruta) return;
    const marco = marcoFoto(archivo, clase, icono);
    marco.dataset.archivo = ruta;
    if (anterior) anterior.replaceWith(marco);
    else nombre.before(marco);
  }

  function mostrarCarruseles() {
    for (const tarjeta of destacados.querySelectorAll('.dcard')) {
      const nombre = tarjeta.querySelector('.nm');
      if (!nombre) continue;
      const codigo = tarjeta.querySelector('[data-inc]')?.dataset.inc;
      const archivo = porCodigo.get(codigo);
      const icono = tarjeta.closest('[data-k="d"]') ? iconosDestacados[codigo] : '';
      mostrarFoto(tarjeta, nombre, archivo, 'dcard-photo', icono);
    }
  }

  function mostrarLista() {
    for (const fila of lista.querySelectorAll('.prod')) {
      const nombre = fila.querySelector('.n');
      if (!nombre) continue;
      const codigo = fila.querySelector('[data-inc]')?.dataset.inc;
      const archivo = codigo ? porCodigo.get(codigo) : porNombre.get(nombre.textContent.trim());
      mostrarFoto(fila, nombre, archivo, 'prod-photo');
    }
  }

  async function actualizarFotos() {
    if (cargandoFotos || document.hidden) return;
    cargandoFotos = true;
    try {
      const respuesta = await fetch('img/catalogo/fotos.json', { cache: 'no-cache' });
      if (!respuesta.ok) return;
      const { fotos } = await respuesta.json();
      if (!fotos || typeof fotos !== 'object' || Array.isArray(fotos)) return;

      porCodigo.clear();
      porNombre.clear();
      for (const [codigo, registro] of Object.entries(fotos)) {
        const { archivo, nombre } = registro || {};
        if (typeof nombre !== 'string' || !/^\d+$/.test(codigo)
          || !/^img\/(catalogo|destacados)\/[a-z0-9-]+\.webp$/.test(archivo)) continue;
        porCodigo.set(codigo, archivo);
        if (porNombre.has(nombre)) porNombre.set(nombre, null);
        else porNombre.set(nombre, archivo);
      }
      mostrarCarruseles();
      mostrarLista();
    } catch {
      // Conserva las fotos cargadas si el catálogo queda sin conexión.
    } finally {
      cargandoFotos = false;
    }
  }

  new MutationObserver(mostrarCarruseles).observe(destacados, { childList: true });
  new MutationObserver(mostrarLista).observe(lista, { childList: true });
  document.addEventListener('visibilitychange', actualizarFotos);
  window.addEventListener('online', actualizarFotos);
  setInterval(actualizarFotos, 120_000);
  actualizarFotos();

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
