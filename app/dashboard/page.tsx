import Link from "next/link"
import { Header } from "@/components/header"
import { NewCustomerModal } from "@/components/new-customer-modal"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

const mockCustomers = [
  {
    id: "acme-corp",
    name: "Acme Corp",
    files: 4,
    analyses: 2,
    lastActivity: "2 days ago",
  },
  {
    id: "techstart-inc",
    name: "TechStart Inc",
    files: 2,
    analyses: 1,
    lastActivity: "1 week ago",
  },
  {
    id: "cloudscale-systems",
    name: "CloudScale Systems",
    files: 6,
    analyses: 3,
    lastActivity: "3 days ago",
  },
]

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-3xl font-bold">My Customers</h1>
            <NewCustomerModal />
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input placeholder="Search customers..." className="pl-10" />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockCustomers.map((customer) => (
              <Link key={customer.id} href={`/customer/${customer.id}`}>
                <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold mb-2">{customer.name}</h3>
                    <p className="text-sm text-muted-foreground mb-1">
                      {customer.files} files · {customer.analyses} analyses
                    </p>
                    <p className="text-sm text-muted-foreground">Last activity: {customer.lastActivity}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
