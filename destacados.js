(() => {
  const destacados = document.getElementById('dest');
  if (!destacados) return;

  const fotos = {
    23588: ['tona-350', '🍺'],
    19802: ['huevo-rojo', '🥚'],
    16098: ['arroz-80-20', '🍚'],
    21796: ['pechuga-con-ala', '🍗'],
    21384: [null, '🍞'],
    15524: ['banano', '🍌'],
    17335: ['coca-cola-2l', '🥤'],
    15969: ['fuente-pura-galon', '💧'],
    23393: ['tomate', '🍅'],
    21798: ['pierna-con-muslo', '🍗'],
    22664: ['spark-limon-hierbabuena', '🥫'],
    21667: ['raptor-600', '🥤'],
  };

  function mostrarFotos() {
    for (const tarjeta of destacados.querySelectorAll('[data-k="d"] .dcard')) {
      const id = tarjeta.querySelector('[data-inc]')?.dataset.inc;
      const foto = fotos[id];
      const nombre = tarjeta.querySelector('.nm');
      if (!foto || !nombre || tarjeta.querySelector('.dcard-photo')) continue;

      const [archivo, icono] = foto;
      const marco = document.createElement('div');
      marco.className = 'dcard-photo';
      marco.setAttribute('aria-hidden', 'true');
      marco.textContent = icono;

      if (archivo) {
        const imagen = document.createElement('img');
        imagen.alt = '';
        imagen.width = 320;
        imagen.height = 224;
        imagen.loading = 'lazy';
        imagen.decoding = 'async';
        imagen.addEventListener('error', () => imagen.remove(), { once: true });
        imagen.src = `img/destacados/${archivo}.webp`;
        marco.append(imagen);
      }

      nombre.before(marco);
    }
  }

  mostrarFotos();
  new MutationObserver(mostrarFotos).observe(destacados, { childList: true });

  const nota = document.querySelector('main > section > .note');
  if (nota) {
    const creditos = document.createElement('a');
    creditos.className = 'photo-credits';
    creditos.href = 'img/destacados/creditos.txt';
    creditos.target = '_blank';
    creditos.rel = 'noopener';
    creditos.textContent = 'Créditos de fotos';
    nota.append(' · ', creditos);
  }
})();
