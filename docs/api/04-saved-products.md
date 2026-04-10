# Saved products — `saved-products`

Requires `Authorization: Bearer <user_jwt>`.

## List saved

**Method:** `GET`

```http
GET /functions/v1/saved-products
Authorization: Bearer <jwt>
```

**Response:** `data` is an array of `{ id, product_id, saved_at, product }`.

## Save a product

**Method:** `POST`  
**Body:** `{ "product_id": "<uuid>" }`

```http
POST /functions/v1/saved-products
Authorization: Bearer <jwt>
Content-Type: application/json

{"product_id":"00000000-0000-0000-0000-000000000000"}
```

## Remove saved

**Method:** `DELETE`  
**Query:** `productId` (uuid)

```http
DELETE /functions/v1/saved-products?productId=00000000-0000-0000-0000-000000000000
Authorization: Bearer <jwt>
```
