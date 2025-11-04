// FIX: Changed from '~/fixtures/baseTest' to relative path
import { test, expect } from '@playwright/test';
import { APIRequestContext } from '../fixtures/baseTest'; 

test.describe('Swagger Petstore API GET Test', () => {
    
    const petId = 1;
    const petUrl = `https://petstore.swagger.io/v2/pet/${petId}`;

    test('should successfully retrieve pet ID 1 and verify basic structure', async ({ request }: { request: APIRequestContext }) => {
        
        await test.step(`Retrieve pet ${petId} via GET request`, async () => {
            
            const getResponse = await request.get(petUrl, {
                headers: {
                    'accept': 'application/json' 
                }
            });

            expect(getResponse.status(), `Expected Status 200 for ${petId}. Received: ${getResponse.status()}`).toBe(200);
            expect(getResponse.headers()['content-type']).toContain('application/json');

            const pet = await getResponse.json();
            
            expect(pet.id).toBe(petId);
            expect(typeof pet.status).toBe('string');
            expect(pet.status.length).toBeGreaterThan(0);
            
            console.log(`✅ Successfully retrieved pet ID ${petId} (${pet.name}) with status: ${pet.status}`);
        });
    });
});
