'use client'

import { useState } from "react"
import { signOut } from "next-auth/react"
import { User, Settings, LogOut, Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface UserNavProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  } | null
}

export function UserNav({ user }: UserNavProps) {
  const { setTheme, theme } = useTheme()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await signOut({ callbackUrl: '/auth/signin' })
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <Card className="p-4 glass-effect">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-muted animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
          </div>
        </div>
      </Card>
    )
  }

  const userInitials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email?.[0]?.toUpperCase() || 'U'

  const themeIcons = {
    light: Sun,
    dark: Moon,
    system: Monitor,
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full p-0 h-auto hover:bg-transparent focus-visible:ring-0"
        >
          <Card className="w-full p-4 glass-effect hover-lift-gentle cursor-pointer transition-all-smooth">
            <div className="flex items-center gap-3">
              <Avatar className="size-10 border-2 border-primary/20">
                <AvatarImage 
                  src={user.image || undefined} 
                  alt={user.name || 'Usuário'} 
                />
                <AvatarFallback className="gradient-primary text-white font-semibold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-left min-w-0">
                <p className="font-medium text-sm truncate">
                  {user.name || 'Usuário'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </Card>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        className="w-64 shadow-modern-xl animate-scale-in" 
        align="end" 
        side="top"
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.name || 'Usuário'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="gap-2 cursor-pointer">
          <User className="size-4" />
          Perfil
        </DropdownMenuItem>
        
        <DropdownMenuItem className="gap-2 cursor-pointer">
          <Settings className="size-4" />
          Configurações
        </DropdownMenuItem>
        
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2">
            {theme && themeIcons[theme as keyof typeof themeIcons] && (
              React.createElement(themeIcons[theme as keyof typeof themeIcons], {
                className: "size-4"
              })
            )}
            Tema
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="shadow-modern-xl">
            <DropdownMenuItem 
              onClick={() => setTheme("light")}
              className="gap-2 cursor-pointer"
            >
              <Sun className="size-4" />
              Claro
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setTheme("dark")}
              className="gap-2 cursor-pointer"
            >
              <Moon className="size-4" />
              Escuro
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setTheme("system")}
              className="gap-2 cursor-pointer"
            >
              <Monitor className="size-4" />
              Sistema
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          className="gap-2 cursor-pointer text-destructive focus:text-destructive" 
          onClick={handleSignOut}
          disabled={isLoading}
        >
          <LogOut className="size-4" />
          {isLoading ? 'Saindo...' : 'Sair'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}