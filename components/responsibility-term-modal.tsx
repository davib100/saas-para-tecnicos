"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Download, Building2 } from "lucide-react"

interface ServiceOrder {
  id: string
  clienteNome: string
  maquinaNome: string
  problema: string
  itensServico: Array<{
    id: string
    descricao: string
    quantidade: number
    preco: number
  }>
  valorEstimado: number
  validadeOrcamento: string
}

interface ResponsibilityTermModalProps {
  isOpen: boolean
  onClose: () => void
  order: ServiceOrder | null
}

export function ResponsibilityTermModal({ isOpen, onClose, order }: ResponsibilityTermModalProps) {
  const [acceptedTerm, setAcceptedTerm] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  if (!order) return null

  const handleGeneratePDF = async () => {
    if (!acceptedTerm) return

    setIsGenerating(true)

    // Simular geração do PDF
    setTimeout(() => {
      setIsGenerating(false)
      setAcceptedTerm(false)
      onClose()

      // Aqui seria feito o download do PDF
      console.log("PDF gerado para OS:", order.id)
    }, 2000)
  }

  const termText = `
TERMO DE RESPONSABILIDADE E CONDIÇÕES DE SERVIÇO

1. DIAGNÓSTICO E ORÇAMENTO
O cliente autoriza a realização do diagnóstico do equipamento descrito neste documento. 
Caso o cliente não aprove o orçamento apresentado ou desista do conserto após o diagnóstico, 
será cobrada uma taxa de diagnóstico no valor de R$ 60,00 (sessenta reais).

2. RESPONSABILIDADE SOBRE O EQUIPAMENTO
A empresa se responsabiliza pelo equipamento durante o período em que estiver sob seus cuidados, 
exceto em casos de força maior. O cliente declara que o equipamento não possui dados importantes 
não salvos em backup.

3. PRAZO E GARANTIA
O prazo para execução do serviço será informado após aprovação do orçamento. 
Os serviços executados possuem garantia de 90 dias para defeitos relacionados ao reparo realizado.

4. PAGAMENTO
O pagamento deverá ser efetuado na retirada do equipamento. 
Em caso de desistência após aprovação do orçamento, será cobrado 50% do valor dos serviços.

5. ABANDONO DE EQUIPAMENTO
Equipamentos não retirados em até 90 dias após a conclusão do serviço ou comunicação 
de não aprovação do orçamento serão considerados abandonados e poderão ser descartados.

Ao aceitar este termo, o cliente declara estar ciente e de acordo com todas as condições acima.
  `

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Termo de Responsabilidade - OS {order.id}
          </DialogTitle>
          <DialogDescription>
            Revise o orçamento e aceite o termo de responsabilidade para gerar o PDF
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 h-[70vh]">
          {/* Preview do Orçamento */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  TechFix Assistência Técnica
                </CardTitle>
                <div className="text-sm text-muted-foreground">
                  <p>CNPJ: 12.345.678/0001-90</p>
                  <p>Rua da Tecnologia, 123 - São Paulo/SP</p>
                  <p>Tel: (11) 99999-9999</p>
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Dados do Cliente e Equipamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p>
                      <strong>Cliente:</strong> {order.clienteNome}
                    </p>
                    <p>
                      <strong>Equipamento:</strong> {order.maquinaNome}
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong>OS:</strong> {order.id}
                    </p>
                    <p>
                      <strong>Data:</strong> {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div>
                  <p>
                    <strong>Problema:</strong> {order.problema}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Orçamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {order.itensServico.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>
                        {item.descricao} (x{item.quantidade})
                      </span>
                      <span>R$ {(item.quantidade * item.preco).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span>R$ {order.valorEstimado.toFixed(2)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Válido até: {new Date(order.validadeOrcamento).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Termo de Responsabilidade */}
          <div className="space-y-4">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-red-600">Termo de Responsabilidade</CardTitle>
              </CardHeader>
              <CardContent className="h-full overflow-y-auto">
                <div className="text-xs leading-relaxed whitespace-pre-line">{termText}</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Controles */}
        <div className="border-t pt-4 space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="accept-term"
              checked={acceptedTerm}
              onCheckedChange={(checked) => setAcceptedTerm(checked as boolean)}
            />
            <label
              htmlFor="accept-term"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Li e aceito o Termo de Responsabilidade acima
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleGeneratePDF}
              disabled={!acceptedTerm || isGenerating}
              className="bg-primary hover:bg-primary/90"
            >
              {isGenerating ? (
                "Gerando PDF..."
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Gerar PDF/Imprimir
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
