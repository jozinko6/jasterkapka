export function startOfDay(date = new Date()) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function startOfWeek(date = new Date()) {
  const copy = startOfDay(date);
  const day = copy.getDay() || 7;
  copy.setDate(copy.getDate() - day + 1);
  return copy;
}

export function sumAmounts(rows, field = "fee") {
  return rows.reduce((sum, row) => Math.round((sum + Number(row[field] || 0)) * 100) / 100, 0);
}

export function buildEarnings(deliveries, rewards) {
  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = startOfWeek(now);
  const delivered = deliveries.filter((task) => task.status === "delivered");
  const todayDeliveries = delivered.filter((task) => new Date(task.delivered_at || task.updated_at || task.created_at) >= todayStart);
  const weekDeliveries = delivered.filter((task) => new Date(task.delivered_at || task.updated_at || task.created_at) >= weekStart);
  const todayRewards = rewards.filter((reward) => new Date(reward.created_at) >= todayStart);
  const weekRewards = rewards.filter((reward) => new Date(reward.created_at) >= weekStart);

  return {
    today: {
      deliveries: todayDeliveries.length,
      deliveryEarnings: sumAmounts(todayDeliveries),
      rewards: sumAmounts(todayRewards, "amount"),
      total: Math.round((sumAmounts(todayDeliveries) + sumAmounts(todayRewards, "amount")) * 100) / 100
    },
    week: {
      deliveries: weekDeliveries.length,
      deliveryEarnings: sumAmounts(weekDeliveries),
      rewards: sumAmounts(weekRewards, "amount"),
      total: Math.round((sumAmounts(weekDeliveries) + sumAmounts(weekRewards, "amount")) * 100) / 100
    },
    allTime: {
      deliveries: delivered.length,
      deliveryEarnings: sumAmounts(delivered),
      rewards: sumAmounts(rewards, "amount"),
      total: Math.round((sumAmounts(delivered) + sumAmounts(rewards, "amount")) * 100) / 100
    }
  };
}
