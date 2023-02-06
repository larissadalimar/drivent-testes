import { AuthenticatedRequest } from "@/middlewares";
import { Response } from "express";
import hotelService from "@/services/hotels-service";

export async function getAllHotels(req: AuthenticatedRequest, res: Response) {
  try {
    const hotels = hotelService.getAll(req.userId);

    res.send(hotels);
  } catch (error) {
    if(error.status === 404) res.sendStatus(404);
    if(error.status === 402) res.sendStatus(402);
    else res.status(500).send(error.message);
  }
}

export async function getHotelRooms(req: AuthenticatedRequest, res: Response) {
  const hotelId = Number(req.params.hotelId);

  if(!hotelId) res.sendStatus(404);
    
  try {
    const hotelWithRooms = hotelService.getHotelRooms(hotelId, req.userId);

    res.send(hotelWithRooms);
  } catch (error) {
    res.status(500).send(error.message);
  }
}
