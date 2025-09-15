
import type React from "react"

// Como os layouts de grupo (app) e (auth) agora definem a estrutura <html> e <body>,
// este layout raiz só precisa passar os filhos adiante.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
