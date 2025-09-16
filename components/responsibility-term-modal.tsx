'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ServiceOrder } from '@prisma/client'
import { useAuth } from '@/hooks/use-auth'

interface ResponsibilityTermModalProps {
  isOpen: boolean
  onClose: () => void
  order: ServiceOrder & { customer: { name: string } }
}

const TERM_TEXT = `
Declaro para os devidos fins que estou ciente e de acordo com as seguintes condições para a realização do serviço no equipamento acima descrito:
1. O equipamento será submetido a uma análise técnica para identificação do defeito e elaboração do orçamento.
2. A não aprovação do orçamento no prazo de 30 (trinta) dias implicará na cobrança de uma taxa de laudo técnico.
3. Equipamentos não retirados em até 90 (noventa) dias após a comunicação da finalização do serviço ou da não aprovação do orçamento serão considerados abandonados, podendo ser vendidos para cobrir os custos do serviço e armazenamento.
4. A garantia do serviço é de 90 (noventa) dias, cobrindo apenas o defeito reparado, não abrangendo novos problemas ou danos causados por mau uso, quedas, picos de energia ou contato com líquidos.
5. O cliente autoriza a realização de todos os testes necessários para o diagnóstico e reparo do equipamento.
`;

export function ResponsibilityTermModal({ isOpen, onClose, order }: ResponsibilityTermModalProps) {
  const [acceptedTerm, setAcceptedTerm] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const { user } = useAuth()

  const handleGeneratePDF = async () => {
    if (!acceptedTerm || !user?.company) return
    setIsGenerating(true)

    try {
      const response = await fetch('/api/pdf/service-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          order,
          company: user.company,
          termText: TERM_TEXT
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao gerar o PDF. Status: ' + response.status);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `os_${order.id}_termo.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      onClose();
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      // Adicionar um toast de erro para o usuário aqui seria uma boa prática
    } finally {
      setIsGenerating(false);
      setAcceptedTerm(false); // Resetar o estado para a próxima abertura
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Termo de Responsabilidade</DialogTitle>
        </DialogHeader>
        <div className="prose prose-sm max-h-[50vh] overflow-y-auto rounded-md border bg-muted p-4">
          <p className="whitespace-pre-wrap">
            {TERM_TEXT}
          </p>
        </div>
        <div className="flex items-center space-x-2 py-4">
          <Checkbox 
            id="terms"
            checked={acceptedTerm}
            onCheckedChange={(checked) => setAcceptedTerm(!!checked)} 
          />
          <Label htmlFor="terms" className="font-medium">
            Li e aceito os termos e condições descritos acima.
          </Label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isGenerating}>Cancelar</Button>
          <Button 
            onClick={handleGeneratePDF} 
            disabled={!acceptedTerm || isGenerating}
          >
            {isGenerating ? 'Gerando PDF...' : 'Gerar PDF e Assinar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
