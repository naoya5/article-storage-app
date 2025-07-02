# Statistics API

## Overview

Provides comprehensive analytics and statistics about user's articles, bookmarks, genres, and tags with caching for performance.

## Endpoints

### Get Statistics

**`GET /api/stats`**

Retrieves comprehensive user statistics with 10-minute caching.

#### Response

**Success (200):**
```typescript
{
  data: {
    basicStats: {
      totalArticles: number;
      totalBookmarks: number;
      totalGenres: number;
      totalTags: number;
      monthlyArticles: number; // Articles added this month
      weeklyArticles: number;  // Articles added this week
      favoriteRate: number;    // Percentage of bookmarks marked as favorite
    };
    platformDistribution: Array<{
      platform: string;
      count: number;
      percentage: number;
    }>;
    readStatusDistribution: Array<{
      status: string;
      count: number;
      percentage: number;
    }>;
    ratingDistribution: Array<{
      rating: number | null;
      count: number;
      percentage: number;
    }>;
    topGenres: Array<{
      id: string;
      name: string;
      color: string;
      articleCount: number;
    }>; // Top 10 genres by article count
    topTags: Array<{
      id: string;
      name: string;
      articleCount: number;
    }>; // Top 10 tags by article count
    recentActivity: Array<{
      date: string; // YYYY-MM-DD format
      articleCount: number;
    }>; // Last 30 days of daily activity
  }
}
```

#### Example

```bash
curl http://localhost:3000/api/stats
```

**Example Response:**
```json
{
  "data": {
    "basicStats": {
      "totalArticles": 125,
      "totalBookmarks": 89,
      "totalGenres": 8,
      "totalTags": 32,
      "monthlyArticles": 15,
      "weeklyArticles": 4,
      "favoriteRate": 23.5
    },
    "platformDistribution": [
      {
        "platform": "zenn",
        "count": 45,
        "percentage": 36.0
      },
      {
        "platform": "qiita",
        "count": 38,
        "percentage": 30.4
      },
      {
        "platform": "twitter",
        "count": 42,
        "percentage": 33.6
      }
    ],
    "readStatusDistribution": [
      {
        "status": "UNREAD",
        "count": 34,
        "percentage": 38.2
      },
      {
        "status": "READING",
        "count": 12,
        "percentage": 13.5
      },
      {
        "status": "READ",
        "count": 43,
        "percentage": 48.3
      }
    ],
    "ratingDistribution": [
      {
        "rating": null,
        "count": 45,
        "percentage": 50.6
      },
      {
        "rating": 5,
        "count": 15,
        "percentage": 16.9
      },
      {
        "rating": 4,
        "count": 12,
        "percentage": 13.5
      },
      {
        "rating": 3,
        "count": 10,
        "percentage": 11.2
      },
      {
        "rating": 2,
        "count": 4,
        "percentage": 4.5
      },
      {
        "rating": 1,
        "count": 3,
        "percentage": 3.4
      }
    ],
    "topGenres": [
      {
        "id": "genre123",
        "name": "Programming",
        "color": "#3B82F6",
        "articleCount": 32
      }
    ],
    "topTags": [
      {
        "id": "tag123",
        "name": "react",
        "articleCount": 18
      }
    ],
    "recentActivity": [
      {
        "date": "2024-01-15",
        "articleCount": 2
      },
      {
        "date": "2024-01-14",
        "articleCount": 1
      }
    ]
  }
}
```

## Data Insights

### Basic Statistics
- **Total Counts**: Articles, bookmarks, genres, and tags
- **Time-based Metrics**: Monthly and weekly article additions
- **Engagement Rate**: Percentage of bookmarks marked as favorites

### Platform Analysis
- Distribution of articles across supported platforms (Twitter, Zenn, Qiita)
- Helps identify content source preferences
- Percentages calculated from total articles

### Reading Progress
- **UNREAD**: Articles not yet started
- **READING**: Articles currently in progress
- **READ**: Completed articles
- Based on bookmarked articles only

### Content Quality Assessment
- Rating distribution from 1-5 stars
- Null ratings indicate unrated content
- Helps identify high-quality content patterns

### Content Organization
- **Top Genres**: Most used broad categories
- **Top Tags**: Most used specific topics
- Limited to top 10 for performance
- Includes article counts for each

### Activity Trends
- Daily article addition counts for last 30 days
- Helps identify usage patterns and engagement trends
- Date format: YYYY-MM-DD

## Performance Features

### Caching
- **Cache Duration**: 10 minutes
- **Cache Type**: In-memory caching
- **Benefits**: Improved response times for frequently accessed data
- **Invalidation**: Automatic after 10 minutes

### Optimization
- Single database query with efficient joins
- Aggregation performed at database level
- Limited result sets (top 10) for performance

## Usage Patterns

### Dashboard Integration
- Primary data source for analytics dashboards
- Real-time insights into user behavior
- Content organization effectiveness

### Trend Analysis
- Identify reading patterns and preferences
- Track content addition trends over time
- Measure engagement with different platforms

### Content Strategy
- Understand which genres and tags are most used
- Identify content quality through ratings
- Optimize content organization

## Business Logic

### Calculations
- **Favorite Rate**: `(Favorite Bookmarks / Total Bookmarks) * 100`
- **Percentages**: Rounded to 1 decimal place
- **Date Ranges**: Based on user's timezone (server timezone)

### Data Filtering
- All statistics are user-specific
- Only bookmarked articles included in read status/rating stats
- Recent activity includes all articles (not just bookmarked)

## Related APIs

- [Articles API](./articles.md) - Source data for article statistics
- [Bookmarks API](./bookmarks.md) - Source data for bookmark statistics
- [Genres API](./genres.md) - Genre information and usage
- [Tags API](./tags.md) - Tag information and usage

## Error Handling

- **401 Unauthorized**: Authentication required
- **500 Internal Server Error**: Database or calculation errors

The API is designed to be robust and will return empty arrays/zero values rather than errors for users with no data.

## Future Enhancements

Potential areas for expansion:
- Custom date range filtering
- More granular time-based analytics
- Content source analysis
- Reading speed metrics
- Comparative analytics