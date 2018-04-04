export function noop() {}

export function unwrapArray(arg, defaultValue) {
  arg = Array.isArray(arg) ? arg[0] : arg
  if (!arg && defaultValue) {
    return defaultValue
  } else {
    return arg
  }
}

export function composeEventHandlers(...fns) {
  return (event, ...args) => {
    fns.forEach(fn => {
      fn && fn(event, ...args);
    })
  }
}
