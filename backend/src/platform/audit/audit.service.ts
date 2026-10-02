import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
@Injectable()
export class AuditService {
  append(transaction: Prisma.TransactionClient, record: Prisma.AuditEventUncheckedCreateInput) {
    return transaction.auditEvent.create({ data: record });
  }
}
