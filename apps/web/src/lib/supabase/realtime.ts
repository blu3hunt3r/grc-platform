/**
 * @file realtime.ts
 * @description Supabase Realtime hooks for live agent updates
 * @architecture Reference: Part 6 - Security & Authentication
 * @module @/lib/supabase
 *
 * Realtime Channels:
 * - agent_executions: Live updates on agent status changes
 * - approvals: Real-time approval requests and responses
 * - evidence: Live evidence collection updates
 *
 * Created on November 17, 2025
 */

'use client'

import { useEffect, useState } from 'react'
import { createClient } from './client'
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'

/**
 * Subscribe to agent execution updates for a specific audit
 */
export function useAgentExecutions(auditId: string | null) {
  const [executions, setExecutions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!auditId) {
      setLoading(false)
      return
    }

    // Initial fetch
    const fetchExecutions = async () => {
      const { data } = await supabase
        .from('agent_executions')
        .select('*')
        .eq('auditId', auditId)
        .order('startedAt', { ascending: false })

      if (data) {
        setExecutions(data)
      }
      setLoading(false)
    }

    fetchExecutions()

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`agent_executions:${auditId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agent_executions',
          filter: `auditId=eq.${auditId}`,
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          if (payload.eventType === 'INSERT') {
            setExecutions((prev) => [payload.new, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setExecutions((prev) =>
              prev.map((exec) => (exec.id === payload.new.id ? payload.new : exec))
            )
          } else if (payload.eventType === 'DELETE') {
            setExecutions((prev) => prev.filter((exec) => exec.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [auditId, supabase])

  return { executions, loading }
}

/**
 * Subscribe to approval requests
 */
export function useApprovals(userId: string | null) {
  const [approvals, setApprovals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    // Initial fetch
    const fetchApprovals = async () => {
      const { data } = await supabase
        .from('approvals')
        .select('*, execution:agent_executions(*)')
        .eq('status', 'PENDING')
        .order('requestedAt', { ascending: false })

      if (data) {
        setApprovals(data)
      }
      setLoading(false)
    }

    fetchApprovals()

    // Subscribe to realtime updates
    const channel = supabase
      .channel('approvals')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'approvals',
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          if (payload.eventType === 'INSERT') {
            setApprovals((prev) => [payload.new, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setApprovals((prev) =>
              prev.map((approval) =>
                approval.id === payload.new.id ? payload.new : approval
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setApprovals((prev) => prev.filter((approval) => approval.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase])

  return { approvals, loading }
}

/**
 * Subscribe to evidence collection updates for a specific audit
 */
export function useEvidence(auditId: string | null) {
  const [evidence, setEvidence] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!auditId) {
      setLoading(false)
      return
    }

    // Initial fetch
    const fetchEvidence = async () => {
      const { data } = await supabase
        .from('evidence')
        .select('*')
        .eq('auditId', auditId)
        .order('createdAt', { ascending: false })

      if (data) {
        setEvidence(data)
      }
      setLoading(false)
    }

    fetchEvidence()

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`evidence:${auditId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'evidence',
          filter: `auditId=eq.${auditId}`,
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          if (payload.eventType === 'INSERT') {
            setEvidence((prev) => [payload.new, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setEvidence((prev) =>
              prev.map((item) => (item.id === payload.new.id ? payload.new : item))
            )
          } else if (payload.eventType === 'DELETE') {
            setEvidence((prev) => prev.filter((item) => item.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [auditId, supabase])

  return { evidence, loading }
}

/**
 * Subscribe to findings for a specific audit
 */
export function useFindings(auditId: string | null) {
  const [findings, setFindings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!auditId) {
      setLoading(false)
      return
    }

    // Initial fetch
    const fetchFindings = async () => {
      const { data } = await supabase
        .from('findings')
        .select('*')
        .eq('auditId', auditId)
        .order('identifiedAt', { ascending: false })

      if (data) {
        setFindings(data)
      }
      setLoading(false)
    }

    fetchFindings()

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`findings:${auditId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'findings',
          filter: `auditId=eq.${auditId}`,
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          if (payload.eventType === 'INSERT') {
            setFindings((prev) => [payload.new, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setFindings((prev) =>
              prev.map((finding) => (finding.id === payload.new.id ? payload.new : finding))
            )
          } else if (payload.eventType === 'DELETE') {
            setFindings((prev) => prev.filter((finding) => finding.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [auditId, supabase])

  return { findings, loading }
}

/**
 * Generic realtime subscription hook
 */
export function useRealtimeSubscription<T = any>(
  table: string,
  filter?: string,
  initialFetch?: () => Promise<T[]>
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Initial fetch
    const fetchData = async () => {
      if (initialFetch) {
        const result = await initialFetch()
        setData(result)
      }
      setLoading(false)
    }

    fetchData()

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`${table}${filter ? `:${filter}` : ''}`)
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table,
          ...(filter ? { filter } : {}),
        } as any,
        (payload: any) => {
          if (payload.eventType === 'INSERT') {
            setData((prev) => [payload.new, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setData((prev) =>
              prev.map((item: any) => (item.id === (payload.new as any).id ? payload.new : item))
            )
          } else if (payload.eventType === 'DELETE') {
            setData((prev) => prev.filter((item: any) => item.id !== (payload.old as any).id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, filter, initialFetch, supabase])

  return { data, loading }
}
