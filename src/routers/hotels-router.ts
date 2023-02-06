import { getAllHotels, getHotelRooms } from "@/controllers/hotels-controller";
import { authenticateToken } from "@/middlewares";
import { Router } from "express";

const hotelRouter = Router();

hotelRouter
  .all("/*", authenticateToken)
  .get("", getAllHotels)
  .get("/:hotelId", getHotelRooms);

export { hotelRouter };
