const API_BASE = 'https://gdbrowser.com/api'; // базовый URL GDBrowser API

let followed = null;
let lastProfile = null;

// Обработка сообщений от страницы
self.addEventListener('message', event => {
  const data = event.data;
  if (data.type === 'FOLLOW_PLAYER') {
    followed = data.username;
    lastProfile = null;
    pollPlayer();
  }
});

// Функция опроса API
async function pollPlayer() {
  if (!followed) return;

  try {
    const resp = await fetch(`${API_BASE}/profile/${encodeURIComponent(followed)}`);
    if (!resp.ok) throw new Error('Ошибка API');

    const profile = await resp.json();

    // Если есть прошлый профиль, проверим изменения
    if (lastProfile) {
      // Пример: если количество CP (creator points) изменилось — считаем, что выложил уровень
      if (profile.cp !== lastProfile.cp) {
        showNotification(`Игрок ${followed}`, `У ${followed} изменились креатор баллы: ${lastProfile.cp} → ${profile.cp}`);
      }
      // Можно проверять и другие параметры: звёзды, уровни, демоны и т.д.
    } else {
      // Первое получение профиля
      showNotification(`Теперь следишь за ${followed}`, `Получили данные профиля игрока.`);
    }

    lastProfile = profile;
  } catch (e) {
    console.error('Ошибка при опросе API:', e);
  }

  // Планируем следующий опрос через, например, каждую минуту (для демо)
  setTimeout(pollPlayer, 60 * 1000);
}

// Функция показа уведомления
async function showNotification(title, body) {
  await self.registration.showNotification(title, {
    body,
    icon: 'https://cdn-icons-png.flaticon.com/512/1250/1250615.png',
    tag: 'gd-follow'
  });
}