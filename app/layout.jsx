import "./globals.css";

export const metadata = {
  title: "Xóm YGO Tournament Deck Validator",
  description:
    "Kiểm tra Deck Condition cho các Archetype trong giải đấu thứ 36 của XYGO",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
