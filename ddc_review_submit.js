
/**
 * DDC Rounds App — Review & Submit Module
 * ========================================
 * Renders the Review & Submit screen, handles final submission,
 * and shows the success/error overlay.
 *
 * Depends on: ddc_app_submission.js, ddc_engagement_form.js
 */
 
// ── Constants (mirrors ddc_engagement_form.js for display) ───────────────
const RS_RESOLUTION_CONDITIONS = [
  'Non combative, left voluntarily',
  'Combative, left voluntarily',
  'Combative, police notified',
  'Non responsive, health situation',
];
const RS_RESOLUTION_OBSERVATIONS = ['Weapons observed', 'Drug supplies observed', 'Active drug use observed'];
const RS_ER_TYPES    = ['Drug Overdose (DO)', 'Life Threatening Injury (LTI)', 'Mental Health (MH)', 'Minor Physical Injury', 'Injury Incompatible with Life (IIL)'];
const RS_ER_SUPPORT  = ['Narcan', 'CPR', 'Bandage'];
const RS_ER_RESOURCES= ['911', 'Non-emergency Police', 'Mental Health Professional', '311', 'No emergency resources contacted'];
const RS_ENV_TYPES   = ['Damage to Assets','Dangerous Sidewalk','Road Conditions','Erosion','Water Leaks','Encumbrances','Damage to CBID Assets','Sidewalk Damage'];
const RS_KGFS_TYPES  = ['Human Waste Clean Up','Human Biohazard Clean Up','Graffiti Removal','Trash Pick Up'];
const RS_RESOURCES_OFFERED = ['Shelter','Meals','Clothing','Medical','Reunification','Other'];
 
// ── Entry point ───────────────────────────────────────────────────────────
 
function openReviewScreen() {
  const state = DDC.getState();
  const session = state.session;
 
  // DIAGNOSTIC - remove after debugging
  console.log('REVIEW SCREEN - photo_captured:', session.photo_captured);
  console.log('REVIEW SCREEN - photo_data length:', session.photo_data ? session.photo_data.length : 'NULL');
  console.log('REVIEW SCREEN - photo_url:', session.photo_url);
 
  // Update tab bar
  const tabBar = document.querySelector('.tab-bar');
  tabBar.innerHTML =
    '<div class="tab inactive" onclick="goToStartScreen()">Start</div>' +
    '<div class="tab inactive" onclick="reopenEngagementForm()">Form</div>' +
    '<div class="tab active">Review &amp; Submit</div>';
 
  const content = document.getElementById('content-area');
  content.innerHTML = buildReviewHTML(state);
  content.scrollTop = 0;
 
  // Update bottom button
  const bottomWrap = document.querySelector('.bottom-btn-wrap');
  bottomWrap.innerHTML =
    '<button class="btn-ghost-round" onclick="reopenEngagementForm()"><i class="ti ti-arrow-left"></i> Back</button>' +
    '<button class="btn-submit-main" onclick="handleSubmit()"><i class="ti ti-send"></i> Submit Session</button>';
}
 
function reopenEngagementForm() {
  const session = DDC.getSession();
  if (session.engagement_type) {
    openEngagementForm(session.engagement_type);
  } else {
    goToStartScreen();
  }
}
 
// ── Build the full review HTML ────────────────────────────────────────────
 
function buildReviewHTML(state) {
  const session = state.session;
  let html = '<div class="section-header">Review &amp; Submit</div>';
 
  // TEMPORARY DEBUG BANNER - remove after photo issue is resolved
  html += '' +
    '<div style="background:#FFF3CD;border:1px solid #FFC107;border-radius:8px;margin:10px 12px;padding:10px 12px;font-size:12px;">' +
      '<strong>Photo debug:</strong><br>' +
      'photo_captured: ' + session.photo_captured + '<br>' +
      'photo_data: ' + (session.photo_data ? 'present (' + session.photo_data.length + ' chars)' : 'NULL') + '<br>' +
      'photo_url: ' + (session.photo_url || 'none') +
    '</div>';
 
  // ── Session card ──
  html += '' +
    '<div class="card">' +
      '<div class="card-header"><span>Session</span></div>' +
      reviewRow('ti-user',     'Logged by',        session.user_name || DDC.getUser().name) +
      reviewRow('ti-calendar', 'Date',              session.date) +
      reviewRow('ti-clock',    'Time',              session.time) +
      reviewRow('ti-map-pin',  'Location',          session.location_name || '<span class="rs-missing">Not set</span>') +
      reviewRow('ti-category', 'Engagement type',   session.engagement_type || '<span class="rs-missing">Not set</span>') +
    '</div>';
 
  // ── Engagement details card ──
  let detailsContent = '';
  if (session.num_people)           detailsContent += reviewRow('ti-users',      'No. of people',    session.num_people);
  if (session.interaction_initiated) detailsContent += reviewRow('ti-hand-stop', 'Initiated',        session.interaction_initiated);
  if (session.homeless_interaction_type) detailsContent += reviewRow('ti-home',  'Interaction type', session.homeless_interaction_type);
  if (session.health_classification) detailsContent += reviewRow('ti-heart',     'Health classification', session.health_classification);
  if (session.criminal_activity_types && session.criminal_activity_types.length) {
    detailsContent += reviewRow('ti-alert-triangle', 'Activity observed', session.criminal_activity_types.join(', '));
  }
  if (session.notes) detailsContent += reviewRow('ti-notes', 'Notes', session.notes);
  if (session.photo_captured) {
    const photoContent = session.photo_data
      ? '<div style="margin-top:6px;"><img src="' + session.photo_data + '" style="width:100%;max-width:300px;border-radius:8px;display:block;" /></div>'
      : '<span style="color:#5a6a7a;font-style:italic;">Photo captured — will upload on submit</span>';
    detailsContent += reviewRow('ti-camera', 'Photo', photoContent);
  }
 
  if (detailsContent) {
    html += '<div class="card"><div class="card-header"><span>Engagement details</span></div>' + detailsContent + '</div>';
  }
 
  // ── Engagement Resolution ──
  if (state.resolution && state.resolution.length > 0) {
    html += '<div class="card"><div class="card-header"><span>Engagement resolution</span></div>';
    state.resolution.forEach(function(r, i) {
      const condLabel = r.condition || '—';
      const obsLabels = [];
      if (r.weapons_observed)         obsLabels.push('Weapons observed');
      if (r.drug_supplies_observed)   obsLabels.push('Drug supplies observed');
      if (r.active_drug_use_observed) obsLabels.push('Active drug use observed');
 
      html += '' +
        '<div class="rs-person-row">' +
          '<div class="rs-person-num">' + (i + 1) + '</div>' +
          '<div style="flex:1;">' +
            (r.condition ? '<div class="rs-person-cond">' + escapeHtml(condLabel) + '</div>' : '') +
            (obsLabels.length ? '<div style="margin-top:2px;">' + obsLabels.map(function(o) { return '<span class="tag tag-amber">' + o + '</span>'; }).join('') + '</div>' : '') +
            buildResourcesOfferedSummary(r) +
          '</div>' +
        '</div>';
    });
    html += '</div>';
  }
 
  // ── Emergency Response ──
  if (state.emergencyResponse && state.emergencyResponse.length > 0) {
    html += '<div class="card"><div class="card-header"><span>Emergency response</span></div>';
    state.emergencyResponse.forEach(function(er, i) {
      const typeLabels     = (er.types || []).join(', ');
      const supportLabels  = [];
      if (er.narcan_administered)   supportLabels.push('Narcan');
      if (er.cpr_administered)      supportLabels.push('CPR');
      if (er.bandage_administered)  supportLabels.push('Bandage');
      const resourceLabels = [];
      if (er.contacted_911)                        resourceLabels.push('911');
      if (er.contacted_non_emergency_police)       resourceLabels.push('Non-emergency Police');
      if (er.contacted_mental_health_professional) resourceLabels.push('Mental Health Professional');
      if (er.contacted_311)                        resourceLabels.push('311');
 
      html += '' +
        '<div class="rs-person-row">' +
          '<div class="rs-person-num" style="background:#C62828;">' + (i + 1) + '</div>' +
          '<div style="flex:1;">' +
            '<div>' + typeLabels.split(', ').map(function(t) { return '<span class="tag tag-red">' + escapeHtml(t) + '</span>'; }).join('') + '</div>' +
            (supportLabels.length ? '<div style="margin-top:2px;">' + supportLabels.map(function(s) { return '<span class="tag tag-blue">' + s + '</span>'; }).join('') + '</div>' : '') +
            (resourceLabels.length ? '<div style="margin-top:2px;">' + resourceLabels.map(function(r) { return '<span class="tag tag-green">' + r + '</span>'; }).join('') + '</div>' : '') +
            (er.notes ? '<div style="font-size:11px;color:#5a6a7a;margin-top:2px;font-style:italic;">' + escapeHtml(er.notes) + '</div>' : '') +
          '</div>' +
        '</div>';
    });
    html += '</div>';
  }
 
  // ── DPD Call Made ──
  if (session.dpd_call && session.dpd_call.options && session.dpd_call.options.length > 0) {
    const dpdTags = session.dpd_call.options.map(function(o) { return '<span class="tag tag-blue">' + escapeHtml(o) + '</span>'; }).join('');
    html += '<div class="card"><div class="card-header"><span>DPD call made</span></div>';
    html += '<div style="padding:12px 14px;">' + dpdTags + '</div>';
    if (session.dpd_call.notes) {
      html += '<div style="padding:0 14px 12px;font-size:12px;color:#5a6a7a;font-style:italic;">' + escapeHtml(session.dpd_call.notes) + '</div>';
    }
    html += '</div>';
  }
 
  // ── Environmental ──
  if (state.environmental && state.environmental.length > 0) {
    html += '<div class="card"><div class="card-header"><span>Environmental concerns identified</span></div>';
    state.environmental.forEach(function(env) {
      const typeTags = (env.types || []).map(function(t) { return '<span class="tag tag-amber">' + escapeHtml(t) + '</span>'; }).join('');
      html += '<div style="padding:12px 14px;">' + typeTags + '</div>';
      if (env.notes) html += '<div style="padding:0 14px 12px;font-size:12px;color:#5a6a7a;font-style:italic;">' + escapeHtml(env.notes) + '</div>';
    });
    html += '</div>';
  }
 
  // ── KGFS ──
  if (session.kgfs && session.kgfs.logged) {
    html += '' +
      '<div class="rs-kgfs-card">' +
        '<div class="rs-kgfs-header">' +
          '<i class="ti ti-mail"></i>' +
          '<div>' +
            '<div class="rs-kgfs-title">KGFS notification</div>' +
            '<div class="rs-kgfs-sub">Email will be sent to Mitch Freund on submit</div>' +
          '</div>' +
        '</div>' +
        '<div class="rs-kgfs-body">' +
          '<div>' + (session.kgfs.types || []).map(function(t) { return '<span class="tag tag-purple">' + escapeHtml(t) + '</span>'; }).join('') + '</div>' +
          (session.kgfs.notes ? '<div style="font-size:12px;color:#4A148C;margin-top:6px;font-style:italic;">' + escapeHtml(session.kgfs.notes) + '</div>' : '') +
        '</div>' +
      '</div>';
  }
 
  html += '<div style="height:16px;"></div>';
  return html;
}
 
// ── Helper: build resources offered summary per resolution record ──────────
 
function buildResourcesOfferedSummary(r) {
  if (!r.resources_offered) {
    return '<div style="margin-top:2px;font-size:11px;color:#5a6a7a;">No resources offered</div>';
  }
  const offered = r.resources_offered_accepted || [];
  if (offered.length === 0) {
    return '<div style="margin-top:2px;font-size:11px;color:#5a6a7a;">Resources offered (none specified)</div>';
  }
  const tags = offered.map(function(item) {
    let label = item.type;
    if (item.offered && item.accepted) label += ' (Offered & Accepted)';
    else if (item.offered) label += ' (Offered)';
    else if (item.accepted) label += ' (Accepted)';
    return '<span class="tag tag-green">' + escapeHtml(label) + '</span>';
  });
  const notesHtml = r.resources_notes ? '<div style="font-size:11px;color:#5a6a7a;margin-top:2px;font-style:italic;">' + escapeHtml(r.resources_notes) + '</div>' : '';
  return '<div style="margin-top:2px;">' + tags.join('') + '</div>' + notesHtml;
}
 
// ── Helper: review row ────────────────────────────────────────────────────
 
function reviewRow(icon, label, value) {
  return '' +
    '<div class="rs-row">' +
      '<i class="ti ' + icon + ' rs-icon"></i>' +
      '<div>' +
        '<div class="rs-label">' + escapeHtml(label) + '</div>' +
        '<div class="rs-value">' + (value || '—') + '</div>' +
      '</div>' +
    '</div>';
}
 
// ── Submit handler ────────────────────────────────────────────────────────
 
async function handleSubmit() {
  const btn = document.querySelector('.btn-submit-main');
  if (!btn) return;
 
  // Run client-side validation first
  const errors = DDC.validate();
  if (errors.length > 0) {
    showToast(errors[0].message, 'error');
    return;
  }
 
  btn.innerHTML = '<span class="spinner"></span> Submitting…';
  btn.disabled = true;
 
  try {
    const result = await DDC.submitSession();
 
    if (!result.success) {
      showToast('Submission failed: ' + (result.errors ? result.errors[0].message : 'Unknown error'), 'error');
      btn.innerHTML = '<i class="ti ti-send"></i> Submit Session';
      btn.disabled = false;
      return;
    }
 
    showSuccessOverlay(result.kgfs_notified);
 
  } catch (err) {
    showToast('Submission failed: ' + err.message, 'error');
    btn.innerHTML = '<i class="ti ti-send"></i> Submit Session';
    btn.disabled = false;
  }
}
 
// ── Success overlay ───────────────────────────────────────────────────────
 
function showSuccessOverlay(kgfsNotified) {
  let overlay = document.getElementById('success-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'success-overlay';
    overlay.className = 'success-overlay';
    document.body.appendChild(overlay);
  }
 
  const kgfsHtml = kgfsNotified ? '' +
    '<div class="success-kgfs">' +
      '<i class="ti ti-mail-check"></i>' +
      '<div>' +
        '<strong>KGFS team notified</strong>' +
        '<span>Email sent to Mitch Freund</span>' +
      '</div>' +
    '</div>' : '';
 
  overlay.innerHTML = '' +
    '<div class="success-box">' +
      '<div class="success-icon"><i class="ti ti-circle-check"></i></div>' +
      '<h2>Session submitted!</h2>' +
      '<p>This session has been recorded successfully.</p>' +
      kgfsHtml +
      '<button class="btn-done-submit" onclick="startNewRound()">Start new session</button>' +
    '</div>';
 
  overlay.classList.add('open');
}
 
function startNewRound() {
  document.getElementById('success-overlay').classList.remove('open');
  DDC.startNewSession();
  goToStartScreen();
  resetStartScreen();
}
