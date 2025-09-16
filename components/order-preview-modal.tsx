"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { FileText, Printer, AlertTriangle, Save, Loader2 } from "lucide-react"
import { Label } from "@/components/ui/label"

interface OrderPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  orderData: any
  clientData: any
  onConfirm: () => Promise<void>; // Adicionado
}

export function OrderPreviewModal({ isOpen, onClose, orderData, clientData, onConfirm }: OrderPreviewModalProps) {
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [isSaving, setIsSaving] = useState(false);

  const handleConfirmAndSave = async () => {
    if (!termsAccepted) return;
    setIsSaving(true);
    try {
      await onConfirm();
      // O fechamento do modal e o reset serão tratados no componente pai
    } catch (error) {
      console.error("Erro ao confirmar e salvar a OS:", error);
      // Idealmente, mostrar um toast de erro para o usuário
    } finally {
      setIsSaving(false);
    }
  }

  const handleClientRefusal = () => {
    console.log("Cliente recusou orçamento.");
    alert("Orçamento recusado.");
    onClose()
  }

  if (!orderData || !clientData) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Pré-visualização da Ordem de Serviço
          </DialogTitle>
          <DialogDescription>Revise e confirme as informações antes de salvar.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* ... (Seções de dados da empresa, cliente, etc. - sem alterações) */}
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
                  <strong>Nome:</strong> {clientData.name}
                </p>
                <p>
                  <strong>Documento:</strong> {clientData.document}
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
                  id="terms-preview"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                />
                <Label htmlFor="terms-preview" className="text-sm font-medium">
                  Li e aceito o Termo de Responsabilidade acima
                </Label>
              </div>
            </CardContent>
          </Card>

        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center pt-6 mt-6 border-t">
            <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="outline" onClick={onClose} disabled={isSaving}>Voltar</Button>
                <Button variant="destructive" onClick={handleClientRefusal} disabled={isSaving}>Cliente Recusou</Button>
            </div>
            <div className="flex gap-2 mt-4 sm:mt-0 w-full sm:w-auto justify-end">
                 <Button onClick={handleConfirmAndSave} disabled={!termsAccepted || isSaving} className="w-full sm:w-auto gradient-primary">
                    {isSaving ? 
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 
                        <Save className="w-4 h-4 mr-2" />
                    }
                    Confirmar e Salvar
                </Button>
            </div>
        </div>

      </DialogContent>
    </Dialog>
  )
}
