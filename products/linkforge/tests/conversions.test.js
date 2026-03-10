// tests/conversions.test.js - Tests for conversion tracking

const request = require('supertest');
const { PrismaClient } = require('@prisma/client');

const app = require('../server/index');
const prisma = new PrismaClient();

describe('Conversion Tracking', () => {
  let testLink;

  beforeAll(async () => {
    testLink = await prisma.link.create({
      data: {
        slug: 'conversion-test',
        targetUrl: 'https://example.com/product',
        clicks: 0
      }
    });
  });

  afterAll(async () => {
    await prisma.clickEvent.deleteMany({
      where: { linkId: testLink.id }
    });
    await prisma.link.delete({
      where: { id: testLink.id }
    });
    await prisma.$disconnect();
  });

  test('should track conversion event', async () => {
    const response = await request(app)
      .post('/api/conversions')
      .send({
        linkId: testLink.id,
        conversionType: 'purchase',
        value: 29.99,
        extra: { productId: 'prod_123' }
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.conversion.conversionType).toBe('purchase');
    expect(response.body.conversion.value).toBe(29.99);
  });

  test('should require linkId and conversionType', async () => {
    const response = await request(app)
      .post('/api/conversions')
      .send({
        value: 10.00
      })
      .expect(400);

    expect(response.body.error).toContain('Missing required fields');
  });

  test('should fetch conversion data for link', async () => {
    // Create a conversion
    await request(app)
      .post('/api/conversions')
      .send({
        linkId: testLink.id,
        conversionType: 'signup',
        value: 0
      });

    // Fetch conversions
    const response = await request(app)
      .get(`/api/conversions/${testLink.id}`)
      .expect(200);

    expect(response.body.totalConversions).toBeGreaterThan(0);
    expect(response.body.conversions).toBeInstanceOf(Array);
  });

  test('should calculate total conversion value', async () => {
    // Create multiple conversions
    await Promise.all([
      request(app)
        .post('/api/conversions')
        .send({
          linkId: testLink.id,
          conversionType: 'purchase',
          value: 50.00
        }),
      request(app)
        .post('/api/conversions')
        .send({
          linkId: testLink.id,
          conversionType: 'purchase',
          value: 75.00
        })
    ]);

    const response = await request(app)
      .get(`/api/conversions/${testLink.id}`)
      .expect(200);

    expect(response.body.totalValue).toBeGreaterThanOrEqual(125.00);
  });
});
