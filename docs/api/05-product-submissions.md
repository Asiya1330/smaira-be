# Product submissions — `product-submissions`

**Method:** `POST`  
**Auth:** `Authorization: Bearer <user_jwt>` (submitter is inferred from the token)

**Body (JSON)**

| Field | Required |
|-------|----------|
| product_name | Yes |
| barcode | Yes |
| brand | No |
| category | No |
| image_url | No |
| ingredients | No |

**Example**

```http
POST /functions/v1/product-submissions
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "product_name": "Unknown lotion",
  "barcode": "1234567890123",
  "brand": null,
  "ingredients": "Water, Glycerin, ..."
}
```

**Response:** `{ "success": true, "data": { "id": "...", "status": "pending" } }` (HTTP 201)
