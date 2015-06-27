

export function listen(dispatcher) {
  const steps = []
  return {step, exec}

  function step(fn) {
    steps.push(fn)
    return {step, exec}
  }
  function exec() {
    dispatcher.listen(model => {
      if (steps.length === 0) {
        throw new Error("No more steps expected but got " + JSON.stringify(model, null, 2))
      }
      const step = steps[0]
      steps.splice(0, 1)
      defer(() => step(model))
    })
  }
}

export function defer(fn) {
  setTimeout(fn, 0)
}
