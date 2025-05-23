import { Car, User, Booking, Message, Review } from "@/types";

export const MOCK_USERS: User[] = [
  {
    id: "1",
    email: "john@example.com",
    name: "John Doe",
    phone: "+1 (555) 123-4567",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36",
    securityQuestions: [
      { question: "What was your first pet's name?", answer: "Rex" },
      { question: "What city were you born in?", answer: "Boston" },
      { question: "What is your mother's maiden name?", answer: "Smith" }
    ],
    isCarOwner: true,
    balance: 1200,
    createdAt: new Date("2023-01-15").toISOString(),
  },
  {
    id: "2",
    email: "jane@example.com",
    name: "Jane Smith",
    phone: "+1 (555) 987-6543",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    securityQuestions: [
      { question: "What was your first pet's name?", answer: "Fluffy" },
      { question: "What city were you born in?", answer: "Chicago" },
      { question: "What is your mother's maiden name?", answer: "Johnson" }
    ],
    isCarOwner: false,
    balance: 800,
    createdAt: new Date("2023-02-20").toISOString(),
  },
  {
    id: "3",
    email: "mike@example.com",
    name: "Mike Johnson",
    phone: "+1 (555) 456-7890",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
    securityQuestions: [
      { question: "What was your first pet's name?", answer: "Buddy" },
      { question: "What city were you born in?", answer: "Seattle" },
      { question: "What is your mother's maiden name?", answer: "Williams" }
    ],
    isCarOwner: true,
    balance: 1500,
    createdAt: new Date("2023-03-10").toISOString(),
  },
];

export const MOCK_CARS: Car[] = [
  {
    id: "1",
    ownerId: "1",
    make: "Toyota",
    model: "Camry",
    year: 2020,
    type: "Sedan",
    seats: 5,
    color: "Silver",
    licensePlate: "ABC123",
    mileage: 25000,
    images: [
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2",
      "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d",
    ],
    pricePerDay: 50,
    location: {
      address: "123 Main St, New York, NY",
      latitude: 40.7128,
      longitude: -74.0060,
    },
    features: ["Bluetooth", "GPS", "Air Conditioning"],
    description: "A reliable and comfortable sedan perfect for city driving.",
    availabilityCalendar: [
      {
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    bookings: [],
    isAvailable: true,
    rating: 4.5,
    reviewCount: 12,
    createdAt: new Date("2023-01-15").toISOString(),
  },
  {
    id: "2",
    ownerId: "2",
    make: "Tesla",
    model: "Model 3",
    year: 2021,
    type: "Electric",
    seats: 5,
    color: "White",
    licensePlate: "XYZ789",
    mileage: 15000,
    images: [
      "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d",
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2",
    ],
    pricePerDay: 80,
    location: {
      address: "456 Oak Ave, Los Angeles, CA",
      latitude: 34.0522,
      longitude: -118.2437,
    },
    features: ["Autopilot", "Touch Screen", "Electric Charging"],
    description: "A modern electric vehicle with advanced features.",
    availabilityCalendar: [
      {
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    bookings: [],
    isAvailable: true,
    rating: 4.8,
    reviewCount: 8,
    createdAt: new Date("2023-02-20").toISOString(),
  },
  {
    id: "3",
    ownerId: "3",
    make: "Honda",
    model: "CR-V",
    year: 2019,
    type: "SUV",
    seats: 5,
    color: "Black",
    licensePlate: "DEF456",
    mileage: 35000,
    images: [
      "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d",
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2",
    ],
    pricePerDay: 60,
    location: {
      address: "789 Pine St, Chicago, IL",
      latitude: 41.8781,
      longitude: -87.6298,
    },
    features: ["4WD", "Roof Rack", "Spare Tire"],
    description: "A spacious SUV ideal for family trips.",
    availabilityCalendar: [
      {
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    bookings: [],
    isAvailable: true,
    rating: 4.2,
    reviewCount: 15,
    createdAt: new Date("2023-03-10").toISOString(),
  },
];

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: "1",
    carId: "1",
    renterId: "2",
    startDate: new Date("2023-08-10").toISOString(),
    endDate: new Date("2023-08-15").toISOString(),
    totalPrice: 425,
    status: "completed",
    createdAt: new Date("2023-07-25").toISOString(),
  },
  {
    id: "2",
    carId: "3",
    renterId: "2",
    startDate: new Date("2023-09-05").toISOString(),
    endDate: new Date("2023-09-08").toISOString(),
    totalPrice: 285,
    status: "upcoming",
    createdAt: new Date("2023-08-20").toISOString(),
  },
  {
    id: "3",
    carId: "2",
    renterId: "1",
    startDate: new Date("2023-08-20").toISOString(),
    endDate: new Date("2023-08-22").toISOString(),
    totalPrice: 130,
    status: "completed",
    createdAt: new Date("2023-08-01").toISOString(),
  },
];

export const MOCK_MESSAGES: Message[] = [
  {
    id: "1",
    senderId: "2",
    receiverId: "1",
    bookingId: "1",
    content: "Hi, I'm interested in renting your Tesla. Is it available for the dates I selected?",
    createdAt: new Date("2023-07-23T10:30:00").toISOString(),
    read: true,
  },
  {
    id: "2",
    senderId: "1",
    receiverId: "2",
    bookingId: "1",
    content: "Yes, it's available! Feel free to book it through the app.",
    createdAt: new Date("2023-07-23T11:15:00").toISOString(),
    read: true,
  },
  {
    id: "3",
    senderId: "2",
    receiverId: "1",
    bookingId: "1",
    content: "Great! I've just made the booking. Where should I pick up the car?",
    createdAt: new Date("2023-07-23T11:45:00").toISOString(),
    read: true,
  },
  {
    id: "4",
    senderId: "1",
    receiverId: "2",
    bookingId: "1",
    content: "You can pick it up at 123 Main St. I'll meet you there at the start time.",
    createdAt: new Date("2023-07-23T12:30:00").toISOString(),
    read: true,
  },
  {
    id: "5",
    senderId: "2",
    receiverId: "3",
    bookingId: "3",
    content: "Hello, I'd like to rent your RAV4 for the weekend. Is it in good condition?",
    createdAt: new Date("2023-07-30T09:20:00").toISOString(),
    read: false,
  },
];

export const MOCK_REVIEWS: Review[] = [
  {
    id: "1",
    bookingId: "1",
    reviewerId: "2",
    targetId: "1",
    targetType: "user",
    rating: 5,
    comment: "John was very responsive and made the rental process smooth.",
    createdAt: new Date("2023-08-16").toISOString(),
  },
  {
    id: "2",
    bookingId: "1",
    reviewerId: "2",
    targetId: "1",
    targetType: "car",
    rating: 4,
    comment: "The Tesla was clean and fun to drive. Battery range was slightly less than expected.",
    createdAt: new Date("2023-08-16").toISOString(),
  },
  {
    id: "3",
    bookingId: "1",
    reviewerId: "1",
    targetId: "2",
    targetType: "user",
    rating: 5,
    comment: "Jane returned the car in perfect condition. Great renter!",
    createdAt: new Date("2023-08-17").toISOString(),
  },
  {
    id: "4",
    bookingId: "3",
    reviewerId: "1",
    targetId: "2",
    targetType: "car",
    rating: 5,
    comment: "The RAV4 was perfect for our weekend trip. Very comfortable and fuel-efficient.",
    createdAt: new Date("2023-08-23").toISOString(),
  },
];

export const SECURITY_QUESTIONS = [
  "What was your first pet's name?",
  "What city were you born in?",
  "What is your mother's maiden name?",
  "What was the name of your elementary school?",
  "What was your childhood nickname?",
  "What is the name of your favorite childhood friend?",
  "What street did you grow up on?",
  "What was the make of your first car?",
  "What is your favorite movie?",
];

export const CAR_TYPES = [
  "Sedan",
  "SUV",
  "Truck",
  "Convertible",
  "Coupe",
  "Hatchback",
  "Wagon",
  "Van",
  "Minivan",
  "Electric",
  "Hybrid",
  "Luxury",
  "Sports",
];

export const CAR_FEATURES = [
  "Air Conditioning",
  "Bluetooth",
  "Backup Camera",
  "Navigation",
  "Sunroof",
  "Heated Seats",
  "Leather Seats",
  "Cruise Control",
  "Apple CarPlay",
  "Android Auto",
  "Premium Sound",
  "Keyless Entry",
  "Autopilot",
  "All-Wheel Drive",
  "Fuel Efficient",
  "Child Seat",
  "Bike Rack",
  "Ski Rack",
  "Pet Friendly",
];