import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";

// Завантаження конфігурації з .env
dotenv.config();

const app = express();
app.use(express.json({ limit: "50mb" }));

// Надійне визначення поточної папки
const currentDir = path.resolve();

// Шлях до файлу бази даних JSON
const dbPath = path.join(currentDir, "src", "data", "coffeetime_db.json");

// Допоміжні функції для роботи з базою даних
const readDb = () => {
  try {
    if (fs.existsSync(dbPath)) {
      const fileContent = fs.readFileSync(dbPath, "utf-8");
      return JSON.parse(fileContent);
    }
  } catch (err) {
    console.error("Помилка читання coffeetime_db.json:", err);
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
    console.error("Помилка запису в coffeetime_db.json:", err);
    return false;
  }
};

// Роздача статичних файлів фронтенду
app.use(express.static(path.join(currentDir, "dist")));

const targetEmail = process.env.MAIL_TO || "potihadima9@gmail.com";

// Функція для відправки листів через Google Скрипт
const sendEmailViaGoogleScript = async (to: string, subject: string, html: string) => {
  const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
  if (!scriptUrl) {
    console.error("GOOGLE_SCRIPT_URL не налаштовано в .env!");
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
    console.error("Помилка відправки через Google Скрипт:", err);
    return false;
  }
};

// === МАРШРУТИ АДМІН-ПАНЕЛІ ===

// 1. Авторизація в адмінці
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  const db = readDb();
  
  // Якщо в БД ще немає збережених креде can-шелів, використовуємо дефолтні
  const validUsername = db?.credentials?.username || "admin";
  const validPassword = db?.credentials?.password || "admin123";
  
  if (username === validUsername && password === validPassword) {
    return res.json({ success: true, token: "admin-token-xyz" });
  }
  res.status(401).json({ error: "Невірний логін або пароль" });
});

// 2. Зміна логіну та паролю (БЕЗ затирання контенту сайту!)
app.post("/api/admin/credentials", (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: "Логін та пароль обов'язкові" });
  }

  const db = readDb() || {};
  
  // Оновлюємо ТІЛЬКИ вузол credentials, зберігаючи решту бази даних
  db.credentials = { username, password };

  if (writeDb(db)) {
    res.json({ success: true, message: "Дані доступу успішно оновлено!" });
  } else {
    res.status(500).json({ error: "Не вдалося зберегти нові дані доступу" });
  }
});

// 3. Отримання даних для адмінки та фронтенду
app.get("/api/db", (req, res) => {
  const db = readDb();
  // Повертаємо базу даних. Якщо вона порожня, віддаємо об'єкт
  res.json(db || {});
});

// 4. Збереження оновленого контенту сайту (БЕЗ затирання пароля!)
app.post(["/api/db", "/api/admin/data"], (req, res) => {
  const db = readDb() || {};
  const incomingData = req.body;

  // Інтелектуальне злиття: перевіряємо, чи фронтенд прислав обгортку, чи чистий контент
  if (incomingData && incomingData.credentials) {
    // Якщо фронт випадково прислав усе разом
    Object.assign(db, incomingData);
  } else {
    // Зберігаємо старі credentials, а решту полів (товари, контент) оновлюємо з req.body
    const currentCredentials = db.credentials;
    
    // Якщо дані прийшли всередині ключа data (специфіка деяких CMS-фронтів)
    if (incomingData.data) {
      Object.assign(db, incomingData.data);
    } else {
      Object.assign(db, incomingData);
    }
    
    // Повертаємо паролі на місце, щоб вони не стерлися
    if (currentCredentials) {
      db.credentials = currentCredentials;
    }
  }

  if (writeDb(db)) {
    res.json({ success: true });
  } else {
    res.status(500).json({ error: "Не вдалося зберегти зміни контенту" });
  }
});


// === МАРШРУТИ НАДСИЛАННЯ ЛИСТІВ ===

app.post("/api/order", async (req, res) => {
  try {
    const { items, totalAmount, customerInfo, targetEmail: requestEmail, recipeName, ingredients } = req.body;
    const finalEmail = requestEmail || targetEmail;
    let emailHtml = "";

    if (recipeName || ingredients) {
      const ingredientsList = Array.isArray(ingredients) 
        ? ingredients.map((ing: any) => `<li>${ing}</li>`).join("")
        : `<li>${ingredients || "Компоненти не вказані"}</li>`;

      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1d2c1; border-radius: 12px; background-color: #fdfbf7;">
          <div style="text-align: center; border-bottom: 2px solid #8c6239; padding-bottom: 15px; margin-bottom: 20px;">
            <h1 style="color: #4a2c11; margin: 0; font-size: 24px;">📖 Рецепт від Coffeetime</h1>
          </div>
          <p>Привіт! Ви надіслали собі рецепт з нашого сайту.</p>
          <h3 style="color: #8c6239;">${recipeName || "Кавовий напій"}</h3>
          <ul>${ingredientsList}</ul>
        </div>
      `;
    } else {
      const itemsListHtml = Array.isArray(items)
        ? items.map((item: any) => `
            <tr>
              <td style="padding: 10px; border: 1px solid #eee;">${item.name || "Товар"} x ${item.quantity || 1}</td>
              <td style="padding: 10px; border: 1px solid #eee; text-align: right;">${(item.price || 0) * (item.quantity || 1)} грн</td>
            </tr>
          `).join("")
        : `<tr><td colspan="2" style="padding: 10px; text-align: center;">Товари не розпізнано</td></tr>`;

      const info = customerInfo || {};

      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1d2c1; border-radius: 12px; background-color: #fdfbf7;">
          <div style="text-align: center; border-bottom: 2px solid #8c6239; padding-bottom: 15px; margin-bottom: 20px;">
            <h1 style="color: #4a2c11; margin: 0; font-size: 24px;">☕ Нове замовлення Coffeetime</h1>
          </div>
          <div style="margin-bottom: 20px;">
            <h3 style="color: #8c6239; border-bottom: 1px solid #e8dec9; padding-bottom: 5px;">Дані клієнта:</h3>
            <p><strong>Ім'я:</strong> ${info.name || "Не вказано"}</p>
            <p><strong>Телефон:</strong> ${info.phone || "Не вказано"}</p>
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
    if (isSent) return res.json({ success: true, message: "Надіслано успішно!" });
    throw new Error("Google Скрипт не зміг надіслати лист");
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
    throw new Error("Google Скрипт повернув помилку");
  } catch (error: any) {
    res.status(500).json({ error: "Failed to process request" });
  }
});

// Перенаправлення SPA-роутів на фронтенд
app.get("*", (req, res) => {
  res.sendFile(path.join(currentDir, "dist", "index.html"));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Сервер працює на порту ${PORT}`);
});
