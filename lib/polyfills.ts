"use client"

// This file provides polyfills for missing React features

import React from "react"

// Add useEffectEvent to React if it doesn't exist
if (!("useEffectEvent" in React)) {
  // @ts-ignore - Add the polyfill to React
  React.useEffectEvent = function useEffectEvent(callback: Function) {
    const ref = React.useRef(callback)

    React.useLayoutEffect(() => {
      ref.current = callback
    })

    return React.useCallback((...args: any[]) => {
      return ref.current(...args)
    }, [])
  }
}
