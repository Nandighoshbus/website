"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  History
} from "lucide-react"
import { THEME_CLASSES } from "@/lib/theme"

interface CreditBalance {
  creditBalance: number
  totalCreditsReceived: number
  totalCreditsUsed: number
  creditLimit: number
  availableCredit: number
}

interface CreditTransaction {
  id: string
  transaction_type: 'credit' | 'debit' | 'refund' | 'adjustment'
  amount: number
  balance_before: number
  balance_after: number
  reference_number: string
  description: string
  created_at: string
  booking_id?: string
}

export default function CreditManagement() {
  const [creditBalance, setCreditBalance] = useState<CreditBalance | null>(null)
  const [transactions, setTransactions] = useState<CreditTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchCreditData()
  }, [])

  const fetchCreditData = async () => {
    try {
      const { jwtAuth } = await import('@/lib/jwtAuth')
      
      // Fetch credit balance
      const balanceData = await jwtAuth.authenticatedRequest('agent', '/credits/balance', {
        method: 'GET'
      })

      if (balanceData && (balanceData as any).success) {
        setCreditBalance((balanceData as any).data)
      }

      // Fetch recent transactions
      const transactionsData = await jwtAuth.authenticatedRequest('agent', '/credits/transactions?limit=10', {
        method: 'GET'
      })

      if (transactionsData && (transactionsData as any).success) {
        setTransactions((transactionsData as any).data)
      }
    } catch (error) {
      console.error('Error fetching credit data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchCreditData()
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'credit':
        return <ArrowUpRight className="w-4 h-4 text-green-400" />
      case 'debit':
        return <ArrowDownRight className="w-4 h-4 text-red-400" />
      case 'refund':
        return <ArrowUpRight className="w-4 h-4 text-blue-400" />
      default:
        return <History className="w-4 h-4 text-gray-400" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'credit':
        return 'text-green-400'
      case 'debit':
        return 'text-red-400'
      case 'refund':
        return 'text-blue-400'
      default:
        return 'text-gray-400'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading credit information...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Credit Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={THEME_CLASSES.CARD_GLASS}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Available Credit
            </CardTitle>
            <Wallet className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ₹{creditBalance?.creditBalance.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-blue-200 mt-1">
              Current balance
            </p>
          </CardContent>
        </Card>

        <Card className={THEME_CLASSES.CARD_GLASS}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Total Received
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ₹{creditBalance?.totalCreditsReceived.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-blue-200 mt-1">
              All time credits
            </p>
          </CardContent>
        </Card>

        <Card className={THEME_CLASSES.CARD_GLASS}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Total Used
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ₹{creditBalance?.totalCreditsUsed.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-blue-200 mt-1">
              All time usage
            </p>
          </CardContent>
        </Card>

        <Card className={THEME_CLASSES.CARD_GLASS}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Credit Limit
            </CardTitle>
            <Wallet className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ₹{creditBalance?.creditLimit.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-blue-200 mt-1">
              Maximum allowed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className={THEME_CLASSES.CARD_GLASS}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Recent Transactions</CardTitle>
              <CardDescription className="text-blue-200">
                Your latest credit activity
              </CardDescription>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              size="sm"
              className="bg-white/5 border-white/20 hover:bg-white/10 text-white"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-blue-200">
              No transactions yet
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                      {getTransactionIcon(transaction.transaction_type)}
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {transaction.description}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge 
                          variant="outline" 
                          className="text-xs border-white/20 text-blue-200"
                        >
                          {transaction.reference_number}
                        </Badge>
                        <span className="text-xs text-blue-300">
                          {formatDate(transaction.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${getTransactionColor(transaction.transaction_type)}`}>
                      {transaction.transaction_type === 'debit' ? '-' : '+'}₹{transaction.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-blue-300">
                      Balance: ₹{transaction.balance_after.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Information */}
      <Card className={THEME_CLASSES.CARD_GLASS}>
        <CardHeader>
          <CardTitle className="text-white">How to Use Credits</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-200 space-y-2">
          <p>• Credits can be used to pay for bus ticket bookings</p>
          <p>• You can use partial or full credit amount for each booking</p>
          <p>• Remaining amount can be paid via cash or other payment methods</p>
          <p>• Credits are automatically deducted when you create a booking</p>
          <p>• Refunded bookings will credit back the amount to your balance</p>
          <p>• Contact admin to request additional credits if needed</p>
        </CardContent>
      </Card>
    </div>
  )
}
