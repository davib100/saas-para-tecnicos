'use client'

import { useState, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Edit, Trash2, Package, Monitor, Eye, EyeOff, Loader2, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react"
import { toast } from "sonner"
import { useDebounce } from "@/lib/hooks/use-debounce"
import { Skeleton } from "@/components/ui/skeleton"

// Interfaces alinhadas com o schema.prisma
interface Product {
  id: string
  tipo: "estoque" | "maquina"
  nome: string
  sku: string | null
  preco: number | null
  quantidade: number | null
  marca: string | null
  modelo: string | null
  numeroSerie: string | null
  estadoEntrada: string | null
  acessorios: string | null
  senha: string | null
  observacoes: string | null
  createdAt: string
  updatedAt: string
  companyId: string
}

// FormData pode usar strings para facilitar a manipulação nos inputs
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
  nome: "", sku: "", preco: "", quantidade: "", marca: "", modelo: "",
  numeroSerie: "", estadoEntrada: "", acessorios: "", senha: "", observacoes: "",
}

const EmptyState = ({ type }: { type: string }) => (
    <div className="text-center text-muted-foreground p-10 border-2 border-dashed rounded-lg mt-4">
        { type === 'estoque' ? 
            <Package className="mx-auto h-12 w-12" /> : 
            <Monitor className="mx-auto h-12 w-12" />
        }
        <h3 className="mt-4 text-lg font-semibold">
            {type === 'estoque' ? "Nenhum Produto em Estoque" : "Nenhuma Máquina Cadastrada"}
        </h3>
        <p className="mt-2 text-sm">
            {`Clique em "${type === 'estoque' ? 'Novo Produto' : 'Nova Máquina'}" para começar.`}
        </p>
    </div>
);

const ProductRowSkeleton = () => (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <Skeleton className="h-8 w-8 rounded-sm" />
        <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-8" />
      </div>
    </div>
  );

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [activeTab, setActiveTab] = useState<"estoque" | "maquina">("estoque")
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({})
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const fetchProducts = useCallback(async (currentPage: number, search: string, type: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/products?page=${currentPage}&pageSize=10&search=${search}&type=${type}`);
      if (!response.ok) throw new Error("Falha ao buscar produtos");
      const data = await response.json();
      setProducts(data.products || []);
      setTotalPages(data.totalPages || 1);
      setTotalProducts(data.totalProducts || 0);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar produtos do servidor.");
      setProducts([]);
      setTotalPages(1);
      setTotalProducts(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    fetchProducts(1, debouncedSearchTerm, activeTab);
  }, [debouncedSearchTerm, activeTab, fetchProducts]);

  useEffect(() => {
    fetchProducts(page, debouncedSearchTerm, activeTab);
  }, [page, fetchProducts]);

  const validateForm = useCallback(() => { 
    if (!formData.nome.trim()) {
        toast.error("O nome do produto é obrigatório.");
        return false;
    }
    return true; 
  }, [formData]);

  const handleSaveProduct = useCallback(async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    const isEditing = !!editingProduct;
    const url = isEditing ? `/api/products/${editingProduct.id}` : "/api/products";
    const method = isEditing ? "PUT" : "POST";

    const productData = {
        ...formData,
        preco: formData.preco ? parseFloat(formData.preco) : null,
        quantidade: formData.quantidade ? parseInt(formData.quantidade, 10) : null,
        sku: formData.sku || null,
        marca: formData.marca || null,
        modelo: formData.modelo || null,
        numeroSerie: formData.numeroSerie || null,
        estadoEntrada: formData.estadoEntrada || null,
        acessorios: formData.acessorios || null,
        senha: formData.senha || null,
        observacoes: formData.observacoes || null,
    };

    try {
        const response = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(productData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Falha ao ${isEditing ? 'atualizar' : 'criar'} produto`);
        }

        toast.success(`Produto ${isEditing ? 'atualizado' : 'criado'} com sucesso`);
        fetchProducts(1, '', activeTab); 
        setPage(1);
        setSearchTerm('');
        setIsDialogOpen(false);

    } catch (error: any) {
        console.error(error);
        toast.error(error.message);
    } finally {
        setIsSaving(false);
    }
  }, [editingProduct, formData, validateForm, fetchProducts, activeTab]);

  const resetForm = useCallback(() => {
    setFormData({ ...initialFormData, tipo: activeTab })
    setEditingProduct(null)
  }, [activeTab]);

  const handleEditProduct = useCallback((product: Product) => {
    setEditingProduct(product);
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
    });
    setIsDialogOpen(true);
  }, []);
  
  const handleDeleteProduct = useCallback(async (productId: string) => {
    if (!confirm("Tem certeza que deseja remover este produto?")) return;
    
    try {
        const response = await fetch(`/api/products/${productId}`, { method: "DELETE" });
        if (response.status !== 204) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Falha ao remover produto");
        }
        toast.success("Produto removido com sucesso");
        fetchProducts(page, debouncedSearchTerm, activeTab);
    } catch (error: any) {
        console.error(error);
        toast.error(error.message);
    }
  }, [fetchProducts, page, debouncedSearchTerm, activeTab]);

  const togglePasswordVisibility = useCallback((productId: string) => {
    setShowPassword(prev => ({ ...prev, [productId]: !prev[productId] }))
  }, []);

  const handleInputChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, []);

  const handleNewProductClick = useCallback(() => {
    resetForm();
    setIsDialogOpen(true);
  }, [resetForm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }

  const renderProductList = (type: "estoque" | "maquina") => (
    <Card>
        <CardHeader>
            <CardTitle>{type === 'estoque' ? 'Produtos em Estoque' : 'Máquinas de Clientes'} ({totalProducts})</CardTitle>
            <CardDescription>Gerencie e visualize os produtos.</CardDescription>
        </CardHeader>
        <CardContent>
        {isLoading ? (
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => <ProductRowSkeleton key={i} />)}
            </div>
        ) : products.length > 0 ? (
            <div className="divide-y">
                {products.map(product => (
                    <div key={product.id} className="flex items-center justify-between p-4 hover:bg-muted/50">
                        <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{product.nome}</div>
                            <div className="text-sm text-muted-foreground">SKU: {product.sku || 'N/A'} | Marca: {product.marca || 'N/A'}</div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                            <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)}><Edit className="w-4 h-4" /></Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteProduct(product.id)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                    </div>
                ))}
            </div>
          ) : (
            <EmptyState type={type} />
          )}
        </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Produtos e Máquinas</h1>
          <p className="text-muted-foreground">Gerencie seu estoque e equipamentos de clientes</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
            if (!isOpen) setEditingProduct(null);
            setIsDialogOpen(isOpen);
        }}>
            <DialogTrigger asChild>
                <Button onClick={handleNewProductClick}>
                    <Plus className="w-4 h-4 mr-2" />
                    {activeTab === "estoque" ? "Novo Produto" : "Nova Máquina"}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{editingProduct ? 'Editar' : (formData.tipo === 'estoque' ? 'Novo Produto' : 'Nova Máquina')}</DialogTitle>
                    <DialogDescription>
                        Preencha os detalhes abaixo.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                   {/* Form fields here, using formData and handleInputChange */}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleSaveProduct} disabled={isSaving}>
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Input
              placeholder="Buscar por nome, SKU, marca ou modelo..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "estoque" | "maquina")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="estoque">Produtos de Estoque</TabsTrigger>
          <TabsTrigger value="maquina">Máquinas de Clientes</TabsTrigger>
        </TabsList>
        <TabsContent value="estoque">
            {renderProductList("estoque")}
        </TabsContent>
        <TabsContent value="maquina">
            {renderProductList("maquina")}
        </TabsContent>
      </Tabs>

      {totalPages > 1 && (
         <div className="flex items-center justify-center space-x-2 mt-6">
            <Button variant="outline" size="sm" onClick={() => setPage(1)} disabled={page === 1}><ChevronsLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft className="h-4 w-4" /></Button>
            <span className="text-sm font-medium">Página {page} de {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => setPage(totalPages)} disabled={page === totalPages}><ChevronsRight className="h-4 w-4" /></Button>
        </div>
      )}
    </div>
  )
}
