/**
 * order controller
 */

import { factories } from "@strapi/strapi";
import { startOfDay, endOfDay } from "date-fns";

export default factories.createCoreController(
  "api::order.order",
  ({ strapi }) => ({
    async dailyRevenue(ctx) {
      try {
        const today = new Date();

        const orders = await strapi.entityService.findMany("api::order.order", {
          filters: {
            statusOrder: "closed",
            updatedAt: {
              $gte: startOfDay(today),
              $lte: endOfDay(today),
            },
          },
          fields: ["total"],
        });

        const totalRevenue = orders.reduce(
          (sum, order) => sum + (order.total || 0),
          0
        );

        ctx.body = { totalRevenue };
      } catch (error) {
        console.error("Error calculating daily revenue:", error);
        ctx.throw(500, "Unable to calculate daily revenue");
      }
    },
  })
);
