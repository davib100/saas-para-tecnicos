import { NextResponse } from "next/server";
import { z } from "zod";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { getAuthUser } from "@/lib/auth";
import { createApiHandler, AppError } from "@/lib/error-handler";

const generatePdfSchema = z.object({
  order: z.object({
    id: z.string(),
    customer: z.object({ name: z.string() }),
    equipment: z.string(),
    brand: z.string().nullable(),
    model: z.string().nullable(),
    serialNumber: z.string().nullable(),
    problemDescription: z.string(),
    createdAt: z.string(),
  }),
  company: z.object({
    name: z.string(),
  }),
  termText: z.string(),
});

export const POST = createApiHandler(async (request: Request) => {
  const user = await getAuthUser();
  if (!user || !user.company?.id) {
    throw new AppError("Unauthorized", 401);
  }

  const body = await request.json();
  const { order, company, termText } = generatePdfSchema.parse(body);

  const doc = new jsPDF();

  // Cabeçalho
  doc.setFontSize(16);
  doc.text(company.name, 14, 22);
  doc.setFontSize(12);
  doc.text(`Ordem de Serviço #${order.id}`, 14, 30);
  doc.line(14, 32, 196, 32); // Linha horizontal

  // Informações do Cliente e Equipamento
  (doc as any).autoTable({
    startY: 38,
    head: [['Cliente', 'Data de Entrada']],
    body: [[order.customer.name, new Date(order.createdAt).toLocaleDateString('pt-BR')]],
    theme: 'striped',
    styles: { fontSize: 10 },
  });

  (doc as any).autoTable({
    startY: (doc as any).lastAutoTable.finalY + 2,
    head: [['Equipamento', 'Marca', 'Modelo', 'Nº de Série']],
    body: [[order.equipment, order.brand || 'N/A', order.model || 'N/A', order.serialNumber || 'N/A']],
    theme: 'striped',
    styles: { fontSize: 10 },
  });

  // Descrição do Problema
  doc.setFontSize(12);
  doc.text("Problema Relatado:", 14, (doc as any).lastAutoTable.finalY + 10);
  doc.setFontSize(10);
  const problemLines = doc.splitTextToSize(order.problemDescription, 182);
  doc.text(problemLines, 14, (doc as any).lastAutoTable.finalY + 16);

  // Termo de Responsabilidade
  const termY = (doc as any).lastAutoTable.finalY + 16 + (problemLines.length * 5) + 10;
  doc.setFontSize(8);
  const termLines = doc.splitTextToSize(termText, 182);
  doc.text(termLines, 14, termY);
  
  // Assinatura
  const signatureY = termY + (termLines.length * 3) + 20;
  doc.line(50, signatureY, 160, signatureY);
  doc.text("Assinatura do Cliente", 105, signatureY + 5, { align: 'center' });

  // Gera o PDF como um Buffer
  const pdfBuffer = doc.output('arraybuffer');

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="os_${order.id}_termo.pdf"`,
    },
  });
}, "pdf/service-order");
