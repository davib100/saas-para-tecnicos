import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { getDailyMovement, exportToExcel } from "@/lib/backup"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export async function GET(request: Request) {
  try {
    const user = await getAuthUser()
    if (!user || !user.company) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get("date")
    const date = dateParam ? new Date(dateParam) : new Date()

    console.log("[v0] Exporting daily movement for:", format(date, "dd/MM/yyyy", { locale: ptBR }))

    const data = await getDailyMovement(user.company.id, date)
    const buffer = await exportToExcel(data)

    const fileName = `movimentacao_${format(date, "yyyy-MM-dd")}.xlsx`

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": buffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("[v0] Error exporting daily movement:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
