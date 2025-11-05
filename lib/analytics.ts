'use client'

interface AnalyticsEvent {
  name: string
  properties?: Record<string, any>
}

class Analytics {
  private isEnabled = process.env.NODE_ENV === 'production'

  track(event: AnalyticsEvent) {
    if (!this.isEnabled) {
      console.log('Analytics Event:', event)
      return
    }

    // Add your analytics provider here (Google Analytics, Mixpanel, etc.)
    try {
      // Example for Google Analytics 4
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', event.name, event.properties)
      }
    } catch (error) {
      console.error('Analytics error:', error)
    }
  }

  page(path: string, title?: string) {
    if (!this.isEnabled) {
      console.log('Analytics Page View:', { path, title })
      return
    }

    try {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
          page_path: path,
          page_title: title
        })
      }
    } catch (error) {
      console.error('Analytics error:', error)
    }
  }

  identify(userId: string, traits?: Record<string, any>) {
    if (!this.isEnabled) {
      console.log('Analytics Identify:', { userId, traits })
      return
    }

    try {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
          user_id: userId,
          custom_map: traits
        })
      }
    } catch (error) {
      console.error('Analytics error:', error)
    }
  }
}

export const analytics = new Analytics()

// Common events
export const trackEvent = {
  challengeStarted: (challengeId: string, challengeName: string) =>
    analytics.track({
      name: 'challenge_started',
      properties: { challenge_id: challengeId, challenge_name: challengeName }
    }),

  challengeCompleted: (challengeId: string, challengeName: string, day: number) =>
    analytics.track({
      name: 'challenge_completed',
      properties: { challenge_id: challengeId, challenge_name: challengeName, day }
    }),

  duaViewed: (duaId: string, category: string) =>
    analytics.track({
      name: 'dua_viewed',
      properties: { dua_id: duaId, category }
    }),

  settingsChanged: (setting: string, value: any) =>
    analytics.track({
      name: 'settings_changed',
      properties: { setting, value }
    }),

  userLogin: (method: string) =>
    analytics.track({
      name: 'user_login',
      properties: { method }
    }),

  userSignup: (method: string) =>
    analytics.track({
      name: 'user_signup',
      properties: { method }
    })
}