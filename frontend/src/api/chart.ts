import { getToken } from '../utils/auth'
import type { ChartRequest, ChartStreamResult } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const TEXT_FIELDS = [
  'answer',
  'thought',
  'reasoning_content',
  'text',
  'message'
] as const

const PRIORITY_OUTPUT_FIELDS = [
  'answer',
  'text',
  'result',
  'output',
  'content'
] as const

const parseStreamLine = (line: string): Record<string, unknown> | null => {
  const trimmedLine = line.trim()

  if (!trimmedLine || trimmedLine.startsWith(':')) {
    return null
  }

  const normalizedLine = trimmedLine.startsWith('data:')
    ? trimmedLine.slice(5).trim()
    : trimmedLine

  if (!normalizedLine || normalizedLine === '[DONE]') {
    return null
  }

  return JSON.parse(normalizedLine) as Record<string, unknown>
}

const collectTextParts = (payload: Record<string, unknown>): string[] => {
  const data = payload.data as Record<string, unknown> | undefined
  const values = new Set<string>()

  for (const field of TEXT_FIELDS) {
    const topLevelValue = payload[field]
    const dataValue = data?.[field]

    if (typeof topLevelValue === 'string' && topLevelValue) {
      values.add(topLevelValue)
    }

    if (typeof dataValue === 'string' && dataValue) {
      values.add(dataValue)
    }
  }

  return [...values]
}

const findFirstString = (value: unknown): string => {
  if (typeof value === 'string' && value.trim()) {
    return value
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const nested = findFirstString(item)
      if (nested) {
        return nested
      }
    }
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>

    for (const field of PRIORITY_OUTPUT_FIELDS) {
      const nested = findFirstString(record[field])
      if (nested) {
        return nested
      }
    }

    for (const nestedValue of Object.values(record)) {
      const nested = findFirstString(nestedValue)
      if (nested) {
        return nested
      }
    }
  }

  return ''
}

const extractFinalAnswer = (payload: Record<string, unknown>): string => {
  const data = payload.data as Record<string, unknown> | undefined
  const outputs = data?.outputs

  return findFirstString(outputs)
}

export const generateChart = async (
  data: ChartRequest,
  onMessage: (text: string) => void
): Promise<ChartStreamResult> => {
  const response = await fetch(`${API_BASE_URL}/api/chart/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    throw new Error('Network error')
  }

  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error('响应流不可用')
  }

  const decoder = new TextDecoder('utf-8')
  let buffer = ''
  let fullText = ''
  let finalAnswer = ''
  let streamFailed = false

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        buffer += decoder.decode()
        break
      }

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split(/\r?\n/)
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        try {
          const json = parseStreamLine(line)
          if (!json) {
            continue
          }

          const event = typeof json.event === 'string' ? json.event : ''
          const workflowAnswer = extractFinalAnswer(json)

          for (const textPart of collectTextParts(json)) {
            fullText += textPart
            onMessage(fullText)
          }

          if ((event === 'workflow_finished' || event === 'message_end') && workflowAnswer) {
            finalAnswer = workflowAnswer
          }
        } catch {
          continue
        }
      }
    }
  } catch {
    streamFailed = true
  }

  if (buffer.trim()) {
    try {
      const json = parseStreamLine(buffer)
      const workflowAnswer = json ? extractFinalAnswer(json) : ''

      for (const textPart of json ? collectTextParts(json) : []) {
        fullText += textPart
        onMessage(fullText)
      }

      if (workflowAnswer) {
        finalAnswer = workflowAnswer
      }
    } catch {
      // ignore trailing incomplete payload
    }
  }

  if (streamFailed && !fullText && !finalAnswer) {
    throw new Error('Network error')
  }

  return {
    fullText,
    finalAnswer: finalAnswer || fullText
  }
}
