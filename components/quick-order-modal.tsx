"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, FileText, Save, UserPlus } from "lucide-react"
import { ClientWizard } from "@/components/client-wizard"
import { OrderPreviewModal } from "@/components/order-preview-modal"
import { clienteId } from "@/utils/clienteId" // Declare the variable here

interface ServiceItem {
  id: string
  descricao: string
  quantidade: number
  preco: number
}

interface QuickOrderModalProps {
  isOpen: boolean
  onClose: () => void
}

const mockClients = [
  { id: "CLI001", nome: "João Silva", documento: "123.456.789-00" },
  { id: "CLI002", nome: "Tech Solutions Ltda", documento: "12.345.678/0001-90" },
  { id: "CLI003", nome: "Maria Santos", documento: "987.654.321-00" },
]

const tiposMaquina = [
  "Notebook",
  "Desktop",
  "Smartphone",
  "Tablet",
  "Televisão",
  "Geladeira",
  "Micro-ondas",
  "Ar Condicionado",
  "Impressora",
  "Outro",
]

export function QuickOrderModal({ isOpen, onClose }: QuickOrderModalProps) {
  const [isClientWizardOpen, setIsClientWizardOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [formData, setFormData] = useState({
    clienteId: "",
    tipoMaquina: "",
    marca: "",
    modelo: "",
    numeroSerie: "",
    acessorios: "",
    problemaDescricao: "",
    itensServico: [{ id: "1", descricao: "", quantidade: 1, preco: 0 }] as ServiceItem[],
    valorEstimado: 0,
    validadeDias: 30,
    dataEntrada: new Date().toISOString().split("T")[0],
  })

  const calculateTotal = () => {
    return formData.itensServico.reduce((total, item) => total + item.quantidade * item.preco, 0)
  }

  const addServiceItem = () => {
    const newId = String(formData.itensServico.length + 1)
    setFormData({
      ...formData,
      itensServico: [...formData.itensServico, { id: newId, descricao: "", quantidade: 1, preco: 0 }],
    })
  }

  const updateServiceItem = (index: number, field: keyof ServiceItem, value: string | number) => {
    const updatedItems = formData.itensServico.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    setFormData({ ...formData, itensServico: updatedItems })
  }

  const removeServiceItem = (index: number) => {
    if (formData.itensServico.length > 1) {
      const updatedItems = formData.itensServico.filter((_, i) => i !== index)
      setFormData({ ...formData, itensServico: updatedItems })
    }
  }

  const handleSaveAsDraft = () => {
    console.log("[v0] Salvando como rascunho:", formData)
    onClose()
  }

  const handleGenerateOrder = () => {
    const valorTotal = calculateTotal()
    setFormData({ ...formData, valorEstimado: valorTotal })
    setIsPreviewOpen(true)
  }

  const resetForm = () => {
    setFormData({
      clienteId: "",
      tipoMaquina: "",
      marca: "",
      modelo: "",
      numeroSerie: "",
      acessorios: "",
      problemaDescricao: "",
      itensServico: [{ id: "1", descricao: "", quantidade: 1, preco: 0 }],
      valorEstimado: 0,
      validadeDias: 30,
      dataEntrada: new Date().toISOString().split("T")[0],
    })
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto shadow-modern border-0">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <FileText className="w-6 h-6 text-primary" />
              Nova Ordem de Serviço - Acesso Rápido
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Crie uma nova OS rapidamente preenchendo as informações essenciais
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <Card className="shadow-md border-0 gradient-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="p-1 bg-primary/10 rounded-md">
                    <UserPlus className="w-4 h-4 text-primary" />
                  </div>
                  Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Select
                      value={formData.clienteId}
                      onValueChange={(value) => setFormData({ ...formData, clienteId: value })}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Selecione um cliente existente" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockClients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.nome} - {client.documento}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setIsClientWizardOpen(true)}
                    className="whitespace-nowrap h-11 hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Novo Cliente
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md border-0 gradient-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Equipamento/Máquina</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tipoMaquina" className="text-sm font-medium">
                      Tipo de Equipamento
                    </Label>
                    <Select
                      value={formData.tipoMaquina}
                      onValueChange={(value) => setFormData({ ...formData, tipoMaquina: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposMaquina.map((tipo) => (
                          <SelectItem key={tipo} value={tipo}>
                            {tipo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="marca" className="text-sm font-medium">
                      Marca
                    </Label>
                    <Input
                      id="marca"
                      value={formData.marca}
                      onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                      placeholder="Ex: Samsung, Dell, Apple"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="modelo" className="text-sm font-medium">
                      Modelo
                    </Label>
                    <Input
                      id="modelo"
                      value={formData.modelo}
                      onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                      placeholder="Ex: Inspiron 15, Galaxy S21"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="numeroSerie" className="text-sm font-medium">
                      Número de Série (opcional)
                    </Label>
                    <Input
                      id="numeroSerie"
                      value={formData.numeroSerie}
                      onChange={(e) => setFormData({ ...formData, numeroSerie: e.target.value })}
                      placeholder="Número de série do equipamento"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="acessorios" className="text-sm font-medium">
                    Acessórios Entregues
                  </Label>
                  <Input
                    id="acessorios"
                    value={formData.acessorios}
                    onChange={(e) => setFormData({ ...formData, acessorios: e.target.value })}
                    placeholder="Ex: Carregador, cabo USB, manual"
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md border-0 gradient-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Problema Relatado</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.problemaDescricao}
                  onChange={(e) => setFormData({ ...formData, problemaDescricao: e.target.value })}
                  placeholder="Descreva detalhadamente o problema relatado pelo cliente..."
                  rows={4}
                  className="resize-none"
                />
              </CardContent>
            </Card>

            <Card className="shadow-md border-0 gradient-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  Itens de Serviço
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addServiceItem}
                    className="hover:bg-primary hover:text-primary-foreground bg-transparent"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Item
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.itensServico.map((item, index) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-3 items-end p-4 border border-border/50 rounded-lg bg-card/50"
                  >
                    <div className="col-span-12 md:col-span-6">
                      <Label className="text-sm font-medium">Descrição do Serviço</Label>
                      <Input
                        value={item.descricao}
                        onChange={(e) => updateServiceItem(index, "descricao", e.target.value)}
                        placeholder="Ex: Diagnóstico, Troca de tela"
                        className="mt-1"
                      />
                    </div>
                    <div className="col-span-4 md:col-span-2">
                      <Label className="text-sm font-medium">Qtd</Label>
                      <Input
                        type="number"
                        value={item.quantidade}
                        onChange={(e) => updateServiceItem(index, "quantidade", Number.parseInt(e.target.value))}
                        min="1"
                        className="mt-1"
                      />
                    </div>
                    <div className="col-span-7 md:col-span-3">
                      <Label className="text-sm font-medium">Valor Unitário (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.preco}
                        onChange={(e) => updateServiceItem(index, "preco", Number.parseFloat(e.target.value))}
                        placeholder="0,00"
                        className="mt-1"
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeServiceItem(index)}
                        disabled={formData.itensServico.length === 1}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 mt-1"
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="border-t pt-4 mt-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Valor Total Estimado:</span>
                    <span className="text-3xl font-bold text-primary">R$ {calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md border-0 gradient-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Configurações do Orçamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="validadeDias" className="text-sm font-medium">
                      Validade do Orçamento (dias)
                    </Label>
                    <Input
                      id="validadeDias"
                      type="number"
                      value={formData.validadeDias}
                      onChange={(e) => setFormData({ ...formData, validadeDias: Number.parseInt(e.target.value) })}
                      min="1"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dataEntrada" className="text-sm font-medium">
                      Data de Entrada
                    </Label>
                    <Input
                      id="dataEntrada"
                      type="date"
                      value={formData.dataEntrada}
                      onChange={(e) => setFormData({ ...formData, dataEntrada: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t">
            <Button variant="outline" onClick={handleClose} className="order-3 sm:order-1 bg-transparent">
              Cancelar
            </Button>
            <Button variant="outline" onClick={handleSaveAsDraft} className="order-2 bg-transparent">
              <Save className="w-4 h-4 mr-2" />
              Salvar como Rascunho
            </Button>
            <Button onClick={handleGenerateOrder} className="gradient-primary order-1 sm:order-3">
              <FileText className="w-4 h-4 mr-2" />
              Gerar Orçamento / OS
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ClientWizard
        isOpen={isClientWizardOpen}
        onClose={() => setIsClientWizardOpen(false)}
        onClientCreated={(clientId) => {
          setFormData({ ...formData, clienteId })
          setIsClientWizardOpen(false)
        }}
      />

      <OrderPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        orderData={formData}
        clientData={mockClients.find((c) => c.id === formData.clienteId)}
      />
    </>
  )
}
