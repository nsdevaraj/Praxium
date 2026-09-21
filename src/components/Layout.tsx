import type { ReactNode } from "react"
import { Link, NavLink } from "react-router-dom"
import { Logo } from "./Logo"
import { useApp } from "../store"

export function PaperShell({ children }: { children: ReactNode }) {
  const user = useApp((s) => s.user)
  const signOut = useApp((s) => s.signOut)
  return (
    <div className="paper-grain min-h-screen text-ink">
      <header className="sticky top-0 z-20 border-b border-ink/8 bg-paper/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link to="/" className="shrink-0">
            <Logo />
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <NavLink to="/catalog" className={({ isActive }) => navCls(isActive)}>
              Catalog
            </NavLink>
            <NavLink to="/join" className={({ isActive }) => navCls(isActive)}>
              Join a room
            </NavLink>
            {user ? (
              <button onClick={signOut} className="ml-2 rounded-full px-3 py-1.5 text-mist hover:text-ink">
                {user.name}
              </button>
            ) : null}
          </nav>
        </div>
      </header>
      {children}
      <footer className="border-t border-ink/10 px-5 py-10 text-sm text-ink/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Logo className="h-6 opacity-70" />
          <p>Built for classrooms and academies that already run Capsim, Markstrat, Cesim, and Forio.</p>
        </div>
      </footer>
    </div>
  )
}

function navCls(active: boolean) {
  return `rounded-full px-3 py-1.5 ${active ? "bg-ink text-paper" : "text-ink/70 hover:text-ink"}`
}

export function InkShell({ children, bar }: { children: ReactNode; bar: ReactNode }) {
  return (
    <div className="ink-grain min-h-screen text-snow">
      <header className="sticky top-0 z-20 border-b border-line bg-ink/85 backdrop-blur">
        {bar}
      </header>
      {children}
    </div>
  )
}
