import nodemailer from "nodemailer";

// メール送信用のトランスポーター作成
export const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
};

// お問い合わせメールのテンプレート
export const createContactEmailTemplate = (data: {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  locale: string;
}) => {
  const serviceLabels: Record<string, { ja: string; en: string }> = {
    camu: { ja: "花夢 (CAMU) - 着物撮影", en: "CAMU - Kimono Photography" },
    chloe: { ja: "Chloe - レンタルスタジオ", en: "Chloe - Rental Studio" },
    cafe: { ja: "アンティークカフェ", en: "Antique Cafe" },
    other: { ja: "その他", en: "Other" },
  };

  const isJapanese = data.locale === "ja";
  const serviceLabel = data.service
    ? serviceLabels[data.service]?.[isJapanese ? "ja" : "en"] || data.service
    : isJapanese
    ? "未選択"
    : "Not selected";

  if (isJapanese) {
    return {
      subject: `【お問い合わせ】${data.name}様より`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', sans-serif; line-height: 1.8; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #2C2C2C; color: white; padding: 30px 20px; text-align: center; }
              .content { background-color: #ffffff; padding: 30px; border: 1px solid #E5E3DC; }
              .field { margin-bottom: 25px; }
              .label { font-weight: bold; color: #8B7355; margin-bottom: 8px; display: block; }
              .value { padding: 10px; background-color: #FAFAF8; border-left: 3px solid #8B7355; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; font-size: 24px; font-weight: 300;">新規お問い合わせ</h1>
              </div>
              <div class="content">
                <p>以下の内容でお問い合わせがありました。</p>
                
                <div class="field">
                  <span class="label">お名前</span>
                  <div class="value">${data.name}</div>
                </div>
                
                <div class="field">
                  <span class="label">メールアドレス</span>
                  <div class="value"><a href="mailto:${data.email}">${
        data.email
      }</a></div>
                </div>
                
                <div class="field">
                  <span class="label">電話番号</span>
                  <div class="value">${data.phone || "未入力"}</div>
                </div>
                
                <div class="field">
                  <span class="label">ご希望のサービス</span>
                  <div class="value">${serviceLabel}</div>
                </div>
                
                <div class="field">
                  <span class="label">お問い合わせ内容</span>
                  <div class="value" style="white-space: pre-wrap;">${
                    data.message
                  }</div>
                </div>
              </div>
              <div class="footer">
                <p>このメールは自動送信されています。</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
新規お問い合わせ

お名前: ${data.name}
メールアドレス: ${data.email}
電話番号: ${data.phone || "未入力"}
ご希望のサービス: ${serviceLabel}

お問い合わせ内容:
${data.message}
      `,
    };
  } else {
    return {
      subject: `[Contact Form] Message from ${data.name}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.8; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #2C2C2C; color: white; padding: 30px 20px; text-align: center; }
              .content { background-color: #ffffff; padding: 30px; border: 1px solid #E5E3DC; }
              .field { margin-bottom: 25px; }
              .label { font-weight: bold; color: #8B7355; margin-bottom: 8px; display: block; }
              .value { padding: 10px; background-color: #FAFAF8; border-left: 3px solid #8B7355; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; font-size: 24px; font-weight: 300;">New Contact Inquiry</h1>
              </div>
              <div class="content">
                <p>You have received a new contact form submission.</p>
                
                <div class="field">
                  <span class="label">Name</span>
                  <div class="value">${data.name}</div>
                </div>
                
                <div class="field">
                  <span class="label">Email</span>
                  <div class="value"><a href="mailto:${data.email}">${
        data.email
      }</a></div>
                </div>
                
                <div class="field">
                  <span class="label">Phone</span>
                  <div class="value">${data.phone || "Not provided"}</div>
                </div>
                
                <div class="field">
                  <span class="label">Service</span>
                  <div class="value">${serviceLabel}</div>
                </div>
                
                <div class="field">
                  <span class="label">Message</span>
                  <div class="value" style="white-space: pre-wrap;">${
                    data.message
                  }</div>
                </div>
              </div>
              <div class="footer">
                <p>This is an automated message.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
New Contact Inquiry

Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone || "Not provided"}
Service: ${serviceLabel}

Message:
${data.message}
      `,
    };
  }
};

// 自動返信メールのテンプレート
export const createAutoReplyTemplate = (name: string, locale: string) => {
  if (locale === "ja") {
    return {
      subject: "お問い合わせありがとうございます - DMC",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', sans-serif; line-height: 1.8; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #2C2C2C; color: white; padding: 30px 20px; text-align: center; }
              .content { background-color: #ffffff; padding: 30px; border: 1px solid #E5E3DC; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #E5E3DC; margin-top: 30px; }
              .signature { margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E3DC; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; font-size: 24px; font-weight: 300;">DMC</h1>
              </div>
              <div class="content">
                <p>${name} 様</p>
                
                <p>この度はお問い合わせいただき、誠にありがとうございます。</p>
                
                <p>お送りいただいた内容を確認させていただき、2営業日以内に担当者よりご連絡させていただきます。</p>
                
                <p>今しばらくお待ちくださいますよう、お願い申し上げます。</p>
                
                <div class="signature">
                  <p><strong>DMC</strong></p>
                  <p>
                    〒417-0001<br>
                    静岡県富士市荒田島町1-13 ラシェット1<br>
                    TEL: 0545-55-4550<br>
                    Email: dmc.fuji0823@gmail.com<br>
                    営業時間: 11:00〜17:00（定休日: 水曜日）
                  </p>
                </div>
              </div>
              <div class="footer">
                <p>このメールは自動送信されています。このメールに返信されても対応できませんのでご了承ください。</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
${name} 様

この度はお問い合わせいただき、誠にありがとうございます。

お送りいただいた内容を確認させていただき、2営業日以内に担当者よりご連絡させていただきます。

今しばらくお待ちくださいますよう、お願い申し上げます。

――――――――――――――――――
DMC
〒417-0001
静岡県富士市荒田島町1-13 ラシェット1
TEL: 0545-55-4550
Email: dmc.fuji0823@gmail.com
営業時間: 11:00〜17:00（定休日: 水曜日）
――――――――――――――――――

このメールは自動送信されています。
      `,
    };
  } else {
    return {
      subject: "Thank you for contacting us - DMC",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.8; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #2C2C2C; color: white; padding: 30px 20px; text-align: center; }
              .content { background-color: #ffffff; padding: 30px; border: 1px solid #E5E3DC; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #E5E3DC; margin-top: 30px; }
              .signature { margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E3DC; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; font-size: 24px; font-weight: 300;">DMC</h1>
              </div>
              <div class="content">
                <p>Dear ${name},</p>
                
                <p>Thank you for contacting us.</p>
                
                <p>We have received your inquiry and will respond within 2 business days.</p>
                
                <p>We appreciate your patience.</p>
                
                <div class="signature">
                  <p><strong>DMC</strong></p>
                  <p>
                    1-13 Aratajima-cho, Fuji City<br>
                    Shizuoka 417-0001, Japan<br>
                    TEL: +81-545-55-4550<br>
                    Email: dmc.fuji0823@gmail.com<br>
                    Business Hours: 11:00–17:00 (Closed: Wednesday)
                  </p>
                </div>
              </div>
              <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
Dear ${name},

Thank you for contacting us.

We have received your inquiry and will respond within 2 business days.

We appreciate your patience.

――――――――――――――――――
DMC
1-13 Aratatajima-cho, Fuji City
Shizuoka 417-0001, Japan
TEL: +81-545-55-4550
Email: dmc.fuji0823@gmail.com
Business Hours: 11:00–17:00 (Closed: Wednesday)
――――――――――――――――――

This is an automated message.
      `,
    };
  }
};
