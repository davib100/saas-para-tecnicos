'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2 } from 'lucide-react'

interface DataChangeRequestModalProps {
  isOpen: boolean
  onClose: () => void
  companyData: any
}

export const DataChangeRequestModal = ({ isOpen, onClose, companyData }: DataChangeRequestModalProps) => {
  const [changeRequest, setChangeRequest] = useState("")
  const [isSending, setIsSending] = useState(false)

  const handleSubmit = async () => {
    if (!changeRequest.trim()) {
      alert("Por favor, descreva as alterações desejadas.")
      return
    }

    setIsSending(true)

    const requestPayload = {
      userId: companyData.id,
      requestedChanges: changeRequest,
      currentData: {
        companyName: companyData.companyName,
        document: companyData.document,
        phone: companyData.phone,
        address: `${companyData.address}, ${companyData.number} - ${companyData.neighborhood}, ${companyData.city}`,
      }
    }

    // --- SIMULAÇÃO DE CHAMADA DE API ---
    // Em um cenário real, aqui você faria a chamada para seu backend.
    // Ex: await fetch("/api/send-change-request", { method: "POST", body: JSON.stringify(requestPayload) })
    console.log("--- SIMULANDO CHAMADA DE API PARA O BACKEND ---")
    console.log("Payload da Requisição:", JSON.stringify(requestPayload, null, 2))
    
    // Simula a latência da rede
    setTimeout(() => {
      setIsSending(false)
      alert("Sua solicitação foi enviada com sucesso! A equipe de suporte entrará em contato em breve.")
      setChangeRequest("")
      onClose()
    }, 2000) // Simula 2 segundos de espera
    // --- FIM DA SIMULAÇÃO ---
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Solicitar Alteração de Dados</DialogTitle>
          <DialogDescription>
            Descreva abaixo quais informações você deseja alterar. Nossa equipe de suporte analisará e processará sua solicitação.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="userId">Seu ID de Cliente (para referência)</Label>
                <p className="text-sm font-semibold text-muted-foreground p-2 bg-muted rounded-md">{companyData?.id}</p>
            </div>
            <div className="space-y-2">
                <Label htmlFor="change-request-description">Alterações Desejadas</Label>
                <Textarea
                    id="change-request-description"
                    placeholder="Ex: Por favor, alterem meu endereço para Rua Nova, nº 456. O CEP continua o mesmo."
                    rows={5}
                    value={changeRequest}
                    onChange={(e) => setChangeRequest(e.target.value)}
                />
            </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSending}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isSending}>
            {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSending ? 'Enviando...' : 'Enviar Solicitação'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
