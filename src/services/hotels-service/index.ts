import { notFoundError, requestError } from "@/errors";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { Hotel, Room, TicketStatus } from "@prisma/client";
import hotelRepository from "@/repositories/hotel-repository";

async function getAll(userId: number): Promise<Hotel[]> {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);

  if(!enrollment) throw notFoundError();

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  
  if(!ticket) throw notFoundError();

  if(ticket.status !== TicketStatus.PAID || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel)
    throw requestError(402, "Ticket não pago, é remoto ou não inclui hotel");

  return await hotelRepository.getAll();
}

async function getHotelRooms(hotelId: number, userId: number): Promise< Hotel & { Rooms: Room[]} > {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);

  if(!enrollment) throw notFoundError();

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);

  if(!ticket) throw notFoundError();

  if(ticket.status !== TicketStatus.PAID || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel)
    throw requestError(402, "Ticket não pago, é remoto ou não inclui hotel");

  const hotel = await hotelRepository.getHotelWithRooms(hotelId);

  if(!hotel) throw notFoundError();
  
  return hotel;
}

const hotelService = {
  getAll,
  getHotelRooms
};

export default hotelService;
