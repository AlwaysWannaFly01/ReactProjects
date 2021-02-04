import isNode from 'detect-node'

export default function handleErr(err) {
  if (isNode) {
    throw err
  } else {
    console.warn(err)
  }
}
