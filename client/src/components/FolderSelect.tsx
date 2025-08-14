import { useId, useState } from "react";
import { CheckIcon, ChevronDownIcon, PlusIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { trpc } from "@/trpc";


const { data: folders } = trpc.getAllFolders.useQuery();

export default function FolderSelect() {
  const id = useId();
  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = useState<string | null>(null);

  return (
    <div className="*:not-first:mt-2">
      <Label htmlFor={id}>select folder</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="bg-background hover:bg-background border-input w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px]"
          >
            <span className={cn("truncate", !value && "text-muted-foreground")}>
              {value
                ? folders?.find(
                    (folder) => folder.id === value
                  )?.name
                : "select folder"}
            </span>
            <ChevronDownIcon
              size={16}
              className="text-muted-foreground/80 shrink-0"
              aria-hidden="true"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="border-input w-full min-w-[var(--radix-popper-anchor-width)] p-0"
          align="start"
        >
          <Command>
            <CommandInput placeholder="select folder" />
            <CommandList>
              <CommandEmpty>No folders found.</CommandEmpty>
              <CommandGroup>
                {folders && folders.map((folder) => (
                  <CommandItem
                    key={folder.id}
                    value={folder.id}
                    onSelect={(v) => {
                      setValue(v === value ? null : v );
                      setOpen(false);
                    }}
                  >
                    {folder.name}
                    {value && value === folder.id && (
                      <CheckIcon size={16} className="ml-auto" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <Button
                  variant="ghost"
                  className="w-full justify-start font-normal"
                >
                  <PlusIcon
                    size={16}
                    className="-ms-2 opacity-60"
                    aria-hidden="true"
                  />
                  new folder
                </Button>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
