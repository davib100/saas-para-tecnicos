'use client'

import { useState, useCallback, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cpfValidation, cnpjValidation } from '@/lib/validators'
import { Loader2, Upload } from 'lucide-react'
import { toast } from 'sonner'

interface CompanySetupModalProps {
  isOpen: boolean;
  onSave: (data: CompanyFormData & { logoUrl: string }) => void;
}

interface CompanyFormData {
  documentType: 'CNPJ' | 'CPF';
  document: string;
  companyName: string;
  phone: string;
  cep: string;
  address: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

const initialFormData: CompanyFormData = {
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

const REQUIRED_FIELDS: Array<keyof CompanyFormData> = [
  'document', 'companyName', 'phone', 'cep', 'address', 'number', 'neighborhood', 'city', 'state'
];

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const CEP_LENGTH = 8;

export function CompanySetupModal({ isOpen, onSave }: CompanySetupModalProps) {
  const [formData, setFormData] = useState<CompanyFormData>(initialFormData);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isCepLoading, setIsCepLoading] = useState(false);

  const validateField = useCallback((name: keyof CompanyFormData, value: string): string => {
    if (name === 'complement') return "";
    if (!value.trim()) return "Campo obrigatório";
    
    if (name === 'document') {
      const { documentType } = formData;
      if (documentType === 'CPF' && !cpfValidation(value)) return "CPF inválido";
      if (documentType === 'CNPJ' && !cnpjValidation(value)) return "CNPJ inválido";
    }
    
    if (name === 'state' && value.length > 2) return "Use apenas a sigla (ex: SP)";
    if (name === 'cep' && value.replace(/\D/g, '').length !== CEP_LENGTH) return "CEP deve conter 8 dígitos";
    
    return "";
  }, [formData.documentType]);

  const handleInputChange = useCallback((name: keyof CompanyFormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [validateField]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setErrors(prev => ({ ...prev, logo: "O arquivo deve ter no máximo 2MB." }));
      setLogoFile(null);
      return;
    }

    setErrors(prev => ({ ...prev, logo: "" }));
    setLogoFile(file);
  }, []);

  const fetchAddressByZipCode = useCallback(async (cep: string) => {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      if (!response.ok) throw new Error('CEP não encontrado');
      
      const data = await response.json();
      if (data.erro) throw new Error('CEP inválido');
      
      return {
        address: data.logradouro || '',
        neighborhood: data.bairro || '',
        city: data.localidade || '',
        state: data.uf || ''
      };
    } catch {
      throw new Error('CEP não encontrado');
    }
  }, []);

  const handleCepChange = useCallback(async (cep: string) => {
    const cleanedCep = cep.replace(/\D/g, '');
    handleInputChange('cep', cleanedCep);

    if (cleanedCep.length !== CEP_LENGTH) {
      if (cleanedCep.length > 0) {
        setErrors(prev => ({ ...prev, cep: "CEP deve conter 8 dígitos" }));
      }
      return;
    }

    setIsCepLoading(true);
    try {
      const addressData = await fetchAddressByZipCode(cleanedCep);
      setFormData(prev => ({ ...prev, ...addressData }));
      setErrors(prev => ({ ...prev, cep: "" }));
    } catch (error) {
      setErrors(prev => ({ ...prev, cep: (error as Error).message }));
    } finally {
      setIsCepLoading(false);
    }
  }, [handleInputChange, fetchAddressByZipCode]);

  const isFormValid = useMemo(() => 
    REQUIRED_FIELDS.every(field => formData[field].trim()) && 
    Object.values(errors).every(err => !err)
  , [formData, errors]);

  const uploadFile = useCallback(async (file: File): Promise<string> => {
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: uploadFormData,
    });

    if (!response.ok) {
      throw new Error('Falha ao fazer upload do logo.');
    }

    const result = await response.json();
    return result.logoUrl;
  }, []);

  const handleSaveClick = useCallback(async () => {
    if (!isFormValid) {
      toast.error("Por favor, corrija os erros antes de salvar.");
      return;
    }

    setIsSaving(true);
    try {
      const logoUrl = logoFile ? await uploadFile(logoFile) : '';
      onSave({ ...formData, logoUrl });
    } catch (error) {
      console.error(error);
      toast.error((error as Error).message || "Ocorreu um erro inesperado.");
    } finally {
      setIsSaving(false);
    }
  }, [isFormValid, logoFile, formData, uploadFile, onSave]);

  const handleDocumentTypeChange = useCallback((value: 'CNPJ' | 'CPF') => {
    setFormData(prev => ({ ...prev, documentType: value, document: '' }));
    setErrors(prev => ({ ...prev, document: '' }));
  }, []);

  const handleStateChange = useCallback((value: string) => {
    handleInputChange('state', value.toUpperCase());
  }, [handleInputChange]);

  const isLoading = isSaving || isCepLoading;

  return (
    <Dialog open={isOpen}>
      <DialogContent 
        className="max-w-2xl" 
        onInteractOutside={(e) => e.preventDefault()} 
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle>Configuração Inicial da Empresa</DialogTitle>
          <DialogDescription>
            Precisamos de algumas informações sobre sua empresa para começar. Estes dados serão usados na emissão de ordens de serviço e relatórios.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="md:col-span-2">
            <Label htmlFor="companyName">Nome/Razão Social</Label>
            <Input 
              id="companyName" 
              value={formData.companyName} 
              onChange={e => handleInputChange('companyName', e.target.value)} 
              disabled={isLoading}
            />
            {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>}
          </div>

          <div>
            <Label>Tipo de Documento</Label>
            <Select 
              value={formData.documentType} 
              onValueChange={handleDocumentTypeChange} 
              disabled={isLoading}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="CNPJ">CNPJ</SelectItem>
                <SelectItem value="CPF">CPF</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="document">{formData.documentType}</Label>
            <Input 
              id="document" 
              value={formData.document} 
              onChange={e => handleInputChange('document', e.target.value)} 
              disabled={isLoading}
            />
            {errors.document && <p className="text-red-500 text-xs mt-1">{errors.document}</p>}
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="logo-upload">Logo da Empresa (Opcional, max 2MB)</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input 
                id="logo-upload" 
                type="file" 
                accept="image/png,image/jpeg,image/webp" 
                onChange={handleFileChange} 
                className="hidden" 
                disabled={isLoading}
              />
              <Label 
                htmlFor="logo-upload" 
                className={`flex items-center gap-2 cursor-pointer text-sm p-2 border rounded-md w-full ${
                  isLoading ? 'bg-muted/50' : 'hover:bg-muted'
                }`}
              >
                <Upload className="w-4 h-4"/>
                <span>{logoFile?.name || "Escolher arquivo..."}</span>
              </Label>
            </div>
            {errors.logo && <p className="text-red-500 text-xs mt-1">{errors.logo}</p>}
          </div>
          
          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input 
              id="phone" 
              value={formData.phone} 
              onChange={e => handleInputChange('phone', e.target.value)} 
              disabled={isLoading}
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          <div className="relative">
            <Label htmlFor="cep">CEP</Label>
            <Input 
              id="cep" 
              value={formData.cep} 
              maxLength={8} 
              onChange={e => handleCepChange(e.target.value)} 
              disabled={isLoading} 
            />
            {isCepLoading && <Loader2 className="absolute right-2 top-8 h-4 w-4 animate-spin" />}
            {errors.cep && <p className="text-red-500 text-xs mt-1">{errors.cep}</p>}
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="address">Endereço</Label>
            <Input 
              id="address" 
              value={formData.address} 
              onChange={e => handleInputChange('address', e.target.value)} 
              disabled={isLoading}
            />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
          </div>

          <div>
            <Label htmlFor="number">Número</Label>
            <Input 
              id="number" 
              value={formData.number} 
              onChange={e => handleInputChange('number', e.target.value)} 
              disabled={isLoading}
            />
            {errors.number && <p className="text-red-500 text-xs mt-1">{errors.number}</p>}
          </div>

          <div>
            <Label htmlFor="complement">Complemento</Label>
            <Input 
              id="complement" 
              value={formData.complement} 
              onChange={e => handleInputChange('complement', e.target.value)} 
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="neighborhood">Bairro</Label>
            <Input 
              id="neighborhood" 
              value={formData.neighborhood} 
              onChange={e => handleInputChange('neighborhood', e.target.value)} 
              disabled={isLoading}
            />
            {errors.neighborhood && <p className="text-red-500 text-xs mt-1">{errors.neighborhood}</p>}
          </div>

          <div>
            <Label htmlFor="city">Cidade</Label>
            <Input 
              id="city" 
              value={formData.city} 
              onChange={e => handleInputChange('city', e.target.value)} 
              disabled={isLoading}
            />
            {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
          </div>

          <div>
            <Label htmlFor="state">Estado (UF)</Label>
            <Input 
              id="state" 
              maxLength={2} 
              value={formData.state} 
              onChange={e => handleStateChange(e.target.value)} 
              disabled={isLoading}
            />
            {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSaveClick} disabled={!isFormValid || isLoading}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
            {isSaving ? "Salvando..." : "Salvar e Começar a Usar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}