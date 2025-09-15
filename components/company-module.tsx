'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building2, Mail } from "lucide-react"
import { DataChangeRequestModal } from './data-change-request-modal' 

interface CompanyModuleProps {
  companyData: any; 
}

const CompanyModule = ({ companyData }: CompanyModuleProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!companyData) return null;

  return (
    <>
      <DataChangeRequestModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        companyData={companyData}
      />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Informações de Cadastro
            </CardTitle>
            <CardDescription>Estes são os dados utilizados para emissão de documentos. Para alterá-los, utilize o botão no final da página.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             {/* O campo de ID foi removido desta visualização */}

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                  <Label htmlFor="companyName">Nome/Razão Social</Label>
                  <Input id="companyName" value={companyData.companyName || ''} readOnly className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="document">{companyData.documentType || 'CNPJ'}</Label>
                  <Input id="document" value={companyData.document || ''} readOnly className="bg-muted/50" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" value={companyData.phone || ''} readOnly className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <Input id="cep" value={companyData.cep || ''} readOnly className="bg-muted/50" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input id="address" value={companyData.address || ''} readOnly className="bg-muted/50" />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                  <Label htmlFor="number">Número</Label>
                  <Input id="number" value={companyData.number || ''} readOnly className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input id="neighborhood" value={companyData.neighborhood || ''} readOnly className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input id="city" value={companyData.city || ''} readOnly className="bg-muted/50" />
              </div>
            </div>
            
            <Button onClick={() => setIsModalOpen(true)} className="mt-4">
                <Mail className="w-4 h-4 mr-2" />
                Solicitar Alteração de Dados
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

export default CompanyModule;
