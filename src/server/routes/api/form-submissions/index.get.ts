import { defineEventHandler, getQuery, createError } from 'h3';
import { requireAuth } from '../../../utils/require-auth';
import { prisma } from '../../../../lib/prisma';

interface SubmissionsQuery {
  skip?: string;
  take?: string;
  sortBy?: string;
  sortOrder?: string;
  formId?: string;
  articleId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event);
  const query = getQuery(event) as SubmissionsQuery;

  // Parse pagination parameters
  const skip = Math.max(0, parseInt(query.skip || '0', 10));
  const take = Math.min(100, Math.max(1, parseInt(query.take || '10', 10)));

  // Parse sort parameters
  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = (query.sortOrder?.toLowerCase() === 'asc' ? 'asc' : 'desc');

  // Build filter conditions
  const where: any = {
    // data: {
    //   contains: query.search,
    //   // mode: 'insensitive'
    // },
    userId: session.user.id // Only submissions to forms created by this user
  };

  if (query.formId) {
    where.formId = query.formId;
  }

  if (query.articleId) {
    where.articleId = query.articleId;
  }

  // Date range filter
  if (query.dateFrom || query.dateTo) {
    where.createdAt = {};
    if (query.dateFrom) {
      where.createdAt.gte = new Date(query.dateFrom);
    }
    if (query.dateTo) {
      where.createdAt.lte = new Date(query.dateTo);
    }
  }

  // Search filter - searches form name and article title
  if (query.search) {
    where.OR = [
      {
        data: {
          contains: query.search,
          // mode: 'insensitive'
        }
      },
      {
        article: {
          title: {
            contains: query.search,
            // mode: 'insensitive'
          }
        }
      }
    ];
  }

  // Build sort parameter
  const orderBy: any = {};
  if (sortBy === 'formName') {
    orderBy.form = { name: sortOrder };
  } else if (sortBy === 'articleTitle') {
    orderBy.article = { title: sortOrder };
  } else {
    orderBy[sortBy] = sortOrder;
  }

  try {
    const [submissions, total] = await Promise.all([
      prisma.formSubmission.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          form: {
            select: {
              id: true,
              name: true
            }
          },
          article: {
            select: {
              id: true,
              title: true
            }
          }
        }
      }),
      prisma.formSubmission.count({ where })
    ]);

    return {
      submissions,
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch form submissions'
    });
  }
});
