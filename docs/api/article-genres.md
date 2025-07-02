# Article-Genre Association API

## Overview

Manage the relationship between articles and genres. Users can associate multiple genres with articles and remove those associations.

## Endpoints

### Add Genre to Article

**`POST /api/articles/[id]/genres`**

Associates a genre with a specific article.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Article ID |

#### Request Body

```typescript
{
  genreId: string; // ID of the genre to associate
}
```

#### Response

**Success (200):**
```typescript
{
  message: "Genre added to article successfully"
}
```

**Error Examples:**
- `400` - Missing or invalid genreId
- `404` - Article or genre not found
- `409` - Genre already associated with article
- `403` - User doesn't own the article or genre

#### Example

```bash
curl -X POST http://localhost:3000/api/articles/article123/genres \
  -H "Content-Type: application/json" \
  -d '{"genreId": "genre456"}'
```

### Remove Genre from Article

**`DELETE /api/articles/[id]/genres`**

Removes a genre association from a specific article.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Article ID |

#### Request Body

```typescript
{
  genreId: string; // ID of the genre to remove
}
```

#### Response

**Success (200):**
```typescript
{
  message: "Genre removed from article successfully"
}
```

**Error Examples:**
- `400` - Missing or invalid genreId
- `404` - Article, genre, or association not found
- `403` - User doesn't own the article or genre

#### Example

```bash
curl -X DELETE http://localhost:3000/api/articles/article123/genres \
  -H "Content-Type: application/json" \
  -d '{"genreId": "genre456"}'
```

## Business Rules

### Authorization
- Users can only manage associations for articles they own
- Users can only associate genres they own
- All operations require authentication

### Validation
- Article must exist and belong to the user
- Genre must exist and belong to the user
- Cannot create duplicate associations
- Cannot remove non-existent associations

### Data Integrity
- Associations are automatically cleaned up when articles or genres are deleted
- Many-to-many relationship allows articles to have multiple genres
- Many-to-many relationship allows genres to be used by multiple articles

## Usage Patterns

### Typical Workflow
1. Create articles using the Articles API
2. Create genres using the Genres API
3. Associate genres with articles using this API
4. Query articles with genre filters using the Articles API

### Best Practices
- Check if association already exists before creating
- Validate genre ownership before association
- Handle 409 conflicts gracefully in UI
- Use bulk operations for multiple associations

## Related APIs

- [Articles API](./articles.md) - For creating and querying articles
- [Genres API](./genres.md) - For managing genres
- [Statistics API](./stats.md) - For analytics including genre usage

## Error Handling

The API provides specific error messages for different failure scenarios:

- **400 Bad Request**: Invalid or missing genreId
- **403 Forbidden**: User doesn't own the article or genre
- **404 Not Found**: Article, genre, or association doesn't exist
- **409 Conflict**: Attempting to create duplicate association

Always check the error message for specific details about what went wrong.