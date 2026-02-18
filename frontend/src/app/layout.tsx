import type { Metadata } from "next";
import { Jura } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/ui/header-1";

const jura = Jura({
  variable: "--font-jura",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "JOIN.IA | Inteligencia Artificial Empresarial",
  description:
    "JOIN.IA: El núcleo central para conectar datos, áreas y procesos mediante workflows y agentes autónomos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${jura.variable} antialiased`}>
        <Header />
        {children}
      </body>
    </html>
  );
}
