export enum PaymentStatus {
    DELETED = 0,
    ACTIVE = 1,
    WAITING_CONFIRMATION = 2
}

export enum PaymentResultMode {
    RAW_AND_ENTITIES = 0,
    RAW = 1,
    ENTITIES = 2
}

export enum PAYMENT_SERVICE_EVENTS {
    PAYMENT_ADDED = "paymentAdded"
}