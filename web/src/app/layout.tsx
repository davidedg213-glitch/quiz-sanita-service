import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Preparati · Prova privata",
  description: "Versione privata del simulatore di preparazione. Tutti i quesiti sono sintetici e non provengono dalla banca ufficiale.",
  robots: { index: false, follow: false }
};
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="it"><body>{children}</body></html>;
}
