// Sums stock across every size/color key on a product (e.g. { S: 2, 'black|M': 0 }).
export function getTotalStock(product) {
  return Object.values(product?.stock ?? {}).reduce((sum, n) => sum + (Number(n) || 0), 0)
}
