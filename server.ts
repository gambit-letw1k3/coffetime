import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";

// Загрузка конфигурации из .env
dotenv.config();

const app = express();
app.use(express.json({ limit: "50mb" }));

// Надежное определение текущей папки
const currentDir = path.resolve();

// Путь к файлу базы данных JSON
const dbPath = path.join(currentDir, "src", "data", "coffeetime_db.json");

// Вспомогательные функции для работы с базой данных
const readDb = () => {
  try {
    if (fs.existsSync(dbPath)) {
      const fileContent = fs.readFileSync(dbPath, "utf-8");
      return JSON.parse(fileContent);
    }
  } catch (err) {
    console.error("Ошибка чтения coffeetime_db.json:", err);
  }
  return {};
};

const writeDb = (data: any) => {
  try {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Ошибка записи в coffeetime_db.json:", err);
    return false;
  }
};

// Раздача статических файлов фронтенда
app.use(express.static(path.join(currentDir, "dist")));

const targetEmail = process.env.MAIL_TO || "potihadima9@gmail.com";

// Функция для отправки писем через Google Скрипт
const sendEmailViaGoogleScript = async (to: string, subject: string, html: string) => {
  const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
  if (!scriptUrl) {
    console.error("GOOGLE_SCRIPT_URL не настроен в .env!");
    return false;
  }
  try {
    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: to,
        subject: subject,
        html: html,
        token: "MySuperSecretToken123"
      })
    });
    const result = await response.json();
    return result.success;
  } catch (err) {
    console.error("Ошибка отправки через Google Скрипт:", err);
    return false;
  }
};

// === МАРШРУТЫ АДМИН-ПАНЕЛИ ===

// 1. Авторизация в админке
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  const db = readDb();
  
  // Если в БД еще нет сохраненных credentials, используем дефолтные
  const validUsername = db?.credentials?.username || "admin";
  const validPassword = db?.credentials?.password || "admin123";
  
  if (username === validUsername && password === validPassword) {
    return res.json({ success: true, token: "admin-token-xyz" });
  }
  res.status(401).json({ error: "Неверный логин или пароль" });
});

// 2. Смена логина и пароля
app.post("/api/admin/credentials", (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: "Логин и пароль обязательны" });
  }

  const db = readDb() || {};
  
  // Обновляем ТОЛЬКО узел credentials, сохраняя весь остальной контент
  db.credentials = { username, password };

  if (writeDb(db)) {
    res.json({ success: true, message: "Данные доступа успешно обновлены!" });
  } else {
    res.status(500).json({ error: "Не удалось сохранить новые данные доступа" });
  }
});

// 3. Получение данных для фронтенда
app.get("/api/db", (req, res) => {
  const db = readDb() || {};
  
  // ВАЖНО: Если фронтенд ожидает чистые данные без оберток, 
  // отдаем весь объект БД. Фронтенд сам разберется с полями контента.
  res.json(db);
});

// 4. Универсальное сохранение контента сайта (БЕЗ затирания пароля!)
app.post(["/api/db", "/api/admin/data"], (req, res) => {
  const db = readDb() || {};
  const incomingData = req.body;

  // Шаг 1: Спасаем текущий рабочий пароль админа от затирания
  const currentCredentials = db.credentials;

  // Шаг 2: Интеллектуальный анализ входящей структуры фронтенда
  if (incomingData && typeof incomingData === "object") {
    
    // Если фронтенд прислал данные в обертке { data: { ... } }
    if (incomingData.data !== undefined) {
      if (typeof incomingData.data === "object" && !Array.isArray(incomingData.data)) {
        Object.assign(db, incomingData.data);
      } else {
        db.data = incomingData.data;
      }
    } 
    // Если фронтенд прислал чистый плоский объект контента
    else {
      // Мержим новые поля в базу данных
      Object.assign(db, incomingData);
    }
  }

  // Шаг 3: Возвращаем пароль на законное место
  if (currentCredentials) {
    db.credentials = currentCredentials;
  }

  // Шаг 4: Записываем всё в файл
  if (writeDb(db)) {
    res.json({ success: true });
  } else {
    res.status(500).json({ error: "Не удалось сохранить изменения контента" });
  }
});


// === МАРШРУТЫ ОТПРАВКИ ПИСЕМ ===

app.post("/api/order", async (req, res) => {
  try {
    // Пишем лог в консоль сервера, чтобы точно видеть структуру данных от фронтенда
    console.log("ПОЛУЧЕН ЗАКАЗ. Тело запроса (req.body):", JSON.stringify(req.body, null, 2));

    const { items, totalAmount, customerInfo, customer, name, phone, targetEmail: requestEmail, recipeName, ingredients } = req.body;
    const finalEmail = requestEmail || targetEmail;
    
    // Интеллектуальный поиск данных клиента (защита от разных названий полей на фронтенде)
    const clientName = customerInfo?.name || customer?.name || name || "Не указано";
    const clientPhone = customerInfo?.phone || customer?.phone || phone || "Не указано";

    let emailHtml = "";

    // Обработка отправки рецепта
    if (recipeName || ingredients) {
      const ingredientsList = Array.isArray(ingredients) 
        ? ingredients.map((ing: any) => `<li>${ing}</li>`).join("")
        : `<li>${ingredients || "Компоненты не указаны"}</li>`;

      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1d2c1; border-radius: 12px; background-color: #fdfbf7;">
          <div style="text-align: center; border-bottom: 2px solid #8c6239; padding-bottom: 15px; margin-bottom: 20px;">
            <h1 style="color: #4a2c11; margin: 0; font-size: 24px;">📖 Рецепт от Coffeetime</h1>
          </div>
          <p>Привет! Вы отправили себе рецепт с нашего сайта.</p>
          <h3 style="color: #8c6239;">${recipeName || "Кофейный напиток"}</h3>
          <ul>${ingredientsList}</ul>
        </div>
      `;
    } else {
      // Обработка обычного заказа товаров
      const itemsListHtml = Array.isArray(items)
        ? items.map((item: any) => `
            <tr>
              <td style="padding: 10px; border: 1px solid #eee;">${item.name || "Товар"} x ${item.quantity || item.count || 1}</td>
              <td style="padding: 10px; border: 1px solid #eee; text-align: right;">${(item.price || 0) * (item.quantity || item.count || 1)} грн</td>
            </tr>
          `).join("")
        : `<tr><td colspan="2" style="padding: 10px; text-align: center;">Товары не распознаны</td></tr>`;

      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1d2c1; border-radius: 12px; background-color: #fdfbf7;">
          <div style="text-align: center; border-bottom: 2px solid #8c6239; padding-bottom: 15px; margin-bottom: 20px;">
            <h1 style="color: #4a2c11; margin: 0; font-size: 24px;">☕ Новое замовлення Coffeetime</h1>
          </div>
          <div style="margin-bottom: 20px;">
            <h3 style="color: #8c6239; border-bottom: 1px solid #e8dec9; padding-bottom: 5px;">Дані клієнта:</h3>
            <p><strong>Ім'я:</strong> ${clientName}</p>
            <p><strong>Телефон:</strong> ${clientPhone}</p>
          </div>
          <div style="margin-bottom: 20px;">
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #f5efe6;">
                  <th style="padding: 10px; border: 1px solid #eee; text-align: left;">Назва</th>
                  <th style="padding: 10px; border: 1px solid #eee; text-align: right;">Сума</th>
                </tr>
              </thead>
              <tbody>${itemsListHtml}</tbody>
              <tfoot>
                <tr style="font-weight: bold; background-color: #fcf9f4;">
                  <td style="padding: 10px; border: 1px solid #eee;">Разом:</td>
                  <td style="padding: 10px; border: 1px solid #eee; text-align: right; color: #4a2c11;">${totalAmount || 0} грн</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      `;
    }

    const isSent = await sendEmailViaGoogleScript(finalEmail, recipeName ? `📖 Рецепт: ${recipeName}` : `☕ Coffeetime: Нове замовлення`, emailHtml);
    if (isSent) return res.json({ success: true, message: "Отправлено успешно!" });
    throw new Error("Google Скрипт не смог отправить письмо");
  } catch (error: any) {
    res.json({ success: true, simulated: true, error: error.message });
  }
});

app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, phone, message, date, time, guests, type } = req.body;
    const isReservation = type === "reservation";
    const subject = isReservation ? `📅 Coffeetime: Бронювання від ${name}` : `✉️ Coffeetime: Повідомлення від ${name}`;

    const emailHtml = `<div style="font-family: Arial, sans-serif; padding: 20px;"><h2>${subject}</h2><p>Ім'я: ${name}</p><p>Телефон: ${phone}</p><p>Повідомлення: ${message}</p></div>`;

    const isSent = await sendEmailViaGoogleScript(targetEmail, subject, emailHtml);
    if (isSent) return res.json({ success: true, message: "Повідомлення надіслано!" });
    throw new Error("Google Скрипт вернул ошибку");
  } catch (error: any) {
    res.status(500).json({ error: "Failed to process request" });
  }
});

// Перенаправление SPA-роутов на фронтенд
app.get("*", (req, res) => {
  res.sendFile(path.join(currentDir, "dist", "index.html"));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
