
/**
 * DDC Rounds App — Session Submission Module
 * ===========================================
 * This file handles all data collection and submission for the DDC Rounds app.
 * 
 * HOW TO USE:
 * 1. Include this script in your mobile app's HTML file
 * 2. Update API_URL to your deployed Apps Script Web App URL
 * 3. Call DDC.init() when the app loads
 * 4. The Submit button calls DDC.submitSession()
 *
 * This module manages:
 * - User authentication (login/logout/token storage)
 * - Session state (collecting all form data as user fills in forms)
 * - Validation (checks all required fields before submission)
 * - Submission (sends data to Google Sheets via Apps Script API)
 * - Location loading (fetches business list from sheet)
 */
 
const DDC = (() => {
 
  // ── Config ────────────────────────────────────────────────────────────────
  const API_URL = 'https://script.google.com/macros/s/AKfycbz4HqUvJToO8bsU9T6sP4mw2hbeKQPVVSCSLHKA4_FDgaBJJp_IaLTF7imafSW_JlLKqQ/exec';
 
  // ── Session state ─────────────────────────────────────────────────────────
  // This object is built up as the user moves through the form screens.
  // Every field the user fills in updates this object.
  // On Submit, the whole object is sent to the API in one call.
  let state = {
    // Auth
    token: null,
    user:  null,
 
    // Session (Start screen)
    session: {
      date:             null,   // auto-set on session start
      time:             null,   // auto-set on session start
      location_id:      null,
      location_name:    null,
      location_address: null,
      location_lat:     null,
      location_lng:     null,
      location_method:  null,   // 'business_list' | 'gps_pin'
      engagement_type:  null,
      num_people:       null,
      interaction_initiated: null,
      notes:            null,
      photo_captured:   false,
      photo_data:       null,
      photo_url:        null,
      homeless_interaction_type: null,  // Blocking ROW
      health_classification:     null,  // Physical/Mental Health
      criminal_activity_types:   [],    // Criminal Activity
 
      // KGFS
      kgfs: {
        logged: false,
        types:  [],
        notes:  null,
      },
 
      // DPD Call (Criminal Activity only)
      dpd_call: {
        options: [],
        notes:   null,
      },
    },
 
    // Per-person resolution records (array, one per person)
    resolution: [],
 
    // Emergency response records (array, one per person)
    emergencyResponse: [],
 
    // Environmental concerns (array)
    environmental: [],
 
    // Locations list (loaded from sheet on app start)
    locations: [],
  };
 
  // ── API helpers ───────────────────────────────────────────────────────────
 
  async function apiPost(body) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body),
      redirect: 'follow',
    });
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error('Invalid response from server: ' + text.substring(0, 100));
    }
  }
 
  async function apiGet(params) {
    const qs  = new URLSearchParams(params).toString();
    const response = await fetch(API_URL + '?' + qs, { redirect: 'follow' });
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error('Invalid response from server: ' + text.substring(0, 100));
    }
  }
 
  // ── Auth ──────────────────────────────────────────────────────────────────
 
  async function login(email, password) {
    const result = await apiPost({ action: 'login', email, password });
    if (!result.token) throw new Error(result.error || 'Login failed');
    state.token = result.token;
    state.user  = result.user;
    // Store token in sessionStorage so user stays logged in during the session
    sessionStorage.setItem('ddc_token', result.token);
    sessionStorage.setItem('ddc_user',  JSON.stringify(result.user));
    return result.user;
  }
 
  function logout() {
    state.token = null;
    state.user  = null;
    sessionStorage.removeItem('ddc_token');
    sessionStorage.removeItem('ddc_user');
  }
 
  function restoreSession() {
    const token = sessionStorage.getItem('ddc_token');
    const user  = sessionStorage.getItem('ddc_user');
    if (token && user) {
      state.token = token;
      state.user  = JSON.parse(user);
      return state.user;
    }
    return null;
  }
 
  // ── Session management ────────────────────────────────────────────────────
 
  function startNewSession() {
    const now = new Date();
    state.session = {
      date:             now.toISOString().split('T')[0],
      time:             now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      location_id:      null,
      location_name:    null,
      location_address: null,
      location_lat:     null,
      location_lng:     null,
      location_method:  null,
      engagement_type:  null,
      num_people:       null,
      interaction_initiated: null,
      notes:            null,
      photo_captured:   false,
      photo_data:       null,
      photo_url:        null,
      health_classification:     null,
      criminal_activity_types:   [],
      kgfs: { logged: false, types: [], notes: null },
      dpd_call: { options: [], notes: null },
    };
    state.resolution       = [];
    state.emergencyResponse = [];
    state.environmental    = [];
  }
 
  // ── Location helpers ──────────────────────────────────────────────────────
 
  async function loadLocations() {
    const result = await apiGet({ action: 'getLocations' });
    if (result.locations) {
      state.locations = result.locations;
    }
    return state.locations;
  }
 
  function setLocationFromBusiness(locationId) {
    const loc = state.locations.find(l => l.location_id === locationId);
    if (!loc) throw new Error('Location not found: ' + locationId);
    state.session.location_id      = loc.location_id;
    state.session.location_name    = loc.name;
    state.session.location_address = loc.address || '';
    state.session.location_lat     = loc.latitude;
    state.session.location_lng     = loc.longitude;
    state.session.location_method  = 'business_list';
  }
 
  function setLocationFromGPS(lat, lng, name) {
    state.session.location_id      = null;
    state.session.location_name    = name || 'GPS location';
    state.session.location_address = '';
    state.session.location_lat     = lat;
    state.session.location_lng     = lng;
    state.session.location_method  = 'gps_pin';
  }
 
  // ── Form field setters ────────────────────────────────────────────────────
  // These are called as the user fills in each screen.
 
  function setEngagementType(type)         { state.session.engagement_type = type; }
  function setNumPeople(n)                 { state.session.num_people = parseInt(n); }
  function setInteractionInitiated(val)    { state.session.interaction_initiated = val; }
  function setNotes(text)                  { state.session.notes = text; }
  function setPhotoCaptured(captured, imageData) {
    state.session.photo_captured = captured;
    state.session.photo_data     = imageData || null;
  }
  function setHomelessInteractionType(val) { state.session.homeless_interaction_type = val; }
  function setHealthClassification(val)    { state.session.health_classification = val; }
  function setCriminalActivityTypes(arr)   { state.session.criminal_activity_types = arr; }
 
  function setKgfs(logged, types, notes) {
    state.session.kgfs = { logged, types: types || [], notes: notes || null };
  }
 
  function setDpdCall(options, notes) {
    state.session.dpd_call = { options: options || [], notes: notes || null };
  }
 
  // ── Change password ───────────────────────────────────────────────────────
 
  async function changePassword(currentPassword, newPassword) {
    if (!state.token) throw new Error('Not logged in');
    const result = await apiPost({
      action:           'changePassword',
      token:            state.token,
      current_password: currentPassword,
      new_password:     newPassword,
    });
    if (!result.success) throw new Error(result.error || 'Password change failed');
    return result;
  }
 
  async function selfResetPassword(email) {
    const result = await apiPost({
      action: 'selfResetPassword',
      email:  email,
    });
    if (!result.success) throw new Error(result.error || 'Password reset failed');
    return result;
  }
 
  // ── Resolution records ────────────────────────────────────────────────────
 
  function setResolution(records) {
    // records = array of { condition, weapons_observed, drug_supplies_observed, active_drug_use_observed }
    state.resolution = records;
  }
 
  // ── Emergency response records ────────────────────────────────────────────
 
  function setEmergencyResponse(records) {
    // records = array of {
    //   person_number, types[], narcan_administered, cpr_administered,
    //   bandage_administered, contacted_911, contacted_non_emergency_police,
    //   contacted_mental_health_professional, contacted_311, notes
    // }
    state.emergencyResponse = records;
  }
 
  // ── Environmental records ─────────────────────────────────────────────────
 
  function setEnvironmental(records) {
    // records = array of { types[], notes }
    state.environmental = records;
  }
 
  // ── Validation ────────────────────────────────────────────────────────────
 
  function validate() {
    const errors = [];
 
    // Required: location
    if (!state.session.location_name) {
      errors.push({ field: 'location', message: 'Location is required — please set a map point or select a business.' });
    }
 
    // Required: engagement type
    if (!state.session.engagement_type) {
      errors.push({ field: 'engagement_type', message: 'Please select an activity type.' });
    }
 
    // Required: number of people (except Business Engagement)
    if (state.session.engagement_type !== 'Business Engagement' && !state.session.num_people) {
      errors.push({ field: 'num_people', message: 'Number of people is required.' });
    }
 
    // Check non-responsive people have emergency response records
    if (state.resolution.length > 0) {
      const nonResponsiveCount = state.resolution.filter(
        r => r.condition === 'Non responsive, health situation'
      ).length;
      if (nonResponsiveCount > 0 && state.emergencyResponse.length < nonResponsiveCount) {
        errors.push({
          field: 'emergency_response',
          message: nonResponsiveCount + ' person(s) marked Non Responsive — at least ' + nonResponsiveCount + ' Emergency Response record(s) required.',
        });
      }
    }
 
    // Check engagement resolution count doesn't exceed num_people
    if (state.resolution.length > state.session.num_people) {
      errors.push({
        field: 'resolution',
        message: 'Engagement Resolution count (' + state.resolution.length + ') cannot exceed No. of People (' + state.session.num_people + ').',
      });
    }
 
    // Check emergency response count doesn't exceed num_people
    if (state.emergencyResponse.length > state.session.num_people) {
      errors.push({
        field: 'emergency_response',
        message: 'Emergency Response count cannot exceed No. of People (' + state.session.num_people + ').',
      });
    }
 
    return errors;
  }
 
  // ── Submission ────────────────────────────────────────────────────────────
 
  async function submitSession() {
    if (!state.token) throw new Error('Not logged in');
 
    // Run validation
    const errors = validate();
    if (errors.length > 0) {
      return { success: false, errors };
    }
 
    // Upload photo if one was taken (captured or chosen)
    if (state.session.photo_data) {
      try {
        const photoResult = await apiPost({
          action:     'uploadPhoto',
          token:      state.token,
          photo_data: state.session.photo_data,
          mime_type:  'image/jpeg',
        });
        console.log('Photo upload result:', JSON.stringify(photoResult));
        if (photoResult.photo_url) {
          state.session.photo_url = photoResult.photo_url;
        } else if (photoResult.error) {
          console.warn('Photo upload error:', photoResult.error);
        }
      } catch (photoErr) {
        console.warn('Photo upload failed:', photoErr.message);
      }
      // Clear raw image data from payload — it's large and already uploaded
      state.session.photo_data = null;
    } else {
      console.log('Photo upload skipped — captured:', state.session.photo_captured, 'data present:', !!state.session.photo_data);
    }
 
    // Build payload
    const payload = {
      action:            'submitSession',
      token:             state.token,
      session:           state.session,
      resolution:        state.resolution,
      emergencyResponse: state.emergencyResponse,
      environmental:     state.environmental,
    };
 
    const result = await apiPost(payload);
 
    if (!result.session_id) {
      throw new Error(result.error || 'Submission failed');
    }
 
    return {
      success:       true,
      session_id:    result.session_id,
      kgfs_notified: result.kgfs_notified,
    };
  }
 
  // ── State reader (for Review & Submit screen) ─────────────────────────────
 
  function getState()   { return state; }
  function getSession() { return state.session; }
  function getUser()    { return state.user; }
 
  // ── Init ──────────────────────────────────────────────────────────────────
 
  async function init() {
    // Try to restore existing session
    const user = restoreSession();
    // Load locations in background
    try { await loadLocations(); } catch (e) { console.warn('Could not load locations:', e); }
    return user;
  }
 
  // ── Public API ────────────────────────────────────────────────────────────
  return {
    init,
    login,
    logout,
    restoreSession,
    startNewSession,
    loadLocations,
    setLocationFromBusiness,
    setLocationFromGPS,
    setEngagementType,
    setNumPeople,
    setInteractionInitiated,
    setNotes,
    setPhotoCaptured,
    setHomelessInteractionType,
    setHealthClassification,
    setCriminalActivityTypes,
    setKgfs,
    setDpdCall,
    changePassword,
    selfResetPassword,
    setResolution,
    setEmergencyResponse,
    setEnvironmental,
    validate,
    submitSession,
    getState,
    getSession,
    getUser,
    get locations() { return state.locations; },
  };
 
})();
 
// ── Usage examples ────────────────────────────────────────────────────────
//
// INITIALIZE APP:
//   const user = await DDC.init();
//   if (user) showMainScreen(); else showLoginScreen();
//
// LOGIN:
//   const user = await DDC.login('jamie@ddcdenver.org', 'password');
//   DDC.startNewSession();
//
// SET LOCATION (from business list):
//   DDC.setLocationFromBusiness('loc_007'); // Chase Bank
//
// SET LOCATION (from GPS):
//   DDC.setLocationFromGPS(39.7403, -104.9817, 'Near Chase Bank');
//
// FILL IN FORM:
//   DDC.setEngagementType('Clearing Doorway');
//   DDC.setNumPeople(3);
//   DDC.setInteractionInitiated('Encountered during normal rounds');
//   DDC.setNotes('Individual sleeping in doorway, asked to relocate.');
//
// SET RESOLUTION:
//   DDC.setResolution([
//     { condition: 'Non combative, left voluntarily', weapons_observed: false, drug_supplies_observed: true,  active_drug_use_observed: false },
//     { condition: 'Non combative, left voluntarily', weapons_observed: false, drug_supplies_observed: false, active_drug_use_observed: false },
//     { condition: 'Non responsive, health situation', weapons_observed: false, drug_supplies_observed: false, active_drug_use_observed: true  },
//   ]);
//
// SET EMERGENCY RESPONSE:
//   DDC.setEmergencyResponse([
//     {
//       person_number: 1,
//       types: ['Drug Overdose (DO)'],
//       narcan_administered: true,
//       cpr_administered: false,
//       bandage_administered: false,
//       contacted_911: true,
//       contacted_non_emergency_police: false,
//       contacted_mental_health_professional: false,
//       contacted_311: false,
//       notes: 'Narcan administered, responding.',
//     }
//   ]);
//
// SET KGFS:
//   DDC.setKgfs(true, ['Human Waste Clean Up'], 'Near doorway entrance.');
//
// SUBMIT:
//   const result = await DDC.submitSession();
//   if (result.success) {
//     showSuccessScreen(result.kgfs_notified);
//   } else {
//     showValidationErrors(result.errors);
//   }
