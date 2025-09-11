import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { createBackup, exportToExcel } from "@/lib/backup"
import { format } from "date-fns"

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Exporting complete backup for company:", user.companyId)

    const data = await createBackup(user.companyId)
    const buffer = await exportToExcel(data)
    const fileName = `backup_completo_${format(new Date(), "yyyy-MM-dd_HH-mm-ss")}.xlsx`

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": buffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("[v0] Error exporting complete backup:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
