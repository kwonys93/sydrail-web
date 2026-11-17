// Sydrail 알림 처리기(2026-11-13): 내리기 알림을 폰 알림으로 띄우고, 누르면 앱 화면으로 돌아온다
// 2026-11-16: 폰 "앱 설치"가 되게 화면을 켤 때 등록하고, 받기 처리기(fetch)를 둔다(그대로 인터넷에서 받음, 저장 안 함)
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  if (e.request.mode !== 'navigate') return;
  e.respondWith(fetch(e.request).catch(() => new Response('<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><p style="font:16px sans-serif;padding:24px">인터넷 연결을 확인해 주세요.<br>Please check your internet connection.</p>', { headers: { 'Content-Type': 'text/html; charset=utf-8' } })));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => cs.length ? cs[0].focus() : self.clients.openWindow('./')));
});
// 2026-11-17 서버 푸시: 서버가 "앞 역을 떠났어요" 신호(내용 없음)를 보내면, 화면이 저장해 둔 문구(Cache 'sydrail-alarm')로 폰 알림을 띄운다 — 앱이 뒤에 있거나 화면이 꺼져 있어도
self.addEventListener('push', e => e.waitUntil((async () => {
  let info = null;
  try {
    const c = await caches.open('sydrail-alarm'), t = await c.match('alarm-test');
    if (t) { const j = await t.json(); await c.delete('alarm-test'); if (Date.now() < j.exp) info = j; }   // 시험 알림(잠깐만 유효)
    if (!info) { const r = await c.match('alarm-info'); if (r) info = await r.json(); }
  } catch (_) {}
  if (!info) info = { title: '🔔 Sydrail', body: '다음 역에서 내려요 · Get off at the next stop' };
  await self.registration.showNotification(info.title, { body: info.body, tag: info.test ? 'sydrail-test' : 'sydrail-alarm', renotify: true, requireInteraction: !info.test, vibrate: [600, 200, 600, 200, 600, 200, 1200], icon: 'icon-192.png' });
  const cs = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  cs.forEach(c => c.postMessage({ type: 'alarm-push', test: !!info.test }));
})()));
