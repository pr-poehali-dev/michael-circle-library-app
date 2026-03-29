# Сборка APK через Capacitor

## Что нужно установить на компьютер
1. **Node.js** (v18+) — https://nodejs.org
2. **Android Studio** — https://developer.android.com/studio
3. **Java JDK 17** — https://adoptium.net

---

## Шаг 1 — Скачать код проекта
В редакторе нажать: **Скачать → Скачать код** → распаковать архив

---

## Шаг 2 — Установить Capacitor
```bash
cd папка-с-проектом

# Установить зависимости
npm install

# Установить Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android

# Инициализировать Capacitor
npx cap init "Архив Михаила Круга" "ru.mikrug.archive" --web-dir=dist
```

---

## Шаг 3 — Собрать веб-билд
```bash
npm run build
```

---

## Шаг 4 — Добавить Android платформу
```bash
npx cap add android
npx cap sync android
```

---

## Шаг 5 — Открыть в Android Studio
```bash
npx cap open android
```

В Android Studio:
- Подождать пока Gradle синхронизируется (2-5 минут)
- **Build → Build Bundle(s) / APK(s) → Build APK(s)**
- APK появится в: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## Шаг 6 — Установить на телефон
```bash
# Через ADB (USB-отладка должна быть включена)
adb install android/app/build/outputs/apk/debug/app-debug.apk
```
Или просто скопировать APK-файл на телефон и открыть.

---

## Настройка иконок приложения
Положить файлы иконок в `public/icons/`:
- `icon-192.png` — основная иконка
- `icon-512.png` — иконка для магазина

Затем в Android Studio: **Tools → Resource Manager → + → Image Asset**

---

## Подпись для Google Play (release-версия)
```bash
# Создать keystore
keytool -genkey -v -keystore krug-release.keystore -alias krug -keyalg RSA -keysize 2048 -validity 10000

# Собрать release APK
# В Android Studio: Build → Generate Signed Bundle/APK
```
