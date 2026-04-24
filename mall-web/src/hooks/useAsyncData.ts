import { useEffect, useEffectEvent, useState } from 'react'

const referenceDepIds = new WeakMap<object, number>()
const symbolDepIds = new Map<symbol, number>()
let nextDepId = 1

function getReferenceDepId(value: object) {
  const existingId = referenceDepIds.get(value)
  if (existingId) {
    return existingId
  }

  const createdId = nextDepId++
  referenceDepIds.set(value, createdId)
  return createdId
}

function getSymbolDepId(value: symbol) {
  const existingId = symbolDepIds.get(value)
  if (existingId) {
    return existingId
  }

  const createdId = nextDepId++
  symbolDepIds.set(value, createdId)
  return createdId
}

function getDependencySignature(deps: ReadonlyArray<unknown>) {
  return JSON.stringify(
    deps.map((value) => {
      if (value === null) {
        return ['null']
      }

      switch (typeof value) {
        case 'undefined':
          return ['undefined']
        case 'boolean':
          return ['boolean', value]
        case 'number':
          if (Number.isNaN(value)) {
            return ['number', 'NaN']
          }
          return ['number', Object.is(value, -0) ? '-0' : value]
        case 'string':
          return ['string', value]
        case 'bigint':
          return ['bigint', value.toString()]
        case 'symbol':
          return ['symbol', getSymbolDepId(value)]
        case 'function':
        case 'object':
          return ['reference', getReferenceDepId(value)]
      }
    }),
  )
}

interface UseAsyncDataOptions<T> {
  enabled?: boolean
  initialData?: T | null
}

export function useAsyncData<T>(
  loader: () => Promise<T>,
  deps: ReadonlyArray<unknown>,
  options: UseAsyncDataOptions<T> = {},
) {
  const { enabled = true, initialData = null } = options
  const dependencySignature = getDependencySignature(deps)
  const [data, setData] = useState<T | null>(initialData)
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState<unknown>(null)
  const [reloadIndex, setReloadIndex] = useState(0)

  const runLoader = useEffectEvent(async (alive: { current: boolean }) => {
    if (!enabled) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const nextData = await loader()
      if (!alive.current) {
        return
      }
      setData(nextData)
    } catch (nextError) {
      if (!alive.current) {
        return
      }
      setError(nextError)
    } finally {
      if (alive.current) {
        setLoading(false)
      }
    }
  })

  useEffect(() => {
    const alive = { current: true }
    runLoader(alive)
    return () => {
      alive.current = false
    }
  }, [dependencySignature, enabled, reloadIndex])

  return {
    data,
    error,
    loading,
    setData,
    reload: () => setReloadIndex((value) => value + 1),
  }
}
