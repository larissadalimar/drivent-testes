import { prisma } from "@/config";
import { Hotel, Room } from "@prisma/client";

async function getAll(): Promise<Hotel[]> {
  return await prisma.hotel.findMany();
}

async function getHotelWithRooms(hotelId: number): Promise<Hotel & { Rooms: Room[]}> {
  return await prisma.hotel.findFirst({
    where: { id: hotelId },
    include: {
      Rooms: true
    }
  });
}

const hotelRepository = {
  getAll,
  getHotelWithRooms
};

export default hotelRepository;
