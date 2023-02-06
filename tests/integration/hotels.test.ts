import app, { init } from "@/app";
import faker from "@faker-js/faker";
import httpStatus from "http-status";
import supertest from "supertest";
import { createEnrollment, createHotel, createRoom, createTicketForHotel, createUser, getHotels, getHotelWithRoom } from "../factories";
import * as jwt from "jsonwebtoken";
import { cleanDb, generateValidToken } from "../helpers";
import { prisma } from "@/config";

const server = supertest(app);

beforeAll( async () => {
  await init();
  await cleanDb();
  await prisma.hotel.createMany({
    data: [
      {
        name: "Copacabana Palace",
        image: "https://img.belmond.com/f_auto/t_2580x1299/photos/cop/cop-din-pool06.jpg"
      },
      {
        name: "Hilton Copacabana",
        image: "https://www.tevejopelomundo.com.br/wp-content/uploads/2019/02/hotel-Hilton-copacabana.jpg"
      }
    ]
  }); 
});

describe("GET /hotels", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/hotels");
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
    
  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
    
    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
    
  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    
    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond 404 if user does not have an enrollment", async () => {
      const token = await generateValidToken();

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });
  
    it("should respond 404 if the user enrollment does not have a ticket", async () => {
      const userWithEnrollment = await createUser();

      await createEnrollment(userWithEnrollment);

      const token = await generateValidToken(userWithEnrollment);

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });
  
    it("should respond 402 if the user enrollment ticket is not paid", async () => {
      const userWithEnrollment = await createUser();

      const enrollmentWithTicket = await createEnrollment(userWithEnrollment);

      await createTicketForHotel(enrollmentWithTicket, false, true, false);

      const token = await generateValidToken(userWithEnrollment);

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });
  
    it("should respond 402 if the user enrollment ticket is remote", async () => {
      const userWithEnrollment = await createUser();

      const enrollmentWithTicket = await createEnrollment(userWithEnrollment);

      await createTicketForHotel(enrollmentWithTicket, true, true, true);

      const token = await generateValidToken(userWithEnrollment);

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it("should respond 402 if the user enrollment ticket does not include hotel", async () => {
      const userWithEnrollment = await createUser();

      const enrollmentWithTicket = await createEnrollment(userWithEnrollment);

      await createTicketForHotel(enrollmentWithTicket, false, false, true);

      const token = await generateValidToken(userWithEnrollment);

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it("should respond 200 and return the hotel list if it is all correct", async () => {
      const userWithEnrollment = await createUser();

      const enrollmentWithTicket = await createEnrollment(userWithEnrollment);

      await createTicketForHotel(enrollmentWithTicket, false, true, true);

      const token = await generateValidToken(userWithEnrollment);

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      const hotels = await getHotels();

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual([
        {
          id: hotels[0].id,
          name: hotels[0].name,
          image: hotels[0].image,
          createdAt: hotels[0].createdAt.toISOString(),
          updatedAt: hotels[0].updatedAt.toISOString(),
        },
        {
          id: hotels[1].id,
          name: hotels[1].name,
          image: hotels[1].image,
          createdAt: hotels[1].createdAt.toISOString(),
          updatedAt: hotels[1].updatedAt.toISOString(),
        }
      ]); 
    });
  }); 
});

describe("GET /hotels/hotelId", () => {
  it("should respond with status 401 if no token is given", async () => {
    const hotels = await getHotels();
    const response = await server.get(`/hotels/${hotels[0].id}`);
        
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
        
  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
    const hotels = await getHotels();

    const response = await server.get(`/hotels/${hotels[0].id}`).set("Authorization", `Bearer ${token}`);
        
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
        
  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    const hotels = await getHotels();

    const response = await server.get(`/hotels/${hotels[0].id}`).set("Authorization", `Bearer ${token}`);
        
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond 404 if user does not have an enrollment", async () => {
      const token = await generateValidToken();
      const hotels = await getHotels();

      const response = await server.get(`/hotels/${hotels[0].id}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });
  
    it("should respond 404 if the user enrollment does not have a ticket", async () => {
      const userWithEnrollment = await createUser();

      await createEnrollment(userWithEnrollment);

      const token = await generateValidToken(userWithEnrollment);

      const hotels = await getHotels();
      const response = await server.get(`/hotels/${hotels[0].id}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });
  
    it("should respond 402 if the user enrollment ticket is not paid", async () => {
      const userWithEnrollment = await createUser();

      const enrollmentWithTicket = await createEnrollment(userWithEnrollment);

      await createTicketForHotel(enrollmentWithTicket, false, true, false);

      const token = await generateValidToken(userWithEnrollment);

      const hotels = await getHotels();
      const response = await server.get(`/hotels/${hotels[0].id}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });
  
    it("should respond 402 if the user enrollment ticket is remote", async () => {
      const userWithEnrollment = await createUser();

      const enrollmentWithTicket = await createEnrollment(userWithEnrollment);

      await createTicketForHotel(enrollmentWithTicket, true, true, true);

      const token = await generateValidToken(userWithEnrollment);

      const hotels = await getHotels();
      const response = await server.get(`/hotels/${hotels[0].id}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it("should respond 402 if the user enrollment ticket does not include hotel", async () => {
      const userWithEnrollment = await createUser();

      const enrollmentWithTicket = await createEnrollment(userWithEnrollment);

      await createTicketForHotel(enrollmentWithTicket, false, false, true);

      const token = await generateValidToken(userWithEnrollment);
    
      const hotels = await getHotels();
      const response = await server.get(`/hotels/${hotels[0].id}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it("should respond 200 and return the hotel with its rooms if it is all correct", async () => {
      const userWithEnrollment = await createUser();

      const enrollmentWithTicket = await createEnrollment(userWithEnrollment);

      await createTicketForHotel(enrollmentWithTicket, false, true, true);

      const token = await generateValidToken(userWithEnrollment);

      const hotel = await createHotel();

      const room = await createRoom(hotel.id);

      const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);

      const hotelResponse = await getHotelWithRoom(hotel.id);

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual(
        {
          id: hotelResponse.id,
          name: hotelResponse.name,
          image: hotelResponse.image,
          createdAt: hotelResponse.createdAt.toISOString(),
          updatedAt: hotelResponse.updatedAt.toISOString(),
          Rooms: [
            {
              id: room.id,
              name: room.name,
              capacity: room.capacity,
              hotelId: room.hotelId,
              createdAt: room.createdAt.toISOString(),
              updatedAt: room.updatedAt.toISOString()
            }
          ]
        }
      ); 
    });
  });
}); 
