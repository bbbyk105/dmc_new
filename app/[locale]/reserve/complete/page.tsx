import type { Metadata } from "next";
import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import { stripe } from "@/lib/stripe";
import { completeBookingSession } from "@/lib/checkout/booking";
import { getBookingBySession } from "@/lib/db/reserve";
import { formatSlot } from "@/lib/reserve/format";
import { formatYen } from "@/lib/reserve/pricing";
import { TELEPHONE_DISPLAY } from "@/lib/site-info";
import type { BookingWithNames } from "@/lib/db/types";

export const dynamic = "force-dynamic";

// お客さまの予約が出るページなので、検索に載せない
export const metadata: Metadata = { robots: { index: false, follow: false } };

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ session_id?: string }>;
};

/**
 * Stripe で払い終わって戻ってくるページ。Webhook より先に着くことがあるので、
 * ここでも Stripe に支払いを確かめて確定する（確定とメールは一度だけ）。
 * Stripe に確かめられないときも、データベースにある今の状態を出す
 */
async function loadBooking(sessionId: string | undefined): Promise<BookingWithNames | null> {
  if (!sessionId || !/^cs_[A-Za-z0-9_]{10,200}$/.test(sessionId)) return null;
  try {
    const session = await stripe().checkout.sessions.retrieve(sessionId);
    if (session.metadata?.kind === "booking") await completeBookingSession(session);
  } catch (error) {
    console.error("[reserve] 完了ページで Stripe に支払いを確かめられませんでした", error);
  }
  try {
    return await getBookingBySession(sessionId);
  } catch (error) {
    console.error("[reserve] 完了ページで予約を読めませんでした", error);
    return null;
  }
}

export default async function ReserveCompletePage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isJa = locale !== "en";
  const booking = await loadBooking((await searchParams).session_id);

  let heading: string;
  let body: string;
  if (booking?.status === "confirmed") {
    heading = isJa ? "ご予約が確定しました" : "Your booking is confirmed";
    body = isJa
      ? `ご予約ありがとうございます。確認のメールを ${booking.customer_email} にお送りしました。当日お待ちしております。`
      : `Thank you. We have sent a confirmation email to ${booking.customer_email}. We look forward to seeing you.`;
  } else if (booking?.status === "cancelled" && booking.cancel_reason === "conflict") {
    const refunded = booking.refunded_amount >= booking.amount;
    heading = isJa ? "ご予約を確定できませんでした" : "We could not confirm your booking";
    body = isJa
      ? `お支払いの手続きに時間がかかったため、そのあいだに別のお客さまのご予約が入ってしまいました。${refunded ? "お支払いいただいた金額は、全額カードに返金しています。" : "お支払いいただいた金額は、全額をカードにお返しします。手続きが済みましたら、あらためてご連絡します。"}お手数ですが、別の日時でご予約ください。`
      : `Your payment took longer than the time we could hold the slot, and it was booked in the meantime. ${refunded ? "We have refunded the full amount to your card." : "We will return the full amount to your card and contact you once it is done."} Please choose another time.`;
  } else if (booking?.status === "cancelled") {
    heading = isJa ? "このご予約はキャンセルされています" : "This booking has been cancelled";
    body = isJa
      ? `キャンセルについてのご案内は、メールでお送りしています。ご不明な点は、お電話（${TELEPHONE_DISPLAY}）でお問い合わせください。`
      : `We have sent you an email about the cancellation. If you have any questions, please call us at ${TELEPHONE_DISPLAY}.`;
  } else if (booking?.status === "expired") {
    heading = isJa ? "お支払いが完了していません" : "Payment was not completed";
    body = isJa
      ? "ご予約は確定していません。お手数ですが、もう一度ご予約ください。"
      : "Your booking has not been confirmed. Please book again.";
  } else if (booking) {
    heading = isJa ? "お支払いを確認しています" : "Checking your payment";
    body = isJa
      ? "お支払いを確認でき次第、ご予約が確定し、メールでお知らせします。しばらくたってもメールが届かないときは、お電話でお問い合わせください。"
      : "Your booking will be confirmed and emailed to you as soon as the payment is confirmed. If you do not receive an email, please call us.";
  } else {
    heading = isJa ? "ご予約が見つかりませんでした" : "Booking not found";
    body = isJa
      ? `お手数ですが、お電話（${TELEPHONE_DISPLAY}）でお問い合わせください。`
      : `Please call us at ${TELEPHONE_DISPLAY}.`;
  }

  return (
    <section className="pb-24 pt-32 md:pt-40">
      <div className="container mx-auto max-w-2xl px-6">
        <h1 className="mb-6 text-center font-serif text-3xl font-light tracking-wide text-text md:text-4xl">{heading}</h1>
        <div className="mx-auto mb-8 h-px w-16 bg-text" />
        <p className="text-center text-sm leading-7 text-text-muted">{body}</p>

        {booking && (
          <dl className="mt-12 border-t border-border">
            {[
              [isJa ? "予約番号" : "Booking number", booking.code],
              [
                isJa ? "サービス" : "Service",
                `${(isJa ? booking.services?.name_ja : booking.services?.name_en) ?? ""} / ${(isJa ? booking.service_options?.name_ja : booking.service_options?.name_en) ?? ""}`,
              ],
              [isJa ? "日時" : "Date & time", formatSlot(new Date(booking.starts_at), new Date(booking.ends_at), locale)],
              [isJa ? "人数" : "Guests", isJa ? `${booking.people}名` : String(booking.people)],
              [isJa ? "料金（税込）" : "Price (tax incl.)", formatYen(booking.amount)],
            ].map(([label, value]) => (
              <div key={label} className="grid grid-cols-3 gap-4 border-b border-border py-4">
                <dt className="text-sm text-text-muted">{label}</dt>
                <dd className="col-span-2 text-sm text-text">{value}</dd>
              </div>
            ))}
          </dl>
        )}

        <div className="mt-12 flex justify-center">
          <Link href={`/${locale}`} className="btn-secondary">
            {isJa ? "トップへ戻る" : "Back to home"}
          </Link>
        </div>
      </div>
    </section>
  );
}
