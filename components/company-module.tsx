'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building2, Save } from "lucide-react"
import { toast } from "sonner"

interface CompanyData {
  id?: string
  companyName: string
  document: string
  documentType: string
  phone: string
  cep: string
  address: string
  number: string
  neighborhood: string
  city: string
  state?: string
  complement?: string
}

interface CompanyModuleProps {
  companyData: CompanyData | null
  onSave: (data: CompanyData) => void
}

const CompanyModule = ({ companyData, onSave }: CompanyModuleProps) => {
  const [editedData, setEditedData] = useState<CompanyData>(() => 
    companyData || {
      companyName: '',
      document: '',
      documentType: 'CNPJ',
      phone: '',
      cep: '',
      address: '',
      number: '',
      neighborhood: '',
      city: '',
      state: '',
      complement: ''
    }
  )

  const [isSaving, setIsSaving] = useState(false)

  const hasChanges = useMemo(() => {
    if (!companyData) return true
    return JSON.stringify(editedData) !== JSON.stringify(companyData)
  }, [editedData, companyData])

  const isFormValid = useMemo(() => {
    const requiredFields = ['companyName', 'document', 'phone', 'address', 'city']
    return requiredFields.every(field => editedData[field as keyof CompanyData]?.toString().trim())
  }, [editedData])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setEditedData(prev => ({ ...prev, [id]: value }))
  }, [])

  const handleSave = useCallback(async () => {
    if (!isFormValid) {
      toast.error("Por favor, preencha todos os campos obrigatórios")
      return
    }

    setIsSaving(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      onSave(editedData)
      toast.success("Dados da empresa salvos com sucesso!")
    } catch (error) {
      toast.error("Erro ao salvar os dados da empresa")
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }, [editedData, onSave, isFormValid])

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Configurações da Empresa</h1>
        <p className="text-muted-foreground">Gerencie as informações da sua empresa</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Informações de Cadastro
          </CardTitle>
          <CardDescription>
            Estes são os dados utilizados para emissão de documentos e relatórios.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">
                Nome/Razão Social <span className="text-destructive">*</span>
              </Label>
              <Input 
                id="companyName" 
                value={editedData.companyName} 
                onChange={handleInputChange}
                placeholder="Digite o nome da empresa"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="document">
                {editedData.documentType} <span className="text-destructive">*</span>
              </Label>
              <Input 
                id="document" 
                value={editedData.document} 
                onChange={handleInputChange}
                placeholder="Digite o documento"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">
                Telefone <span className="text-destructive">*</span>
              </Label>
              <Input 
                id="phone" 
                value={editedData.phone} 
                onChange={handleInputChange}
                placeholder="(00) 00000-0000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cep">CEP</Label>
              <Input 
                id="cep" 
                value={editedData.cep} 
                onChange={handleInputChange}
                placeholder="00000-000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">
              Endereço <span className="text-destructive">*</span>
            </Label>
            <Input 
              id="address" 
              value={editedData.address} 
              onChange={handleInputChange}
              placeholder="Rua, Avenida, etc."
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="number">Número</Label>
              <Input 
                id="number" 
                value={editedData.number} 
                onChange={handleInputChange}
                placeholder="123"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="neighborhood">Bairro</Label>
              <Input 
                id="neighborhood" 
                value={editedData.neighborhood} 
                onChange={handleInputChange}
                placeholder="Nome do bairro"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">
                Cidade <span className="text-destructive">*</span>
              </Label>
              <Input 
                id="city" 
                value={editedData.city} 
                onChange={handleInputChange}
                placeholder="Nome da cidade"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="state">Estado</Label>
              <Input 
                id="state" 
                value={editedData.state || ''} 
                onChange={handleInputChange}
                placeholder="UF"
                maxLength={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="complement">Complemento</Label>
              <Input 
                id="complement" 
                value={editedData.complement || ''} 
                onChange={handleInputChange}
                placeholder="Sala, andar, etc."
              />
            </div>
          </div>
          
          <div className="flex justify-end pt-4 border-t">
            <Button 
              onClick={handleSave} 
              disabled={!hasChanges || !isFormValid || isSaving}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CompanyModule