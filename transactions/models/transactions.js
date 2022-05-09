'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */

module.exports = {
  lifecycles: {
    async afterCreate(ctx) {
      const { user } = ctx;
      if (user) {
        const userInfo = await strapi.query('user', 'users-permissions').findOne({ id: user.id });
        const balance = (Number(ctx.amount) + Number(userInfo.balance)).toFixed(2);
        await strapi.query('user', 'users-permissions').update({ id: user.id }, { balance });
      }
    }
  }
};
