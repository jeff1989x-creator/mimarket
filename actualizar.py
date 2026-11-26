"""Actualiza la app instalable a partir de la tienda publicada en Claude.
Uso: python3 actualizar.py tienda.html   (escribe index.html y renueva sw.js)"""
import sys, time
OUT='.'
ver = time.strftime('%Y%m%d%H%M')
open(f'{OUT}/sw.js', 'w').write(f"""// Pedidos MiMarket: siempre intenta traer precios nuevos; sin señal muestra la última copia.
const C='mimarket-{ver}';
const BASE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(BASE)).catch(()=>{{}}))}});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{{
  const r=e.request; if(r.method!=='GET')return;
  const u=new URL(r.url); if(u.origin!==location.origin)return;
  e.respondWith(fetch(r).then(res=>{{const cp=res.clone();caches.open(C).then(c=>c.put(r,cp));return res}}).catch(()=>caches.match(r).then(m=>m||caches.match('./index.html'))));
}});
""")

HEAD = """<link rel="manifest" href="manifest.webmanifest">
<meta name="theme-color" content="#111111">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="MiMarket">
<meta name="apple-mobile-web-app-status-bar-style" content="black">
<link rel="icon" type="image/png" sizes="192x192" href="icon-192.png">
<link rel="apple-touch-icon" href="icon-180.png">
<meta name="description" content="Haz tu pedido del super Mi Market y envíalo por WhatsApp.">
<meta property="og:title" content="Pedidos MiMarket">
<meta property="og:description" content="Arma tu pedido y envíalo por WhatsApp. Entrega a domicilio.">
<meta property="og:image" content="icon-512.png">
<style>
#inst{position:fixed;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom));z-index:60;display:flex;gap:10px;align-items:center;background:#111;color:#fff;border-radius:14px;padding:10px 12px;box-shadow:0 8px 24px #0005;max-width:520px;margin:0 auto}
#inst[hidden]{display:none}#inst img{width:40px;height:40px;border-radius:10px}
#inst p{margin:0;flex:1;font-size:14px;line-height:1.3}#inst b{display:block;font-size:15px}
#inst .si{background:#ffa000;color:#111;border:0;border-radius:10px;padding:9px 14px;font:800 15px "Nunito Sans",sans-serif}
#inst .no{background:none;border:0;color:#bbb;font-size:20px;padding:4px 6px}
</style>
"""

BODY = """<div id="inst" hidden role="dialog" aria-label="Instalar app"><img src="icon-96.png" alt=""><p><b>Instala la app MiMarket</b><span id="instTxt">Pide más rápido desde tu pantalla de inicio.</span></p><button type="button" class="si" id="instSi">Instalar</button><button type="button" class="no" id="instNo" aria-label="Cerrar">✕</button></div>
<script>
(()=>{
 if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
 const box=document.getElementById('inst'),si=document.getElementById('instSi'),txt=document.getElementById('instTxt');
 const ya=matchMedia('(display-mode: standalone)').matches||navigator.standalone;
 let no=false;try{no=localStorage.getItem('mm.noinst')==='1'}catch(e){}
 if(ya||no)return;
 let ev=null;
 addEventListener('beforeinstallprompt',e=>{e.preventDefault();ev=e;setTimeout(()=>box.hidden=false,2500)});
 si.onclick=async()=>{if(ev){ev.prompt();await ev.userChoice;ev=null;box.hidden=true}else box.hidden=true};
 document.getElementById('instNo').onclick=()=>{box.hidden=true;try{localStorage.setItem('mm.noinst','1')}catch(e){}};
 addEventListener('appinstalled',()=>box.hidden=true);
 if(/iphone|ipad|ipod/i.test(navigator.userAgent)){txt.textContent='En Safari toca Compartir ⬆️ y luego "Agregar a inicio".';si.textContent='Entendido';setTimeout(()=>box.hidden=false,2500)}
})();
</script>
"""

src = open(sys.argv[1], encoding='utf-8').read()
src = src[src.index('<!DOCTYPE html>'):]
if 'id="inst"' in src: sys.exit('Ese archivo ya es la app; usa la tienda original.')
src = src.replace('<title>Tienda MiMarket</title>', '<title>Pedidos MiMarket</title>', 1)
src = src.replace('</head>', HEAD + '</head>', 1)
i = src.rindex('</body>')
src = src[:i] + BODY + src[i:]
open('index.html', 'w', encoding='utf-8').write(src)
print('index.html actualizado', len(src), ver)
