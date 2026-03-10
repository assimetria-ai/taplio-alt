/**
 * Token Manager - Secure Token Management & Auto-Refresh
 * Task #10273 - Build LinkedIn OAuth connection flow
 * 
 * Handles token encryption, decryption, and automatic refresh
 */

const crypto = require('crypto');
const prisma = require('../db/client');
const { refreshAccessToken } = require('./oauth');

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.TOKEN_ENCRYPTION_KEY;

/**
 * Validates encryption key is properly configured
 */
function validateEncryptionKey() {
  if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
    throw new Error(
      'TOKEN_ENCRYPTION_KEY must be a 64-character hex string (32 bytes). ' +
      'Generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    );
  }
}

/**
 * Encrypts a token for secure storage
 * @param {string} token - Plain text token
 * @returns {Object} Encrypted data with IV and auth tag
 */
function encryptToken(token) {
  if (!ENCRYPTION_KEY) {
    // Skip encryption in development if not configured
    console.warn('⚠️  TOKEN_ENCRYPTION_KEY not set - storing tokens in plain text (NOT FOR PRODUCTION)');
    return { encrypted: token, iv: null, authTag: null };
  }

  validateEncryptionKey();
  
  const iv = crypto.randomBytes(16);
  const key = Buffer.from(ENCRYPTION_KEY, 'hex');
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
}

/**
 * Decrypts a token from storage
 * @param {Object} encryptedData - Encrypted token data
 * @returns {string} Decrypted token
 */
function decryptToken(encryptedData) {
  const { encrypted, iv, authTag } = encryptedData;
  
  // Handle unencrypted tokens (development mode)
  if (!iv || !authTag) {
    return encrypted;
  }

  validateEncryptionKey();
  
  const key = Buffer.from(ENCRYPTION_KEY, 'hex');
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Stores OAuth token with encryption
 * @param {Object} tokenData - Token data to store
 * @returns {Promise<Object>} Stored token record
 */
async function storeEncryptedToken(tokenData) {
  const { userId, provider, accessToken, refreshToken, expiresIn, profile, scope } = tokenData;
  
  // Encrypt tokens
  const encryptedAccess = encryptToken(accessToken);
  const encryptedRefresh = refreshToken ? encryptToken(refreshToken) : null;
  
  // Calculate expiration date
  const expiresAt = expiresIn 
    ? new Date(Date.now() + expiresIn * 1000)
    : null;
  
  // Store in database
  const result = await prisma.oAuthToken.upsert({
    where: {
      userId_provider: {
        userId,
        provider
      }
    },
    update: {
      accessToken: encryptedAccess.encrypted,
      accessTokenIv: encryptedAccess.iv,
      accessTokenTag: encryptedAccess.authTag,
      refreshToken: encryptedRefresh?.encrypted,
      refreshTokenIv: encryptedRefresh?.iv,
      refreshTokenTag: encryptedRefresh?.authTag,
      expiresAt,
      profile,
      scope,
      updatedAt: new Date()
    },
    create: {
      userId,
      provider,
      accessToken: encryptedAccess.encrypted,
      accessTokenIv: encryptedAccess.iv,
      accessTokenTag: encryptedAccess.authTag,
      refreshToken: encryptedRefresh?.encrypted,
      refreshTokenIv: encryptedRefresh?.iv,
      refreshTokenTag: encryptedRefresh?.authTag,
      expiresAt,
      profile,
      scope,
      tokenType: 'Bearer'
    }
  });
  
  console.log(`✓ Token stored securely for user ${userId} (${provider})`);
  return result;
}

/**
 * Gets a valid access token, refreshing if necessary
 * @param {string} userId - User ID
 * @param {string} provider - OAuth provider (e.g., 'linkedin')
 * @returns {Promise<Object>} Valid token data or null if not connected
 */
async function getValidToken(userId, provider = 'linkedin') {
  // Fetch token from database
  const tokenRecord = await prisma.oAuthToken.findUnique({
    where: {
      userId_provider: { userId, provider }
    }
  });
  
  if (!tokenRecord) {
    console.log(`No ${provider} token found for user ${userId}`);
    return null;
  }
  
  // Decrypt access token
  const accessToken = decryptToken({
    encrypted: tokenRecord.accessToken,
    iv: tokenRecord.accessTokenIv,
    authTag: tokenRecord.accessTokenTag
  });
  
  // Check if token is still valid (with 5-minute buffer)
  const bufferMs = 5 * 60 * 1000; // 5 minutes
  const isExpired = tokenRecord.expiresAt && 
                   tokenRecord.expiresAt.getTime() < Date.now() + bufferMs;
  
  if (!isExpired) {
    return {
      accessToken,
      expiresAt: tokenRecord.expiresAt,
      profile: tokenRecord.profile
    };
  }
  
  // Token is expired, attempt refresh
  console.log(`Token expired for user ${userId}, attempting refresh...`);
  
  if (!tokenRecord.refreshToken) {
    console.error(`No refresh token available for user ${userId}`);
    return null;
  }
  
  // Decrypt refresh token
  const refreshToken = decryptToken({
    encrypted: tokenRecord.refreshToken,
    iv: tokenRecord.refreshTokenIv,
    authTag: tokenRecord.refreshTokenTag
  });
  
  // Attempt to refresh
  const refreshResult = await refreshAccessToken(refreshToken);
  
  if (!refreshResult.success) {
    console.error(`Token refresh failed for user ${userId}:`, refreshResult.error);
    // Token refresh failed - user needs to reconnect
    return null;
  }
  
  // Store new tokens
  await storeEncryptedToken({
    userId,
    provider,
    accessToken: refreshResult.data.access_token,
    refreshToken: refreshResult.data.refresh_token || refreshToken,
    expiresIn: refreshResult.data.expires_in,
    profile: tokenRecord.profile,
    scope: tokenRecord.scope
  });
  
  console.log(`✓ Token refreshed successfully for user ${userId}`);
  
  return {
    accessToken: refreshResult.data.access_token,
    expiresAt: new Date(Date.now() + refreshResult.data.expires_in * 1000),
    profile: tokenRecord.profile
  };
}

/**
 * Checks if a user has a valid LinkedIn connection
 * @param {string} userId - User ID
 * @param {string} provider - OAuth provider
 * @returns {Promise<boolean>} True if connected and valid
 */
async function isConnected(userId, provider = 'linkedin') {
  const token = await getValidToken(userId, provider);
  return token !== null;
}

/**
 * Revokes and removes all tokens for a user
 * @param {string} userId - User ID
 * @param {string} provider - OAuth provider
 * @returns {Promise<boolean>} True if revoked successfully
 */
async function revokeToken(userId, provider = 'linkedin') {
  try {
    await prisma.oAuthToken.delete({
      where: {
        userId_provider: { userId, provider }
      }
    });
    
    console.log(`✓ Token revoked for user ${userId} (${provider})`);
    return true;
    
  } catch (error) {
    if (error.code === 'P2025') {
      // Record not found - already revoked
      return true;
    }
    throw error;
  }
}

/**
 * Middleware to ensure user has valid LinkedIn token
 * Automatically refreshes if needed
 */
function requireLinkedInAuth(req, res, next) {
  return async (req, res, next) => {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'authentication_required',
        message: 'User must be logged in'
      });
    }
    
    const token = await getValidToken(userId, 'linkedin');
    
    if (!token) {
      return res.status(403).json({
        success: false,
        error: 'linkedin_not_connected',
        message: 'LinkedIn account not connected or token expired',
        action: 'redirect_to_oauth'
      });
    }
    
    // Attach token to request for use in route handlers
    req.linkedInToken = token;
    next();
  };
}

module.exports = {
  encryptToken,
  decryptToken,
  storeEncryptedToken,
  getValidToken,
  isConnected,
  revokeToken,
  requireLinkedInAuth
};
