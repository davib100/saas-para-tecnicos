'use client'

import type React from "react"
import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ClientObjectSchema } from "@/lib/validators"
import { toast } from "sonner"
import { type Client } from "@/types/client"
import InputMask from "react-input-mask"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, ArrowLeft, User, Building, Camera, Upload, Loader2, X } from "lucide-react"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

const OSSchema = z.object({
  equipment: z.string().min(1, "O tipo de equipamento é obrigatório."),
  brand: z.string().optional(),
  model: z.string().optional(),
  problemDescription: z.string().min(1, "A descrição do problema é obrigatória."),
})

const WizardFormSchema = ClientObjectSchema.extend({
  criarOS: z.boolean().default(false),
  osData: OSSchema.optional(),
}).superRefine((data, ctx) => {
  if (data.criarOS && !data.osData) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Os dados do equipamento são necessários para criar a OS.", path: ['osData'] });
  }
})

type WizardFormData = z.infer<typeof WizardFormSchema>

export interface SaveData {
    clientData: z.infer<typeof ClientObjectSchema>;
    osData?: z.infer<typeof OSSchema>;
}

interface ClientWizardProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: SaveData) => void
  isSaving: boolean
  clientToEdit: Client | null
}

const STEP_VALIDATION_FIELDS: { [key: number]: any } = {
  1: { PF: ['documento', 'nome', 'telefone'], PJ: ['documento', 'nome', 'inscricaoEstadual', 'telefone'] },
  2: ['cep', 'rua', 'numero', 'bairro', 'cidade', 'estado'],
  3: [],
  4: ['osData.equipment', 'osData.problemDescription']
};

const TOTAL_STEPS = 4;

const StepIndicator = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => (
    <div className="flex items-center gap-2 my-4">{Array.from({ length: totalSteps }, (_, index) => { const step = index + 1; const isActive = step === currentStep; const isCompleted = step < currentStep; return (<div key={step} className="flex items-center"><div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-300 ${isCompleted ? 'bg-primary text-primary-foreground' : isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{step}</div>{step < totalSteps && <div className={`w-12 h-0.5 mx-2 transition-colors duration-300 ${isCompleted ? 'bg-primary' : 'bg-muted'}`} />}</div>);})}</div>
);

export function ClientWizard({ isOpen, onClose, onSave, isSaving, clientToEdit }: ClientWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditing = useMemo(() => !!clientToEdit, [clientToEdit]);

  const form = useForm<WizardFormData>({ resolver: zodResolver(WizardFormSchema), defaultValues: { tipo: "PF", documento: "", nome: "", inscricaoEstadual: "", telefone: "", cep: "", rua: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "", consentimentoFoto: false, observacoes: "", criarOS: false, osData: { equipment: '', brand: '', model: '', problemDescription: '' } } });

  useEffect(() => { if (isEditing && clientToEdit) { form.reset({...clientToEdit, criarOS: false }); } else { form.reset(); } }, [clientToEdit, isEditing, form]);

  const tipo = form.watch("tipo");
  const criarOS = form.watch("criarOS");

  const handleClose = useCallback(() => { setCurrentStep(1); setPhotoPreview(null); onClose(); }, [onClose]);
  const handlePhotoUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (file) { setPhotoPreview(URL.createObjectURL(file)); } }, []);
  const removePhoto = useCallback(() => { setPhotoPreview(null); if (fileInputRef.current) { fileInputRef.current.value = ""; } }, []);

  const handleNextStep = useCallback(async () => { let isValid = true; if (currentStep === 4 && criarOS) { isValid = await form.trigger(['osData.equipment', 'osData.problemDescription']); } else if (currentStep < 4) { const fieldsToValidate = STEP_VALIDATION_FIELDS[currentStep][tipo] || STEP_VALIDATION_FIELDS[currentStep]; isValid = await form.trigger(fieldsToValidate); } if (isValid && currentStep < TOTAL_STEPS) { setCurrentStep(currentStep + 1); } }, [currentStep, tipo, form, criarOS]);
  const handlePrevStep = useCallback(() => { if (currentStep > 1) setCurrentStep(currentStep - 1); }, [currentStep]);

  const onSubmit = useCallback((data: WizardFormData) => { const { osData, criarOS, ...clientData } = data; onSave({ clientData: ClientObjectSchema.parse(clientData), osData: criarOS ? osData : undefined }); }, [onSave]);

  const stepTitle = useMemo(() => { switch (currentStep) { case 1: return "Dados Básicos"; case 2: return "Endereço"; case 3: return "Foto e Observações"; case 4: return "Ordem de Serviço (Opcional)"; default: return ""; } }, [currentStep]);

  const handleCepBlur = useCallback(async (cep: string) => {
    const cleanedCep = cep.replace(/[^0-9]/g, '');
    if (cleanedCep.length !== 8) return;
    const toastId = toast.loading("Buscando CEP...");
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanedCep}/json/`);
      const data = await response.json();
      if (data.erro) throw new Error("CEP não encontrado");
      form.setValue('rua', data.logradouro); form.setValue('bairro', data.bairro); form.setValue('cidade', data.localidade); form.setValue('estado', data.uf);
      toast.success("Endereço encontrado!", { id: toastId });
      document.getElementById('numero')?.focus();
    } catch (error) {
      toast.error("Falha ao buscar CEP.", { id: toastId });
    }
  }, [form]);

  const renderStep1 = () => (
    <div className="space-y-6"><FormField control={form.control} name="tipo" render={({ field }) => (<FormItem><FormLabel>Tipo de Cliente</FormLabel><div className="flex gap-4"><Button type="button" variant={field.value === "PF" ? "default" : "outline"} onClick={() => field.onChange("PF")} className="flex-1"><User className="w-4 h-4 mr-2" />Pessoa Física</Button><Button type="button" variant={field.value === "PJ" ? "default" : "outline"} onClick={() => field.onChange("PJ")} className="flex-1"><Building className="w-4 h-4 mr-2" />Pessoa Jurídica</Button></div><FormMessage /></FormItem>)} /><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><FormField control={form.control} name="documento" render={({ field }) => (<FormItem><FormLabel>{tipo === "PF" ? "CPF" : "CNPJ"}</FormLabel><FormControl><InputMask mask={tipo === 'PF' ? '999.999.999-99' : '99.999.999/9999-99'} value={field.value} onChange={field.onChange} onBlur={field.onBlur}>{(inputProps: any) => <Input {...inputProps} placeholder={tipo === "PF" ? "000.000.000-00" : "00.000.000/0000-00"} />}</InputMask></FormControl><FormMessage /></FormItem>)} /><FormField control={form.control} name="nome" render={({ field }) => (<FormItem><FormLabel>{tipo === "PF" ? "Nome Completo" : "Razão Social"}</FormLabel><FormControl><Input placeholder="Digite o nome" {...field} /></FormControl><FormMessage /></FormItem>)} />{tipo === "PJ" && <FormField control={form.control} name="inscricaoEstadual" render={({ field }) => (<FormItem><FormLabel>Inscrição Estadual</FormLabel><FormControl><Input placeholder="000.000.000.000" {...field} /></FormControl><FormMessage /></FormItem>)} /> }<FormField control={form.control} name="telefone" render={({ field }) => (<FormItem><FormLabel>Telefone</FormLabel><FormControl><InputMask mask="(99) 99999-9999" value={field.value} onChange={field.onChange} onBlur={field.onBlur}>{(inputProps: any) => <Input {...inputProps} placeholder="(00) 00000-0000" />}</InputMask></FormControl><FormMessage /></FormItem>)} /></div></div>
  );

  const renderStep2 = () => (
    <div className="space-y-6"><div className="grid grid-cols-1 md:grid-cols-3 gap-6"><FormField control={form.control} name="cep" render={({ field }) => (<FormItem><FormLabel>CEP</FormLabel><FormControl><InputMask mask="99999-999" value={field.value} onChange={field.onChange} onBlur={(e) => { field.onBlur(); handleCepBlur(e.target.value); }}>{(inputProps: any) => <Input {...inputProps} placeholder="00000-000" />}</InputMask></FormControl><FormMessage /></FormItem>)} /><FormField control={form.control} name="rua" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Rua</FormLabel><FormControl><Input placeholder="Nome da rua" {...field} /></FormControl><FormMessage /></FormItem>)} /></div><div className="grid grid-cols-1 md:grid-cols-3 gap-6"><FormField control={form.control} name="numero" render={({ field }) => (<FormItem><FormLabel>Número</FormLabel><FormControl><Input id="numero" placeholder="123" {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={form.control} name="complemento" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Complemento</FormLabel><FormControl><Input placeholder="Apartamento, bloco, etc." {...field} /></FormControl><FormMessage /></FormItem>)} /></div><div className="grid grid-cols-1 md:grid-cols-3 gap-6"><FormField control={form.control} name="bairro" render={({ field }) => (<FormItem><FormLabel>Bairro</FormLabel><FormControl><Input placeholder="Nome do bairro" {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={form.control} name="cidade" render={({ field }) => (<FormItem><FormLabel>Cidade</FormLabel><FormControl><Input placeholder="Nome da cidade" {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={form.control} name="estado" render={({ field }) => (<FormItem><FormLabel>Estado</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl><SelectContent><SelectItem value="AC">Acre</SelectItem><SelectItem value="AL">Alagoas</SelectItem><SelectItem value="AP">Amapá</SelectItem><SelectItem value="AM">Amazonas</SelectItem><SelectItem value="BA">Bahia</SelectItem><SelectItem value="CE">Ceará</SelectItem><SelectItem value="DF">Distrito Federal</SelectItem><SelectItem value="ES">Espírito Santo</SelectItem><SelectItem value="GO">Goiás</SelectItem><SelectItem value="MA">Maranhão</SelectItem><SelectItem value="MT">Mato Grosso</SelectItem><SelectItem value="MS">Mato Grosso do Sul</SelectItem><SelectItem value="MG">Minas Gerais</SelectItem><SelectItem value="PA">Pará</SelectItem><SelectItem value="PB">Paraíba</SelectItem><SelectItem value="PR">Paraná</SelectItem><SelectItem value="PE">Pernambuco</SelectItem><SelectItem value="PI">Piauí</SelectItem><SelectItem value="RJ">Rio de Janeiro</SelectItem><SelectItem value="RN">Rio Grande do Norte</SelectItem><SelectItem value="RS">Rio Grande do Sul</SelectItem><SelectItem value="RO">Rondônia</SelectItem><SelectItem value="RR">Roraima</SelectItem><SelectItem value="SC">Santa Catarina</SelectItem><SelectItem value="SP">São Paulo</SelectItem><SelectItem value="SE">Sergipe</SelectItem><SelectItem value="TO">Tocantins</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} /></div></div>
  );

  const renderStep3 = () => (
    <div className="space-y-6"><div><Label htmlFor="photo">Foto do Cliente (Opcional)</Label><div className="mt-2">{photoPreview ? (<div className="relative w-32 h-32 mx-auto"><img src={photoPreview} alt="Preview" className="w-full h-full object-cover rounded-lg border"/><Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6" onClick={removePhoto}><X className="h-3 w-3" /></Button></div>) : (<div className="border-2 border-dashed border-muted-foreground rounded-lg p-8 text-center"><Camera className="mx-auto h-12 w-12 text-muted-foreground mb-4" /><Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}><Upload className="w-4 h-4 mr-2" />Selecionar Foto</Button></div>)}<input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden"/></div></div><FormField control={form.control} name="consentimentoFoto" render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange}/></FormControl><div className="space-y-1 leading-none"><FormLabel>Cliente concorda com o uso da foto</FormLabel></div></FormItem>)}/><FormField control={form.control} name="observacoes" render={({ field }) => (<FormItem><FormLabel>Observações</FormLabel><FormControl><Textarea placeholder="Informações adicionais sobre o cliente" className="min-h-[100px]" {...field} /></FormControl><FormMessage /></FormItem>)}/></div>
  );

  const renderStep4 = () => (
    <div className="space-y-6"><FormField control={form.control} name="criarOS" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-muted/50"><div className="space-y-0.5"><FormLabel className="text-base">Criar Ordem de Serviço?</FormLabel><div className="text-sm text-muted-foreground">Marque esta opção para criar uma OS para este cliente imediatamente.</div></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />{criarOS && (<div className="space-y-4 border rounded-lg p-4 animate-in fade-in-0"><h4 className="font-medium text-lg">Dados do Equipamento</h4><FormField control={form.control} name="osData.equipment" render={({ field }) => (<FormItem><FormLabel>Equipamento</FormLabel><FormControl><Input placeholder="Ex: Notebook, Desktop, Impressora" {...field} /></FormControl><FormMessage /></FormItem>)} /><div className="grid grid-cols-2 gap-4"><FormField control={form.control} name="osData.brand" render={({ field }) => (<FormItem><FormLabel>Marca</FormLabel><FormControl><Input placeholder="Ex: Dell, HP, Apple" {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={form.control} name="osData.model" render={({ field }) => (<FormItem><FormLabel>Modelo</FormLabel><FormControl><Input placeholder="Ex: Inspiron 15, MacBook Pro" {...field} /></FormControl><FormMessage /></FormItem>)} /></div><FormField control={form.control} name="osData.problemDescription" render={({ field }) => (<FormItem><FormLabel>Descrição do Problema</FormLabel><FormControl><Textarea placeholder="Descreva o problema relatado pelo cliente" className="min-h-[100px]" {...field} /></FormControl><FormMessage /></FormItem>)} /></div>)}</div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) { case 1: return renderStep1(); case 2: return renderStep2(); case 3: return renderStep3(); case 4: return renderStep4(); default: return renderStep1(); }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}><DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{isEditing ? `Editar Cliente: ${clientToEdit?.nome}` : "Cadastrar Novo Cliente"}</DialogTitle><DialogDescription>Passo {currentStep} de {TOTAL_STEPS} - {stepTitle}</DialogDescription></DialogHeader><StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} /><Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8"><div className="min-h-[400px]">{renderCurrentStep()}</div><div className="flex justify-between pt-4 border-t"><Button type="button" variant="outline" onClick={handlePrevStep} disabled={currentStep === 1 || isSaving}><ArrowLeft className="w-4 h-4 mr-2" />Anterior</Button><div className="flex gap-2"><Button type="button" variant="ghost" onClick={handleClose} disabled={isSaving}>Cancelar</Button>{currentStep < TOTAL_STEPS ? (<Button type="button" onClick={handleNextStep} disabled={isSaving}>Próximo <ArrowRight className="w-4 h-4 ml-2" /></Button>) : (<Button type="submit" disabled={isSaving}>{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{isSaving ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : (criarOS ? 'Salvar e Criar OS' : 'Finalizar Cadastro'))}</Button>)}</div></div></form></Form></DialogContent></Dialog>
  );
}
