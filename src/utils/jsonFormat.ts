export function isJSONString(input: string) {
  try {
    JSON.parse(input)
  } catch (e) {
    return false
  }
  return true
}
