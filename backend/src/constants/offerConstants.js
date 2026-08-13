const OFFER_STATUS = Object.freeze({
  DRAFT: 'DRAFT',
  SENT: 'SENT',
  ACCEPTED: 'ACCEPTED',
  DECLINED: 'DECLINED',
  WITHDRAWN: 'WITHDRAWN',
});

module.exports = {
  OFFER_STATUS,
  ALL_OFFER_STATUSES: Object.values(OFFER_STATUS),
};
