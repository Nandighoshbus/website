"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Wallet, 
  Plus,
  Search,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  TrendingUp,
  DollarSign
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Agent {
  id: string
  agentCode: string
  businessName: string
  creditBalance: number
  totalCreditsReceived: number
  totalCreditsUsed: number
  creditLimit: number
  isActive: boolean
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
  agent: {
    agent_code: string
    business_name: string
  }
}

export default function AdminCreditManagement() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [transactions, setTransactions] = useState<CreditTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [creditAmount, setCreditAmount] = useState("")
  const [description, setDescription] = useState("")
  const [adminNotes, setAdminNotes] = useState("")
  const [isAddingCredit, setIsAddingCredit] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { jwtAuth } = await import('@/lib/jwtAuth')
      
      // Fetch agents with credit summary
      const agentsData = await jwtAuth.authenticatedRequest('admin', '/credits/agents', {
        method: 'GET'
      })

      if (agentsData && (agentsData as any).success) {
        setAgents((agentsData as any).data)
      }

      // Fetch recent transactions
      const transactionsData = await jwtAuth.authenticatedRequest('admin', '/credits/admin/transactions?limit=20', {
        method: 'GET'
      })

      if (transactionsData && (transactionsData as any).success) {
        setTransactions((transactionsData as any).data)
      }
    } catch (error) {
      console.error('Error fetching credit data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCredit = async () => {
    if (!selectedAgent || !creditAmount || parseFloat(creditAmount) <= 0) {
      alert('Please select an agent and enter a valid amount')
      return
    }

    setIsAddingCredit(true)
    try {
      const { jwtAuth } = await import('@/lib/jwtAuth')
      
      const response = await jwtAuth.authenticatedRequest('admin', '/credits/add', {
        method: 'POST',
        body: JSON.stringify({
          agentId: selectedAgent.id,
          amount: parseFloat(creditAmount),
          description: description || `Credits added by admin`,
          adminNotes: adminNotes || null
        })
      })

      if (response && (response as any).success) {
        alert((response as any).message)
        setShowAddDialog(false)
        setCreditAmount("")
        setDescription("")
        setAdminNotes("")
        setSelectedAgent(null)
        fetchData() // Refresh data
      } else {
        alert('Failed to add credits')
      }
    } catch (error: any) {
      console.error('Error adding credits:', error)
      alert(error.message || 'Failed to add credits')
    } finally {
      setIsAddingCredit(false)
    }
  }

  const filteredAgents = agents.filter(agent =>
    agent.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.agentCode.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalCreditsIssued = agents.reduce((sum, agent) => sum + agent.totalCreditsReceived, 0)
  const totalCreditsUsed = agents.reduce((sum, agent) => sum + agent.totalCreditsUsed, 0)
  const totalCreditBalance = agents.reduce((sum, agent) => sum + agent.creditBalance, 0)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-900">Loading credit management...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Credits Issued
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              ₹{totalCreditsIssued.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              All time issued
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Credits Used
            </CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              ₹{totalCreditsUsed.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              All time usage
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Outstanding Balance
            </CardTitle>
            <Wallet className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              ₹{totalCreditBalance.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Current balance
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Agents
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {agents.filter(a => a.isActive).length}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              With credit access
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Agents List */}
      <Card className="bg-white border shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Agent Credit Management</CardTitle>
              <CardDescription>
                Manage agent credit balances and limits
              </CardDescription>
            </div>
            <Button
              onClick={fetchData}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search agents by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Agents Table */}
            <div className="space-y-2">
              {filteredAgents.map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="text-gray-900 font-medium">{agent.businessName}</p>
                        <p className="text-sm text-gray-600">Code: {agent.agentCode}</p>
                      </div>
                      {!agent.isActive && (
                        <Badge variant="outline" className="border-red-500 text-red-600">
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Balance</p>
                      <p className="text-lg font-bold text-green-600">
                        ₹{agent.creditBalance.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Received</p>
                      <p className="text-sm text-gray-900">
                        ₹{agent.totalCreditsReceived.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Used</p>
                      <p className="text-sm text-gray-900">
                        ₹{agent.totalCreditsUsed.toFixed(2)}
                      </p>
                    </div>
                    
                    <Dialog open={showAddDialog && selectedAgent?.id === agent.id} onOpenChange={(open) => {
                      setShowAddDialog(open)
                      if (!open) setSelectedAgent(null)
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          onClick={() => setSelectedAgent(agent)}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Credits
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-white">
                        <DialogHeader>
                          <DialogTitle>
                            Add Credits to {agent.businessName}
                          </DialogTitle>
                          <DialogDescription>
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4 py-4">
                          <div>
                            <Label htmlFor="amount">Amount (₹)</Label>
                            <Input
                              id="amount"
                              type="number"
                              placeholder="Enter amount"
                              value={creditAmount}
                              onChange={(e) => setCreditAmount(e.target.value)}
                              className=""
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="description">Description</Label>
                            <Input
                              id="description"
                              placeholder="Purpose of credit"
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                              className=""
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="notes">Admin Notes (Optional)</Label>
                            <Textarea
                              id="notes"
                              placeholder="Internal notes"
                              value={adminNotes}
                              onChange={(e) => setAdminNotes(e.target.value)}
                              className=""
                            />
                          </div>
                        </div>
                        
                        <DialogFooter>
                          <Button
                            onClick={handleAddCredit}
                            disabled={isAddingCredit}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            {isAddingCredit ? 'Adding...' : 'Add Credits'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="bg-white border shadow-sm">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            Latest credit transactions across all agents
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              No transactions yet
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="text-gray-900 font-medium">{transaction.agent.business_name}</p>
                        <p className="text-sm text-gray-600">
                          {transaction.description}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {transaction.reference_number}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatDate(transaction.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`text-lg font-bold ${getTransactionColor(transaction.transaction_type)}`}>
                      {transaction.transaction_type === 'debit' ? '-' : '+'}₹{transaction.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Balance: ₹{transaction.balance_after.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
