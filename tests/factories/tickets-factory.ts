import faker from "@faker-js/faker";
import { prisma } from "@/config";
import { Enrollment, TicketStatus } from "@prisma/client";

export async function createTicketType(isRemote?: boolean, includesHotel?: boolean) {
  return prisma.ticketType.create({
    data: {
      name: faker.name.findName(),
      price: faker.datatype.number(),
      isRemote: isRemote !== null? isRemote: faker.datatype.boolean(),
      includesHotel: includesHotel !== null? includesHotel: faker.datatype.boolean(),
    },
  });
}

export async function createTicket(enrollmentId: number, ticketTypeId: number, status: TicketStatus) {
  return prisma.ticket.create({
    data: {
      enrollmentId,
      ticketTypeId,
      status,
    },
  });
}

export async function createTicketForHotel(enrollment: Enrollment, isRemote: boolean, includesHotel: boolean, isPaid: boolean) {
  const ticketType = await createTicketType(isRemote, includesHotel);

  if(isPaid) {
    return await prisma.ticket.create({
      data: {
        ticketTypeId: ticketType.id,
        enrollmentId: enrollment.id,
        status: TicketStatus.PAID
      }
    });
  }else {
    return await prisma.ticket.create({
      data: {
        ticketTypeId: ticketType.id,
        enrollmentId: enrollment.id,
        status: TicketStatus.RESERVED
      }
    });
  }
}
