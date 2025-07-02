# Article-Tag Association API

## Overview

Manage the relationship between articles and tags. Users can associate multiple tags with articles and remove those associations.

## Endpoints

### Add Tag to Article

**`POST /api/articles/[id]/tags`**

Associates a tag with a specific article.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Article ID |

#### Request Body

```typescript
{
  tagId: string; // ID of the tag to associate
}
```

#### Response

**Success (200):**
```typescript
{
  message: "Tag added to article successfully"
}
```

**Error Examples:**
- `400` - Missing or invalid tagId
- `404` - Article or tag not found
- `409` - Tag already associated with article
- `403` - User doesn't own the article or tag

#### Example

```bash
curl -X POST http://localhost:3000/api/articles/article123/tags \
  -H "Content-Type: application/json" \
  -d '{"tagId": "tag456"}'
```

### Remove Tag from Article

**`DELETE /api/articles/[id]/tags`**

Removes a tag association from a specific article.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Article ID |

#### Request Body

```typescript
{
  tagId: string; // ID of the tag to remove
}
```

#### Response

**Success (200):**
```typescript
{
  message: "Tag removed from article successfully"
}
```

**Error Examples:**
- `400` - Missing or invalid tagId
- `404` - Article, tag, or association not found
- `403` - User doesn't own the article or tag

#### Example

```bash
curl -X DELETE http://localhost:3000/api/articles/article123/tags \
  -H "Content-Type: application/json" \
  -d '{"tagId": "tag456"}'
```

## Business Rules

### Authorization
- Users can only manage associations for articles they own
- Users can only associate tags they own
- All operations require authentication

### Validation
- Article must exist and belong to the user
- Tag must exist and belong to the user
- Cannot create duplicate associations
- Cannot remove non-existent associations

### Data Integrity
- Associations are automatically cleaned up when articles or tags are deleted
- Many-to-many relationship allows articles to have multiple tags
- Many-to-many relationship allows tags to be used by multiple articles

## Usage Patterns

### Typical Workflow
1. Create articles using the Articles API
2. Create tags using the Tags API
3. Associate tags with articles using this API
4. Query articles with tag filters using the Articles API

### Best Practices
- Check if association already exists before creating
- Validate tag ownership before association
- Handle 409 conflicts gracefully in UI
- Use bulk operations for multiple associations
- Consider tag naming conventions for consistency

### Tag Organization
- Tags are lightweight labels (max 30 characters)
- Use tags for specific topics, technologies, or keywords
- Tags complement genres (which are broader categories)
- Consider using lowercase for consistency

## Related APIs

- [Articles API](./articles.md) - For creating and querying articles
- [Tags API](./tags.md) - For managing tags
- [Statistics API](./stats.md) - For analytics including tag usage

## Error Handling

The API provides specific error messages for different failure scenarios:

- **400 Bad Request**: Invalid or missing tagId
- **403 Forbidden**: User doesn't own the article or tag
- **404 Not Found**: Article, tag, or association doesn't exist
- **409 Conflict**: Attempting to create duplicate association

Always check the error message for specific details about what went wrong.

## Comparison with Genres

| Aspect | Tags | Genres |
|--------|------|--------|
| Character limit | 30 | 50 |
| Purpose | Specific topics/keywords | Broad categories |
| Color | No | Yes |
| Typical use | JavaScript, React, Tutorial | Programming, Design, Business |