import { useState } from 'react'
import { sidebarConfig } from '@/config/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

interface SidebarProps {
  isCollapsed?: boolean
}

export function Sidebar({ isCollapsed = false }: SidebarProps) {
  const [activeItem, setActiveItem] = useState('/admin')

  return (
    <aside className={`flex h-screen flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Logo/Header */}
      <div className="flex flex-col gap-2 p-2 pb-0">
        <div className={`flex h-14 w-full items-center rounded-lg px-2 ${
          isCollapsed ? 'justify-center' : 'justify-start'
        }`}>
          {/* Logo Image */}
          <img
            src="/D.png"
            alt="Logo"
            className={`object-contain transition-all ${
              isCollapsed ? 'h-10 max-w-[80%]' : 'h-12 max-w-full'
            }`}
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex flex-col gap-2 py-2">
          {sidebarConfig.map((group, groupIndex) => (
            <div key={groupIndex}>
              {!isCollapsed && (
                <div className="px-3 py-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                    {group.label}
                  </span>
                </div>
              )}
              <div className="space-y-0.5 px-2">
                {group.items.map((item) => {
                  const hasChildren = item.children && item.children.length > 0
                  const isActive = item.href ? activeItem === item.href : false

                  if (hasChildren && !isCollapsed) {
                    return (
                      <Collapsible key={item.title}>
                        <CollapsibleTrigger className="group flex h-8 w-full cursor-pointer items-center gap-2 overflow-hidden rounded-md p-1.5 pl-2 text-left text-[13px] font-[450] text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent/30">
                          {item.icon}
                          <span className="flex-1 truncate transition-[letter-spacing] duration-150 group-hover:tracking-wide">
                            {item.title}
                          </span>
                          {item.badge && (
                            <span className="inline-flex min-w-[20px] items-center justify-center rounded-full bg-red-500 px-2 py-0.5 text-xs font-medium text-white">
                              {item.badge}
                            </span>
                          )}
                          <svg
                            className="size-4 shrink-0 transition-transform group-data-[state=open]:rotate-90"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="ml-4 mt-0.5 space-y-0.5 border-l border-border pl-2">
                            {item.children?.map((child) => {
                              const isChildActive = child.href ? activeItem === child.href : false
                              return (
                                <button
                                  key={child.href}
                                  onClick={() => child.href && setActiveItem(child.href)}
                                  className={`group flex h-8 w-full cursor-pointer items-center gap-2 overflow-hidden rounded-md p-1.5 pl-2 text-left text-[13px] transition-colors ${
                                    isChildActive
                                      ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
                                      : 'font-[450] text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                                  }`}
                                >
                                  {child.icon}
                                  <span className="flex-1 truncate transition-[letter-spacing] duration-150 group-hover:tracking-wide">
                                    {child.title}
                                  </span>
                                  {child.badge && (
                                    <span className="inline-flex min-w-[20px] items-center justify-center rounded-full bg-red-500 px-2 py-0.5 text-xs font-medium text-white">
                                      {child.badge}
                                    </span>
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    )
                  }

                  return (
                    <button
                      key={item.href}
                      onClick={() => item.href && setActiveItem(item.href)}
                      className={`group flex h-8 w-full cursor-pointer items-center overflow-hidden rounded-md p-1.5 text-left text-[13px] transition-colors ${
                        isCollapsed ? 'justify-center px-2' : 'gap-2 pl-2'
                      } ${
                        isActive
                          ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
                          : 'font-[450] text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                      }`}
                    >
                      <div className="relative shrink-0">
                        {item.icon}
                        {isCollapsed && item.badge && (
                          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {!isCollapsed && (
                        <>
                          <span className="flex-1 truncate transition-[letter-spacing] duration-150 group-hover:tracking-wide">
                            {item.title}
                          </span>
                          {item.badge && (
                            <span className="inline-flex min-w-[20px] items-center justify-center rounded-full bg-red-500 px-2 py-0.5 text-xs font-medium text-white">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer - User Profile */}
      <div className="mt-auto shrink-0 border-t border-border bg-sidebar-accent/30">
        <DropdownMenu>
          <DropdownMenuTrigger className={`w-full cursor-pointer p-3 transition-colors hover:bg-sidebar-accent/50 focus:outline-none ${
            isCollapsed ? 'flex justify-center' : ''
          }`}>
            <div className={`flex items-center ${isCollapsed ? '' : 'gap-3'}`}>
              <Avatar className={isCollapsed ? 'h-8 w-8' : 'h-10 w-10'}>
                <AvatarImage src="/developer.jpeg" alt="User" />
                <AvatarFallback>SS</AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <>
                  <div className="flex min-w-0 max-w-[140px] flex-1 flex-col items-start">
                    <span className="w-full truncate text-left text-sm font-medium text-sidebar-foreground/90">
                      Miles
                    </span>
                    <span className="w-full truncate text-left text-xs text-sidebar-foreground/50">
                      Operations Manager
                    </span>
                  </div>
                  <svg
                    className="size-4 text-sidebar-foreground/50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                    />
                  </svg>
                </>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <svg
                className="mr-2 size-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <svg
                className="mr-2 size-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
              <svg
                className="mr-2 size-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}
