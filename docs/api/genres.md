# Genres API

## Overview

Manage article genres. Genres are broad categories used to organize articles with visual color coding.

## Endpoints

### Get All Genres

**`GET /api/genres`**

Retrieves all genres for the authenticated user with article counts.

#### Response

**Success (200):**
```typescript
{
  data: Array<{
    id: string;
    name: string;
    color: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    _count: {
      articles: number; // Number of articles with this genre
    };
  }>
}
```

#### Example

```bash
curl http://localhost:3000/api/genres
```

**Example Response:**
```json
{
  "data": [
    {
      "id": "genre123",
      "name": "Programming",
      "color": "#3B82F6",
      "userId": "user123",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "_count": {
        "articles": 15
      }
    }
  ]
}
```

### Create Genre

**`POST /api/genres`**

Creates a new genre.

#### Request Body

```typescript
{
  name: string; // Genre name (max 50 characters)
  color?: string; // Hex color code (optional, defaults to #3B82F6)
}
```

#### Response

**Success (201):**
```typescript
{
  data: {
    id: string;
    name: string;
    color: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
  },
  message: "Genre created successfully"
}
```

**Error Examples:**
- `400` - Missing name or name too long (>50 characters)
- `400` - Invalid color format
- `409` - Genre name already exists for this user

#### Example

```bash
curl -X POST http://localhost:3000/api/genres \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Machine Learning",
    "color": "#10B981"
  }'
```

### Update Genre

**`PUT /api/genres/[id]`**

Updates an existing genre.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Genre ID |

#### Request Body

```typescript
{
  name: string; // New genre name (max 50 characters)
  color: string; // New hex color code
}
```

#### Response

**Success (200):**
```typescript
{
  data: {
    id: string;
    name: string;
    color: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
  },
  message: "Genre updated successfully"
}
```

**Error Examples:**
- `400` - Missing required fields or invalid data
- `404` - Genre not found
- `403` - User doesn't own the genre
- `409` - Genre name already exists for this user

#### Example

```bash
curl -X PUT http://localhost:3000/api/genres/genre123 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "AI & Machine Learning",
    "color": "#8B5CF6"
  }'
```

### Delete Genre

**`DELETE /api/genres/[id]`**

Deletes a genre if no articles are associated with it.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Genre ID |

#### Response

**Success (200):**
```typescript
{
  message: "Genre deleted successfully"
}
```

**Error Examples:**
- `400` - Cannot delete genre with associated articles
- `404` - Genre not found
- `403` - User doesn't own the genre

#### Example

```bash
curl -X DELETE http://localhost:3000/api/genres/genre123
```

## Data Models

### Genre
```typescript
interface Genre {
  id: string;
  name: string;
  color: string; // Hex color code (e.g., "#3B82F6")
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Business Rules

### Authorization
- Users can only manage their own genres
- All operations require authentication

### Validation
- Genre name is required and must be ≤50 characters
- Genre names must be unique per user
- Color must be a valid hex color code
- Default color is `#3B82F6` (blue)

### Deletion Rules
- Genres can only be deleted if no articles are associated
- Use the article count from the GET endpoint to check associations
- Remove all article associations before deleting a genre

### Naming Conventions
- Genre names are case-sensitive
- Recommended to use title case (e.g., "Machine Learning")
- Keep names broad and categorical

## Usage Patterns

### Typical Workflow
1. Create genres for broad categories
2. Associate articles with genres using Article-Genre API
3. Use genres for filtering and organization
4. Update genre colors for visual organization
5. Check article count before deletion

### Best Practices
- Use genres for broad categorization (vs. tags for specific topics)
- Choose distinct colors for visual differentiation
- Keep genre names concise but descriptive
- Avoid creating too many genres (diminishes organization value)

### Suggested Genre Examples
- Programming
- Design
- Business
- Science
- Technology
- Personal Development
- News
- Entertainment

## Color Management

### Recommended Colors
- `#3B82F6` - Blue (default)
- `#10B981` - Green
- `#F59E0B` - Yellow
- `#EF4444` - Red
- `#8B5CF6` - Purple
- `#06B6D4` - Cyan
- `#F97316` - Orange
- `#84CC16` - Lime

### Color Format
- Must be hex format with # prefix
- Both 3-digit (#RGB) and 6-digit (#RRGGBB) formats supported
- Case-insensitive

## Related APIs

- [Articles API](./articles.md) - For filtering articles by genre
- [Article-Genre Association](./article-genres.md) - For managing article-genre relationships
- [Statistics API](./stats.md) - For genre usage analytics

## Error Handling

Common error scenarios:

- **400 Bad Request**: Invalid data format or business rule violation
- **403 Forbidden**: User doesn't own the genre
- **404 Not Found**: Genre doesn't exist
- **409 Conflict**: Duplicate genre name or articles still associated

Always check the article count before attempting to delete a genre.