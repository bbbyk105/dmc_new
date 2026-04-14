/**
 * JSON-LD 構造化データを <script> タグとして出力するサーバーコンポーネント
 */
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
