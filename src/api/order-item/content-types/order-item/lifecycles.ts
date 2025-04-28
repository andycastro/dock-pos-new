export default {
  async beforeCreate(event) {
    const { data } = event.params;

    // Verifica se o produto foi enviado no request
    if (data.product?.connect?.[0]?.id) {
      const productId = data.product.connect[0].id;

      // Busca o produto para pegar o preço
      const product = await strapi.entityService.findOne('api::product.product', productId);

      // Se o produto existir e tiver um preço, preenche o itemPrice
      if (product?.price) {
        data.itemPrice = product.price;
      }
    }
  },

  async afterCreate(event) {
    const { result } = event;

    // Popula o relacionamento "order" explicitamente
    const populatedResult = await strapi.entityService.findOne(
      'api::order-item.order-item',
      result.id,
      {
        populate: { order: true }, // Popula o relacionamento 'order'
      }
    );

    // Ensure populatedResult is cast to include the 'order' property
        const { order, itemPrice, quantity } = populatedResult as { order?: { id: string }; itemPrice?: number; quantity?: number };

    console.log('Order Item Created:', { order, itemPrice, quantity });

    if (order?.id && itemPrice && quantity) {
      // Busca a ordem atual para obter o total atual
      const currentOrder = await strapi.entityService.findOne('api::order.order', order.id);

      if (!currentOrder) {
        console.error(`Order with ID ${order.id} not found.`);
        return;
      }

      // Calcula o novo total
      const newTotal = (currentOrder.total || 0) + itemPrice * quantity;

      // Atualiza o total da ordem
      await strapi.entityService.update('api::order.order', order.id, {
        data: {
          total: newTotal,
        },
      });

      console.log(`Order total updated to ${newTotal}`);
    } else {
      console.error('Missing required fields:', { order, itemPrice, quantity });
    }
  },

  async beforeDelete(event) {
    const { where } = event.params;

    // Popula o relacionamento "order" explicitamente antes da exclusão
    const populatedResult = await strapi.entityService.findMany(
      'api::order-item.order-item',
      {
        filters: where,
        populate: { order: true }, // Popula o relacionamento 'order'
      }
    );

    // Armazena os dados populados no evento para uso no afterDelete
    event.params.populatedResult = populatedResult[0];
  },

  async afterDelete(event) {
    const populatedResult = event.params.populatedResult;

    if (!populatedResult) {
      console.error('No populated result found for afterDelete.');
      return;
    }

    const { order, itemPrice, quantity } = populatedResult;

    console.log('Order Item Deleted:', { order, itemPrice, quantity });

    if (order?.id && itemPrice && quantity) {
      // Busca a ordem atual para obter o total atual
      const currentOrder = await strapi.entityService.findOne('api::order.order', order.id);

      if (!currentOrder) {
        console.error(`Order with ID ${order.id} not found.`);
        return;
      }

      // Calcula o novo total
      const newTotal = (currentOrder.total || 0) - itemPrice * quantity;

      // Atualiza o total da ordem
      await strapi.entityService.update('api::order.order', order.id, {
        data: {
          total: newTotal,
        },
      });

      console.log(`Order total updated to ${newTotal}`);
    } else {
      console.error('Missing required fields:', { order, itemPrice, quantity });
    }
  },
};