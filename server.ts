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
  
  const validUsername = db?.credentials?.username || "admin";
  const validPassword = db?.credentials?.password || "admin123";
  
  if (username === validUsername && password === validPassword) {
    return res.json({ success: true, token: "admin-token-xyz" });
  }
  res.status(401).json({ error: "Неверный логин или密码" });
});

// 2. Смена логина и пароля
app.post("/api/admin/credentials", (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: "Логин и пароль обязательны" });
  }

  const db = readDb() || {};
  db.credentials = { username, password };

  if (writeDb(db)) {
    res.json({ success: true, message: "Данные доступа успешно обновлены!" });
  } else {
    res.status(500).json({ error: "Не удалось сохранить новые данные доступа" });
  }
});

// 3. Получение данных (Исправлено под ожидания фронтенда!)
app.get("/api/db", (req, res) => {
  const db = readDb() || {};
  
  // КЛЮЧЕВОЙ МОМЕНТ: фронтенд ожидает увидеть чистый контент без ключа credentials.
  // Отдаем копию базы данных, из которой убран узел credentials, чтобы не ломать React-стейт.
  const { credentials, ...cleanData } = db;
  
  // Если в базе сохранен только ключ data (некоторые CMS), отдаем его содержимое напрямую
  if (cleanData.data && Object.keys(cleanData).length === 1) {
    return res.json(cleanData.data);
  }
  
  res.json(cleanData);
});

// 4. Универсальное сохранение контента сайта (БЕЗ затирания пароля!)
app.post(["/api/db", "/api/admin/data"], (req, res) => {
  const db = readDb() || {};
  const incomingData = req.body;

  const currentCredentials = db.credentials;

  if (incomingData && typeof incomingData === "object") {
    if (incomingData.data !== undefined) {
      if (typeof incomingData.data === "object" && !Array.isArray(incomingData.data)) {
        Object.assign(db, incomingData.data);
      } else {
        db.data = incomingData.data;
      }
    } else {
      // Полностью обновляем поля контента, чтобы старые удалялись, а новые записывались
      for (const key in db) {
        if (key !== "credentials") {
          delete db[key];
        }
      }
      Object.assign(db, incomingData);
    }
  }

  if (currentCredentials) {
    db.credentials = currentCredentials;
  }

  if (writeDb(db)) {
    res.json({ success: true });
  } else {
    res.status(500).json({ error: "Не удалось сохранить изменения контента" });
  }
});


// === МАРШРУТЫ ОТПРАВКИ ПИСЕМ ===

app.post("/api/order", async (req, res) => {
  try {
    console.log("ЗАКАЗ:", JSON.stringify(req.body, null, 2));

    const body = req.body;
    
    // Сверхгибкий поиск данных клиента по всем возможным ключам фронтенда
    const clientName = body.customerInfo?.name || body.customer?.name || body.name || body.formData?.name || "Не указано";
    const clientPhone = body.customerInfo?.phone || body.customer?.phone || body.phone || body.formData?.phone || "Не указано";
    const totalAmount = body.totalAmount || body.total || body.price || "0";

    let emailHtml = "";

    // Проверка на отправку рецепта
    if (body.recipeName || body.ingredients) {
      const ingredientsList = Array.isArray(body.ingredients) 
        ? body.ingredients.map((ing: any) => `<li>${ing}</li>`).join("")
        : `<li>${body.ingredients || "Компоненты не указаны"}</li>`;

      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1d2c1; border-radius: 12px; background-color: #fdfbf7;">
          <div style="text-align: center; border-bottom: 2px solid #8c6239; padding-bottom: 15px; margin-bottom: 20px;">
            <h1 style="color: #4a2c11; margin: 0; font-size: 24px;">📖 Рецепт від Coffeetime</h1>
          </div>
          <p>Привіт! Ви надіслали собі рецепт з нашого сайту.</p>
          <h3 style="color: #8c6239;">${body.recipeName || "Кавовий напій"}</h3>
          <ul>${ingredientsList}</ul>
        </div>
      `;
    } else {
      // Сборка списка товаров из корзины или конструктора
      let itemsListHtml = "";
      
      // Если пришел массив товаров
      if (Array.isArray(body.items) && body.items.length > 0) {
        itemsListHtml = body.items.map((item: any) => `
          <tr>
            <td style="padding: 10px; border: 1px solid #eee;">${item.name || "Товар"} x ${item.quantity || item.count || 1}</td>
            <td style="padding: 10px; border: 1px solid #eee; text-align: right;">${item.price || 0} грн</td>
          </tr>
        `).join("");
      } 
      // Если это кастомный заказ напрямую из конструктора (одиночный объект)
      else if (body.name && (body.price || body.totalAmount)) {
        itemsListHtml = `
          <tr>
            <td style="padding: 10px; border: 1px solid #eee;">${body.name} x 1</td>
            <td style="padding: 10px; border: 1px solid #eee; text-align: right;">${totalAmount} грн</td>
          </tr>
        `;
      } else {
        itemsListHtml = `<tr><td colspan="2" style="padding: 10px; text-align: center; color: #999;">Кастомний конструктор або пуста корзина</td></tr>`;
      }

      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1d2c1; border-radius: 12px; background-color: #fdfbf7;">
          <div style="text-align: center; border-bottom: 2px solid #8c6239; padding-bottom: 15px; margin-bottom: 20px;">
            <h1 style="color: #4a2c11; margin: 0; font-size: 24px;">☕ Нове замовлення Coffeetime</h1>
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
                  <td style="padding: 10px; border: 1px solid #eee; text-align: right; color: #4a2c11;">${totalAmount}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      `;
    }

    const isSent = await sendEmailViaGoogleScript(finalEmail, body.recipeName ? `📖 Рецепт: ${body.recipeName}` : `☕ Coffeetime: Нове замовлення`, emailHtml);
    if (isSent) return res.json({ success: true, message: "Надіслано успішно!" });
    throw new Error("Google Скрипт не зміг надіслати лист");
  } catch (error: any) {
    res.json({ success: true, simulated: true, error: error.message });
  }
});

app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, phone, message, type } = req.body;
    const isReservation = type === "reservation";
    const subject = isReservation ? `📅 Coffeetime: Бронювання від ${name}` : `✉️ Coffeetime: Повідомлення від ${name}`;

    const emailHtml = `<div style="font-family: Arial, sans-serif; padding: 20px;"><h2>${subject}</h2><p>Ім'я: ${name}</p><p>Телефон: ${phone}</p><p>Повідомлення: ${message}</p></div>`;

    const isSent = await sendEmailViaGoogleScript(targetEmail, subject, emailHtml);
    if (isSent) return res.json({ success: true, message: "Повідомлення надіслано!" });
    throw new Error("Google Скрипт повернув помилку");
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
  console.log(`Сервер працює на порту ${PORT}`);
});
