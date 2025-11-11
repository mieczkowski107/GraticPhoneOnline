export class NotFoundError extends Error {
    constructor(msg: string) {
        super(msg);
        this.name = "NotFoundError";
        Object.setPrototypeOf(this, InvalidInputError.prototype);
    }
}
export class InvalidInputError extends Error {
    constructor(msg: string) {
        super(msg);
        this.name = "InvalidError";
        Object.setPrototypeOf(this, InvalidInputError.prototype);
    }
}

export class AuthenticationError extends Error {
    constructor(msg: string) {
        super(msg);
        this.name = "AuthenticationError";
        Object.setPrototypeOf(this, AuthenticationError.prototype);
    }
}