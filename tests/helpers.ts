import * as jwt from "jsonwebtoken";
import { Enrollment, TicketStatus, User } from "@prisma/client";

import { createUser } from "./factories";
import { createSession } from "./factories/sessions-factory";
import { prisma } from "@/config";
import { generateCPF } from "@brazilian-utils/brazilian-utils";
import faker from "@faker-js/faker";

export async function cleanDb() {
  await prisma.address.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.ticket.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.ticketType.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.hotel.deleteMany({});
}

export async function generateValidToken(user?: User) {
  const incomingUser = user || (await createUser());
  const token = jwt.sign({ userId: incomingUser.id }, process.env.JWT_SECRET);

  await createSession(token);

  return token;
}

export const generateValidEnrollmentBody = (user: User) => ({
  name: faker.name.findName(),
  cpf: generateCPF(),
  birthday: faker.date.past().toISOString(),
  phone: "(21) 98999-9999",
  userId: user.id
});

export async function createEnrollment(user: User) {
  const enrollment = generateValidEnrollmentBody(user);

  return await prisma.enrollment.create({
    data: enrollment
  });
}

async function createTicketType(isRemote: boolean, includesHotel: boolean) {
  return await prisma.ticketType.create({
    data: {
      name: faker.name.findName(),
      price: faker.datatype.number(),
      isRemote: isRemote,
      includesHotel: includesHotel
    }
  });
}

export async function createTicket(enrollment: Enrollment, isRemote: boolean, includesHotel: boolean, isPaid: boolean) {
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

export async function getHotels() {
  return await prisma.hotel.findMany();
}

export async function getHotelWithRoom(id: number) {
  return await prisma.hotel.findFirst({
    where: {
      id: id
    },
    include: {
      Rooms: true
    }
  });
}

export async function createHotel() {
  return await prisma.hotel.create({
    data: {
      name: faker.name.findName(),
      image: faker.image.imageUrl()
    }
  });
}

export async function createRoom(hotelId: number) {
  return await prisma.room.create({
    data: {
      name: faker.name.findName(),
      capacity: faker.datatype.number(),
      hotelId: hotelId
    }
  });
}
