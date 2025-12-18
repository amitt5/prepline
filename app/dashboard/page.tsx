import { auth } from '@clerk/nextjs/server'
import { Header } from "@/components/header"
import { NewCustomerModal } from "@/components/new-customer-modal"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import Link from "next/link"
import { supabaseAdmin } from "@/lib/supabase/client"

export default async function DashboardPage() {
  const { userId } = await auth()
  
  if (!userId) {
    return null
  }

  const { data: customers, error } = await supabaseAdmin
    .from("customers")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  // Format customers for display
  const formattedCustomers =
    customers?.map((customer) => ({
      id: customer.id,
      name: customer.name,
      files: 0,
      analyses: 0,
      lastActivity: customer.updated_at
        ? new Date(customer.updated_at as string).toLocaleDateString()
        : new Date(customer.created_at as string).toLocaleDateString(),
    })) || []

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

          {error && (
            <p className="text-sm text-red-500">
              Failed to load customers. Please try again.
            </p>
          )}

          {formattedCustomers.length === 0 && !error ? (
            <Card>
              <CardContent className="py-8 flex flex-col items-center justify-center gap-2">
                <p className="text-sm text-muted-foreground">You don&apos;t have any customers yet.</p>
                <p className="text-sm text-muted-foreground">Click &quot;New Customer&quot; to create your first one.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {formattedCustomers.map((customer) => (
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
          )}
        </div>
      </main>
    </div>
  )
}