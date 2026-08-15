# Подключение Supabase к RITM SPORT

Не публикуйте `service_role`, `sb_secret_...`, `WHOP_API_KEY` или секрет webhook в GitHub. В файл `supabase-config.js` помещается только публичный ключ `sb_publishable_...`.

## 1. Создать проект

1. Откройте `https://supabase.com/dashboard` и нажмите **New project**.
2. Название: `ritm-sport`.
3. Придумайте и сохраните пароль базы данных.
4. Выберите ближайший к покупателям регион и дождитесь создания проекта.

## 2. Создать таблицы и защиту

1. Слева откройте **SQL Editor** → **New query**.
2. Откройте локальный файл `supabase/schema.sql` и скопируйте весь текст.
3. Вставьте текст в SQL Editor и нажмите **Run**.
4. В **Table Editor** должны появиться таблицы `profiles`, `products` и `orders`.

Файл сразу включает Row Level Security. Покупатель не может читать чужие заказы или назначить себя администратором.

## 3. Включить сайт

1. В Supabase откройте **Project Settings** → **API Keys**.
2. Скопируйте **Project URL** и **Publishable key** (`sb_publishable_...`).
3. В локальном файле `supabase-config.js` заполните:

```js
window.RITM_SUPABASE_CONFIG = {
  url: 'https://ВАШ_PROJECT_REF.supabase.co',
  publishableKey: 'sb_publishable_ВАШ_КЛЮЧ'
};
```

Этот ключ разрешено публиковать: доступ к данным ограничивают правила RLS. Секретный ключ сюда не вставляйте.

## 4. Настроить регистрацию

1. Откройте **Authentication** → **URL Configuration**.
2. В **Site URL** укажите `https://ritmsport.site`.
3. В **Redirect URLs** добавьте `https://ritmsport.site/**`.
4. В **Authentication** → **Providers** → **Email** оставьте регистрацию по e-mail включённой и включите подтверждение e-mail.

## 5. Создать администратора

1. После публикации откройте `https://ritmsport.site`, нажмите **Contul meu** и создайте свой аккаунт.
2. Подтвердите e-mail.
3. В Supabase откройте **SQL Editor** и выполните, заменив адрес на свой:

```sql
update public.profiles
set role = 'admin'
where id = (
  select id from auth.users where email = 'ВАШ_EMAIL'
);
```

4. Админка будет доступна по адресу `https://ritmsport.site/admin.html`.

## 6. Развернуть обработчик Whop

1. Откройте **Edge Functions** → **Deploy a new function** → **Via Editor**.
2. Назовите функцию `whop-webhook`.
3. Скопируйте весь код из `supabase/functions/whop-webhook/index.ts` в редактор.
4. Отключите проверку JWT для этой функции: запрос проверяется подписью Whop.
5. Нажмите **Deploy function**.

Адрес получится таким:

```text
https://ВАШ_PROJECT_REF.supabase.co/functions/v1/whop-webhook
```

## 7. Добавить серверные секреты

В Supabase откройте **Edge Functions** → **Secrets** и сначала добавьте:

- `WHOP_API_KEY` — Company API key из Whop;
- `WHOP_COMPANY_ID` — идентификатор бизнеса, начинающийся с `biz_`.

`WHOP_WEBHOOK_SECRET` добавьте после создания webhook на следующем шаге.

`SUPABASE_URL` и серверный ключ Supabase уже доступны Edge Function автоматически. Не добавляйте их в репозиторий.

## 8. Создать webhook в Whop

1. В Whop Dashboard откройте **Developer** → **Webhooks** → **Create webhook**.
2. Вставьте URL функции из шага 6.
3. API version: `v1`.
4. Event: `payment.succeeded`.
5. Сохраните и перенесите выданный `whsec_...` в секрет `WHOP_WEBHOOK_SECRET` в Supabase.
6. У API-ключа должны быть права чтения оплаты, товара, участника и e-mail покупателя.

Whop может отправить одно событие повторно. Функция безопасно обновляет один заказ по уникальному `payment.id`, не создавая дубликаты.

## 9. Опубликовать изменения

```powershell
cd "C:\Users\user\Documents\Codex\2026-08-11\new-chat"
git add .
git commit -m "Connect Supabase backend and admin panel"
git push
```

После GitHub Pages обновится `https://ritmsport.site`. Покупатель должен зарегистрироваться с тем же e-mail, который использовал при оплате в Whop — тогда RLS покажет ему его заказ.
