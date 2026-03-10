# LinkedIn OAuth Usage Examples
**Task #10273 - Build LinkedIn OAuth connection flow**

This guide shows how to use the LinkedIn OAuth implementation in your application.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Frontend Integration](#frontend-integration)
3. [Backend Integration](#backend-integration)
4. [Token Management](#token-management)
5. [Making LinkedIn API Calls](#making-linkedin-api-calls)
6. [Error Handling](#error-handling)

---

## Quick Start

### 1. Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
cp @custom/.env.example .env
```

**Generate encryption key:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Minimum required configuration:**
```env
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret
LINKEDIN_REDIRECT_URI=http://localhost:3000/api/oauth/linkedin/callback
TOKEN_ENCRYPTION_KEY=<generated_64_char_hex_string>
DATABASE_URL=postgresql://user:pass@localhost:5432/db
SESSION_SECRET=<generated_secret>
```

### 2. Database Migration

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name add_oauth_tokens
```

### 3. Server Setup

```javascript
// server/index.js
const express = require('express');
const session = require('express-session');
const oauthRouter = require('./@custom/api/oauth');

const app = express();

// Session middleware (required for CSRF protection)
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Mount OAuth routes
app.use('/api/oauth', oauthRouter);

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

---

## Frontend Integration

### React Example

```jsx
// components/LinkedInConnect.jsx
import { useState } from 'react';

export function LinkedInConnect() {
  const [status, setStatus] = useState('disconnected');
  const [profile, setProfile] = useState(null);

  // Initiate OAuth flow
  const connectLinkedIn = () => {
    window.location.href = '/api/oauth/auth/linkedin';
  };

  // Check connection status
  const checkConnection = async () => {
    const response = await fetch('/api/linkedin/status');
    const data = await response.json();
    
    if (data.connected) {
      setStatus('connected');
      setProfile(data.profile);
    }
  };

  // Disconnect account
  const disconnect = async () => {
    const response = await fetch('/api/oauth/linkedin/revoke', {
      method: 'POST',
      credentials: 'include'
    });
    
    const data = await response.json();
    if (data.success) {
      setStatus('disconnected');
      setProfile(null);
    }
  };

  return (
    <div className="linkedin-integration">
      {status === 'disconnected' ? (
        <button onClick={connectLinkedIn} className="btn-linkedin">
          <LinkedInIcon />
          Connect LinkedIn
        </button>
      ) : (
        <div className="connected-state">
          <div className="profile">
            <img src={profile?.profilePicture} alt={profile?.name} />
            <span>{profile?.name}</span>
          </div>
          <button onClick={disconnect} className="btn-disconnect">
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
```

### Handling OAuth Callback

```jsx
// pages/oauth-callback.jsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function OAuthCallback() {
  const router = useRouter();
  const { success, error } = router.query;

  useEffect(() => {
    if (success === 'linkedin') {
      // Show success message
      showNotification('LinkedIn connected successfully!', 'success');
      router.push('/dashboard/integrations');
    } else if (error) {
      // Show error message
      showNotification(`Connection failed: ${error}`, 'error');
      router.push('/dashboard/integrations');
    }
  }, [success, error]);

  return (
    <div className="oauth-loading">
      <Spinner />
      <p>Connecting your LinkedIn account...</p>
    </div>
  );
}
```

---

## Backend Integration

### Check Connection Status

```javascript
// api/linkedin/status.js
const { isConnected, getValidToken } = require('../@custom/api/token-manager');

app.get('/api/linkedin/status', async (req, res) => {
  const userId = req.user?.id;
  
  if (!userId) {
    return res.json({ connected: false });
  }

  const connected = await isConnected(userId);
  
  if (connected) {
    const token = await getValidToken(userId);
    return res.json({
      connected: true,
      profile: token.profile
    });
  }

  res.json({ connected: false });
});
```

### Protected Route Example

```javascript
// api/linkedin/post.js
const { requireLinkedInAuth } = require('../@custom/api/token-manager');

app.post('/api/linkedin/post', requireLinkedInAuth, async (req, res) => {
  const { content } = req.body;
  const accessToken = req.linkedInToken.accessToken;

  // Make LinkedIn API call
  const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      author: `urn:li:person:${req.linkedInToken.profile.id}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text: content },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    })
  });

  const data = await response.json();
  res.json({ success: true, postId: data.id });
});
```

---

## Token Management

### Get Valid Token (with Auto-Refresh)

```javascript
const { getValidToken } = require('./@custom/api/token-manager');

async function makeLinkedInApiCall(userId) {
  // Automatically refreshes token if expired
  const token = await getValidToken(userId);
  
  if (!token) {
    throw new Error('LinkedIn not connected or token expired');
  }

  // Use token.accessToken for API calls
  const response = await fetch('https://api.linkedin.com/v2/me', {
    headers: {
      'Authorization': `Bearer ${token.accessToken}`
    }
  });

  return response.json();
}
```

### Manual Token Refresh

```javascript
const { getValidToken } = require('./@custom/api/token-manager');

// getValidToken automatically handles refresh
// Just call it before making API requests
const token = await getValidToken(userId);
```

### Check Connection Status

```javascript
const { isConnected } = require('./@custom/api/token-manager');

const connected = await isConnected(userId, 'linkedin');

if (!connected) {
  // Prompt user to connect LinkedIn
  return { error: 'LinkedIn not connected' };
}
```

---

## Making LinkedIn API Calls

### Post to LinkedIn

```javascript
async function postToLinkedIn(userId, content) {
  const { getValidToken } = require('./@custom/api/token-manager');
  
  const token = await getValidToken(userId);
  if (!token) {
    throw new Error('LinkedIn not connected');
  }

  const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token.accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0'
    },
    body: JSON.stringify({
      author: `urn:li:person:${token.profile.id}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text: content },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    })
  });

  if (!response.ok) {
    throw new Error(`LinkedIn API error: ${response.status}`);
  }

  return response.json();
}
```

### Get Profile Data

```javascript
async function getLinkedInProfile(userId) {
  const { getValidToken } = require('./@custom/api/token-manager');
  
  const token = await getValidToken(userId);
  if (!token) {
    return null;
  }

  // Profile data is cached in token.profile
  return token.profile;
  
  // Or fetch fresh data:
  const response = await fetch('https://api.linkedin.com/v2/me', {
    headers: {
      'Authorization': `Bearer ${token.accessToken}`
    }
  });

  return response.json();
}
```

### Upload Media (Image)

```javascript
async function uploadImageToLinkedIn(userId, imageBuffer) {
  const { getValidToken } = require('./@custom/api/token-manager');
  
  const token = await getValidToken(userId);
  if (!token) {
    throw new Error('LinkedIn not connected');
  }

  // 1. Register upload
  const registerResponse = await fetch(
    'https://api.linkedin.com/v2/assets?action=registerUpload',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        registerUploadRequest: {
          recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
          owner: `urn:li:person:${token.profile.id}`,
          serviceRelationships: [{
            relationshipType: 'OWNER',
            identifier: 'urn:li:userGeneratedContent'
          }]
        }
      })
    }
  );

  const { value } = await registerResponse.json();
  const uploadUrl = value.uploadMechanism[
    'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'
  ].uploadUrl;
  const asset = value.asset;

  // 2. Upload binary
  await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token.accessToken}`
    },
    body: imageBuffer
  });

  return asset; // Use this in post creation
}
```

---

## Error Handling

### Handle Connection Errors

```javascript
try {
  const token = await getValidToken(userId);
  // Make API call...
} catch (error) {
  if (error.message.includes('not connected')) {
    // Redirect to OAuth flow
    return res.redirect('/api/oauth/auth/linkedin');
  }
  
  if (error.message.includes('expired')) {
    // Token refresh failed - need to reconnect
    await revokeToken(userId);
    return res.status(401).json({
      error: 'linkedin_reconnect_required',
      message: 'Please reconnect your LinkedIn account'
    });
  }
  
  throw error;
}
```

### Handle API Rate Limits

```javascript
async function makeLinkedInApiCallWithRetry(url, options, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const response = await fetch(url, options);
    
    if (response.status === 429) {
      // Rate limited
      const retryAfter = response.headers.get('Retry-After') || 60;
      console.log(`Rate limited, retrying after ${retryAfter}s`);
      await sleep(retryAfter * 1000);
      continue;
    }
    
    return response;
  }
  
  throw new Error('Rate limit exceeded, max retries reached');
}
```

---

## Production Checklist

- ✅ Set `TOKEN_ENCRYPTION_KEY` (64-char hex)
- ✅ Set `SESSION_SECRET` (random string)
- ✅ Configure `LINKEDIN_REDIRECT_URI` with production domain
- ✅ Enable HTTPS (`SESSION_SECURE=true`)
- ✅ Set up database backups
- ✅ Configure rate limiting
- ✅ Set up monitoring/logging
- ✅ Test token refresh flow
- ✅ Test error scenarios
- ✅ Review LinkedIn API usage limits

---

## Troubleshooting

### Token Refresh Fails

**Symptom:** Users constantly need to reconnect
**Solution:** Check if refresh token is being stored and refreshAccessToken function is working

```javascript
// Debug token refresh
const tokenRecord = await prisma.oAuthToken.findUnique({
  where: { userId_provider: { userId, provider: 'linkedin' } }
});

console.log('Token expires:', tokenRecord.expiresAt);
console.log('Has refresh token:', !!tokenRecord.refreshToken);
```

### Encryption Errors

**Symptom:** `TOKEN_ENCRYPTION_KEY must be a 64-character hex string`
**Solution:** Generate proper key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### LinkedIn API 401 Errors

**Symptom:** API calls fail with 401
**Possible causes:**
1. Token expired - Should auto-refresh
2. Invalid token - User needs to reconnect
3. Insufficient permissions - Check scope

---

## Support

For issues or questions:
- Check the [LinkedIn API documentation](https://docs.microsoft.com/en-us/linkedin/)
- Review `OAUTH_IMPLEMENTATION.md` for technical details
- Check server logs for detailed error messages
