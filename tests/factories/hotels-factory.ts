import { prisma } from "@/config";
import faker from "@faker-js/faker";

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
