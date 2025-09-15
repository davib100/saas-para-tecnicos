'use client'

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

// Dados de ilustração removidos

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([])
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
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.modelo?.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const handleSaveProduct = () => {
    if (editingProduct) {
      setProducts(
        products.map((p) =>
          p.id === editingProduct.id
            ? { 
                ...p, 
                ...formData, 
                preco: formData.preco ? parseFloat(formData.preco) : undefined, 
                quantidade: formData.quantidade ? parseInt(formData.quantidade, 10) : undefined 
            }
            : p,
        ),
      )
    } else {
      const newProduct: Product = {
        id: `PRD${Date.now()}`,
        ...formData,
        preco: formData.preco ? parseFloat(formData.preco) : undefined,
        quantidade: formData.quantidade ? parseInt(formData.quantidade, 10) : undefined,
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
      nome: "", sku: "", preco: "", quantidade: "", marca: "", modelo: "",
      numeroSerie: "", estadoEntrada: "", acessorios: "", senha: "", observacoes: "",
    })
    setEditingProduct(null)
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      tipo: product.tipo, nome: product.nome, sku: product.sku || "",
      preco: product.preco?.toString() || "", quantidade: product.quantidade?.toString() || "",
      marca: product.marca || "", modelo: product.modelo || "", numeroSerie: product.numeroSerie || "",
      estadoEntrada: product.estadoEntrada || "", acessorios: product.acessorios || "",
      senha: product.senha || "", observacoes: product.observacoes || "",
    })
    setIsDialogOpen(true)
  }
  
  const handleDeleteProduct = (productId: string) => {
    setProducts(products.filter(p => p.id !== productId));
  }

  const togglePasswordVisibility = (productId: string) => {
    setShowPassword((prev) => ({ ...prev, [productId]: !prev[productId] }))
  }

  const EmptyState = ({ type }: { type: string }) => (
    <div className="text-center text-muted-foreground p-10 border-2 border-dashed rounded-lg mt-4">
        {type === 'estoque' ? <Package className="mx-auto h-12 w-12" /> : <Monitor className="mx-auto h-12 w-12" />}
        <h3 className="mt-4 text-lg font-semibold">
            {type === 'estoque' ? "Nenhum Produto em Estoque" : "Nenhuma Máquina Cadastrada"}
        </h3>
        <p className="mt-2 text-sm">
            Clique em "{type === 'estoque' ? 'Novo Produto' : 'Nova Máquina'}" para começar.
        </p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Produtos e Máquinas</h1>
          <p className="text-muted-foreground">Gerencie seu estoque e equipamentos de clientes</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setFormData({ ...formData, tipo: activeTab as "estoque" | "maquina" }); }}>
              <Plus className="w-4 h-4 mr-2" />
              {activeTab === "estoque" ? "Novo Produto" : "Nova Máquina"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
             {/* O conteúdo do formulário permanece o mesmo */}
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
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
                  disabled={products.filter(p => p.tipo === activeTab).length === 0}
                />
              </div>
              <Button variant="outline" disabled={products.filter(p => p.tipo === activeTab).length === 0}>
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
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"><Package className="w-5 h-5 text-blue-600" /></div>
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
                        <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)}><Edit className="w-4 h-4" /></Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteProduct(product.id)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                    </div>
                    ))}
                </div>
                </CardContent>
            </Card>
          ) : <EmptyState type="estoque" />}
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
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center"><Monitor className="w-5 h-5 text-purple-600" /></div>
                        <div className="flex-1">
                            <h3 className="font-medium">{product.nome}</h3>
                            <div className="flex items-center gap-2 flex-wrap text-sm text-muted-foreground mt-1">
                            <Badge variant="outline">{product.marca} {product.modelo}</Badge>
                            <span>S/N: {product.numeroSerie || 'N/A'}</span>
                            <span>Estado: {product.estadoEntrada || 'N/A'}</span>
                            {product.senha && (
                                <span className="flex items-center gap-1">
                                Senha: {showPassword[product.id] ? product.senha : "••••••"}
                                <Button variant="ghost" size="icon" onClick={() => togglePasswordVisibility(product.id)} className="h-auto p-0 ml-1">
                                    {showPassword[product.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </Button>
                                </span>
                            )}
                            </div>
                        </div>
                        </div>
                        <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)}><Edit className="w-4 h-4" /></Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteProduct(product.id)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                    </div>
                    ))}
                </div>
                </CardContent>
            </Card>
          ) : <EmptyState type="maquina" />}
        </TabsContent>
      </Tabs>
    </div>
  )
}
