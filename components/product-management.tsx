'use client'

import { useState, useEffect, useMemo, useCallback, memo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Edit, Trash2, Package, Monitor, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

interface Product {
  id: string
  tipo: "estoque" | "maquina"
  nome: string
  sku?: string
  preco?: number
  quantidade?: number
  marca?: string
  modelo?: string
  numeroSerie?: string
  estadoEntrada?: string
  acessorios?: string
  senha?: string
  observacoes?: string
  dataCadastro: string
}

interface FormData {
  tipo: "estoque" | "maquina"
  nome: string
  sku: string
  preco: string
  quantidade: string
  marca: string
  modelo: string
  numeroSerie: string
  estadoEntrada: string
  acessorios: string
  senha: string
  observacoes: string
}

const initialFormData: FormData = {
  tipo: "estoque",
  nome: "",
  sku: "",
  preco: "",
  quantidade: "",
  marca: "",
  modelo: "",
  numeroSerie: "",
  estadoEntrada: "",
  acessorios: "",
  senha: "",
  observacoes: "",
}

const EmptyState = memo(({ type }: { type: string }) => (
  <div className="text-center text-muted-foreground p-10 border-2 border-dashed rounded-lg mt-4">
    {type === 'estoque' ? 
      <Package className="mx-auto h-12 w-12" /> : 
      <Monitor className="mx-auto h-12 w-12" />
    }
    <h3 className="mt-4 text-lg font-semibold">
      {type === 'estoque' ? "Nenhum Produto em Estoque" : "Nenhuma Máquina Cadastrada"}
    </h3>
    <p className="mt-2 text-sm">
      Clique em "{type === 'estoque' ? 'Novo Produto' : 'Nova Máquina'}" para começar.
    </p>
  </div>
))
EmptyState.displayName = 'EmptyState'

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [activeTab, setActiveTab] = useState<"estoque" | "maquina">("estoque")
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({})
  const [formData, setFormData] = useState<FormData>(initialFormData)

  const loadProducts = useCallback(() => {
    try {
      const savedProducts = localStorage.getItem('products')
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts))
      }
    } catch (error) {
      console.error("Falha ao ler dados de produtos:", error)
      toast.error("Erro ao carregar produtos")
    }
  }, [])

  const saveProducts = useCallback((productsToSave: Product[]) => {
    try {
      localStorage.setItem('products', JSON.stringify(productsToSave))
    } catch (error) {
      console.error("Falha ao salvar dados de produtos:", error)
      toast.error("Erro ao salvar produtos")
    }
  }, [])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  useEffect(() => {
    saveProducts(products)
  }, [products, saveProducts])

  const filteredProducts = useMemo(() => {
    const searchLower = searchTerm.toLowerCase()
    return products.filter(product =>
      product.tipo === activeTab &&
      (product.nome.toLowerCase().includes(searchLower) ||
        product.sku?.toLowerCase().includes(searchLower) ||
        product.marca?.toLowerCase().includes(searchLower) ||
        product.modelo?.toLowerCase().includes(searchLower))
    )
  }, [products, activeTab, searchTerm])

  const validateForm = useCallback(() => {
    if (!formData.nome.trim()) {
      toast.error("Nome é obrigatório")
      return false
    }
    if (formData.tipo === "estoque" && formData.preco && isNaN(parseFloat(formData.preco))) {
      toast.error("Preço deve ser um número válido")
      return false
    }
    if (formData.tipo === "estoque" && formData.quantidade && isNaN(parseInt(formData.quantidade))) {
      toast.error("Quantidade deve ser um número válido")
      return false
    }
    return true
  }, [formData])

  const handleSaveProduct = useCallback(() => {
    if (!validateForm()) return

    const productData = {
      ...formData,
      preco: formData.preco ? parseFloat(formData.preco) : undefined,
      quantidade: formData.quantidade ? parseInt(formData.quantidade, 10) : undefined,
    }

    if (editingProduct) {
      setProducts(prev =>
        prev.map(p => p.id === editingProduct.id ? { ...p, ...productData } : p)
      )
      toast.success("Produto atualizado com sucesso")
    } else {
      const newProduct: Product = {
        id: `PRD${Date.now()}`,
        ...productData,
        dataCadastro: new Date().toISOString().split("T")[0],
      }
      setProducts(prev => [...prev, newProduct])
      toast.success("Produto criado com sucesso")
    }

    resetForm()
    setIsDialogOpen(false)
  }, [editingProduct, formData, validateForm])

  const resetForm = useCallback(() => {
    setFormData({ ...initialFormData, tipo: activeTab })
    setEditingProduct(null)
  }, [activeTab])

  const handleEditProduct = useCallback((product: Product) => {
    setEditingProduct(product)
    setFormData({
      tipo: product.tipo,
      nome: product.nome,
      sku: product.sku || "",
      preco: product.preco?.toString() || "",
      quantidade: product.quantidade?.toString() || "",
      marca: product.marca || "",
      modelo: product.modelo || "",
      numeroSerie: product.numeroSerie || "",
      estadoEntrada: product.estadoEntrada || "",
      acessorios: product.acessorios || "",
      senha: product.senha || "",
      observacoes: product.observacoes || "",
    })
    setIsDialogOpen(true)
  }, [])
  
  const handleDeleteProduct = useCallback((productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId))
    toast.success("Produto removido com sucesso")
  }, [])

  const togglePasswordVisibility = useCallback((productId: string) => {
    setShowPassword(prev => ({ ...prev, [productId]: !prev[productId] }))
  }, [])

  const handleInputChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleNewProductClick = useCallback(() => {
    resetForm()
    setFormData(prev => ({ ...prev, tipo: activeTab }))
  }, [resetForm, activeTab])

  const hasProducts = products.filter(p => p.tipo === activeTab).length > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Produtos e Máquinas</h1>
          <p className="text-muted-foreground">Gerencie seu estoque e equipamentos de clientes</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewProductClick}>
              <Plus className="w-4 h-4 mr-2" />
              {activeTab === "estoque" ? "Novo Produto" : "Nova Máquina"}
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 
                  `Editar ${activeTab === "estoque" ? "Produto" : "Máquina"}` : 
                  `Novo ${activeTab === "estoque" ? "Produto" : "Máquina"}`
                }
              </DialogTitle>
              <DialogDescription>
                Preencha as informações do {activeTab === "estoque" ? "produto" : "equipamento"}.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nome" className="text-right">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => handleInputChange("nome", e.target.value)}
                  className="col-span-3"
                />
              </div>

              {formData.tipo === "estoque" && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="sku" className="text-right">SKU</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => handleInputChange("sku", e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="preco" className="text-right">Preço</Label>
                    <Input
                      id="preco"
                      type="number"
                      step="0.01"
                      value={formData.preco}
                      onChange={(e) => handleInputChange("preco", e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="quantidade" className="text-right">Quantidade</Label>
                    <Input
                      id="quantidade"
                      type="number"
                      value={formData.quantidade}
                      onChange={(e) => handleInputChange("quantidade", e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="marca" className="text-right">Marca</Label>
                <Input
                  id="marca"
                  value={formData.marca}
                  onChange={(e) => handleInputChange("marca", e.target.value)}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="modelo" className="text-right">Modelo</Label>
                <Input
                  id="modelo"
                  value={formData.modelo}
                  onChange={(e) => handleInputChange("modelo", e.target.value)}
                  className="col-span-3"
                />
              </div>

              {formData.tipo === "maquina" && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="numeroSerie" className="text-right">Número de Série</Label>
                    <Input
                      id="numeroSerie"
                      value={formData.numeroSerie}
                      onChange={(e) => handleInputChange("numeroSerie", e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="estadoEntrada" className="text-right">Estado de Entrada</Label>
                    <Input
                      id="estadoEntrada"
                      value={formData.estadoEntrada}
                      onChange={(e) => handleInputChange("estadoEntrada", e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="acessorios" className="text-right">Acessórios</Label>
                    <Textarea
                      id="acessorios"
                      value={formData.acessorios}
                      onChange={(e) => handleInputChange("acessorios", e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="senha" className="text-right">Senha</Label>
                    <Input
                      id="senha"
                      type="password"
                      value={formData.senha}
                      onChange={(e) => handleInputChange("senha", e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="observacoes" className="text-right">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => handleInputChange("observacoes", e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveProduct}>
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "estoque" | "maquina")}>
        <TabsList>
          <TabsTrigger value="estoque">Produtos de Estoque</TabsTrigger>
          <TabsTrigger value="maquina">Máquinas de Clientes</TabsTrigger>
        </TabsList>

        <Card className="mt-4">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder={`Buscar ${activeTab === "estoque" ? "produtos" : "máquinas"}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                  disabled={!hasProducts}
                />
              </div>
              <Button variant="outline" disabled={!hasProducts}>
                <Search className="w-4 h-4 mr-2" />
                Buscar
              </Button>
            </div>
          </CardContent>
        </Card>

        <TabsContent value="estoque">
          {filteredProducts.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Produtos em Estoque ({filteredProducts.length})</CardTitle>
                <CardDescription>Controle seu estoque de peças e produtos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Package className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{product.nome}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            {product.sku && <Badge variant="outline">SKU: {product.sku}</Badge>}
                            <span>Preço: R$ {product.preco?.toFixed(2) || 'N/A'}</span>
                            <span>Estoque: {product.quantidade || 0} unidades</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteProduct(product.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <EmptyState type="estoque" />
          )}
        </TabsContent>

        <TabsContent value="maquina">
          {filteredProducts.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Máquinas de Clientes ({filteredProducts.length})</CardTitle>
                <CardDescription>Equipamentos recebidos para manutenção</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <Monitor className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{product.nome}</h3>
                          <div className="flex items-center gap-2 flex-wrap text-sm text-muted-foreground mt-1">
                            <Badge variant="outline">{product.marca} {product.modelo}</Badge>
                            <span>S/N: {product.numeroSerie || 'N/A'}</span>
                            <span>Estado: {product.estadoEntrada || 'N/A'}</span>
                            {product.senha && (
                              <span className="flex items-center gap-1">
                                Senha: {showPassword[product.id] ? product.senha : "••••••"}
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => togglePasswordVisibility(product.id)} 
                                  className="h-auto p-0 ml-1"
                                >
                                  {showPassword[product.id] ? 
                                    <EyeOff className="w-4 h-4" /> : 
                                    <Eye className="w-4 h-4" />
                                  }
                                </Button>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteProduct(product.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <EmptyState type="maquina" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}