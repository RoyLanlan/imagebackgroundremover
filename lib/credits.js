// 简单的内存存储，生产环境替换为数据库
const userCredits = {}

export function getCredits(email) {
  return userCredits[email] ?? 10 // 新用户赠送10积分
}

export function setCredits(email, credits) {
  userCredits[email] = credits
}

export function deductCredit(email) {
  const current = getCredits(email)
  if (current <= 0) return false
  userCredits[email] = current - 1
  return true
}

export function addCredits(email, amount) {
  userCredits[email] = getCredits(email) + amount
}
