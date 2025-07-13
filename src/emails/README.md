# Atlas Hosting Email Templates

This directory contains email templates for Atlas Hosting using React Email.

## Templates

### 1. Welcome Email (`atlas-welcome.tsx`)
Sent to new users when they create an account.

**Props:**
- `firstName`: User's first name
- `organizationName`: Name of the user's organization
- `dashboardUrl`: Link to the dashboard
- `supportEmail`: Support email address

**Usage:**
```tsx
<AtlasWelcomeEmail
  firstName="John"
  organizationName="Acme Corp"
  dashboardUrl="https://atlashosting.com/dashboard"
  supportEmail="support@atlashosting.com"
/>
```

### 2. Password Reset Email (`atlas-password-reset.tsx`)
Sent when a user requests a password reset.

**Props:**
- `firstName`: User's first name
- `email`: User's email address
- `resetLink`: Password reset link
- `resetCode`: Alternative reset code
- `expirationTime`: How long the reset link is valid
- `supportEmail`: Support email address

**Usage:**
```tsx
<AtlasPasswordResetEmail
  firstName="John"
  email="john@example.com"
  resetLink="https://atlashosting.com/reset-password?token=abc123"
  resetCode="ABC123"
  expirationTime="1 hour"
  supportEmail="support@atlashosting.com"
/>
```

### 3. Notification Email (`atlas-notification.tsx`)
Generic notification template that changes styling based on severity.

**Props:**
- `firstName`: User's first name
- `organizationName`: Name of the user's organization
- `title`: Notification title
- `message`: Main notification message
- `severity`: 'success' | 'info' | 'warning' | 'danger'
- `actionUrl`: Optional action button URL
- `actionText`: Action button text
- `timestamp`: When the notification occurred
- `supportEmail`: Support email address
- `additionalInfo`: Optional additional information

**Usage:**
```tsx
<AtlasNotificationEmail
  firstName="John"
  organizationName="Acme Corp"
  title="Website Deployment Successful"
  message="Your website has been successfully deployed to production."
  severity="success"
  actionUrl="https://atlashosting.com/dashboard"
  actionText="View Dashboard"
  timestamp="2025-01-04 15:30:00"
  supportEmail="support@atlashosting.com"
  additionalInfo="Deployment took 2 minutes and 34 seconds."
/>
```

## Severity Levels

The notification template supports four severity levels:

- **Success** (green): ✅ Successful operations, completions
- **Info** (blue): ℹ️ General information, updates
- **Warning** (yellow): ⚠️ Warnings, attention needed
- **Danger** (red): 🚨 Errors, critical issues

## Development

To preview these templates:

1. Run the development server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000 in your browser

3. The templates will be available in the preview interface

## Assets

Make sure to copy the `atlas.svg` logo from `src/assets/atlas.svg` to `emails/static/atlas-logo.png` (converted to PNG format) for the templates to display the logo correctly.

## Integration

These templates are designed to be used with your existing logging system. The notification template's severity levels correspond to your log severity levels:

- `success` → Log success events
- `info` → Log info events  
- `warning` → Log warning events
- `danger` → Log error/danger events
