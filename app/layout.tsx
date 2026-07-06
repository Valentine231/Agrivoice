import type { Metadata } from "next";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "AgriLink — Farm to Buyer, Made Simple",
  description:
    "AgriLink connects farmers directly to buyers and trusted transporters, with secure escrow-style payments powered by Paystack.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
