/**
 * Enum for the type of audit
 * @readonly
 * @enum {string}
 */
export const AuditType = {
  CRUD: 'crud',
  LOGIN: 'login',
  NOTIFICATION: 'notification',
  ERROR: 'error'
};

export class AuditRequestFilters {
  constructor(properties) {
    if (!properties) return;

    /**
     * The types of audits to include in the filter
     * @type AuditType[]
     */
    this.types = properties?.types;

    /**
     * The uuid of the employee who caused the audit
     * @type {string}
     */
    this.actor = properties?.actor;

    /**
     * The uuid of the employee whose data was changed, or (if the audit is a notification) received the notification
     * @type {string}
     */
    this.receiver = properties?.receiver;

    /** @type Date */
    this.startDate = properties?.startDate;
    /** @type Date */
    this.endDate = properties?.endDate;
  }

  /**
   * Sets the audit types
   * @param {AuditType[]} types The list of audit types (which correspond to tables) to filter
   * @returns {AuditRequestFilters} this
   */
  fromTables(types) {
    this.types = types;
    return this;
  }

  /**
   * Sets the actor
   * @param {string} actor The uuid of the employee who caused the audit
   * @returns {AuditRequestFilters} this
   */
  by(actor) {
    this.actor = actor;
    return this;
  }

  /**
   * Sets the receiver
   * @param {string} receiver The uuid of the employee affected by the audit
   * @returns {AuditRequestFilters} this
   */
  on(receiver) {
    this.receiver = receiver;
    return this;
  }

  /**
   * Sets the range of time
   * @param {Date | null} startDate
   * @param {Date | null} endDate
   * @returns {AuditRequestFilters} this
   */
  betweenDates(startDate, endDate) {
    this.startDate = startDate;
    this.endDate = endDate;
    return this;
  }
}
