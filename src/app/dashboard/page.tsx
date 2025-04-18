import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Request New Loan
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+ New</div>
          <p className="text-xs text-muted-foreground">
            Submit a new loan request
          </p>
          <Button asChild className="mt-4">
            <Link href="/create-loan">
              Request Loan
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 