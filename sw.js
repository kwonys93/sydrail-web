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
