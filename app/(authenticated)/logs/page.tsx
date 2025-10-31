'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Confirm } from '@/components/ui/confirm'
import { Pagination } from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { usePermissions } from '@/hooks/use-permissions'
import { useToast } from '@/hooks/use-toast'
import { PERMISSIONS } from '@/lib/permissions/constants'
import { FileText, RefreshCw, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'

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
  const [limit, setLimit] = useState(25)
  const { toast } = useToast()
  const { hasPermission } = usePermissions()

  const canDelete = hasPermission(PERMISSIONS.LOGS_DELETE)

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/logs?page=${page}&level=${level}&limit=${limit}`)
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
    setPage(1) // Reset to first page when limit changes
  }, [limit])

  useEffect(() => {
    fetchLogs()
  }, [page, level, limit])

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'destructive'
      case 'warn':
        return 'secondary'
      case 'info':
        return 'default'
      case 'debug':
        return 'outline'
      default:
        return 'default'
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
          {canDelete && (
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
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <CardTitle>Log Entries</CardTitle>
            </div>
            <div className="flex gap-2">
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
              <Select value={limit.toString()} onValueChange={(value) => setLimit(parseInt(value))}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <CardDescription>Real-time system logs and API activity</CardDescription>
            <div className="text-sm text-muted-foreground">
              Total: {total} entries | Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading logs...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No logs found</div>
          ) : (
            <div className="space-y-4">
              {(() => {
                const groupedLogs = logs.reduce((groups, log) => {
                  const date = new Date(log.timestamp)
                  const today = new Date()
                  const yesterday = new Date(today)
                  yesterday.setDate(yesterday.getDate() - 1)

                  let dateKey
                  if (date.toDateString() === today.toDateString()) {
                    dateKey = 'Today'
                  } else if (date.toDateString() === yesterday.toDateString()) {
                    dateKey = 'Yesterday'
                  } else {
                    dateKey = date.toLocaleDateString()
                  }

                  if (!groups[dateKey]) {
                    groups[dateKey] = []
                  }
                  groups[dateKey].push(log)
                  return groups
                }, {} as Record<string, LogEntry[]>)

                return Object.entries(groupedLogs).map(([dateKey, dateLogs]) => (
                  <div key={dateKey} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-px bg-border flex-1" />
                      <span className="text-sm font-medium text-muted-foreground px-2">
                        {dateKey}
                      </span>
                      <div className="h-px bg-border flex-1" />
                    </div>
                    <div className="space-y-2">
                      {dateLogs.map(log => (
                        <div key={log.id} className="border rounded-lg p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant={getLevelColor(log.level)}>
                                {log.level.toUpperCase()}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {new Date(log.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                          <div className="text-sm">{log.message}</div>
                          {log.meta && (
                            <details className="text-xs">
                              <summary className="cursor-pointer text-muted-foreground">
                                Show metadata
                              </summary>
                              <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                                {JSON.stringify(JSON.parse(log.meta), null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              })()}
            </div>
          )}

          <Pagination
            currentPage={page}
            totalItems={total}
            itemsPerPage={limit}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>
    </div>
  )
}
