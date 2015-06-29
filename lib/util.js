
export function keys(obj) {
  return Object.keys(obj)
}

export function zipObject(fields) {
  const obj = {}
  fields.forEach(([k, v]) => obj[k] = v)
  return obj
}

export function noop(arg) {
  return arg
}

export function defer(fn) {
  setTimeout(fn, 0)
}
