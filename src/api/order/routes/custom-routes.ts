export default {
  routes: [
    {
      method: "GET",
      path: "/orders/daily-revenue",
      handler: "order.dailyRevenue",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
}