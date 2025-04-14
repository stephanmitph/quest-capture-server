import Link from "next/link"
import { ChevronRight } from "lucide-react"

export interface BreadcrumbItem {
  label: string
  href: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex text-sm text-gray-500 mb-1">
      {items.map((item, index) => (
        <div key={item.href} className="flex items-center">
          {index > 0 && <ChevronRight className="h-3 w-3 mx-1" />}
          <Link href={item.href} className="hover:text-gray-700 hover:underline transition-colors">
            {item.label}
          </Link>
        </div>
      ))}
    </nav>
  )
}

