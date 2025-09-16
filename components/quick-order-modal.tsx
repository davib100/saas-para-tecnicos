'use client'

import { useState, useReducer, Reducer } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Plus, FileText, Save, UserPlus, Loader2, X } from "lucide-react"
import { ClientWizard } from "@/components/client-wizard"
import { OrderPreviewModal } from "@/components/order-preview-modal"
import { CustomerCombobox } from "./customer-combobox"

// Tipos
interface ServiceItem {
  id: string;
  descricao: string;
  quantidade: number;
  preco: number;
}

interface CustomerData {
  id: string;
  name: string;
  document: string;
}

interface QuickOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: () => void;
}

// Lógica do Reducer
type FormState = {
  clienteId: string;
  tipoMaquina: string;
  marca: string;
  modelo: string;
  numeroSerie: string;
  acessorios: string;
  problemaDescricao: string;
  itensServico: ServiceItem[];
  valorEstimado: number;
  validadeDias: number;
  dataEntrada: string;
};

type FormAction = 
  | { type: 'UPDATE_FIELD'; field: keyof FormState; value: any }
  | { type: 'ADD_SERVICE_ITEM' }
  | { type: 'REMOVE_SERVICE_ITEM'; id: string }
  | { type: 'UPDATE_SERVICE_ITEM'; id: string; field: keyof ServiceItem; value: string | number }
  | { type: 'SET_CLIENT'; clientId: string; }
  | { type: 'CALCULATE_TOTAL' }
  | { type: 'RESET' };

const getInitialState = (): FormState => ({
    clienteId: "",
    tipoMaquina: "",
    marca: "",
    modelo: "",
    numeroSerie: "",
    acessorios: "",
    problemaDescricao: "",
    itensServico: [{ id: crypto.randomUUID(), descricao: "", quantidade: 1, preco: 0 }],
    valorEstimado: 0,
    validadeDias: 30,
    dataEntrada: new Date().toISOString().split("T")[0],
});

const formReducer: Reducer<FormState, FormAction> = (state, action): FormState => {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value };
    case 'ADD_SERVICE_ITEM':
      return {
        ...state,
        itensServico: [
          ...state.itensServico,
          { id: crypto.randomUUID(), descricao: "", quantidade: 1, preco: 0 },
        ],
      };
    case 'REMOVE_SERVICE_ITEM':
        if (state.itensServico.length <= 1) return state; // Não remover o último item
        return {
            ...state,
            itensServico: state.itensServico.filter(item => item.id !== action.id)
        };
    case 'UPDATE_SERVICE_ITEM':
      return {
        ...state,
        itensServico: state.itensServico.map(item => 
          item.id === action.id ? { ...item, [action.field]: action.value } : item
        )
      };
    case 'SET_CLIENT':
      return { ...state, clienteId: action.clientId };
    case 'CALCULATE_TOTAL':
        const total = state.itensServico.reduce((acc, item) => acc + Number(item.quantidade) * Number(item.preco), 0);
        return { ...state, valorEstimado: total };
    case 'RESET':
      return getInitialState();
    default:
      return state;
  }
};

export function QuickOrderModal({ isOpen, onClose, onOrderCreated }: QuickOrderModalProps) {
  const [state, dispatch] = useReducer(formReducer, getInitialState());
  const [isClientWizardOpen, setIsClientWizardOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<CustomerData | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleApiSubmit = async (status: 'DRAFT' | 'BUDGET') => {
    if (!state.clienteId) {
      console.error("Cliente é obrigatório.");
      return;
    }
    setIsSaving(true);
    try {
      const response = await fetch("/api/service-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...state, status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao salvar a ordem de serviço");
      }
      
      onOrderCreated();
      handleClose();

    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAsDraft = () => handleApiSubmit("DRAFT");

  const handleGenerateOrder = () => {
    if (!state.clienteId || !selectedClient) {
      console.error("Selecione um cliente para gerar a ordem.");
      return;
    }
    dispatch({ type: 'CALCULATE_TOTAL' });
    setIsPreviewOpen(true);
  }

  const handleClose = () => {
    if (isSaving) return;
    dispatch({ type: 'RESET' });
    setSelectedClient(null);
    onClose();
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto shadow-modern border-0">
           <DialogHeader> ... </DialogHeader>
           <div className="space-y-6">
              {/* Cliente */}
              <Card className="shadow-md border-0 gradient-card">
                 <CardHeader>...</CardHeader>
                 <CardContent>
                    <div className="flex gap-3">
                      <div className="flex-1">
                         <CustomerCombobox
                            value={state.clienteId}
                            onChange={(clientId) => dispatch({ type: 'SET_CLIENT', clientId })}
                            onClientSelected={setSelectedClient}
                         />
                      </div>
                      <Button onClick={() => setIsClientWizardOpen(true)}>...</Button>
                    </div>
                 </CardContent>
              </Card>
              
              {/* Equipamento */}
              <Card> ... </Card>

              {/* Problema */}
              <Card> ... </Card>
              
              {/* Itens de Serviço */}
              <Card>
                <CardHeader> ... </CardHeader>
                <CardContent>
                   {state.itensServico.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 mb-2">
                         <Input 
                            placeholder="Descrição" 
                            value={item.descricao} 
                            onChange={e => dispatch({ type: 'UPDATE_SERVICE_ITEM', id: item.id, field: 'descricao', value: e.target.value })}
                         />
                         <Input 
                            type="number" 
                            placeholder="Qtd" 
                            value={item.quantidade} 
                            onChange={e => dispatch({ type: 'UPDATE_SERVICE_ITEM', id: item.id, field: 'quantidade', value: Number(e.target.value) })}
                            className="w-20"
                         />
                         <Input 
                            type="number" 
                            placeholder="Preço" 
                            value={item.preco} 
                            onChange={e => dispatch({ type: 'UPDATE_SERVICE_ITEM', id: item.id, field: 'preco', value: Number(e.target.value) })}
                            className="w-24"
                        />
                        <Button variant="ghost" size="icon" onClick={() => dispatch({ type: 'REMOVE_SERVICE_ITEM', id: item.id })} disabled={state.itensServico.length <= 1}>
                            <X className="h-4 w-4" />
                        </Button>
                      </div>
                   ))}
                   <Button variant="outline" size="sm" onClick={() => dispatch({ type: 'ADD_SERVICE_ITEM' })} className="mt-2">
                      <Plus className="h-4 w-4 mr-2" /> Adicionar Item
                   </Button>
                </CardContent>
              </Card>
           </div>
           <div className="flex justify-end gap-3 pt-6 border-t">
              <Button onClick={handleClose}>Cancelar</Button>
              <Button onClick={handleSaveAsDraft} disabled={isSaving}>{isSaving ? <Loader2/> : <Save/>} Salvar Rascunho</Button>
              <Button onClick={handleGenerateOrder} disabled={isSaving}><FileText/> Gerar Orçamento</Button>
           </div>
        </DialogContent>
      </Dialog>

      <ClientWizard 
        isOpen={isClientWizardOpen} 
        onClose={() => setIsClientWizardOpen(false)} 
        onClientCreated={(newClient) => { 
            dispatch({ type: 'SET_CLIENT', clientId: newClient.id });
            setSelectedClient(newClient);
            setIsClientWizardOpen(false); 
        }} 
      />

      <OrderPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        orderData={state}
        clientData={selectedClient}
        onConfirm={() => handleApiSubmit('BUDGET')} 
      />
    </>
  )
}
