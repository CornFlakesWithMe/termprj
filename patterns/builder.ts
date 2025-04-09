// Builder Pattern for Car Listing Creation
import { Car, DateRange } from "@/types";

export class CarBuilder {
  private car: Partial<Car> = {};

  constructor() {
    this.car.id = Date.now().toString();
    this.car.createdAt = new Date().toISOString();
    this.car.isAvailable = true;
    this.car.bookings = [];
    this.car.rating = 0;
    this.car.reviewCount = 0;
    this.car.availabilityCalendar = [];
  }

  setOwnerId(ownerId: string): CarBuilder {
    this.car.ownerId = ownerId;
    return this;
  }

  setMake(make: string): CarBuilder {
    this.car.make = make;
    return this;
  }

  setModel(model: string): CarBuilder {
    this.car.model = model;
    return this;
  }

  setYear(year: number): CarBuilder {
    this.car.year = year;
    return this;
  }

  setType(type: string): CarBuilder {
    this.car.type = type;
    return this;
  }

  setSeats(seats: number): CarBuilder {
    this.car.seats = seats;
    return this;
  }

  setColor(color: string): CarBuilder {
    this.car.color = color;
    return this;
  }

  setLicensePlate(licensePlate: string): CarBuilder {
    this.car.licensePlate = licensePlate;
    return this;
  }

  setMileage(mileage: number): CarBuilder {
    this.car.mileage = mileage;
    return this;
  }

  setPricePerDay(pricePerDay: number): CarBuilder {
    this.car.pricePerDay = pricePerDay;
    return this;
  }

  setLocation(address: string, latitude: number, longitude: number): CarBuilder {
    this.car.location = {
      address,
      latitude,
      longitude,
    };
    return this;
  }

  setDescription(description: string): CarBuilder {
    this.car.description = description;
    return this;
  }

  setImages(images: string[]): CarBuilder {
    this.car.images = images;
    return this;
  }

  setFeatures(features: string[]): CarBuilder {
    this.car.features = features;
    return this;
  }

  setAvailability(availability: DateRange[]): CarBuilder {
    this.car.availabilityCalendar = availability;
    return this;
  }

  build(): Car {
    if (!this.car.ownerId) throw new Error("Owner ID is required");
    if (!this.car.make) throw new Error("Make is required");
    if (!this.car.model) throw new Error("Model is required");
    if (!this.car.year) throw new Error("Year is required");
    if (!this.car.type) throw new Error("Type is required");
    if (!this.car.seats) throw new Error("Number of seats is required");
    if (!this.car.color) throw new Error("Color is required");
    if (!this.car.licensePlate) throw new Error("License plate is required");
    if (!this.car.mileage) throw new Error("Mileage is required");
    if (!this.car.pricePerDay) throw new Error("Price per day is required");
    if (!this.car.location) throw new Error("Location is required");

    return this.car as Car;
  }
}

export class CarDirector {
  private builder: CarBuilder;

  constructor(builder: CarBuilder) {
    this.builder = builder;
  }

  public createBasicCar(ownerId: string, make: string, model: string, year: number): Car {
    return this.builder
      .setOwnerId(ownerId)
      .setMake(make)
      .setModel(model)
      .setYear(year)
      .setPricePerDay(50)
      .setLocation("Default Address", 0, 0)
      .setDescription("Basic car listing")
      .build();
  }

  public createFullCar(
    ownerId: string,
    make: string,
    model: string,
    year: number,
    type: string,
    seats: number,
    color: string,
    licensePlate: string,
    images: string[],
    pricePerDay: number,
    location: { address: string; latitude: number; longitude: number },
    features: string[],
    description: string
  ): Car {
    return this.builder
      .setOwnerId(ownerId)
      .setMake(make)
      .setModel(model)
      .setYear(year)
      .setType(type)
      .setSeats(seats)
      .setColor(color)
      .setLicensePlate(licensePlate)
      .setMileage(0)
      .setPricePerDay(pricePerDay)
      .setLocation(location.address, location.latitude, location.longitude)
      .setDescription(description)
      .setImages(images)
      .setFeatures(features)
      .build();
  }
}