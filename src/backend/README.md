# Shopping List Backend API

## Installation

```bash
cd src/backend
npm install
```

## Running the server

```bash
npm start
# or for development with auto-reload
npm run dev
```

The server will run on `http://localhost:3001`

## API Endpoints

### POST /shoppingList/create

Creates a new shopping list.

**Request Body (dtoIn):**
```json
{
  "name": "My Shopping List"
}
```

**Response (dtoOut):**
```json
{
  "awid": "uuid-string",
  "id": "uuid-string", 
  "name": "My Shopping List",
  "state": "active",
  "ownerUuIdentity": "user-identity"
}
```

### POST /shoppingList/get

Retrieves a shopping list by ID.

**Request Body (dtoIn):**
```json
{
  "id": "uuid-string"
}
```

**Response (dtoOut):**
```json
{
  "awid": "uuid-string",
  "id": "uuid-string",
  "name": "My Shopping List", 
  "state": "active",
  "ownerUuIdentity": "user-identity"
}
```

## Error Handling

All endpoints return errors in the uuAppErrorMap format:

```json
{
  "uuAppErrorMap": {
    "errorCode": {
      "type": "error",
      "message": "Error description",
      "paramMap": {}
    }
  }
}
```
