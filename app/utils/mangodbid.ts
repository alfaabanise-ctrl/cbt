export function getMongoId(
  item: any
): string {

  if (!item) {
    return ""
  }

  const value =
    item._id ??
    item.id ??
    ""

  // Normal MongoDB ObjectId/string
  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    return String(value)
  }

  // MongoDB extended JSON:
  // { $oid: "68..." }
  if (
    typeof value === "object" &&
    value?.$oid
  ) {
    return String(value.$oid)
  }

  // Mongoose ObjectId
  if (
    typeof value === "object" &&
    typeof value?.toString === "function"
  ) {
    const result = value.toString()

    if (
      result &&
      result !== "[object Object]"
    ) {
      return result
    }
  }

  return ""
}