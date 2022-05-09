'use strict';
const _ = require('lodash');
const moment = require('moment');

module.exports = {
  async find(ctx) {
    const { page, filter } = ctx.params;
    let transactions = null;
    if (filter) {
      transactions = await strapi.query('transactions').search({ _q: filter, _limit: -1 });
    } else {
      transactions = await strapi.query('transactions').find({ _limit: -1 });
    }
    transactions = _.filter(transactions, (transaction) => transaction.user.role == 1);
    const transactionsSortByDate = _.orderBy(transactions, (e) => moment(e.date), ['desc']);
    const sendTransactions = transactionsSortByDate.slice(page * 10, page * 10 + 10);
    return { count: transactionsSortByDate.length, sendTransactions };
  },
  async findByUser(ctx) {
    const { id, page, filter } = ctx.params;
    let transactions = null;
    if (filter) {
      transactions = await strapi.query('transactions').search({ _q: filter, user: id, _limit: -1 });
    } else {
      transactions = await strapi.query('transactions').find({ user: id, _limit: -1 });
    }

    const transactionsSortByDate = _.orderBy(transactions, (e) => moment(e.date), ['desc']);
    const sendTransactions = transactionsSortByDate.slice(page * 10, page * 10 + 10);
    return { count: transactionsSortByDate.length, sendTransactions };
  },
  async getTransactionsByGraph(ctx) {
    const { id, date } = ctx.params;
    const transactions = await strapi.query('transactions').find({ user: id });
    if (date) {
      const transactionsFilterByTime = _.filter(transactions, (el) => {
        if (moment(el.date).isBetween(moment().subtract(1, date), moment())) {
          return el;
        }
      });
      const transactionsToGraph = _.groupBy(transactionsFilterByTime, 'product')
      return transactionsToGraph;
    } else {
      const transactionsToGraph = _.groupBy(transactions, 'product')
      return transactionsToGraph;
    }
  },
  async getUserTransactionsByGraph(ctx) {
    const { date } = ctx.params;
    const transactions = await strapi.query('transactions').find({ _limit: -1 });
    const transactionsWithoutWithdraw = _.filter(transactions, (el) => el.product !== "Withdraw")
    if (date) {
      const transactionsFilterByTime = _.filter(transactionsWithoutWithdraw, (el) => {
        if (moment(el.date).isBetween(moment().subtract(1, date), moment())) {
          return el;
        }
      });
      const transactionsToGraph = _.groupBy(transactionsFilterByTime, 'user.username');
      return transactionsToGraph;
    } else {
      const transactionsToGraph = _.groupBy(transactionsWithoutWithdraw, 'user.username')
      return transactionsToGraph;
    }
  }
};
