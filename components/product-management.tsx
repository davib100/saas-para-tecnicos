"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Edit, Trash2, Package, Monitor, Upload, Eye, EyeOff } from "lucide-react"

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
  fotos?: string[]
  observacoes?: string
  dataCadastro: string
}

const mockProducts: Product[] = [
  {
    id: "PRD001",
    tipo: "estoque",
    nome: 'Tela LCD 15.6"',
    sku: "TL156001",
    preco: 280.0,
    quantidade: 15,
    observacoes: "Compatível com notebooks Dell e HP",
    dataCadastro: "2024-01-10",
  },
  {
    id: "PRD002",
    tipo: "maquina",
    nome: "Notebook Dell Inspiron",
    marca: "Dell",
    modelo: "Inspiron 15 3000",
    numeroSerie: "DL123456789",
    estadoEntrada: "Funcionando parcialmente",
    acessorios: "Carregador, mouse",
    senha: "123456",
    observacoes: "Não liga, possível problema na fonte",
    dataCadastro: "2024-01-15",
  },
  {
    id: "PRD003",
    tipo: "estoque",
    nome: "Fonte Notebook Universal",
    sku: "FT90W001",
    preco: 85.0,
    quantidade: 8,
    observacoes: "90W, múltiplos conectores",
    dataCadastro: "2024-01-08",
  },
]

function ProductManagement() {
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [activeTab, setActiveTab] = useState("estoque")
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({})
  const [formData, setFormData] = useState({
    tipo: "estoque" as "estoque" | "maquina",
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
  })

  const filteredProducts = products.filter(
    (product) =>
      product.tipo === activeTab &&
      (product.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.includes(searchTerm) ||
        product.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.modelo?.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const handleSaveProduct = () => {
    if (editingProduct) {
      setProducts(
        products.map((product) =>
          product.id === editingProduct.id
            ? {
                ...product,
                ...formData,
                preco: formData.preco ? Number.parseFloat(formData.preco) : undefined,
                quantidade: formData.quantidade ? Number.parseInt(formData.quantidade) : undefined,
              }
            : product,
        ),
      )
    } else {
      const newProduct: Product = {
        id: `PRD${String(products.length + 1).padStart(3, "0")}`,
        ...formData,
        preco: formData.preco ? Number.parseFloat(formData.preco) : undefined,
        quantidade: formData.quantidade ? Number.parseInt(formData.quantidade) : undefined,
        dataCadastro: new Date().toISOString().split("T")[0],
      }
      setProducts([...products, newProduct])
    }

    resetForm()
    setIsDialogOpen(false)
  }

  const resetForm = () => {
    setFormData({
      tipo: activeTab as "estoque" | "maquina",
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
    })
    setEditingProduct(null)
  }

  const handleEditProduct = (product: Product) => {
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
  }

  const togglePasswordVisibility = (productId: string) => {
    setShowPassword((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Produtos e Máquinas</h1>
          <p className="text-muted-foreground">Gerencie seu estoque e equipamentos de clientes</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                resetForm()
                setFormData({ ...formData, tipo: activeTab as "estoque" | "maquina" })
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              {activeTab === "estoque" ? "Novo Produto" : "Nova Máquina"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Editar" : "Cadastrar"} {formData.tipo === "estoque" ? "Produto" : "Máquina"}
              </DialogTitle>
              <DialogDescription>
                Preencha as informações{" "}
                {formData.tipo === "estoque" ? "do produto de estoque" : "da máquina do cliente"}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="nome">{formData.tipo === "estoque" ? "Nome do Produto" : "Tipo de Equipamento"}</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder={formData.tipo === "estoque" ? 'Ex: Tela LCD 15.6"' : "Ex: Notebook, Smartphone, TV"}
                />
              </div>

              {formData.tipo === "estoque" ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      placeholder="Código do produto"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preco">Preço (R$)</Label>
                    <Input
                      id="preco"
                      type="number"
                      step="0.01"
                      value={formData.preco}
                      onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                      placeholder="0,00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantidade">Quantidade</Label>
                    <Input
                      id="quantidade"
                      type="number"
                      value={formData.quantidade}
                      onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="marca">Marca</Label>
                    <Input
                      id="marca"
                      value={formData.marca}
                      onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                      placeholder="Ex: Dell, Apple, Samsung"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="modelo">Modelo</Label>
                    <Input
                      id="modelo"
                      value={formData.modelo}
                      onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                      placeholder="Ex: Inspiron 15, iPhone 12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numeroSerie">Número de Série</Label>
                    <Input
                      id="numeroSerie"
                      value={formData.numeroSerie}
                      onChange={(e) => setFormData({ ...formData, numeroSerie: e.target.value })}
                      placeholder="Número de série do equipamento"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estadoEntrada">Estado na Entrada</Label>
                    <Input
                      id="estadoEntrada"
                      value={formData.estadoEntrada}
                      onChange={(e) => setFormData({ ...formData, estadoEntrada: e.target.value })}
                      placeholder="Ex: Funcionando, Com defeito, Não liga"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="acessorios">Acessórios Entregues</Label>
                    <Input
                      id="acessorios"
                      value={formData.acessorios}
                      onChange={(e) => setFormData({ ...formData, acessorios: e.target.value })}
                      placeholder="Ex: Carregador, mouse, cabo USB"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="senha">Senha do Aparelho</Label>
                    <Input
                      id="senha"
                      type="password"
                      value={formData.senha}
                      onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                      placeholder="Senha para acesso ao equipamento"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2 col-span-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Informações adicionais"
                  rows={3}
                />
              </div>

              {formData.tipo === "maquina" && (
                <div className="space-y-2 col-span-2">
                  <Label>Fotos do Equipamento</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">Clique para fazer upload das fotos</p>
                    <p className="text-xs text-gray-500">PNG, JPG até 5MB cada</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveProduct}>{editingProduct ? "Salvar Alterações" : "Cadastrar"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="estoque">Produtos de Estoque</TabsTrigger>
          <TabsTrigger value="maquina">Máquinas de Clientes</TabsTrigger>
        </TabsList>

        {/* Filtros e Busca */}
        <Card className="mt-4">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder={`Buscar ${activeTab === "estoque" ? "produtos" : "máquinas"}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button variant="outline">
                <Search className="w-4 h-4 mr-2" />
                Buscar
              </Button>
            </div>
          </CardContent>
        </Card>

        <TabsContent value="estoque">
          <Card>
            <CardHeader>
              <CardTitle>Produtos em Estoque ({filteredProducts.length})</CardTitle>
              <CardDescription>Controle seu estoque de peças e produtos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Package className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{product.nome}</h3>
                          <Badge variant="outline">SKU: {product.sku}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span>Preço: R$ {product.preco?.toFixed(2)}</span>
                          <span>Estoque: {product.quantidade} unidades</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 bg-transparent">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maquina">
          <Card>
            <CardHeader>
              <CardTitle>Máquinas de Clientes ({filteredProducts.length})</CardTitle>
              <CardDescription>Equipamentos recebidos para manutenção</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Monitor className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{product.nome}</h3>
                          <Badge variant="outline">
                            {product.marca} {product.modelo}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span>S/N: {product.numeroSerie}</span>
                          <span>Estado: {product.estadoEntrada}</span>
                          {product.senha && (
                            <span className="flex items-center gap-1">
                              Senha: {showPassword[product.id] ? product.senha : "••••••"}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => togglePasswordVisibility(product.id)}
                                className="h-auto p-0 ml-1"
                              >
                                {showPassword[product.id] ? (
                                  <EyeOff className="w-3 h-3" />
                                ) : (
                                  <Eye className="w-3 h-3" />
                                )}
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
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 bg-transparent">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export { ProductManagement }
