'use client'

import { signOut } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LogOut, User as UserIcon, HelpCircle } from "lucide-react"

// Supondo que você tenha um hook para obter o usuário atual.
// Se não, você precisará passar os dados do usuário como props.
interface User {
  name?: string | null
  email?: string | null
  image?: string | null
}

interface UserNavProps {
  user: User | null
}

function getInitials(name: string): string {
  const names = name.split(' ');
  if (names.length === 0) return 'U';
  const firstInitial = names[0][0] || '';
  const lastInitial = names.length > 1 ? names[names.length - 1][0] || '' : '';
  return (firstInitial + lastInitial).toUpperCase();
}

export function UserNav({ user }: UserNavProps) {
  if (!user) {
    return null; // Ou um botão de login
  }

  const userName = user.name || "Usuário";
  const userEmail = user.email || "";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-full justify-start px-2">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src={user.image || undefined} alt={`@${userName}`} />
            <AvatarFallback>{getInitials(userName)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start space-y-1 truncate">
             <p className="text-sm font-medium leading-none truncate">{userName}</p>
             <p className="text-xs leading-none text-muted-foreground truncate">{userEmail}</p>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userEmail}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Meu Perfil</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
             <HelpCircle className="mr-2 h-4 w-4" />
            <span>Ajuda & Suporte</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/login' })}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
