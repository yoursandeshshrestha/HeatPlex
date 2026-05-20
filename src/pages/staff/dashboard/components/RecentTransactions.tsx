import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {  Search, Plus } from 'lucide-react'

interface Transaction {
  id: string
  customer: string
  email: string
  amount: string
  status: 'completed' | 'pending' | 'failed'
  date: string
  time: string
}

const transactions: Transaction[] = [
  {
    id: 'TXN-001',
    customer: 'John Doe',
    email: 'john@example.com',
    amount: '$250.00',
    status: 'completed',
    date: 'Nov 10, 2024',
    time: '10:30 AM',
  },
  {
    id: 'TXN-002',
    customer: 'Jane Smith',
    email: 'jane@example.com',
    amount: '$150.00',
    status: 'pending',
    date: 'Nov 10, 2024',
    time: '09:15 AM',
  },
  {
    id: 'TXN-003',
    customer: 'Bob Johnson',
    email: 'bob@example.com',
    amount: '$350.00',
    status: 'completed',
    date: 'Nov 9, 2024',
    time: '04:45 PM',
  },
  {
    id: 'TXN-004',
    customer: 'Alice Williams',
    email: 'alice@example.com',
    amount: '$450.00',
    status: 'failed',
    date: 'Nov 9, 2024',
    time: '02:20 PM',
  },
  {
    id: 'TXN-005',
    customer: 'Charlie Brown',
    email: 'charlie@example.com',
    amount: '$200.00',
    status: 'completed',
    date: 'Nov 8, 2024',
    time: '11:00 AM',
  },
]

const statusStyles = {
  completed: 'bg-emerald-500/10 text-emerald-400 backdrop-blur-sm hover:bg-emerald-500/15',
  pending: 'bg-amber-500/10 text-amber-400 backdrop-blur-sm hover:bg-amber-500/15',
  failed: 'bg-red-500/10 text-red-400 backdrop-blur-sm hover:bg-red-500/15',
}

export function RecentTransactions() {
  return (
    <Card>
      <div className="flex items-center justify-between border-b p-4">
        <div className="text-sm font-medium">
          Recent Transactions
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search transactions..."
              className="h-9 w-[200px] cursor-text rounded-md pl-8 text-sm"
            />
          </div>
          <Button variant="outline" size="sm" className="h-9 cursor-pointer">
            <Plus className="mr-1.5 size-4" />
            Add Transaction
          </Button>
        </div>
      </div>
      <div className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b hover:bg-transparent">
              <TableHead className="px-6 font-semibold">Transaction ID</TableHead>
              <TableHead className="font-semibold">Customer</TableHead>
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">Amount</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="px-6 font-semibold">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id} className="cursor-pointer border-b transition-colors hover:bg-muted/50">
                <TableCell className="px-6 py-4 font-medium">{transaction.id}</TableCell>
                <TableCell className="py-4">{transaction.customer}</TableCell>
                <TableCell className="py-4 text-muted-foreground">
                  {transaction.email}
                </TableCell>
                <TableCell className="py-4 font-semibold">{transaction.amount}</TableCell>
                <TableCell className="py-4">
                  <Badge variant="secondary" className={statusStyles[transaction.status]}>
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="py-4 text-muted-foreground">
                  {transaction.date}
                </TableCell>
                <TableCell className="px-6 py-4 text-muted-foreground">
                  {transaction.time}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
