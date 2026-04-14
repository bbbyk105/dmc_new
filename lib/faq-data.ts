/**
 * FAQ データ（FaqSection コンポーネントと FAQPage JSON-LD で共有）
 */
export const faqContent = {
  ja: {
    title: "よくある質問",
    items: [
      {
        question: "キャンセルはできますか？",
        answer:
          "はい、キャンセルは可能です。キャンセルをご希望の場合は、撮影日の2日前までにご連絡ください。",
      },
      {
        question: "持ち物はありますか？",
        answer:
          "着物用肌着をご用意ください（DMCで ¥3,000で購入できます）。着物や小物はすべてスタジオでご用意しております。",
      },
      {
        question: "撮影時間はどのくらいですか？",
        answer:
          "プランによって異なりますが、通常は1時間から4時間程度です。詳細は各プランのページをご確認ください。",
      },
      {
        question: "写真の納品方法を教えてください",
        answer:
          "撮影データはオンラインでお届けします。ダウンロードリンクをメールでお送りいたします。",
      },
      {
        question: "雨天の場合はどうなりますか？",
        answer:
          "屋外撮影の場合、雨天時はスタジオ撮影に変更となります。天候による変更は前日までにご連絡いたします。",
      },
    ],
  },
  en: {
    title: "FAQ",
    items: [
      {
        question: "Can I cancel my reservation?",
        answer:
          "Yes, cancellations are possible. Please contact us at least 2 days before your scheduled session.",
      },
      {
        question: "What should I bring?",
        answer:
          "Please bring kimono underwear (available for purchase at DMC for ¥3,000). All ceremonial kimonos and accessories are provided at the studio.",
      },
      {
        question: "How long does a session take?",
        answer:
          "It varies by plan, but typically ranges from 1 to 4 hours. Please check each plan page for details.",
      },
      {
        question: "How are photos delivered?",
        answer:
          "Photo data is delivered online. We will send you a download link via email.",
      },
      {
        question: "What happens if it rains?",
        answer:
          "For outdoor shoots, we will switch to studio photography in case of rain. We will notify you of any weather-related changes by the day before.",
      },
    ],
  },
} as const;
