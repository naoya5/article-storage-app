# Bookmarks API

## Overview

Manage bookmarks for articles. Users can bookmark articles, update bookmark details like read status and ratings, and delete bookmarks.

## Endpoints

### Create Bookmark

**`POST /api/bookmarks`**

Creates a bookmark for a specific article.

#### Request Body

```typescript
{
  articleId: string; // ID of the article to bookmark
}
```

#### Response

**Success (201):**
```typescript
{
  data: {
    id: string;
    articleId: string;
    userId: string;
    readStatus: "UNREAD";
    isFavorite: false;
    rating: null;
    memo: null;
    createdAt: string;
    updatedAt: string;
  },
  message: "Bookmark created successfully"
}
```

**Error Examples:**
- `400` - Missing or invalid articleId
- `404` - Article not found
- `409` - Bookmark already exists for this article
- `403` - User doesn't own the article

#### Example

```bash
curl -X POST http://localhost:3000/api/bookmarks \
  -H "Content-Type: application/json" \
  -d '{"articleId": "article123"}'
```

### Update Bookmark

**`PATCH /api/bookmarks/[id]`**

Updates bookmark details such as read status, favorite status, rating, and memo.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Bookmark ID |

#### Request Body

```typescript
{
  readStatus?: "UNREAD" | "READING" | "READ"; // Optional
  isFavorite?: boolean; // Optional
  rating?: number | null; // Optional, 1-5 or null
  memo?: string | null; // Optional
}
```

#### Response

**Success (200):**
```typescript
{
  data: {
    id: string;
    articleId: string;
    userId: string;
    readStatus: string;
    isFavorite: boolean;
    rating: number | null;
    memo: string | null;
    createdAt: string;
    updatedAt: string;
  },
  message: "Bookmark updated successfully"
}
```

**Error Examples:**
- `400` - Invalid rating (must be 1-5 or null)
- `400` - Invalid read status
- `404` - Bookmark not found
- `403` - User doesn't own the bookmark

#### Example

```bash
curl -X PATCH http://localhost:3000/api/bookmarks/bookmark123 \
  -H "Content-Type: application/json" \
  -d '{
    "readStatus": "READ",
    "isFavorite": true,
    "rating": 5,
    "memo": "Great article about React hooks!"
  }'
```

### Delete Bookmark

**`DELETE /api/bookmarks`**

Removes a bookmark using the article ID as a query parameter.

#### Query Parameters

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `articleId` | string | ID of the article to unbookmark | Yes |

#### Response

**Success (200):**
```typescript
{
  message: "Bookmark deleted successfully"
}
```

**Error Examples:**
- `400` - Missing articleId parameter
- `404` - Bookmark not found
- `403` - User doesn't own the bookmark

#### Example

```bash
curl -X DELETE "http://localhost:3000/api/bookmarks?articleId=article123"
```

## Data Models

### Bookmark
```typescript
interface Bookmark {
  id: string;
  articleId: string;
  userId: string;
  readStatus: "UNREAD" | "READING" | "READ";
  isFavorite: boolean;
  rating: number | null; // 1-5 or null
  memo: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### Read Status Values
- `UNREAD` - Article has not been read
- `READING` - Article is currently being read
- `READ` - Article has been completed

### Rating System
- Range: 1-5 (integers only)
- `null` - No rating assigned
- 5 - Excellent
- 4 - Good
- 3 - Average
- 2 - Below Average
- 1 - Poor

## Business Rules

### Authorization
- Users can only manage their own bookmarks
- Users can only bookmark articles they own
- All operations require authentication

### Validation
- Article must exist and belong to the user
- Rating must be between 1-5 or null
- Read status must be a valid enum value
- Cannot create duplicate bookmarks for the same article

### Default Values
- `readStatus`: "UNREAD"
- `isFavorite`: false
- `rating`: null
- `memo`: null

## Usage Patterns

### Typical Workflow
1. User adds articles to the system
2. User bookmarks interesting articles
3. User updates read status as they progress
4. User adds ratings and memos after reading
5. User can filter articles by bookmark status

### Best Practices
- Update read status to track reading progress
- Use ratings to identify high-quality content
- Add memos for personal notes and takeaways
- Use favorite status for quick access to top content

## Related APIs

- [Articles API](./articles.md) - For querying bookmarked articles
- [Statistics API](./stats.md) - For bookmark analytics

## Error Handling

Common error scenarios:

- **400 Bad Request**: Invalid parameters or values
- **403 Forbidden**: User doesn't own the bookmark or article
- **404 Not Found**: Bookmark or article doesn't exist
- **409 Conflict**: Attempting to create duplicate bookmark

## Integration Notes

- Bookmarks are automatically included in article queries
- Bookmark data is used in statistics and analytics
- Deleting an article automatically removes associated bookmarks
- Favorite bookmarks can be queried through the Articles API