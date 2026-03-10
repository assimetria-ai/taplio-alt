// @custom/utils/timezone.js - Timezone Handling Utilities

/**
 * Timezone Utilities for Newsletter Scheduling
 * Handles timezone conversions, optimal time suggestions, and scheduling logic
 */

/**
 * Get current time in a specific timezone
 * @param {string} timezone - IANA timezone (e.g., "America/New_York")
 * @returns {Date} - Current time in that timezone
 */
function getCurrentTimeInTimezone(timezone) {
  return new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));
}

/**
 * Convert scheduled time from sender's timezone to recipient's timezone
 * @param {Date|string} scheduledTime - Time in sender's timezone
 * @param {string} senderTimezone - Sender's IANA timezone
 * @param {string} recipientTimezone - Recipient's IANA timezone
 * @returns {Date} - Scheduled time in recipient's timezone
 */
function convertToRecipientTimezone(scheduledTime, senderTimezone, recipientTimezone) {
  const date = new Date(scheduledTime);
  
  // Get UTC timestamp
  const utcTime = date.toLocaleString('en-US', { timeZone: 'UTC' });
  
  // Convert to recipient's timezone
  return new Date(new Date(utcTime).toLocaleString('en-US', { timeZone: recipientTimezone }));
}

/**
 * Check if a time falls within the allowed send window
 * @param {Date} time - Time to check
 * @param {Object} sendWindow - Send window configuration
 * @param {string} sendWindow.startTime - Start time (HH:MM)
 * @param {string} sendWindow.endTime - End time (HH:MM)
 * @param {number[]} sendWindow.daysOfWeek - Allowed days (0=Sun, 6=Sat)
 * @returns {boolean} - True if within window
 */
function isWithinSendWindow(time, sendWindow) {
  if (!sendWindow) return true;
  
  const hour = time.getHours();
  const minute = time.getMinutes();
  const dayOfWeek = time.getDay();
  
  // Check day of week
  if (sendWindow.daysOfWeek && !sendWindow.daysOfWeek.includes(dayOfWeek)) {
    return false;
  }
  
  // Check time window
  if (sendWindow.startTime && sendWindow.endTime) {
    const [startHour, startMinute] = sendWindow.startTime.split(':').map(Number);
    const [endHour, endMinute] = sendWindow.endTime.split(':').map(Number);
    
    const currentMinutes = hour * 60 + minute;
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    
    if (currentMinutes < startMinutes || currentMinutes > endMinutes) {
      return false;
    }
  }
  
  return true;
}

/**
 * Find the next valid send time within the send window
 * @param {Date} proposedTime - Proposed send time
 * @param {Object} sendWindow - Send window configuration
 * @param {string} timezone - Timezone for the send window
 * @returns {Date} - Next valid send time
 */
function findNextValidSendTime(proposedTime, sendWindow, timezone) {
  if (!sendWindow) return proposedTime;
  
  let candidateTime = new Date(proposedTime);
  const maxDaysToCheck = 7; // Don't look more than a week ahead
  let daysChecked = 0;
  
  while (daysChecked < maxDaysToCheck) {
    if (isWithinSendWindow(candidateTime, sendWindow)) {
      return candidateTime;
    }
    
    // Move to next valid time
    if (sendWindow.startTime) {
      const [startHour, startMinute] = sendWindow.startTime.split(':').map(Number);
      candidateTime.setHours(startHour, startMinute, 0, 0);
      
      // If this time is still before now or not in valid day, move to next day
      if (candidateTime <= proposedTime || !sendWindow.daysOfWeek.includes(candidateTime.getDay())) {
        candidateTime.setDate(candidateTime.getDate() + 1);
        daysChecked++;
      } else {
        break;
      }
    } else {
      break;
    }
  }
  
  return candidateTime;
}

/**
 * Suggest optimal send time based on recipient behavior
 * @param {Object} recipient - Recipient data
 * @param {Array} openHistory - Array of timestamp when emails were opened
 * @param {Array} clickHistory - Array of timestamp when emails were clicked
 * @param {string} recipientTimezone - Recipient's timezone
 * @returns {Object} - Optimal time suggestion with confidence
 */
function suggestOptimalSendTime(recipient, openHistory = [], clickHistory = [], recipientTimezone) {
  // Combine open and click history
  const allInteractions = [...openHistory, ...clickHistory]
    .map(ts => new Date(ts))
    .filter(d => !isNaN(d.getTime()));
  
  if (allInteractions.length === 0) {
    // No history - use industry best practices
    return getIndustryBestPractices(recipientTimezone);
  }
  
  // Analyze interaction patterns
  const hourFrequency = {};
  const dayFrequency = {};
  
  allInteractions.forEach(date => {
    const hour = date.getHours();
    const day = date.getDay();
    
    hourFrequency[hour] = (hourFrequency[hour] || 0) + 1;
    dayFrequency[day] = (dayFrequency[day] || 0) + 1;
  });
  
  // Find most frequent hour and day
  const optimalHour = Object.entries(hourFrequency)
    .sort((a, b) => b[1] - a[1])[0][0];
  
  const optimalDay = Object.entries(dayFrequency)
    .sort((a, b) => b[1] - a[1])[0][0];
  
  // Calculate confidence based on sample size
  const confidence = Math.min(allInteractions.length / 20, 1); // 20+ samples = full confidence
  
  // Find next occurrence of this day/hour combination
  const now = new Date();
  const targetDate = new Date(now);
  
  // Move to next occurrence of optimal day
  const daysToAdd = (parseInt(optimalDay) - now.getDay() + 7) % 7;
  targetDate.setDate(targetDate.getDate() + daysToAdd);
  targetDate.setHours(parseInt(optimalHour), 0, 0, 0);
  
  // If that time has passed today, move to next week
  if (targetDate <= now) {
    targetDate.setDate(targetDate.getDate() + 7);
  }
  
  return {
    recommendedTime: targetDate.toISOString(),
    confidence: parseFloat(confidence.toFixed(2)),
    reasoning: `Based on ${allInteractions.length} past interactions, this recipient is most active on ${getDayName(optimalDay)} around ${optimalHour}:00`,
    basedOn: ['historical_opens', 'recipient_activity'],
    optimalHour: parseInt(optimalHour),
    optimalDay: parseInt(optimalDay),
    timezone: recipientTimezone
  };
}

/**
 * Get industry best practices for send times (when no recipient data)
 * @param {string} timezone - Recipient timezone
 * @returns {Object} - Best practice send time
 */
function getIndustryBestPractices(timezone) {
  // Industry research shows Tuesday-Thursday, 10 AM is optimal
  const now = new Date();
  const targetDate = new Date(now);
  
  // Move to next Tuesday (2) if today is Friday or later
  const today = now.getDay();
  let daysToAdd = 0;
  
  if (today === 0 || today === 6 || today === 5) { // Sunday, Saturday, Friday
    daysToAdd = (2 - today + 7) % 7;
  } else if (today > 2) { // Wednesday or Thursday
    daysToAdd = (2 - today + 7) % 7;
  } else {
    daysToAdd = (2 - today + 7) % 7;
  }
  
  targetDate.setDate(targetDate.getDate() + daysToAdd);
  targetDate.setHours(10, 0, 0, 0); // 10 AM
  
  // If that time has passed, move to next Tuesday
  if (targetDate <= now) {
    targetDate.setDate(targetDate.getDate() + 7);
  }
  
  return {
    recommendedTime: targetDate.toISOString(),
    confidence: 0.5, // Medium confidence (industry average)
    reasoning: 'Industry best practice: Tuesday at 10 AM has the highest open rates on average',
    basedOn: ['industry_benchmarks'],
    optimalHour: 10,
    optimalDay: 2, // Tuesday
    timezone: timezone
  };
}

/**
 * Get day name from day number
 */
function getDayName(dayNum) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayNum];
}

/**
 * Validate IANA timezone string
 * @param {string} timezone - Timezone to validate
 * @returns {boolean} - True if valid
 */
function isValidTimezone(timezone) {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch (ex) {
    return false;
  }
}

/**
 * Get timezone offset in hours
 * @param {string} timezone - IANA timezone
 * @returns {number} - Offset in hours from UTC
 */
function getTimezoneOffset(timezone) {
  const now = new Date();
  const tzString = now.toLocaleString('en-US', { timeZone: timezone, timeZoneName: 'short' });
  const match = tzString.match(/GMT([+-]\d+)/);
  return match ? parseInt(match[1]) : 0;
}

module.exports = {
  getCurrentTimeInTimezone,
  convertToRecipientTimezone,
  isWithinSendWindow,
  findNextValidSendTime,
  suggestOptimalSendTime,
  getIndustryBestPractices,
  isValidTimezone,
  getTimezoneOffset,
  getDayName
};
