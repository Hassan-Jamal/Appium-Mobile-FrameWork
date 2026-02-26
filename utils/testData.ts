import { faker } from '@faker-js/faker';

// ── User Data ──────────────────────────────────────────────────────────────

export interface UserData {
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    password: string;
    phone: string;
    username: string;
}

/**
 * Generate random user credentials and profile data
 */
export function generateUser(): UserData {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    return {
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        password: `${faker.internet.password({ length: 10 })}@1`,
        phone: faker.phone.number(),
        username: faker.internet.username({ firstName, lastName }).toLowerCase(),
    };
}

// ── Item / Product Data ────────────────────────────────────────────────────

export interface ItemData {
    title: string;
    description: string;
    category: string;
    price: string;
    quantity: number;
}

/**
 * Generate random product/item data for CRUD tests
 */
export function generateItem(): ItemData {
    return {
        title: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        category: faker.commerce.department(),
        price: faker.commerce.price({ min: 1, max: 500 }),
        quantity: faker.number.int({ min: 1, max: 100 }),
    };
}

// ── Address Data ───────────────────────────────────────────────────────────

export interface AddressData {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

/**
 * Generate random address data
 */
export function generateAddress(): AddressData {
    return {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zipCode: faker.location.zipCode(),
        country: faker.location.country(),
    };
}

// ── Comment / Message Data ─────────────────────────────────────────────────

export interface CommentData {
    title: string;
    body: string;
    rating: number;
}

/**
 * Generate random comment/review data
 */
export function generateComment(): CommentData {
    return {
        title: faker.lorem.sentence({ min: 3, max: 8 }),
        body: faker.lorem.paragraph({ min: 1, max: 3 }),
        rating: faker.number.int({ min: 1, max: 5 }),
    };
}

// ── Date / Time Helpers ────────────────────────────────────────────────────

/**
 * Generate a future date (e.g., for scheduling tests)
 */
export function generateFutureDate(daysAhead: number = 7): string {
    const future = faker.date.future({ years: 0.5 });
    return future.toLocaleDateString('en-US');
}

/**
 * Generate a past date
 */
export function generatePastDate(daysAgo: number = 30): string {
    const past = faker.date.past({ years: 0.5 });
    return past.toLocaleDateString('en-US');
}

// ── Quick Generators ───────────────────────────────────────────────────────

export const testData = {
    /** Random alphanumeric string of given length */
    randomString: (length: number = 8) =>
        faker.string.alphanumeric({ length }),

    /** Random integer in range */
    randomInt: (min: number, max: number) =>
        faker.number.int({ min, max }),

    /** Random email */
    randomEmail: () =>
        faker.internet.email().toLowerCase(),

    /** Random URL */
    randomUrl: () =>
        faker.internet.url(),

    /** Unique ID */
    uniqueId: () =>
        faker.string.uuid(),
};

export default {
    generateUser,
    generateItem,
    generateAddress,
    generateComment,
    generateFutureDate,
    generatePastDate,
    testData,
};
