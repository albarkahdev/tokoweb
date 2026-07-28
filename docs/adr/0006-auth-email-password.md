# ADR-0006: Auth email + password, session cookie, reset via email

**Status:** diterima · 2026-07-28

## Konteks
Klien gaptek, buka CMS dari HP. Magic link via WA ideal tapi butuh WA API berbayar (ditunda ke Fase 2).

## Opsi
1. **Email + password** — familiar, reset via email (Resend, free 100/hari), fallback admin reset manual.
2. Magic link via WA — UX terbaik untuk target user, tapi dependensi WA API berbayar dari hari 1.
3. Magic link via email — tanpa password, tapi klien gaptek sering tidak buka email; login harian jadi tergantung email.

## Keputusan
Opsi 1 (pilihan founder). Password di-hash scrypt/bcrypt (Web Crypto compatible), session cookie `HttpOnly, Secure, SameSite=Lax`, umur 30 hari (HP pribadi, jangan sering logout).

## Konsekuensi
- (+) Nol dependensi berbayar; pola yang semua orang kenal.
- (−) Klien wajib punya email saat onboarding (masuk form intake).
- (−) "Lupa password" pasti sering → tombol reset menonjol + admin bisa reset dari panel.
- Fase 2: tambah magic link WA saat WA API masuk (ADR baru).
