'use client'

import { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { isValidCPF, isValidCNPJ } from '@/lib/validators'
import { Loader2 } from 'lucide-react'

interface CompanySetupModalProps {
  isOpen: boolean;
  onSave: (data: any) => void;
}

// Telefone agora é obrigatório
const REQUIRED_FIELDS: Array<keyof typeof initialFormData> = [
    'document', 'companyName', 'phone', 'cep', 'address', 'number', 'neighborhood', 'city', 'state'
];

const initialFormData = {
    documentType: 'CNPJ',
    document: '',
    companyName: '',
    phone: '',
    cep: '',
    address: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: ''
};

export function CompanySetupModal({ isOpen, onSave }: CompanySetupModalProps) {
  const [formData, setFormData] = useState(initialFormData);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCepLoading, setIsCepLoading] = useState(false);

  const validateField = useCallback((name: string, value: string) => {
    // Pula a validação de "obrigatório" apenas para o complemento
    if (name === 'complement') return "";

    if (!value) return "Campo obrigatório";

    if (name === 'document') {
      const docType = formData.documentType;
      if (docType === 'CPF' && !isValidCPF(value)) return "CPF inválido";
      if (docType === 'CNPJ' && !isValidCNPJ(value)) return "CNPJ inválido";
    }
    
    if (name === 'state' && value.length > 2) return "Use apenas a sigla (ex: SP)";

    return "";
  }, [formData.documentType]);

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleCepChange = async (cep: string) => {
    const cleanedCep = cep.replace(/[^\d]/g, '');
    handleInputChange('cep', cleanedCep);

    if (cleanedCep.length !== 8) {
        if (cleanedCep.length > 0) {
            setErrors(prev => ({...prev, cep: "CEP deve conter 8 dígitos"}))
        }
      return;
    }

    setIsCepLoading(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanedCep}/json/`);
      if (!response.ok) throw new Error('CEP não encontrado');
      const data = await response.json();
      if (data.erro) throw new Error('CEP inválido');
      
      setFormData(prev => ({
        ...prev,
        address: data.logradouro || '',
        neighborhood: data.bairro || '',
        city: data.localidade || '',
        state: data.uf || ''
      }));
       setErrors(prev => ({...prev, cep: ""}))
    } catch (error) {
      setErrors(prev => ({ ...prev, cep: "CEP não encontrado" }));
    } finally {
      setIsCepLoading(false);
    }
  };
  
  const isFormValid = 
    REQUIRED_FIELDS.every(field => !!formData[field]) &&
    Object.values(errors).every(err => err === '');

  const handleSaveClick = () => {
    let hasError = false;
    const newErrors: Record<string, string> = {};

    REQUIRED_FIELDS.forEach(key => {
        const error = validateField(key, formData[key]);
        if(error) {
            newErrors[key] = error;
            hasError = true;
        }
    });
    
    const docError = validateField('document', formData.document);
    if (docError) {
        newErrors.document = docError;
        hasError = true;
    }

    if(hasError) {
        setErrors(prev => ({...prev, ...newErrors}));
        return;
    }

    onSave(formData);
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-2xl" onInteractOutside={(e) => e.preventDefault()} showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Configuração Inicial da Empresa</DialogTitle>
          <DialogDescription>
            Precisamos de algumas informações sobre sua empresa para começar. Estes dados serão usados na emissão de ordens de serviço e relatórios.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="md:col-span-2">
            <Label htmlFor="companyName">Nome/Razão Social</Label>
            <Input id="companyName" value={formData.companyName} onChange={e => handleInputChange('companyName', e.target.value)} />
            {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>}
          </div>

          <div>
             <Label>Tipo de Documento</Label>
            <Select value={formData.documentType} onValueChange={value => setFormData({...formData, documentType: value, document: ''})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="CNPJ">CNPJ</SelectItem>
                <SelectItem value="CPF">CPF</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="document">{formData.documentType}</Label>
            <Input id="document" value={formData.document} onChange={e => handleInputChange('document', e.target.value)} />
             {errors.document && <p className="text-red-500 text-xs mt-1">{errors.document}</p>}
          </div>

          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

           <div className="relative">
            <Label htmlFor="cep">CEP</Label>
            <Input id="cep" value={formData.cep} maxLength={8} onChange={e => handleCepChange(e.target.value)} />
            {isCepLoading && <Loader2 className="absolute right-2 top-8 h-4 w-4 animate-spin" />}
            {errors.cep && <p className="text-red-500 text-xs mt-1">{errors.cep}</p>}
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="address">Endereço</Label>
            <Input id="address" value={formData.address} onChange={e => handleInputChange('address', e.target.value)} />
             {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
          </div>

          <div>
            <Label htmlFor="number">Número</Label>
            <Input id="number" value={formData.number} onChange={e => handleInputChange('number', e.target.value)} />
            {errors.number && <p className="text-red-500 text-xs mt-1">{errors.number}</p>}
          </div>

          <div>
            <Label htmlFor="complement">Complemento (Opcional)</Label>
            <Input id="complement" value={formData.complement} onChange={e => handleInputChange('complement', e.target.value)} />
          </div>

          <div>
            <Label htmlFor="neighborhood">Bairro</Label>
            <Input id="neighborhood" value={formData.neighborhood} onChange={e => handleInputChange('neighborhood', e.target.value)} />
            {errors.neighborhood && <p className="text-red-500 text-xs mt-1">{errors.neighborhood}</p>}
          </div>

          <div>
            <Label htmlFor="city">Cidade</Label>
            <Input id="city" value={formData.city} onChange={e => handleInputChange('city', e.target.value)} />
            {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
          </div>

          <div>
            <Label htmlFor="state">Estado (UF)</Label>
            <Input id="state" maxLength={2} value={formData.state} onChange={e => handleInputChange('state', e.target.value.toUpperCase())} />
            {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSaveClick} disabled={!isFormValid || isCepLoading}>
            Salvar e Começar a Usar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
