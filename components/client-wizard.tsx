"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowRight, ArrowLeft, User, Building, Camera, Upload, CheckCircle, AlertCircle, FileText } from "lucide-react"

interface ClientWizardProps {
  isOpen: boolean
  onClose: () => void
  onSave?: (clientData: any) => void
  onClientCreated?: (clientId: string) => void
}

export function ClientWizard({ isOpen, onClose, onSave, onClientCreated }: ClientWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isValidatingDocument, setIsValidatingDocument] = useState(false)
  const [documentValidation, setDocumentValidation] = useState<{
    isValid: boolean
    message: string
    verifiedName?: string
  } | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    // Etapa 1 - Dados Básicos
    tipo: "PF" as "PF" | "PJ",
    documento: "",
    nome: "",
    telefone: "",

    // Etapa 2 - Endereço
    cep: "",
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",

    // Etapa 3 - Foto/Documento
    consentimentoFoto: false,
    observacoes: "",

    // Etapa 4 - OS Opcional
    criarOS: false,
    descricaoProblema: "",
    tipoMaquina: "",
    marca: "",
    modelo: "",
    dataEntrada: new Date().toISOString().split("T")[0],
    valorEstimado: "",
  })

  const validateDocument = async (documento: string, tipo: "PF" | "PJ") => {
    setIsValidatingDocument(true)

    // Simular validação de CPF/CNPJ
    setTimeout(() => {
      const isValid = documento.length >= 11

      if (isValid && tipo === "PF") {
        setDocumentValidation({
          isValid: true,
          message: "CPF válido",
          verifiedName: "João Silva Santos", // Nome simulado da receita
        })
        setFormData((prev) => ({ ...prev, nome: "João Silva Santos" }))
      } else if (isValid && tipo === "PJ") {
        setDocumentValidation({
          isValid: true,
          message: "CNPJ válido",
          verifiedName: "Tech Solutions Ltda", // Razão social simulada
        })
        setFormData((prev) => ({ ...prev, nome: "Tech Solutions Ltda" }))
      } else {
        setDocumentValidation({
          isValid: false,
          message: `${tipo === "PF" ? "CPF" : "CNPJ"} inválido ou não encontrado`,
        })
      }

      setIsValidatingDocument(false)
    }, 1500)
  }

  const handleDocumentChange = (value: string) => {
    setFormData((prev) => ({ ...prev, documento: value }))
    setDocumentValidation(null)

    // Auto-validar quando documento estiver completo
    if ((formData.tipo === "PF" && value.length === 14) || (formData.tipo === "PJ" && value.length === 18)) {
      validateDocument(value, formData.tipo)
    }
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCameraCapture = () => {
    // Simular captura de câmera
    alert("Funcionalidade de câmera será implementada com acesso à webcam")
  }

  const canProceedStep1 = () => {
    return formData.documento && formData.nome && formData.telefone && documentValidation?.isValid
  }

  const canProceedStep2 = () => {
    return formData.rua && formData.numero && formData.bairro && formData.cidade && formData.estado
  }

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFinish = () => {
    const clientData = {
      ...formData,
      id: `CLI${String(Date.now()).slice(-3)}`,
      dataCadastro: new Date().toISOString().split("T")[0],
      status: "Ativo",
      foto: photoPreview,
    }

    if (onSave) {
      onSave(clientData)
    }

    if (onClientCreated) {
      onClientCreated(clientData.id)
    }

    onClose()

    // Reset form
    setCurrentStep(1)
    setFormData({
      tipo: "PF",
      documento: "",
      nome: "",
      telefone: "",
      cep: "",
      rua: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      consentimentoFoto: false,
      observacoes: "",
      criarOS: false,
      descricaoProblema: "",
      tipoMaquina: "",
      marca: "",
      modelo: "",
      dataEntrada: new Date().toISOString().split("T")[0],
      valorEstimado: "",
    })
    setDocumentValidation(null)
    setPhotoFile(null)
    setPhotoPreview(null)
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Dados Básicos</h3>
        <p className="text-sm text-muted-foreground">Informações principais do cliente</p>
      </div>

      {/* Toggle CPF/CNPJ */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant={formData.tipo === "PF" ? "default" : "outline"}
          onClick={() => {
            setFormData((prev) => ({ ...prev, tipo: "PF", documento: "", nome: "" }))
            setDocumentValidation(null)
          }}
          className="flex-1"
        >
          <User className="w-4 h-4 mr-2" />
          Pessoa Física (CPF)
        </Button>
        <Button
          type="button"
          variant={formData.tipo === "PJ" ? "default" : "outline"}
          onClick={() => {
            setFormData((prev) => ({ ...prev, tipo: "PJ", documento: "", nome: "" }))
            setDocumentValidation(null)
          }}
          className="flex-1"
        >
          <Building className="w-4 h-4 mr-2" />
          Pessoa Jurídica (CNPJ)
        </Button>
      </div>

      {/* Campo Documento */}
      <div className="space-y-2">
        <Label htmlFor="documento">{formData.tipo === "PF" ? "CPF" : "CNPJ"}</Label>
        <div className="relative">
          <Input
            id="documento"
            value={formData.documento}
            onChange={(e) => handleDocumentChange(e.target.value)}
            placeholder={formData.tipo === "PF" ? "000.000.000-00" : "00.000.000/0000-00"}
            className={documentValidation ? (documentValidation.isValid ? "border-green-500" : "border-red-500") : ""}
          />
          {isValidatingDocument && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            </div>
          )}
        </div>
        {documentValidation && (
          <div
            className={`flex items-center gap-2 text-sm ${
              documentValidation.isValid ? "text-green-600" : "text-red-600"
            }`}
          >
            {documentValidation.isValid ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {documentValidation.message}
          </div>
        )}
      </div>

      {/* Campo Nome */}
      <div className="space-y-2">
        <Label htmlFor="nome">
          {formData.tipo === "PF" ? "Nome Completo" : "Razão Social"}
          {documentValidation?.verifiedName && (
            <Badge variant="outline" className="ml-2 text-green-600">
              Verificado
            </Badge>
          )}
        </Label>
        <Input
          id="nome"
          value={formData.nome}
          onChange={(e) => setFormData((prev) => ({ ...prev, nome: e.target.value }))}
          placeholder={formData.tipo === "PF" ? "Nome completo" : "Razão social da empresa"}
          readOnly={!!documentValidation?.verifiedName}
        />
      </div>

      {/* Campo Telefone */}
      <div className="space-y-2">
        <Label htmlFor="telefone">Telefone</Label>
        <Input
          id="telefone"
          value={formData.telefone}
          onChange={(e) => setFormData((prev) => ({ ...prev, telefone: e.target.value }))}
          placeholder="(11) 99999-9999"
        />
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Endereço</h3>
        <p className="text-sm text-muted-foreground">Localização do cliente</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cep">CEP</Label>
          <Input
            id="cep"
            value={formData.cep}
            onChange={(e) => setFormData((prev) => ({ ...prev, cep: e.target.value }))}
            placeholder="00000-000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rua">Rua *</Label>
          <Input
            id="rua"
            value={formData.rua}
            onChange={(e) => setFormData((prev) => ({ ...prev, rua: e.target.value }))}
            placeholder="Nome da rua"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="numero">Número *</Label>
          <Input
            id="numero"
            value={formData.numero}
            onChange={(e) => setFormData((prev) => ({ ...prev, numero: e.target.value }))}
            placeholder="123"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="complemento">Complemento</Label>
          <Input
            id="complemento"
            value={formData.complemento}
            onChange={(e) => setFormData((prev) => ({ ...prev, complemento: e.target.value }))}
            placeholder="Apto, sala, etc."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bairro">Bairro *</Label>
          <Input
            id="bairro"
            value={formData.bairro}
            onChange={(e) => setFormData((prev) => ({ ...prev, bairro: e.target.value }))}
            placeholder="Nome do bairro"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cidade">Cidade *</Label>
          <Input
            id="cidade"
            value={formData.cidade}
            onChange={(e) => setFormData((prev) => ({ ...prev, cidade: e.target.value }))}
            placeholder="Nome da cidade"
          />
        </div>
        <div className="space-y-2 col-span-2">
          <Label htmlFor="estado">Estado *</Label>
          <Input
            id="estado"
            value={formData.estado}
            onChange={(e) => setFormData((prev) => ({ ...prev, estado: e.target.value }))}
            placeholder="SP"
          />
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Foto / Documento</h3>
        <p className="text-sm text-muted-foreground">Adicione uma foto do cliente ou documento</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Lado esquerdo - Observações */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData((prev) => ({ ...prev, observacoes: e.target.value }))}
              placeholder="Informações adicionais sobre o cliente..."
              rows={4}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="consentimento"
              checked={formData.consentimentoFoto}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, consentimentoFoto: checked as boolean }))}
            />
            <Label htmlFor="consentimento" className="text-sm">
              Autorizo o uso da foto para cadastro e identificação
            </Label>
          </div>
        </div>

        {/* Lado direito - Upload de foto */}
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            {photoPreview ? (
              <div className="space-y-2">
                <img
                  src={photoPreview || "/placeholder.svg"}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg mx-auto"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPhotoPreview(null)
                    setPhotoFile(null)
                  }}
                >
                  Remover Foto
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Camera className="w-12 h-12 text-gray-400 mx-auto" />
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCameraCapture}
                    className="w-full bg-transparent"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Tirar Foto
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload de Foto
                  </Button>
                </div>
              </div>
            )}
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
        </div>
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Abrir Ordem de Serviço</h3>
        <p className="text-sm text-muted-foreground">Deseja já criar uma OS para este cliente?</p>
      </div>

      <div className="flex items-center justify-center gap-4">
        <Button
          type="button"
          variant={formData.criarOS ? "outline" : "default"}
          onClick={() => setFormData((prev) => ({ ...prev, criarOS: false }))}
          className="flex-1"
        >
          Não, apenas cadastrar
        </Button>
        <Button
          type="button"
          variant={formData.criarOS ? "default" : "outline"}
          onClick={() => setFormData((prev) => ({ ...prev, criarOS: true }))}
          className="flex-1"
        >
          <FileText className="w-4 h-4 mr-2" />
          Sim, criar OS
        </Button>
      </div>

      {formData.criarOS && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dados da Ordem de Serviço</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="descricaoProblema">Descrição do Problema</Label>
              <Textarea
                id="descricaoProblema"
                value={formData.descricaoProblema}
                onChange={(e) => setFormData((prev) => ({ ...prev, descricaoProblema: e.target.value }))}
                placeholder="Descreva o defeito ou problema relatado..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipoMaquina">Tipo de Máquina</Label>
                <Input
                  id="tipoMaquina"
                  value={formData.tipoMaquina}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tipoMaquina: e.target.value }))}
                  placeholder="Ex: Notebook, Desktop"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="marca">Marca</Label>
                <Input
                  id="marca"
                  value={formData.marca}
                  onChange={(e) => setFormData((prev) => ({ ...prev, marca: e.target.value }))}
                  placeholder="Ex: Dell, HP, Lenovo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modelo">Modelo</Label>
                <Input
                  id="modelo"
                  value={formData.modelo}
                  onChange={(e) => setFormData((prev) => ({ ...prev, modelo: e.target.value }))}
                  placeholder="Ex: Inspiron 15"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dataEntrada">Data de Entrada</Label>
                <Input
                  id="dataEntrada"
                  type="date"
                  value={formData.dataEntrada}
                  onChange={(e) => setFormData((prev) => ({ ...prev, dataEntrada: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valorEstimado">Valor Estimado (R$)</Label>
                <Input
                  id="valorEstimado"
                  value={formData.valorEstimado}
                  onChange={(e) => setFormData((prev) => ({ ...prev, valorEstimado: e.target.value }))}
                  placeholder="0,00"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
          <DialogDescription>
            Passo {currentStep} de 4 -{" "}
            {currentStep === 1
              ? "Dados Básicos"
              : currentStep === 2
                ? "Endereço"
                : currentStep === 3
                  ? "Foto / Documento"
                  : "Ordem de Serviço"}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep ? "bg-primary text-primary-foreground" : "bg-gray-200 text-gray-600"
                }`}
              >
                {step}
              </div>
              {step < 4 && <div className={`flex-1 h-1 mx-2 ${step < currentStep ? "bg-primary" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={handlePrevStep} disabled={currentStep === 1}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>

            {currentStep < 4 ? (
              <Button
                onClick={handleNextStep}
                disabled={(currentStep === 1 && !canProceedStep1()) || (currentStep === 2 && !canProceedStep2())}
              >
                Próximo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleFinish}>{formData.criarOS ? "Criar Cliente + OS" : "Finalizar Cadastro"}</Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
