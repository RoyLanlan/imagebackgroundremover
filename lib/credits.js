import prisma from './prisma'

// 获取用户积分（无用户则创建，赠送10积分）
export async function getCredits(email, name, image) {
  if (!email) return 0

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: name || '',
      image: image || '',
      credits: 10,
    },
  })

  return user.credits
}

// 设置积分（覆盖）
export async function setCredits(email, credits) {
  await prisma.user.update({
    where: { email },
    data: { credits },
  })
}

// 扣除积分
export async function deductCredit(email) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || user.credits <= 0) return false

  await prisma.user.update({
    where: { email },
    data: { credits: { decrement: 1 } },
  })

  await prisma.creditTransaction.create({
    data: {
      userId: user.id,
      type: 'debit',
      amount: 1,
      description: '使用积分处理图片',
    },
  })

  return true
}

// 增加积分
export async function addCredits(email, amount, description) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return

  await prisma.user.update({
    where: { email },
    data: { credits: { increment: amount } },
  })

  await prisma.creditTransaction.create({
    data: {
      userId: user.id,
      type: 'credit',
      amount,
      description: description || `充值 ${amount} 积分`,
    },
  })
}
