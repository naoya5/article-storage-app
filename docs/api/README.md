# API Documentation

This directory contains comprehensive documentation for all API endpoints in the Article Storage App.

## Overview

The Article Storage App provides a RESTful API built with Next.js App Router. All endpoints require authentication except for the NextAuth.js authentication handler.

## Base URL

```
http://localhost:3000/api
```

## Authentication

All API endpoints require authentication using NextAuth.js. Include the session token in your requests.

## API Endpoints

### Authentication
- [NextAuth.js Authentication](./auth.md)

### Articles Management
- [Articles API](./articles.md) - Create, read, and manage articles
- [Article-Genre Association](./article-genres.md) - Manage article-genre relationships
- [Article-Tag Association](./article-tags.md) - Manage article-tag relationships

### Bookmarks Management
- [Bookmarks API](./bookmarks.md) - Create, update, and delete bookmarks

### Content Organization
- [Genres API](./genres.md) - Manage article genres
- [Tags API](./tags.md) - Manage article tags

### Analytics
- [Statistics API](./stats.md) - Get comprehensive user statistics

## Common Response Format

### Success Response
```json
{
  "data": {
    // Response data
  },
  "message": "Success message"
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": "Detailed error information (optional)"
}
```

## HTTP Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Platform Support

The application supports article import from:
- Twitter/X
- Zenn
- Qiita

## Rate Limiting

Currently, no rate limiting is implemented. Consider implementing rate limiting for production use.

## Versioning

The API is currently unversioned. All endpoints are under `/api/`.