<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Loyiha qoidalari (shop_web)

Bu Next.js loyihasi — kichik onlayn do'kon. Ham oddiy web sayt, ham keyinchalik
Telegram Mini App sifatida ishlaydi. Hozir faqat SKELET quramiz: struktura,
tizimlar va bo'sh sahifalar. Dizayn keyingi bosqichda.

## 1. Papka tuzilishi

```
app/
  layout.tsx              root layout (providerlar shu yerda)
  page.tsx                bosh sahifa
  catalog/page.tsx
  cart/page.tsx
  favorites/page.tsx
  profile/page.tsx
components/
  ui/                     primitivlar: Button, Input, Modal, Skeleton
  layout/                 Header, BottomNav, Container
  shared/                 bir necha sahifada takrorlanadigan komponentlar
  <sahifa-nomi>/          faqat o'sha sahifaga tegishli komponentlar
lib/
  i18n/
  theme/
  utils/
  types/
store/                    zustand store'lar
```

Har bir sahifa papkasida page.tsx bilan birga loading.tsx bo'lsin.

## 2. Til tizimi (uz, en, ru)

- URL'da til prefiksi BO'LMASIN (/uz, /en emas) — Telegram Mini App uchun
  ortiqcha murakkablik. React Context ishlatilsin.
- lib/i18n/locales/ ichida uz.json, en.json, ru.json
- lib/i18n/ ichida LanguageProvider va useTranslation() hook
- Standart til: uz. Tanlangan til localStorage'da saqlansin.
- Uchala JSON faylning kalitlari BIR XIL bo'lishi shart.
- Kodda matn to'g'ridan-to'g'ri yozilmasin, faqat t('kalit')

## 3. Mavzu (light / dark / auto)

- next-themes paketi, attribute="class", defaultTheme="system"
- Tailwind'da darkMode: 'class'
- Ranglar CSS o'zgaruvchilari orqali berilsin (globals.css ichida
  :root va .dark bloklari). Komponentlarda bg-white yoki bg-black kabi
  qattiq ranglar YOZILMASIN.
- Sahifa yuklanganda mavzu miltillamasligi kerak (hydration mismatch bo'lmasin)
- Profil sahifasida uchta tanlov: Light / Dark / Auto

## 4. Skeleton loading (majburiy)

- components/ui/Skeleton.tsx — asosiy primitiv
- Har bir ma'lumot yuklanadigan blok uchun alohida skeleton komponenti:
  ProductCardSkeleton, ProductDetailSkeleton, CartItemSkeleton va hokazo
- Skeleton faqat kutish holati emas — u haqiqiy kontentning O'LCHAMI va
  JOYLASHUVIni takrorlashi shart, aks holda sahifa sakraydi
- Skeleton ranglari ham light va dark rejimda to'g'ri ko'rinsin
- Har bir sahifada loading.tsx bo'lsin va ichida o'sha sahifaning
  skeletoni ishlatilsin

## 5. Promokod

- store/cart.ts ichida promokod holati bo'lsin: kod, chegirma summasi, xato
- components/cart/PromoCode.tsx — input + "Qo'llash" tugmasi
- Holatlari: bo'sh, yuklanmoqda (skeleton yoki spinner), qabul qilindi,
  xato (noto'g'ri kod / muddati tugagan)
- Savat jamida alohida qator: "Promokod chegirmasi"
- Hozircha tekshirish funksiyasi mock bo'lsin, keyin backendga ulanadi
- Promokod chegirmasi hisobi FAQAT ko'rsatish uchun. Haqiqiy hisob keyin
  serverda bo'ladi

## 6. Qat'iy qoidalar

1. Takrorlanadigan har qanday element global komponent bo'lishi va faqat
   shu yerdan ishlatilishi SHART. Kodni nusxalash taqiqlanadi.
2. Faqat men aytgan sahifa va fayllarga tegiladi. Boshqasiga tegilmaydi.
3. Yangi qo'shilgan yoki o'zgartirilgan HAR QANDAY joyda:
   - matn t('kalit') orqali berilsin va uchala tilga qo'shilsin
   - ranglar light/dark ikkalasida to'g'ri ishlasin
   - ma'lumot yuklansa — skeleton bo'lsin
4. TypeScript. any ishlatilmasin.
5. Sodda va o'qiladigan kod. Ortiqcha abstraksiya kerak emas — sayt kichik.

## 7. Bosqichlar

- **Bajarildi**: struktura, i18n (uz/en/ru), mavzu (next-themes), Skeleton
  primitivi, Header va BottomNav (ishlaydigan), 5 ta sahifa bo'sh placeholder
  holatida (faqat sarlavha + skeleton).
- **Keyingi bosqichlar** (hali qilinmagan): sahifalarning haqiqiy kontenti,
  promokod tizimi (store/cart.ts, components/cart/PromoCode.tsx), Button/
  Input/Modal primitivlari, profil sahifasidagi til/mavzu tanlovi UI'si.
