"use client"

// This is a polyfill for @radix-ui/react-use-effect-event
const React = require("react")

// Create our own implementation of useEffectEvent
function useEffectEvent(callback) {
  const ref = React.useRef(callback)

  React.useLayoutEffect(() => {
    ref.current = callback
  })

  return React.useCallback((...args) => {
    return ref.current(...args)
  }, [])
}

// Export the polyfill
module.exports = {
  useEffectEvent,
}
