import express from "express";
import path from "path";
import dotenv from "dotenv";

// Завантаження конфігурації з .env
dotenv.config();

const app = express();
app.use(express.json());

// Надійне визначення поточної папки для CommonJS в esbuild
const currentDir = path.resolve();

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
        token: "MySuperSecretToken123" // Має збігатися з токеном у Google Скрипті
      })
    });

    const result = await response.json();
    return result.success;
  } catch (err) {
    console.error("Помилка відправки через Google Скрипт:", err);
    return false;
  }
};

// API endpoint for handling food orders
// API endpoint for handling food orders
app.post("/api/order", async (req, res) => {
  try {
    // Додаємо targetEmail сюди, щоб сервер міг його прочитати з запиту фронтенду
    const { items, totalAmount, customerInfo, targetEmail: requestEmail } = req.body;
    
    // Якщо фронтенд передав пошту — беремо її, якщо ні — беремо стандартну potihadima9@gmail.com
    const finalEmail = requestEmail || targetEmail;
    console.log("Received order request for:", finalEmail);
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

// Усі інші GET-запити перенаправляються на фронтенд
app.get("*", (req, res) => {
  res.sendFile(path.join(currentDir, "dist", "index.html"));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Сервер працює на порту ${PORT}`);
});
