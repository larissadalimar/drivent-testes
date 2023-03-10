import { AuthenticatedRequest } from "@/middlewares";
import { Response } from "express";
import hotelService from "@/services/hotels-service";

export async function getAllHotels(req: AuthenticatedRequest, res: Response) {
  try {
    const hotels = await hotelService.getAll(req.userId);

    res.send(hotels);
  } catch (error) {
    if(error.name === "NotFoundError") res.sendStatus(404);
    if(error.status === 402) res.sendStatus(402);
    else res.status(500).send(error.message);
  }
}

export async function getHotelRooms(req: AuthenticatedRequest, res: Response) {
  const hotelId = Number(req.params.hotelId);

  if(!hotelId) res.sendStatus(404);
    
  try {
    const hotelWithRooms = await hotelService.getHotelRooms(hotelId, req.userId);

    res.send(hotelWithRooms);
  } catch (error) {
    if(error.name === "NotFoundError") res.sendStatus(404);
    if(error.status === 402) res.sendStatus(402);
    res.status(500).send(error.message);
  }
}
