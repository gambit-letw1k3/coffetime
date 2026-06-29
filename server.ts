import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";

// Завантаження конфігурації з .env
dotenv.config();

const app = express();
app.use(express.json({ limit: "50mb" }));

// Надійне визначення поточної папки для CommonJS в esbuild
const currentDir = path.resolve();

// Шлях до файлу бази даних JSON
const dbPath = path.join(currentDir, "src", "data", "coffeetime_db.json");

// Допоміжні функції для роботи з базою даних адмінки
const readDb = () => {
  try {
    if (fs.existsSync(dbPath)) {
      const fileContent = fs.readFileSync(dbPath, "utf-8");
      return JSON.parse(fileContent);
    }
  } catch (err) {
    console.error("Помилка читання coffeetime_db.json:", err);
  }
  return null;
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

// Роздача статичних файлів з папки dist (зібраний фронтенд)
app.use(express.static(path.join(currentDir, "dist")));

const targetEmail = process.env.MAIL_TO || "potihadima9@gmail.com";

// Функція для відправки листів через Google Скрипт за допомогою fetch
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

// Маршрут для авторизації в адмінці
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  const db = readDb();
  
  // Перевірка, чи змінені логін/пароль є в БД, інакше дефолтні admin/admin123
  const validUsername = db?.credentials?.username || "admin";
  const validPassword = db?.credentials?.password || "admin123";
  
  if (username === validUsername && password === validPassword) {
    return res.json({ success: true, token: "admin-token-xyz" });
  }
  res.status(401).json({ error: "Невірний логін або пароль" });
});

// Маршрут для зміни логіну та паролю (Виправлено 404 error)
app.post("/api/admin/credentials", (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: "Логін та пароль обов'язкові" });
  }

  const db = readDb() || {};
  db.credentials = { username, password };

  const success = writeDb(db);
  if (success) {
    res.json({ success: true, message: "Дані доступу успішно оновлено!" });
  } else {
    res.status(500).json({ error: "Не вдалося зберегти нові дані доступу" });
  }
});

// Отримання даних для адмінки та фронтенду
app.get("/api/db", (req, res) => {
  const db = readDb();
  if (!db) {
    return res.status(500).json({ error: "Не вдалося завантажити базу даних" });
  }
  res.json(db);
});

// Збереження оновлених даних з адмінки (Сумісність з двома ендпоїнтами фронту)
app.post(["/api/db", "/api/admin/data"], (req, res) => {
  // Якщо фронтенд передає дані контенту прямо в body, записуємо їх
  const success = writeDb(req.body);
  if (success) {
    res.json({ success: true });
  } else {
    res.status(500).json({ error: "Не вдалося зберегти зміни" });
  }
});


// === МАРШРУТИ НАДСИЛАННЯ ЛИСТІВ ===

// API endpoint for handling food orders, cart items, and recipes
app.post("/api/order", async (req, res) => {
  try {
    const { items, totalAmount, customerInfo, targetEmail: requestEmail, recipeName, ingredients } = req.body;
    
    const finalEmail = requestEmail || targetEmail;
    console.log("Processing order/recipe request for:", finalEmail);

    let emailHtml = "";

    // ЯКЩО ЦЕ РЕЦЕПТ
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
          <ul>
            ${ingredientsList}
          </ul>
        </div>
      `;
    } 
    // ЯКЩО ЦЕ ЗВИЧАЙНЕ ЗАМОВЛЕННЯ З КОШИКА
    else {
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
            <p><strong>Спосіб доставки:</strong> ${info.deliveryMethod === 'delivery' ? 'Доставка' : 'Самовивіз'}</p>
            ${info.address ? `<p><strong>Адреса:</strong> ${info.address}</p>` : ''}
          </div>
          <div style="margin-bottom: 20px;">
            <h3 style="color: #8c6239; border-bottom: 1px solid #e8dec9; padding-bottom: 5px;">Товари:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #f5efe6;">
                  <th style="padding: 10px; border: 1px solid #eee; text-align: left;">Назва</th>
                  <th style="padding: 10px; border: 1px solid #eee; text-align: right;">Сума</th>
                </tr>
              </thead>
              <tbody>
                ${itemsListHtml}
              </tbody>
              <tfoot>
                <tr style="font-weight: bold; background-color: #fcf9f4;">
                  <td style="padding: 10px; border: 1px solid #eee;">Разом:</td>
                  <td style="padding: 10px; border: 1px solid #eee; text-align: right; color: #4a2c11; font-size: 16px;">${totalAmount || 0} грн</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      `;
    }

    const isSent = await sendEmailViaGoogleScript(
      finalEmail, 
      recipeName ? `📖 Рецепт: ${recipeName}` : `☕ Coffeetime: Нове замовлення`, 
      emailHtml
    );
    
    if (isSent) {
      return res.json({ success: true, message: "Надіслано успішно!" });
    } else {
      throw new Error("Google Скрипт не зміг надіслати лист");
    }

  } catch (error: any) {
    console.error("Error processing order/recipe email:", error);
    res.json({ success: true, simulated: true, error: error.message });
  }
});

// API endpoint for handling general contact / reservation forms
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, phone, message, date, time, guests, type } = req.body;
    console.log("Received contact/reservation request:", req.body);

    const isReservation = type === "reservation";
    const subject = isReservation 
      ? `📅 Coffeetime: Нове бронювання столика від ${name}`
      : `✉️ Coffeetime: Нове повідомлення зворотного зв'язку від ${name}`;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1d2c1; border-radius: 12px; background-color: #fdfbf7;">
        <div style="text-align: center; border-bottom: 2px solid #8c6239; padding-bottom: 15px; margin-bottom: 20px;">
          <h1 style="color: #4a2c11; margin: 0; font-size: 24px;">${isReservation ? '📅 Нове бронювання' : '✉️ Нове повідомлення'}</h1>
          <p style="color: #8c6239; margin: 5px 0 0 0; font-size: 14px;">Отримано через форму на сайті Coffeetime</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr style="background-color: #fcf9f4;">
              <td style="padding: 10px; border: 1px solid #eee; font-weight: bold; width: 30%; color: #4a2c11;">Ім'я:</td>
              <td style="padding: 10px; border: 1px solid #eee; color: #333;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #eee; font-weight: bold; color: #4a2c11;">Телефон:</td>
              <td style="padding: 10px; border: 1px solid #eee; color: #333;">${phone || "Не вказано"}</td>
            </tr>
            <tr style="background-color: #fcf9f4;">
              <td style="padding: 10px; border: 1px solid #eee; font-weight: bold; color: #4a2c11;">Email:</td>
              <td style="padding: 10px; border: 1px solid #eee; color: #333;">${email || "Не вказано"}</td>
            </tr>
            ${isReservation ? `
            <tr>
              <td style="padding: 10px; border: 1px solid #eee; font-weight: bold; color: #4a2c11;">Дата бронювання:</td>
              <td style="padding: 10px; border: 1px solid #eee; color: #333; font-weight: bold;">${date}</td>
            </tr>
            <tr style="background-color: #fcf9f4;">
              <td style="padding: 10px; border: 1px solid #eee; font-weight: bold; color: #4a2c11;">Час:</td>
              <td style="padding: 10px; border: 1px solid #eee; color: #333; font-weight: bold;">${time}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #eee; font-weight: bold; color: #4a2c11;">Кількість гостей:</td>
              <td style="padding: 10px; border: 1px solid #eee; color: #333;">${guests || 1} осіб</td>
            </tr>
            ` : ''}
            ${message ? `
            <tr style="background-color: #fcf9f4;">
              <td style="padding: 10px; border: 1px solid #eee; font-weight: bold; color: #4a2c11; vertical-align: top;">Повідомлення:</td>
              <td style="padding: 10px; border: 1px solid #eee; color: #333; white-space: pre-line;">${message}</td>
            </tr>
            ` : ''}
          </table>
        </div>
      </div>
    `;

    try {
      const isSent = await sendEmailViaGoogleScript(targetEmail, subject, emailHtml);
      if (isSent) {
        return res.json({ success: true, message: "Повідомлення надіслано!" });
      } else {
        throw new Error("Google Скрипт повернув помилку при відправці контактної форми");
      }
    } catch (smtpErr: any) {
      return res.json({ success: true, simulated: true, error: smtpErr.message });
    }
  } catch (error: any) {
    res.status(500).json({ error: "Failed to process request" });
  }
});

// Усі інші GET-запити перенаправляються на фронтенд
app.get("*", (req, res) => {
  res.sendFile(path.join(currentDir, "dist", "index.html"));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Сервер працює на порту ${PORT}`);
});
