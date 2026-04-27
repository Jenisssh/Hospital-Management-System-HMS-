package com.hms.payment.exception;

import com.hms.payment.entity.PaymentStatus;

public class RefundNotAllowedException extends RuntimeException {
    public RefundNotAllowedException(PaymentStatus status) {
        super("Only PAID payments can be refunded; current status is " + status);
    }
}
