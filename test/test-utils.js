

export function listen(dispatcher, steps = []) {
  return {step, exec}

  function step(fn) {
    return listen(dispatcher, [...steps, fn])
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
