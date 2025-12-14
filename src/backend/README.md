# Shopping List Backend API

A Node.js/Express backend API for managing shopping lists with MongoDB persistence.

- **MongoDB Integration**: Full CRUD operations with MongoDB
- **Authentication**: User identity-based access control
- **Validation**: Comprehensive input validation and error handling
- **Soft Delete**: Lists are marked as deleted, not permanently removed
- **Pagination**: Efficient pagination for list retrieval
- **API Testing**: Complete Insomnia collection included

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

1. **Install dependencies:**

   ```bash
   cd src/backend
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the backend directory:

   ```env
   PORT=3001
   MONGODB_URI=mongodb://localhost:27017/shopping-list-db
   NODE_ENV=development
   ```

3. **Start MongoDB:**
   - Local: `mongod`
   - Or use MongoDB Atlas cloud service

4. **Start the server:**
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

## API Endpoints

### Base URL: `http://localhost:3001`

All endpoints require the `x-user-identity` header for authentication.

### 1. **POST /shoppingList/create**

**Auth:** Owner  
Creates a new shopping list.

**Request Body:**

```json
{
  "name": "Weekly Groceries"
}
```

**Response:**

```json
{
  "awid": "uuid-string",
  "id": "mongodb-object-id",
  "name": "Weekly Groceries",
  "state": "active",
  "owner  Identity": "user-123",
  "items": [],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 2. **GET /shoppingList/get**

**Auth:** Both (Owner/User)  
Retrieves a specific shopping list.

**Query Parameters:**

- `id`: Shopping list ID or AWID

**Response:**

```json
{
  "awid": "uuid-string",
  "id": "mongodb-object-id",
  "name": "Weekly Groceries",
  "state": "active",
  "ownerIdentity": "user-123",
  "items": [],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 3. **GET /shoppingList/myList**

**Auth:** User  
Retrieves all shopping lists for the authenticated user.

**Query Parameters:**

- `pageIndex`: Page number (0-based, default: 0)
- `pageSize`: Items per page (default: 10, max: 100)

**Response:**

```json
{
  "itemList": [
    {
      "awid": "uuid-string",
      "id": "mongodb-object-id",
      "name": "Weekly Groceries",
      "state": "active",
      "ownerIdentity": "user-123",
      "itemCount": 5,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pageInfo": {
    "pageIndex": 0,
    "pageSize": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

### 4. **PUT /shoppingList/update**

**Auth:** Owner  
Updates an existing shopping list.

**Request Body:**

```json
{
  "id": "shopping-list-id",
  "name": "Updated List Name"
}
```

**Response:**

```json
{
  "awid": "uuid-string",
  "id": "mongodb-object-id",
  "name": "Updated List Name",
  "state": "active",
  "ownerUuIdentity": "user-123",
  "items": [],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:01.000Z"
}
```

### 5. **DELETE /shoppingList/delete**

**Auth:** Owner  
Soft deletes a shopping list.

**Request Body:**

```json
{
  "id": "shopping-list-id"
}
```

**Response:**

```json
{
  "success": true,
  "id": "mongodb-object-id",
  "awid": "uuid-string"
}
```

## Error Handling

All endpoints return errors in the uuAppErrorMap format:

```json
{
  "uuAppErrorMap": {
    "errorType": {
      "type": "error",
      "message": "Error description",
      "paramMap": {
        "additionalInfo": "value"
      }
    }
  }
}
```

### Common Error Types:

- `validationError`: Input validation failed
- `shoppingListNotFound`: Requested list doesn't exist
- `unauthorizedAccess`: User lacks permission
- `serverError`: Internal server error

## Testing with Insomnia

1. **Import the collection:**
   - Open Insomnia
   - Import from file: `test/insomnia/shopping-list-api.json`

2. **Configure environment:**
   - Set `base_url`: `http://localhost:3001`
   - Set `user_identity`: Your test user ID
   - Set `shopping_list_id`: Will be populated after creating a list

3. **Test workflow:**
   1. Create a shopping list
   2. Copy the returned `id` to `shopping_list_id` environment variable
   3. Test get, update, and delete operations
   4. Use myList to see all your lists

## Database Schema

### ShoppingList Collection:

```javascript
{
  awid: String (unique),
  name: String (required, 1-100 chars),
  state: String (enum: 'active', 'archived', 'deleted'),
  ownerIdentity: String (required),
  items: [{
    id: String,
    name: String,
    completed: Boolean,
    addedAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

## Development

- **Start with auto-reload:** `npm run dev`
- **Linting:** `npm run lint`
- **Testing:** Import Insomnia collection and test all endpoints

## Unit Tests

To run the Jest unit tests:

1. **Navigate to backend directory:**

   ```bash
   cd src/backend
   ```

2. **Run npm install in the backend directory:**

   ```bash
   npm install
   ```

3. **Run tests:**
   ```bash
   npm test
   ```
