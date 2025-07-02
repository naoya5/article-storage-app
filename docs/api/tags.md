# Tags API

## Overview

Manage article tags. Tags are lightweight labels used for specific topics, keywords, or technologies.

## Endpoints

### Get All Tags

**`GET /api/tags`**

Retrieves all tags for the authenticated user with article counts.

#### Response

**Success (200):**
```typescript
{
  data: Array<{
    id: string;
    name: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    _count: {
      articles: number; // Number of articles with this tag
    };
  }>
}
```

#### Example

```bash
curl http://localhost:3000/api/tags
```

**Example Response:**
```json
{
  "data": [
    {
      "id": "tag123",
      "name": "react",
      "userId": "user123",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "_count": {
        "articles": 8
      }
    }
  ]
}
```

### Create Tag

**`POST /api/tags`**

Creates a new tag.

#### Request Body

```typescript
{
  name: string; // Tag name (max 30 characters)
}
```

#### Response

**Success (201):**
```typescript
{
  data: {
    id: string;
    name: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
  },
  message: "Tag created successfully"
}
```

**Error Examples:**
- `400` - Missing name or name too long (>30 characters)
- `409` - Tag name already exists for this user

#### Example

```bash
curl -X POST http://localhost:3000/api/tags \
  -H "Content-Type: application/json" \
  -d '{
    "name": "typescript"
  }'
```

### Update Tag

**`PUT /api/tags/[id]`**

Updates an existing tag.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Tag ID |

#### Request Body

```typescript
{
  name: string; // New tag name (max 30 characters)
}
```

#### Response

**Success (200):**
```typescript
{
  data: {
    id: string;
    name: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
  },
  message: "Tag updated successfully"
}
```

**Error Examples:**
- `400` - Missing name or name too long
- `404` - Tag not found
- `403` - User doesn't own the tag
- `409` - Tag name already exists for this user

#### Example

```bash
curl -X PUT http://localhost:3000/api/tags/tag123 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "react-hooks"
  }'
```

### Delete Tag

**`DELETE /api/tags/[id]`**

Deletes a tag if no articles are associated with it.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Tag ID |

#### Response

**Success (200):**
```typescript
{
  message: "Tag deleted successfully"
}
```

**Error Examples:**
- `400` - Cannot delete tag with associated articles
- `404` - Tag not found
- `403` - User doesn't own the tag

#### Example

```bash
curl -X DELETE http://localhost:3000/api/tags/tag123
```

## Data Models

### Tag
```typescript
interface Tag {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Business Rules

### Authorization
- Users can only manage their own tags
- All operations require authentication

### Validation
- Tag name is required and must be ≤30 characters
- Tag names must be unique per user
- No color or additional metadata (unlike genres)

### Deletion Rules
- Tags can only be deleted if no articles are associated
- Use the article count from the GET endpoint to check associations
- Remove all article associations before deleting a tag

### Naming Conventions
- Tag names are case-sensitive
- Recommended to use lowercase for consistency
- Use hyphens for multi-word tags (e.g., "react-hooks")
- Keep names concise and specific

## Usage Patterns

### Typical Workflow
1. Create tags for specific topics or keywords
2. Associate articles with tags using Article-Tag API
3. Use tags for detailed filtering and search
4. Update tag names for consistency
5. Check article count before deletion

### Best Practices
- Use tags for specific topics (vs. genres for broad categories)
- Maintain consistent naming conventions
- Use lowercase for better organization
- Combine with hyphens for multi-word concepts
- Create tags as needed rather than pre-defining

### Tag Categories & Examples

**Technologies:**
- `javascript`, `typescript`, `react`, `nextjs`, `nodejs`

**Concepts:**
- `hooks`, `state-management`, `authentication`, `testing`

**Patterns:**
- `design-patterns`, `best-practices`, `performance`

**Difficulty:**
- `beginner`, `intermediate`, `advanced`

**Content Type:**
- `tutorial`, `documentation`, `opinion`, `news`

## Comparison with Genres

| Aspect | Tags | Genres |
|--------|------|--------|
| Character limit | 30 | 50 |
| Purpose | Specific topics/keywords | Broad categories |
| Color | No | Yes |
| Naming convention | lowercase-with-hyphens | Title Case |
| Quantity | Many (specific) | Few (broad) |
| Examples | `react-hooks`, `typescript` | `Programming`, `Design` |

## Related APIs

- [Articles API](./articles.md) - For filtering articles by tag
- [Article-Tag Association](./article-tags.md) - For managing article-tag relationships
- [Statistics API](./stats.md) - For tag usage analytics

## Error Handling

Common error scenarios:

- **400 Bad Request**: Invalid data format or business rule violation
- **403 Forbidden**: User doesn't own the tag
- **404 Not Found**: Tag doesn't exist
- **409 Conflict**: Duplicate tag name or articles still associated

Always check the article count before attempting to delete a tag.

## Integration Notes

- Tags are returned alphabetically sorted
- Article count helps identify popular topics
- Tags complement genres for comprehensive organization
- Use both tags and genres together for powerful filtering