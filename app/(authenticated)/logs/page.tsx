'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Confirm } from '@/components/ui/confirm'
import { FileText, Trash2, RefreshCw } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'

interface LogEntry {
  id: string
  level: string
  message: string
  meta: string | null
  timestamp: string
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [clearing, setClearing] = useState(false)
  const [level, setLevel] = useState('all')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const { toast } = useToast()

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/logs?page=${page}&level=${level}&limit=50`)
      const data = await response.json()
      
      if (data.error) {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
        return
      }
      
      setLogs(data.logs || [])
      setTotal(data.total || 0)
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch logs', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const clearAllLogs = async () => {
    setClearing(true)
    try {
      const response = await fetch('/api/logs', { method: 'DELETE' })
      const data = await response.json()
      
      if (data.error) {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      } else {
        toast({ title: 'Success', description: 'All logs cleared successfully' })
        fetchLogs()
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to clear logs', variant: 'destructive' })
    } finally {
      setClearing(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [page, level])

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'destructive'
      case 'warn': return 'secondary'
      case 'info': return 'default'
      case 'debug': return 'outline'
      default: return 'default'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">API Logs</h1>
          <p className="text-muted-foreground">Monitor system activity and debug issues</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchLogs} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Confirm
            title="Clear All Logs?"
            description="This will permanently delete all log entries. This action cannot be undone."
            confirmText="Clear All Logs"
            confirmVariant="destructive"
            variant="destructive"
            size="sm"
            disabled={clearing}
            onConfirm={clearAllLogs}
            successMessage="All logs cleared successfully"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All
          </Confirm>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <CardTitle>Log Entries ({total})</CardTitle>
            </div>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="warn">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="debug">Debug</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <CardDescription>Real-time system logs and API activity</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading logs...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No logs found</div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div key={log.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={getLevelColor(log.level)}>{log.level.toUpperCase()}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm">{log.message}</div>
                  {log.meta && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-muted-foreground">Show metadata</summary>
                      <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                        {JSON.stringify(JSON.parse(log.meta), null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {total > 50 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="px-4 py-2 text-sm">Page {page}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => p + 1)}
                disabled={page * 50 >= total}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}