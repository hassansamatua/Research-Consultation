// Database Error Handler Utility
// Provides graceful handling of database connection issues

export interface DatabaseError {
  code: string;
  message: string;
  isConnectionError: boolean;
  userMessage: string;
}

export function handleDatabaseError(error: any): DatabaseError {
  const dbError: DatabaseError = {
    code: error.code || 'UNKNOWN_ERROR',
    message: error.message || 'Unknown database error',
    isConnectionError: false,
    userMessage: 'An unexpected error occurred. Please try again.'
  };

  // Handle specific database connection errors
  switch (error.code) {
    case 'ER_CON_COUNT_ERROR':
      dbError.isConnectionError = true;
      dbError.userMessage = 'The database is temporarily unavailable due to high traffic. Please try again in a few moments.';
      break;
    
    case 'ECONNREFUSED':
      dbError.isConnectionError = true;
      dbError.userMessage = 'Unable to connect to the database. Please check your connection and try again.';
      break;
    
    case 'ETIMEDOUT':
      dbError.isConnectionError = true;
      dbError.userMessage = 'Database connection timed out. Please try again.';
      break;
    
    case 'ENOTFOUND':
      dbError.isConnectionError = true;
      dbError.userMessage = 'Database server not found. Please check your network connection.';
      break;
    
    default:
      dbError.userMessage = 'A database error occurred. Please try again or contact support if the problem persists.';
  }

  console.error('Database Error:', {
    code: dbError.code,
    message: dbError.message,
    isConnectionError: dbError.isConnectionError,
    timestamp: new Date().toISOString()
  });

  return dbError;
}

export function createDatabaseErrorResponse(error: any) {
  const dbError = handleDatabaseError(error);
  
  return {
    success: false,
    error: dbError.userMessage,
    details: process.env.NODE_ENV === 'development' ? dbError.message : undefined,
    isConnectionError: dbError.isConnectionError,
    retryable: dbError.isConnectionError
  };
}

// Retry logic for database operations
export async function retryDatabaseOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const dbError = handleDatabaseError(error);
      
      // Don't retry non-connection errors
      if (!dbError.isConnectionError) {
        throw error;
      }
      
      if (attempt === maxRetries) {
        throw new Error(dbError.userMessage);
      }
      
      // Exponential backoff
      const waitTime = delay * Math.pow(2, attempt - 1);
      console.log(`Database operation failed, retrying in ${waitTime}ms... (Attempt ${attempt}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError;
}
