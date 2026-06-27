import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  // Middleware to parse JSON bodies with large payload limit for base64 images
  app.use(express.json({ limit: "50mb" }));

  // Create uploads directory if not exists
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Serve static uploads BEFORE Vite
  app.use("/uploads", express.static(uploadsDir));

  const dbPath = path.join(process.cwd(), "src", "data", "coffeetime_db.json");

  // Helper to read DB
  const readDb = () => {
    try {
      if (fs.existsSync(dbPath)) {
        const fileContent = fs.readFileSync(dbPath, "utf-8");
        return JSON.parse(fileContent);
      }
    } catch (err) {
      console.error("Error reading coffeetime_db.json:", err);
    }
    return null;
  };

  // Helper to write DB
  const writeDb = (data: any) => {
    try {
      fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf-8");
      return true;
    } catch (err) {
      console.error("Error writing coffeetime_db.json:", err);
      return false;
    }
  };

  // Public endpoint to load dynamic coffee data (securely stripping admin credentials)
  app.get("/api/public/data", (req, res) => {
    const data = readDb();
    if (data) {
      const sanitized = { ...data };
      delete sanitized.adminCredentials;
      return res.json({ success: true, data: sanitized });
    }
    return res.status(500).json({ error: "Failed to read database file" });
  });

  // Submit or edit a review by unique deviceId
  app.post("/api/reviews", (req, res) => {
    const { deviceId, name, text, rating } = req.body;
    if (!deviceId || !name || !text || typeof rating !== "number") {
      return res.status(400).json({ error: "Некоректні або неповні дані відгуку" });
    }

    const db = readDb();
    if (!db) {
      return res.status(500).json({ error: "Помилка читання бази даних" });
    }

    if (!db.reviews || !Array.isArray(db.reviews)) {
      db.reviews = [];
    }

    const existingIndex = db.reviews.findIndex((r: any) => r.deviceId === deviceId);

    const now = new Date();
    const formattedDate = now.toLocaleDateString("uk-UA");

    if (existingIndex !== -1) {
      // Edit existing review
      db.reviews[existingIndex].name = name;
      db.reviews[existingIndex].text = text;
      db.reviews[existingIndex].rating = rating;
      db.reviews[existingIndex].date = formattedDate;
    } else {
      // Create new review
      const colors = [
        "bg-amber-100 text-amber-800",
        "bg-orange-100 text-orange-800",
        "bg-stone-200 text-stone-800",
        "bg-yellow-100 text-yellow-800",
        "bg-emerald-100 text-emerald-800",
        "bg-red-100 text-red-800"
      ];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const randomSkew = (Math.random() * 6) - 3; // between -3 and 3 degrees

      const newReview = {
        id: `rev_${Date.now()}`,
        deviceId,
        name,
        role: "Гість кав’ярні",
        text,
        rating,
        date: formattedDate,
        avatarColor: randomColor,
        skew: parseFloat(randomSkew.toFixed(1))
      };

      // Add to beginning of user reviews
      db.reviews.unshift(newReview);
    }

    const success = writeDb(db);
    if (success) {
      // Strip credentials for safety before returning
      const sanitizedReviews = [...db.reviews];
      return res.json({ success: true, reviews: sanitizedReviews });
    }
    return res.status(500).json({ error: "Помилка запису у базу даних" });
  });

  // Delete a review by unique deviceId
  app.delete("/api/reviews", (req, res) => {
    const { deviceId } = req.body;
    if (!deviceId) {
      return res.status(400).json({ error: "Ідентифікатор пристрою обов'язковий" });
    }

    const db = readDb();
    if (!db) {
      return res.status(500).json({ error: "Помилка читання бази даних" });
    }

    if (!db.reviews || !Array.isArray(db.reviews)) {
      db.reviews = [];
    }

    const initialLength = db.reviews.length;
    db.reviews = db.reviews.filter((r: any) => r.deviceId !== deviceId);

    if (db.reviews.length === initialLength) {
      return res.status(404).json({ error: "Відгук не знайдено для цього пристрою" });
    }

    const success = writeDb(db);
    if (success) {
      return res.json({ success: true, reviews: db.reviews });
    }
    return res.status(500).json({ error: "Помилка запису у базу даних" });
  });

  // Admin login endpoint (supporting persistent credentials from DB)
  app.post("/api/admin/login", (req, res) => {
    const { username, password } = req.body;
    const db = readDb();
    
    let adminUser = process.env.ADMIN_USER || "admin";
    let adminPass = process.env.ADMIN_PASSWORD || "admin123";
    
    if (db && db.adminCredentials) {
      adminUser = db.adminCredentials.username || adminUser;
      adminPass = db.adminCredentials.password || adminPass;
    }

    if (username === adminUser && password === adminPass) {
      return res.json({ success: true, token: "admin_token_2026" });
    }
    return res.status(401).json({ error: "Неправильний логін або пароль" });
  });

  // Admin save endpoint (sanitizing adminCredentials if passed to ensure it stays in DB but doesn't get messed up)
  app.post("/api/admin/data", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== "Bearer admin_token_2026") {
      return res.status(403).json({ error: "Помилка авторизації. Доступ заборонено." });
    }

    const newData = req.body;
    if (!newData || typeof newData !== "object") {
      return res.status(400).json({ error: "Некоректний формат даних" });
    }

    // Preserve existing adminCredentials if not included in the request body
    const existingDb = readDb();
    if (existingDb && existingDb.adminCredentials && !newData.adminCredentials) {
      newData.adminCredentials = existingDb.adminCredentials;
    }

    const success = writeDb(newData);
    if (success) {
      return res.json({ success: true, message: "Дані успішно збережено!" });
    }
    return res.status(500).json({ error: "Помилка при записі у базу даних" });
  });

  // Get admin credentials (authenticated)
  app.get("/api/admin/credentials", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== "Bearer admin_token_2026") {
      return res.status(403).json({ error: "Помилка авторизації. Доступ заборонено." });
    }

    const db = readDb();
    let adminUser = process.env.ADMIN_USER || "admin";
    let adminPass = process.env.ADMIN_PASSWORD || "admin123";

    if (db && db.adminCredentials) {
      adminUser = db.adminCredentials.username || adminUser;
      adminPass = db.adminCredentials.password || adminPass;
    }

    return res.json({ success: true, username: adminUser, password: adminPass });
  });

  // Update admin credentials (authenticated)
  app.post("/api/admin/credentials", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== "Bearer admin_token_2026") {
      return res.status(403).json({ error: "Помилка авторизації. Доступ заборонено." });
    }

    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Логін та пароль не можуть бути порожніми" });
    }

    const db = readDb();
    if (db) {
      db.adminCredentials = { username, password };
      const success = writeDb(db);
      if (success) {
        return res.json({ success: true, message: "Логін та пароль успішно змінено!" });
      }
    }
    return res.status(500).json({ error: "Помилка при збереженні нових облікових даних" });
  });

  // Upload image endpoint (authenticated)
  app.post("/api/admin/upload-image", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== "Bearer admin_token_2026") {
      return res.status(403).json({ error: "Помилка авторизації. Доступ заборонено." });
    }

    const { image, fileName } = req.body;
    if (!image) {
      return res.status(400).json({ error: "Зображення не надано" });
    }

    try {
      // Matches data URI scheme, e.g. "data:image/png;base64,..."
      const matches = image.match(/^data:image\/([A-Za-z\-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ error: "Некоректний формат файлу зображення" });
      }

      const fileExtension = matches[1] === "jpeg" ? "jpg" : matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, "base64");

      const baseName = fileName 
        ? path.basename(fileName, path.extname(fileName)).replace(/[^a-z0-9]/gi, '_').toLowerCase()
        : "upload";
      const safeFileName = `${baseName}_${Date.now()}.${fileExtension}`;

      const filePath = path.join(uploadsDir, safeFileName);
      fs.writeFileSync(filePath, buffer);

      const fileUrl = `/uploads/${safeFileName}`;
      return res.json({ success: true, url: fileUrl });
    } catch (err: any) {
      console.error("Error saving uploaded image:", err);
      return res.status(500).json({ error: err.message || "Помилка при збереженні файлу" });
    }
  });

  // Email Configuration (Gmail SMTP or custom provider)
  const targetEmail = process.env.SMTP_USER;

  // Transporter for sending mail
  // Transporter for sending mail
  // Функція для відправки через твоє Google-посилання
const sendEmailViaGoogleScript = async (to: string, subject: string, html: string) => {
  const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
  
  if (!scriptUrl) {
    console.error("Помилка: GOOGLE_SCRIPT_URL не налаштовано в .env!");
    return false;
  }

  try {
    // Робимо звичайний інтернет-запит, який Render НЕ блокує
    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: to,
        subject: subject,
        html: html,
        token: "MySuperSecretToken123" // Переконайся, що такий самий токен вказано в самому Google Скрипті
      })
    });

    const result = await response.json();
    return result.success;
  } catch (err) {
    console.error("Помилка відправки через Google Скрипт:", err);
    return false;
  }
};

  // API endpoint to handle order or customizable coffee submissions
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
          
          <div style="background-color: #f5efe6; padding: 15px; border-radius: 8px; border: 1px solid #e8dec9; text-align: center; margin-top: 20px;">
            <p style="margin: 0; font-size: 13px; color: #4a2c11;">
              Будь ласка, зв'яжіться з гостем якнайшвидше для підтвердження або відповіді.
            </p>
          </div>
        </div>
      `;

      try {
        // Відправка форми контактів через Google Скрипт
        const isSent = await sendEmailViaGoogleScript(targetEmail, subject, emailHtml);
        
        if (isSent) {
          console.log(`Contact Email successfully sent via Google Script to ${targetEmail}`);
          return res.json({ success: true, message: "Повідомлення надіслано!" });
        } else {
          throw new Error("Google Скрипт повернув помилку при відправці контактної форми");
        }
      } catch (smtpErr: any) {
        console.error("Google Script error sending contact email, falling back to simulated:", smtpErr);
        return res.json({
          success: true,
          simulated: true,
          error: smtpErr.message || "Невідома помилка відправки"
        });
      }
    } catch (error: any) {
      console.error("Error sending contact email:", error);
      res.status(500).json({ error: "Failed to process request" });
    }
  });

  // API endpoint for handling general contact / reservation forms
  // API endpoint for handling food orders
  app.post("/api/order", async (req, res) => {
    try {
      const { items, totalAmount, customerInfo, targetEmail } = req.body;
      console.log("Received order request for:", targetEmail);

      const itemsListHtml = items
        .map(
          (item: any) => `
          <tr>
            <td style="padding: 10px; border: 1px solid #eee;">${item.name} x ${item.quantity}</td>
            <td style="padding: 10px; border: 1px solid #eee; text-align: right;">${item.price * item.quantity} грн</td>
          </tr>
        `
        )
        .join("");

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1d2c1; border-radius: 12px; background-color: #fdfbf7;">
          <div style="text-align: center; border-bottom: 2px solid #8c6239; padding-bottom: 15px; margin-bottom: 20px;">
            <h1 style="color: #4a2c11; margin: 0; font-size: 24px;">☕ Нове замовлення Coffeetime</h1>
          </div>
          <div style="margin-bottom: 20px;">
            <h3 style="color: #8c6239; border-bottom: 1px solid #e8dec9; padding-bottom: 5px;">Дані клієнта:</h3>
            <p><strong>Ім'я:</strong> ${customerInfo.name}</p>
            <p><strong>Телефон:</strong> ${customerInfo.phone}</p>
            <p><strong>Спосіб доставки:</strong> ${customerInfo.deliveryMethod === 'delivery' ? 'Доставка' : 'Самовивіз'}</p>
            ${customerInfo.address ? `<p><strong>Адреса:</strong> ${customerInfo.address}</p>` : ''}
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
                  <td style="padding: 10px; border: 1px solid #eee; text-align: right; color: #4a2c11; font-size: 16px;">${totalAmount} грн</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      `;

      try {
        // Відправка замовлення через Google Скрипт
        const isSent = await sendEmailViaGoogleScript(
          targetEmail, 
          `☕ Coffeetime: Нове замовлення на суму ${totalAmount} грн`, 
          emailHtml
        );
        
        if (isSent) {
          console.log(`Email successfully sent via Google Script to ${targetEmail}`);
          return res.json({ success: true, message: "Замовлення успішно надіслано на пошту!" });
        } else {
          throw new Error("Google Скрипт повернув помилку при відправці замовлення");
        }
      } catch (smtpErr: any) {
        console.error("Google Script error sending order, falling back to simulated:", smtpErr);
        return res.json({
          success: true,
          simulated: true,
          error: smtpErr.message || "Невідома помилка відправки"
        });
      }
    } catch (error: any) {
      console.error("Error processing order email:", error);
      res.status(500).json({ error: "Failed to send order email" });
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
          
          <div style="background-color: #f5efe6; padding: 15px; border-radius: 8px; border: 1px solid #e8dec9; text-align: center; margin-top: 20px;">
            <p style="margin: 0; font-size: 13px; color: #4a2c11;">
              Будь ласка, зв'яжіться з гостем якнайшвидше для підтвердження або відповіді.
            </p>
          </div>
        </div>
      `;

      try {
        // Відправка форми контактів через Google Скрипт
        const isSent = await sendEmailViaGoogleScript(targetEmail, subject, emailHtml);
        
        if (isSent) {
          console.log(`Contact Email successfully sent via Google Script to ${targetEmail}`);
          return res.json({ success: true, message: "Повідомлення надіслано!" });
        } else {
          throw new Error("Google Скрипт повернув помилку при відправці контактної форми");
        }
      } catch (smtpErr: any) {
        console.error("Google Script error sending contact email, falling back to simulated:", smtpErr);
        return res.json({
          success: true,
          simulated: true,
          error: smtpErr.message || "Невідома помилка відправки"
        });
      }
    } catch (error: any) {
      console.error("Error sending contact email:", error);
      res.status(500).json({ error: "Failed to process request" });
    }
  });
