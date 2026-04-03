const express = require('express');
const { query } = require('../db');

const router = express.Router();

function mapBlog(row) {
  return {
    _id: row._id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    category: row.category,
    tags: row.tags || [],
    author: row.author,
    status: row.status,
    publishedAt: row.publishedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

router.get('/', async (req, res) => {
  try {
    const result = await query(
      `SELECT id AS "_id", slug, title, excerpt, content, category, tags, author, status,
              published_at AS "publishedAt", created_at AS "createdAt", updated_at AS "updatedAt"
       FROM blogs
       WHERE status = 'published'
       ORDER BY published_at DESC NULLS LAST, created_at DESC`
    );

    return res.json(result.rows.map(mapBlog));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch blogs', error: error.message });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const result = await query(
      `SELECT id AS "_id", slug, title, excerpt, content, category, tags, author, status,
              published_at AS "publishedAt", created_at AS "createdAt", updated_at AS "updatedAt"
       FROM blogs
       WHERE slug = $1 AND status = 'published'`,
      [req.params.slug]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    return res.json(mapBlog(result.rows[0]));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch blog', error: error.message });
  }
});

module.exports = router;
