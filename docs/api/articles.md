# Articles API

## Overview

Manage articles in the system. Supports creating articles from URLs (Twitter, Zenn, Qiita) and retrieving articles with advanced filtering.

## Endpoints

### Create Article

**`POST /api/articles`**

Creates a new article by extracting metadata from a URL.

#### Request Body

```typescript
{
  url: string; // URL of the article to add
}
```

#### Supported Platforms
- Twitter/X posts
- Zenn articles
- Qiita articles

#### Response

**Success (201):**
```typescript
{
  data: {
    id: string;
    url: string;
    title: string;
    description: string;
    author: string;
    publishedAt: string;
    platform: string;
    content: string;
    createdAt: string;
    updatedAt: string;
  },
  message: string;
}
```

**Error Examples:**
- `400` - Invalid URL format
- `409` - Article already exists
- `500` - Failed to extract metadata

#### Example

```bash
curl -X POST http://localhost:3000/api/articles \
  -H "Content-Type: application/json" \
  -d '{"url": "https://zenn.dev/example/articles/example-article"}'
```

### Get Articles

**`GET /api/articles`**

Retrieves articles with filtering, searching, and pagination support.

#### Query Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `page` | number | Page number (1-based) | 1 |
| `limit` | number | Items per page (max 100) | 20 |
| `platform` | string | Filter by platform (twitter, zenn, qiita) | - |
| `query` | string | Search in title, description, content, author | - |
| `genreId` | string | Filter by genre ID | - |
| `tagId` | string | Filter by tag ID | - |
| `dateFrom` | string | Filter from date (ISO format) | - |
| `dateTo` | string | Filter to date (ISO format) | - |

#### Response

**Success (200):**
```typescript
{
  data: {
    articles: Array<{
      id: string;
      url: string;
      title: string;
      description: string;
      author: string;
      publishedAt: string;
      platform: string;
      content: string;
      createdAt: string;
      updatedAt: string;
      genres: Array<{
        id: string;
        name: string;
        color: string;
      }>;
      tags: Array<{
        id: string;
        name: string;
      }>;
      bookmarks: Array<{
        id: string;
        readStatus: string;
        isFavorite: boolean;
        rating: number | null;
        memo: string | null;
      }>;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }
}
```

#### Search Features

- **Full-text search**: Searches across title, description, content, and author fields
- **Case-insensitive**: Search is not case-sensitive
- **Partial matching**: Supports partial word matching

#### Example Requests

```bash
# Get all articles (first page)
curl http://localhost:3000/api/articles

# Search articles
curl "http://localhost:3000/api/articles?query=react&platform=zenn"

# Filter by date range
curl "http://localhost:3000/api/articles?dateFrom=2024-01-01&dateTo=2024-12-31"

# Pagination
curl "http://localhost:3000/api/articles?page=2&limit=10"

# Filter by genre and tag
curl "http://localhost:3000/api/articles?genreId=abc123&tagId=def456"
```

## Data Models

### Article
```typescript
interface Article {
  id: string;
  url: string;
  title: string;
  description: string;
  author: string;
  publishedAt: Date;
  platform: 'twitter' | 'zenn' | 'qiita';
  content: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Error Handling

Common error responses:

- `400` - Invalid request parameters
- `401` - Authentication required
- `409` - Duplicate article URL
- `500` - Server error (metadata extraction failed)

## Notes

- All endpoints require authentication
- Users can only access their own articles
- Article URLs must be unique per user
- Metadata extraction is automatic and platform-specific
- Failed metadata extraction will result in a 500 error