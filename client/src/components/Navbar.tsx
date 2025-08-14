import { useId } from "react"
import {
  MailIcon,
  SearchIcon,
} from "lucide-react"
import UserMenu from "@/components/navbar-components/user-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"


export default function NavBar() {
  const id = useId()

  return (
    <header className="border-b px-4 md:px-6">
      <div className="flex h-16 items-center justify-between gap-4">
        {/* Left side */}
        <div className="flex flex-1 items-center gap-2">
          <div className="flex items-center gap-6">
            <div className="relative ml-50">
              <Input
                id={id}
                className="peer h-8 ps-8 pe-2 w-lg"
                placeholder="Search files...."
                type="search"
              />
              <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-2 peer-disabled:opacity-50">
                <SearchIcon size={16} />
              </div>
            </div>
        </div>
          </div>
        {/* Right side */}
        <div className="flex flex-1 items-center justify-end gap-4">
          <div className="flex items-center gap-2">
            {/* Messages */}
            <Button
              size="icon"
              variant="ghost"
              className="text-muted-foreground relative size-8 rounded-full shadow-none"
              aria-label="Open notifications"
            >
              <MailIcon size={16} aria-hidden="true" />
              <div
                aria-hidden="true"
                className="bg-primary absolute top-0.5 right-0.5 size-1 rounded-full"
              />
            </Button>
            {/* Notification menu */}
          </div>
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
