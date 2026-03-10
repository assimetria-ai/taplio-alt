// tests/redirect.test.js - Tests for redirect handler

const request = require('supertest');
const { PrismaClient } = require('@prisma/client');

// Mock Express app (you would import your actual app in practice)
const app = require('../server/index');
const prisma = new PrismaClient();

describe('Redirect Handler', () => {
  let testLink;

  beforeAll(async () => {
    // Create test link
    testLink = await prisma.link.create({
      data: {
        slug: 'test-slug',
        targetUrl: 'https://example.com',
        clicks: 0
      }
    });
  });

  afterAll(async () => {
    // Cleanup
    await prisma.clickEvent.deleteMany({
      where: { linkId: testLink.id }
    });
    await prisma.link.delete({
      where: { id: testLink.id }
    });
    await prisma.$disconnect();
  });

  test('should redirect to target URL', async () => {
    const response = await request(app)
      .get(`/${testLink.slug}`)
      .expect(302);

    expect(response.headers.location).toBe(testLink.targetUrl);
  });

  test('should return 404 for non-existent slug', async () => {
    const response = await request(app)
      .get('/nonexistent-slug')
      .expect(404);

    expect(response.body.error).toBe('Link not found');
  });

  test('should capture click event with analytics', async () => {
    await request(app)
      .get(`/${testLink.slug}`)
      .set('User-Agent', 'Mozilla/5.0')
      .set('Referer', 'https://google.com')
      .expect(302);

    // Wait a bit for async analytics capture
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify click event was created
    const clickEvents = await prisma.clickEvent.findMany({
      where: { linkId: testLink.id }
    });

    expect(clickEvents.length).toBeGreaterThan(0);
    expect(clickEvents[0].userAgent).toContain('Mozilla');
    expect(clickEvents[0].referer).toBe('https://google.com');
  });

  test('should increment click counter', async () => {
    const initialClicks = testLink.clicks;

    await request(app)
      .get(`/${testLink.slug}`)
      .expect(302);

    // Wait for async update
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify click count increased
    const updatedLink = await prisma.link.findUnique({
      where: { id: testLink.id }
    });

    expect(updatedLink.clicks).toBeGreaterThan(initialClicks);
  });
});
