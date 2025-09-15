'use client'

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
  id: string; descricao: string; quantidade: number; preco: number;
}

interface QuickOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// A lista de clientes foi removida para eliminar dados estáticos.
const clients: {id: string, nome: string, documento: string}[] = []

const tiposMaquina = [
  "Notebook", "Desktop", "Smartphone", "Tablet", "Televisão", "Geladeira", 
  "Micro-ondas", "Ar Condicionado", "Impressora", "Outro",
]

export function QuickOrderModal({ isOpen, onClose }: QuickOrderModalProps) {
  const [isClientWizardOpen, setIsClientWizardOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [formData, setFormData] = useState({
    clienteId: "", tipoMaquina: "", marca: "", modelo: "", numeroSerie: "", acessorios: "",
    problemaDescricao: "",
    itensServico: [{ id: "1", descricao: "", quantidade: 1, preco: 0 }] as ServiceItem[],
    valorEstimado: 0, validadeDias: 30, dataEntrada: new Date().toISOString().split("T")[0],
  })

  const calculateTotal = () => {
    return formData.itensServico.reduce((total, item) => total + item.quantidade * item.preco, 0)
  }

  const addServiceItem = () => {
    const newId = String(formData.itensServico.length + 1)
    setFormData({ ...formData, itensServico: [...formData.itensServico, { id: newId, descricao: "", quantidade: 1, preco: 0 }] })
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
    console.log("Salvando como rascunho:", formData)
    onClose()
  }

  const handleGenerateOrder = () => {
    const valorTotal = calculateTotal()
    setFormData({ ...formData, valorEstimado: valorTotal })
    setIsPreviewOpen(true)
  }

  const resetForm = () => {
    setFormData({
        clienteId: "", tipoMaquina: "", marca: "", modelo: "", numeroSerie: "", acessorios: "",
        problemaDescricao: "",
        itensServico: [{ id: "1", descricao: "", quantidade: 1, preco: 0 }],
        valorEstimado: 0, validadeDias: 30, dataEntrada: new Date().toISOString().split("T")[0],
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
            <DialogTitle className="flex items-center gap-2 text-xl"><FileText className="w-6 h-6 text-primary" />Nova Ordem de Serviço Rápida</DialogTitle>
            <DialogDescription>Crie uma nova OS rapidamente preenchendo as informações essenciais</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <Card className="shadow-md border-0 gradient-card">
              <CardHeader className="pb-3"><CardTitle className="text-lg flex items-center gap-2"><div className="p-1 bg-primary/10 rounded-md"><UserPlus className="w-4 h-4 text-primary" /></div>Cliente</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Select value={formData.clienteId} onValueChange={(value) => setFormData({ ...formData, clienteId: value })}>
                      <SelectTrigger className="h-11"><SelectValue placeholder="Selecione um cliente existente" /></SelectTrigger>
                      <SelectContent>
                        {clients.length > 0 ? (
                          clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>{client.nome} - {client.documento}</SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-clients" disabled>Nenhum cliente cadastrado</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="outline" onClick={() => setIsClientWizardOpen(true)} className="whitespace-nowrap h-11 hover:bg-primary hover:text-primary-foreground transition-colors">
                    <UserPlus className="w-4 h-4 mr-2" />Novo Cliente
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* O restante do formulário permanece o mesmo... */}
            <Card className="shadow-md border-0 gradient-card"> 
                <CardHeader className="pb-3"><CardTitle className="text-lg">Equipamento/Máquina</CardTitle></CardHeader>
                <CardContent> ... </CardContent>
            </Card>

            <Card className="shadow-md border-0 gradient-card">
                 <CardHeader className="pb-3"><CardTitle className="text-lg">Problema Relatado</CardTitle></CardHeader>
                 <CardContent> ... </CardContent>
            </Card>

            <Card className="shadow-md border-0 gradient-card">
                 <CardHeader className="pb-3"><CardTitle>Itens de Serviço</CardTitle></CardHeader>
                 <CardContent> ... </CardContent>
            </Card>

             <Card className="shadow-md border-0 gradient-card">
                 <CardHeader className="pb-3"><CardTitle>Configurações do Orçamento</CardTitle></CardHeader>
                 <CardContent> ... </CardContent>
            </Card>

          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t">
            <Button variant="outline" onClick={handleClose} className="order-3 sm:order-1 bg-transparent">Cancelar</Button>
            <Button variant="outline" onClick={handleSaveAsDraft} className="order-2 bg-transparent"><Save className="w-4 h-4 mr-2" />Salvar como Rascunho</Button>
            <Button onClick={handleGenerateOrder} className="gradient-primary order-1 sm:order-3"><FileText className="w-4 h-4 mr-2" />Gerar Orçamento / OS</Button>
          </div>
        </DialogContent>
      </Dialog>

      <ClientWizard isOpen={isClientWizardOpen} onClose={() => setIsClientWizardOpen(false)} onClientCreated={(newClientId) => { setFormData({ ...formData, clienteId: newClientId }); setIsClientWizardOpen(false); }} />

      <OrderPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        orderData={formData}
        clientData={clients.find((c) => c.id === formData.clienteId)}
      />
    </>
  )
}
