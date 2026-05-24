import "./globals.css";

export const metadata = {
  title: "Yu-Gi-Oh! Tournament Deck Validator",
  description:
    "Kiểm tra Deck Condition cho các Archetype trong giải đấu Yu-Gi-Oh!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
