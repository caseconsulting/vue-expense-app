export class Base {
  clearEmails() {
    this.cc = '';
    this.bcc = '';
    this.replyTo = '';

    if (this.categories) {
      this.categories = this.categories.forEach((c) => c.clearEmails());
    }
  }
}
