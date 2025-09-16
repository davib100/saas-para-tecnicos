'use client'

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useDebounce } from "@/hooks/use-debounce"

interface Customer {
  id: string
  name: string
  document: string
}

interface CustomerComboboxProps {
  value: string
  onChange: (value: string) => void
  onClientSelected: (client: Customer | null) => void;
}

export function CustomerCombobox({ value, onChange, onClientSelected }: CustomerComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [items, setItems] = React.useState<Customer[]>([])
  const [isLoading, setIsLoading] = React.useState(false)

  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  React.useEffect(() => {
    if (debouncedSearchTerm) {
      setIsLoading(true)
      fetch(`/api/customers/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: debouncedSearchTerm }),
      })
        .then((res) => res.json())
        .then((data) => {
          setItems(data.data || [])
        })
        .finally(() => setIsLoading(false))
    } else {
      setItems([])
    }
  }, [debouncedSearchTerm])

  const selectedItem = items.find((item) => item.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-11"
        >
          {value && selectedItem ? `${selectedItem.name} - ${selectedItem.document}` : "Selecione ou busque um cliente..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Buscar cliente por nome ou documento..." 
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandEmpty>{isLoading ? "Buscando..." : "Nenhum cliente encontrado."}</CommandEmpty>
          <CommandGroup>
            {items.map((item) => (
              <CommandItem
                key={item.id}
                value={item.id}
                onSelect={(currentValue) => {
                  const selected = items.find(i => i.id === currentValue);
                  onChange(currentValue === value ? "" : currentValue)
                  onClientSelected(selected || null);
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === item.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {item.name} - {item.document}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
