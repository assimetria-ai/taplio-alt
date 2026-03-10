/**
 * LinkedIn OAuth 2.0 Integration
 * Task #10266 - Feature 5: LinkedIn OAuth integration
 * Task #10273 - Enhanced with secure token management
 * 
 * This module handles the OAuth callback flow for LinkedIn authentication:
 * 1. Receives authorization code from LinkedIn
 * 2. Exchanges code for access token
 * 3. Stores tokens securely with encryption
 * 4. Fetches LinkedIn profile data
 * 5. Handles token refresh automatically
 */

const express = require('express');
const router = express.Router();
const { storeEncryptedToken, revokeToken } = require('./token-manager');

// LinkedIn OAuth 2.0 endpoints
const LINKEDIN_AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization';
const LINKEDIN_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';
const LINKEDIN_API_URL = 'https://api.linkedin.com/v2';

/**
 * Initiates LinkedIn OAuth flow
 * Redirects user to LinkedIn authorization page
 */
router.get('/auth/linkedin', (req, res) => {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:3000/api/oauth/linkedin/callback';
  const state = generateState(); // CSRF protection
  const scope = 'r_liteprofile r_emailaddress w_member_social'; // Required scopes for posting

  // Store state in session or database for verification
  req.session = req.session || {};
  req.session.oauthState = state;

  const authUrl = `${LINKEDIN_AUTH_URL}?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scope)}`;

  res.redirect(authUrl);
});

/**
 * OAuth Callback Handler
 * Handles the redirect from LinkedIn after user authorization
 * 
 * @route GET /api/oauth/linkedin/callback
 * @param {string} code - Authorization code from LinkedIn
 * @param {string} state - CSRF protection token
 * @param {string} error - Error code if authorization failed
 * @param {string} error_description - Human-readable error description
 */
router.get('/linkedin/callback', async (req, res) => {
  try {
    const { code, state, error, error_description } = req.query;

    // Handle authorization errors
    if (error) {
      console.error('LinkedIn OAuth error:', error, error_description);
      return res.status(400).json({
        success: false,
        error: 'authorization_failed',
        message: error_description || 'Failed to authorize with LinkedIn'
      });
    }

    // Validate required parameters
    if (!code || !state) {
      return res.status(400).json({
        success: false,
        error: 'invalid_request',
        message: 'Missing required parameters: code or state'
      });
    }

    // Verify state to prevent CSRF attacks
    if (req.session && req.session.oauthState !== state) {
      return res.status(403).json({
        success: false,
        error: 'invalid_state',
        message: 'State verification failed. Possible CSRF attack.'
      });
    }

    // Exchange authorization code for access token
    const tokenResponse = await exchangeCodeForToken(code);
    
    if (!tokenResponse.success) {
      return res.status(500).json({
        success: false,
        error: 'token_exchange_failed',
        message: tokenResponse.error || 'Failed to exchange code for token'
      });
    }

    const { access_token, expires_in, refresh_token } = tokenResponse.data;

    // Fetch LinkedIn profile data
    const profileData = await fetchLinkedInProfile(access_token);

    if (!profileData.success) {
      console.error('Failed to fetch profile:', profileData.error);
      // Continue anyway - we have the token
    }

    // Store tokens securely in database with encryption
    const userId = req.user?.id || req.session?.userId; // Assumes user is authenticated
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'user_not_authenticated',
        message: 'User must be logged in to connect LinkedIn'
      });
    }

    const tokenData = {
      userId,
      provider: 'linkedin',
      accessToken: access_token,
      refreshToken: refresh_token || null,
      expiresIn: expires_in,
      profile: profileData.success ? profileData.data : null,
      scope: 'r_liteprofile r_emailaddress w_member_social'
    };

    await storeEncryptedToken(tokenData);

    // Clear OAuth state from session
    if (req.session) {
      delete req.session.oauthState;
    }

    // Success response - redirect to success page or return JSON
    const redirectUrl = process.env.OAUTH_SUCCESS_REDIRECT || '/dashboard/integrations?success=linkedin';
    
    if (req.query.format === 'json' || req.headers.accept?.includes('application/json')) {
      return res.json({
        success: true,
        message: 'LinkedIn account connected successfully',
        profile: profileData.success ? {
          id: profileData.data.id,
          firstName: profileData.data.localizedFirstName,
          lastName: profileData.data.localizedLastName
        } : null
      });
    }

    res.redirect(redirectUrl);

  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({
      success: false,
      error: 'internal_server_error',
      message: 'An unexpected error occurred during OAuth callback'
    });
  }
});

/**
 * Exchanges authorization code for access token
 * @param {string} code - Authorization code from LinkedIn
 * @returns {Promise<Object>} Token response
 */
async function exchangeCodeForToken(code) {
  try {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      client_id: process.env.LINKEDIN_CLIENT_ID,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET,
      redirect_uri: process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:3000/api/oauth/linkedin/callback'
    });

    const response = await fetch(LINKEDIN_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error_description || 'Token exchange failed'
      };
    }

    const data = await response.json();
    return {
      success: true,
      data: data
    };

  } catch (error) {
    console.error('Token exchange error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Fetches LinkedIn profile data using access token
 * @param {string} accessToken - LinkedIn access token
 * @returns {Promise<Object>} Profile data
 */
async function fetchLinkedInProfile(accessToken) {
  try {
    const response = await fetch(`${LINKEDIN_API_URL}/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to fetch profile: ${response.status}`
      };
    }

    const data = await response.json();
    return {
      success: true,
      data: data
    };

  } catch (error) {
    console.error('Profile fetch error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Token storage moved to token-manager.js for encryption support

/**
 * Generates a random state string for CSRF protection
 * @returns {string} Random state string
 */
function generateState() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Refreshes an expired access token using refresh token
 * @param {string} refreshToken - LinkedIn refresh token
 * @returns {Promise<Object>} New token data
 */
async function refreshAccessToken(refreshToken) {
  try {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: process.env.LINKEDIN_CLIENT_ID,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET
    });

    const response = await fetch(LINKEDIN_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    if (!response.ok) {
      return {
        success: false,
        error: 'Token refresh failed'
      };
    }

    const data = await response.json();
    return {
      success: true,
      data: data
    };

  } catch (error) {
    console.error('Token refresh error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Revokes LinkedIn access token (disconnects account)
 * @route POST /api/oauth/linkedin/revoke
 */
router.post('/linkedin/revoke', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'user_not_authenticated'
      });
    }

    // Revoke and remove tokens from database
    const revoked = await revokeToken(userId, 'linkedin');

    if (revoked) {
      return res.json({
        success: true,
        message: 'LinkedIn account disconnected successfully'
      });
    }

    res.status(500).json({
      success: false,
      error: 'revocation_failed',
      message: 'Failed to revoke token'
    });

  } catch (error) {
    console.error('Token revocation error:', error);
    res.status(500).json({
      success: false,
      error: 'revocation_failed',
      message: error.message
    });
  }
});

module.exports = router;
module.exports.refreshAccessToken = refreshAccessToken;
