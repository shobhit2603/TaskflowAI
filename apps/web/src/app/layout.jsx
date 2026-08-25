import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/layout/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: {
    default: "TaskflowAI — Smart Task & Reminder App",
    template: "%s | TaskflowAI",
  },
  description:
    "AI-powered task management with natural language parsing, smart categorization, and intelligent reminders.",
  keywords: ["task management", "AI", "productivity", "reminders", "Mistral AI"],
};

export default function RootLayout({ children }) {
  return (
    // dark class applies the dark theme CSS variables from globals.css
    <html lang="en" className="dark h-full">
      <body className={`${inter.variable} font-sans h-full antialiased bg-background text-foreground`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
