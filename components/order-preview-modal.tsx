"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { FileText, Printer, AlertTriangle } from "lucide-react"
import { Label } from "@/components/ui/label"

interface OrderPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  orderData: any
  clientData: any
}

export function OrderPreviewModal({ isOpen, onClose, orderData, clientData }: OrderPreviewModalProps) {
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGeneratePDF = async () => {
    if (!termsAccepted) return

    setIsGenerating(true)

    // Simular geração de PDF
    await new Promise((resolve) => setTimeout(resolve, 2000))

    console.log("[v0] Gerando PDF da OS:", orderData)

    // Aqui seria a lógica real de geração do PDF
    // e redirecionamento para a tela da OS criada

    setIsGenerating(false)
    onClose()

    // Simular redirecionamento para tela da OS
    alert("OS criada com sucesso! Redirecionando para a tela da OS...")
  }

  const handleClientRefusal = () => {
    // Marcar OS como recusada e gerar cobrança da taxa
    console.log("[v0] Cliente recusou orçamento, gerando taxa de R$ 60,00")
    alert("Orçamento recusado. Taxa de R$ 60,00 será cobrada conforme termo de responsabilidade.")
    onClose()
  }

  if (!orderData || !clientData) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Preview do Orçamento / Ordem de Serviço
          </DialogTitle>
          <DialogDescription>Revise as informações antes de gerar o documento final</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Dados da Empresa */}
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl">TechFix Assistência Técnica</CardTitle>
              <p className="text-sm text-muted-foreground">CNPJ: 12.345.678/0001-90 | Telefone: (11) 99999-9999</p>
              <p className="text-sm text-muted-foreground">Rua das Tecnologias, 123 - São Paulo, SP</p>
            </CardHeader>
          </Card>

          {/* Dados do Cliente e Equipamento */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dados do Cliente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>
                  <strong>Nome:</strong> {clientData.nome}
                </p>
                <p>
                  <strong>Documento:</strong> {clientData.documento}
                </p>
                <p>
                  <strong>Data:</strong> {new Date(orderData.dataEntrada).toLocaleDateString("pt-BR")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Equipamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>
                  <strong>Tipo:</strong> {orderData.tipoMaquina}
                </p>
                <p>
                  <strong>Marca/Modelo:</strong> {orderData.marca} {orderData.modelo}
                </p>
                {orderData.numeroSerie && (
                  <p>
                    <strong>Nº Série:</strong> {orderData.numeroSerie}
                  </p>
                )}
                {orderData.acessorios && (
                  <p>
                    <strong>Acessórios:</strong> {orderData.acessorios}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Problema Relatado */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Problema Relatado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{orderData.problemaDescricao}</p>
            </CardContent>
          </Card>

          {/* Itens de Serviço */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Itens de Serviço</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {orderData.itensServico.map((item: any, index: number) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <div className="flex-1">
                      <p className="font-medium">{item.descricao}</p>
                      <p className="text-sm text-muted-foreground">
                        Quantidade: {item.quantidade} x R$ {item.preco.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">R$ {(item.quantidade * item.preco).toFixed(2)}</p>
                    </div>
                  </div>
                ))}

                <Separator />

                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Valor Total:</span>
                  <span className="text-primary">R$ {orderData.valorEstimado.toFixed(2)}</span>
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>Validade do orçamento: {orderData.validadeDias} dias</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Termo de Responsabilidade */}
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                Termo de Responsabilidade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <p>
                  <strong>IMPORTANTE:</strong> Ao autorizar este orçamento, o cliente declara estar ciente de que:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>O equipamento será analisado e reparado conforme descrito acima</li>
                  <li>Caso não autorize o conserto após o diagnóstico, será cobrada taxa de R$ 60,00</li>
                  <li>O prazo de garantia é de 90 dias para serviços realizados</li>
                  <li>Equipamentos não retirados em 30 dias serão considerados abandonados</li>
                </ul>
                <p className="font-medium text-orange-800">Taxa de diagnóstico não autorizado: R$ 60,00</p>
              </div>

              <div className="flex items-center space-x-2 pt-3">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                />
                <Label htmlFor="terms" className="text-sm font-medium">
                  Li e aceito o Termo de Responsabilidade acima
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-between pt-4 border-t">
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Voltar para Edição
            </Button>
            <Button
              variant="outline"
              onClick={handleClientRefusal}
              className="text-red-600 hover:text-red-700 bg-transparent"
            >
              Cliente Recusou
            </Button>
          </div>

          <Button onClick={handleGeneratePDF} disabled={!termsAccepted || isGenerating} className="bg-primary">
            {isGenerating ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Gerando PDF...
              </>
            ) : (
              <>
                <Printer className="w-4 h-4 mr-2" />
                Gerar PDF / Imprimir
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
