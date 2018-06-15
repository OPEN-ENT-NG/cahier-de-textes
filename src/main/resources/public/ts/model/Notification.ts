export class Notification {
    text: String;
    status: String;

    constructor(text: String, status: String = 'info') {
        this.text = text;
        this.status = status;
    }
}