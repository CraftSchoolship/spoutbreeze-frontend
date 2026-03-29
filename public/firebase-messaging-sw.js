importScripts('https://www.gstatic.com/firebasejs/10.10.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.10.0/firebase-messaging-compat.js');

// We don't have access to process.env here directly, so we rely on the snippet
// However, service workers generally need the config hardcoded or fetched via URLparams.
// A common workaround is to use URL query parameters when registering the SW, or
// initialize it here with placeholder variables that get replaced by your build process.
//
// For Next.js, a simpler approach is fetching the config dynamically or 
// hardcoding the known safe public variables if they don't change often.

const firebaseConfig = {
  // IMPORTANT: You will need to replace these placeholders or inject them during build.
  // Alternatively, the background messages will still be processed by the browser's native push
  // mechanism if the token was generated properly by the main thread.
  // This initialization is strictly required if you want custom background data handling.
  apiKey: "AIzaSyBlXjxGsPShDlb2KmAA-v2-lvKrIboVGX4",
  authDomain: "bluescale-b3112.firebaseapp.com",
  projectId: "bluescale-b3112",
  messagingSenderId: "302091099824",
  appId: "1:302091099824:web:7eae3039d24d6ee88a2575",
};

try {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const notificationTitle = payload.notification?.title || 'New Notification';
    const notificationOptions = {
      body: payload.notification?.body,
      icon: '/logo.png', // Replace with your actual icon
      data: payload.data,
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} catch (error) {
  console.log('[firebase-messaging-sw.js] Failed to initialize Firebase:', error);
}

// Add event listener for notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // This looks to see if the current is already open and focuses if it is
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
