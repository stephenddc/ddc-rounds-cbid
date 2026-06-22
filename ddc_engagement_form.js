
/* DDC Rounds App - Engagement Form Module (Clearing A Doorway base) */
 
const RESOLUTION_CONDITIONS = [
  'Non combative, left voluntarily',
  'Combative, left voluntarily',
  'Combative, police notified',
  'Non responsive, health situation',
];
const RESOLUTION_OBSERVATIONS = [
  'Weapons observed',
  'Drug supplies observed',
  'Active drug use observed',
];
 
const RESOURCES_OFFERED_TYPES = [
  'Shelter',
  'Meals',
  'Clothing',
  'Medical',
  'Reunification',
  'Other',
];
 
const ER_TYPES = [
  'Drug Overdose (DO)',
  'Life Threatening Injury (LTI)',
  'Mental Health (MH)',
  'Minor Physical Injury',
  'Injury Incompatible with Life (IIL)',
];
const ER_SUPPORT = ['Narcan', 'CPR', 'Bandage'];
const ER_RESOURCES = ['911', 'Non-emergency Police', 'Mental Health Professional', '311', 'No emergency resources contacted'];
 
const ENV_TYPES = [
  'Damage to Assets',
  'Dangerous Sidewalk',
  'Road Conditions',
  'Erosion',
  'Water Leaks',
  'Encumbrances',
  'Damage to CBID Assets',
  'Sidewalk Damage',
];
 
const KGFS_TYPES = [
  'Human Waste Clean Up',
  'Human Biohazard Clean Up',
  'Graffiti Removal',
  'Trash Pick Up',
];
 
const DPD_CALL_OPTIONS = [
  '911',
  '311',
  'Non-emergency Police',
  'No call was made',
];
const DPD_NO_CALL_IDX = 3; // index of 'No call was made'
 
const HOMELESS_INTERACTION_TYPES = [
  'Trespassing - Request Removal from Property',
  'Blocking Right of Way - Request Relocation',
  'Structure Erected - Request Removal',
];
 
const CRIMINAL_ACTIVITY_TYPES_LIST = [
  'Breaking & Entering Physical Property',
  'Breaking & Entering Automobile',
  'Physical Altercation between 2 or more people',
  'Arson',
  'Vandalism',
  'Drug Transaction'
];
 
const HEALTH_CLASSIFICATIONS = ['Physical', 'Mental', 'Physical & Mental'];
 
const ENGAGEMENT_CONFIGS = {
  'Clearing Doorway': {
    title: 'Clearing A Doorway',
    showHomelessInteraction: false,
    showHealthClassification: false,
    showCriminalActivity: false,
    showFullSections: true,
    showCondition: true,
    showResolution: true,
    showDpdCall: false,
    mutuallyExclusiveInitiated: true,
  },
  'General Outreach': {
    title: 'General Outreach',
    showHomelessInteraction: false,
    showHealthClassification: false,
    showCriminalActivity: false,
    showFullSections: true,
    showCondition: false,
    showResolution: true,
    showDpdCall: false,
    mutuallyExclusiveInitiated: true,
  },
  'Blocking Right of Way/Trespassing': {
    title: 'Blocking Right of Way/Trespassing',
    showHomelessInteraction: true,
    showHealthClassification: false,
    showCriminalActivity: false,
    showFullSections: true,
    showCondition: true,
    showResolution: true,
    showDpdCall: false,
    mutuallyExclusiveInitiated: true,
  },
  'Physical/Mental Health Response': {
    title: 'Physical/Mental Health Response',
    showHomelessInteraction: false,
    showHealthClassification: true,
    showCriminalActivity: false,
    showFullSections: true,
    showCondition: true,
    showResolution: true,
    showDpdCall: false,
    mutuallyExclusiveInitiated: true,
  },
  'Business Engagement': {
    title: 'Business Engagement',
    showHomelessInteraction: false,
    showHealthClassification: false,
    showCriminalActivity: false,
    showFullSections: false,
    showCondition: false,
    showResolution: false,
    showDpdCall: false,
    showNumPeople: false,
    mutuallyExclusiveInitiated: true,
    initiatedOptions: [
      'Dream Team initiated Community Engagement',
      'Business Requested Engagement',
    ],
  },
  'Criminal Activity Observed': {
    title: 'Criminal Activity Observed',
    showHomelessInteraction: false,
    showHealthClassification: false,
    showCriminalActivity: true,
    showFullSections: true,
    showCondition: true,
    showResolution: false,
    showDpdCall: true,
    mutuallyExclusiveInitiated: true,
  },
};
 
let formState = {
  numPeople: null,
  initiated: [],
  homelessInteractionType: [],
  healthClassification: null,
  criminalActivityTypes: [],
  notes: '',
  resolution: [],
  emergencyResponse: [],
  environmental: [],
  kgfs: [],
  dpdCall: { selected: [], notes: '' },
};
 
let currentEngagementConfig = null;
 
function resetFormState() {
  formState = {
    numPeople: null,
    initiated: [],
    homelessInteractionType: [],
    healthClassification: null,
    criminalActivityTypes: [],
    notes: '',
    resolution: [],
    emergencyResponse: [],
    environmental: [],
    kgfs: [],
    dpdCall: { selected: [], notes: '' },
  };
}
 
function openEngagementForm(engagementType) {
  currentEngagementConfig = ENGAGEMENT_CONFIGS[engagementType];
  if (!currentEngagementConfig) {
    showToast('Unknown engagement type: ' + engagementType, 'error');
    return;
  }
  resetFormState();
  renderEngagementForm();
}
 
function renderEngagementForm() {
  const cfg = currentEngagementConfig;
  const content = document.getElementById('content-area');
  const tabBar  = document.querySelector('.tab-bar');
 
  tabBar.innerHTML =
    '<div class="tab inactive" onclick="confirmBackToStart()">Start</div>' +
    '<div class="tab active">' + escapeHtml(shortenTitle(cfg.title)) + '</div>' +
    '<div class="tab inactive" style="opacity:0.4;">Review &amp; Submit</div>';
 
  let html = '<div class="section-header">' + escapeHtml(cfg.title) + '</div>';
 
  if (cfg.showNumPeople !== false) {
    html += '' +
      '<div class="card">' +
        '<div class="card-header"><span>No. of people</span></div>' +
        '<div class="field-wrap">' +
          '<input class="num-input" type="number" inputmode="numeric" min="1" placeholder="Enter number..." id="num-people" value="' + (formState.numPeople || '') + '" oninput="onNumPeopleChange(this.value)" />' +
        '</div>' +
      '</div>' +
      '<p class="validation-msg" id="num-people-err">Number of people is required.</p>';
  }
 
  const initiatedOptions = cfg.initiatedOptions || ['Responded to a call by a business', 'Encountered during normal rounds'];
  html += '' +
    '<div class="card">' +
      '<div class="card-header"><span>How was the interaction initiated?</span></div>' +
      (cfg.mutuallyExclusiveInitiated
        ? initiatedOptions.map(function(label, i) { return renderRadioRow('init-' + i, label, formState.initiated.indexOf(i) >= 0, "selectInitiated(" + i + ")"); }).join('')
        : initiatedOptions.map(function(label, i) { return renderCheckRow('init-' + i, label, formState.initiated.indexOf(i) >= 0, "toggleArrayField('initiated', " + i + ")"); }).join('')) +
    '</div>';
 
  if (cfg.showHomelessInteraction) {
    html += '<div class="card"><div class="card-header"><span>Type of homeless interaction</span></div>';
    for (let i = 0; i < HOMELESS_INTERACTION_TYPES.length; i++) {
      html += renderCheckRow('homeless-' + i, HOMELESS_INTERACTION_TYPES[i], formState.homelessInteractionType.indexOf(i) >= 0, "toggleArrayField('homelessInteractionType', " + i + ")");
    }
    html += '</div>';
  }
 
  if (cfg.showHealthClassification) {
    html += '<div class="card"><div class="card-header"><span>How would you classify the health response?</span></div>';
    for (let i = 0; i < HEALTH_CLASSIFICATIONS.length; i++) {
      html += renderRadioRow('health-' + i, HEALTH_CLASSIFICATIONS[i], formState.healthClassification === i, "selectHealthClassification(" + i + ")");
    }
    html += '</div>';
  }
 
  if (cfg.showCriminalActivity) {
    html += '<div class="card"><div class="card-header"><span>Type of activity observed</span><p>Select all that apply</p></div>';
    for (let i = 0; i < CRIMINAL_ACTIVITY_TYPES_LIST.length; i++) {
      html += renderCheckRow('crim-' + i, CRIMINAL_ACTIVITY_TYPES_LIST[i], formState.criminalActivityTypes.indexOf(i) >= 0, "toggleArrayField('criminalActivityTypes', " + i + ")");
    }
    html += '</div>';
  }
 
  if (cfg.showFullSections && cfg.showResolution !== false) {
    const resStatus = getResolutionStatus();
    html += '' +
      '<div class="card">' +
        '<div class="card-header"><span>Engagement resolution</span><p>Tap to record condition for each person</p></div>' +
        '<div class="eng-res-row" onclick="openResolutionPanel()">' +
          '<span style="font-size:14px;color:#1a2332;">' + escapeHtml(resStatus.label) + '</span>' +
          '<div style="display:flex;align-items:center;gap:8px;">' +
            '<span class="er-status ' + (resStatus.done ? 'done' : '') + '">' + resStatus.status + '</span>' +
            '<i class="ti ti-chevron-right" style="font-size:16px;color:#5a6a7a;"></i>' +
          '</div>' +
        '</div>' +
      '</div>';
  }
 
  html += '' +
    '<div class="card">' +
      '<div class="card-header"><span>Notes</span></div>' +
      '<textarea class="notes-area" placeholder="Enter text..." oninput="formState.notes = this.value">' + escapeHtml(formState.notes) + '</textarea>' +
    '</div>';
 
  if (cfg.showFullSections) {
    // DPD Call (Criminal Activity only) replaces Emergency Response
    if (cfg.showDpdCall) {
      html += renderDpdCallSection();
    } else {
      const erCount = formState.emergencyResponse.length;
      html += '<div class="card"><div class="card-header"><span>Emergency response</span></div>';
      if (erCount > 0) {
        html += renderSubRecordTable(formState.emergencyResponse.map(function(r) {
          return {
            label: r.types.map(function(i) { return ER_TYPES[i]; }).join(', '),
            sub: r.support.map(function(i) { return ER_SUPPORT[i]; }).concat(r.resources.map(function(i) { return ER_RESOURCES[i]; })).join(', '),
          };
        }), 'emergencyResponse');
      }
      html += '<button class="add-row-btn" onclick="openEmergencyResponsePanel()"><i class="ti ti-clipboard-plus"></i> Add</button></div>';
    }
 
    const envCount = formState.environmental.length;
    html += '<div class="card"><div class="card-header"><span>Environmental concerns identified</span></div>';
    if (envCount > 0) {
      html += renderSubRecordTable(formState.environmental.map(function(r) {
        return { label: r.types.map(function(i) { return ENV_TYPES[i]; }).join(', '), sub: r.notes || '' };
      }), 'environmental');
    }
    html += '<button class="add-row-btn" onclick="openEnvironmentalPanel()"><i class="ti ti-clipboard-plus"></i> Add</button></div>';
 
    const kgfsCount = formState.kgfs.length;
    html += '<div class="card"><div class="card-header"><span>KGFS requests</span></div>';
    if (kgfsCount > 0) {
      html += renderSubRecordTable(formState.kgfs.map(function(r) {
        return { label: r.types.map(function(i) { return KGFS_TYPES[i]; }).join(', '), sub: r.notes || '' };
      }), 'kgfs');
    }
    html += '<button class="add-row-btn" onclick="openKgfsPanel()"><i class="ti ti-clipboard-plus"></i> Add</button></div>';
  }
 
  html += '<div style="height:8px;"></div>';
  content.innerHTML = html;
 
  const bottomWrap = document.querySelector('.bottom-btn-wrap');
  bottomWrap.innerHTML =
    '<button class="btn-ghost-round" onclick="confirmBackToStart()"><i class="ti ti-arrow-left"></i> Back</button>' +
    '<button class="btn-round active-state" onclick="handleSaveAndContinue()">Save &amp; Continue \u2192</button>';
}
 
function shortenTitle(title) {
  return title.length > 22 ? title.substring(0, 20) + '...' : title;
}
 
function renderCheckRow(id, label, checked, onclick) {
  return '' +
    '<div class="check-row" onclick="' + onclick + '">' +
      '<div class="checkbox ' + (checked ? 'checked' : '') + '" id="' + id + '"></div>' +
      '<span class="check-label">' + escapeHtml(label) + '</span>' +
    '</div>';
}
 
function renderRadioRow(id, label, selected, onclick) {
  return '' +
    '<div class="check-row" onclick="' + onclick + '">' +
      '<div class="radio ' + (selected ? 'selected' : '') + '" id="' + id + '"></div>' +
      '<span class="check-label">' + escapeHtml(label) + '</span>' +
    '</div>';
}
 
function renderSubRecordTable(records, fieldName) {
  let html = '<table class="sub-table"><tbody>';
  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    html += '' +
      '<tr>' +
        '<td>' +
          '<div class="sub-record-label">' + escapeHtml(r.label || '-') + '</div>' +
          (r.sub ? '<div class="sub-record-sub">' + escapeHtml(r.sub) + '</div>' : '') +
        '</td>' +
        '<td style="width:36px;text-align:right;">' +
          '<button class="del-btn" onclick="removeSubRecord(\'' + fieldName + '\', ' + i + ')"><i class="ti ti-x"></i></button>' +
        '</td>' +
      '</tr>';
  }
  html += '</tbody></table>';
  return html;
}
 
function removeSubRecord(fieldName, idx) {
  formState[fieldName].splice(idx, 1);
  renderEngagementForm();
}
 
function onNumPeopleChange(val) {
  formState.numPeople = val ? parseInt(val) : null;
  document.getElementById('num-people-err').classList.remove('show');
}
 
function toggleArrayField(field, idx) {
  const arr = formState[field];
  const i = arr.indexOf(idx);
  if (i >= 0) arr.splice(i, 1);
  else arr.push(idx);
  renderEngagementForm();
}
 
function selectInitiated(idx) {
  formState.initiated = [idx];
  renderEngagementForm();
}
 
function selectHealthClassification(idx) {
  formState.healthClassification = idx;
  renderEngagementForm();
}
 
function getResolutionStatus() {
  const total = formState.numPeople || 0;
  const recorded = formState.resolution.length;
  if (total === 0) return { label: 'Enter No. of People first', status: '-', done: false };
  if (recorded === 0) return { label: 'Not yet recorded', status: '-', done: false };
  if (recorded >= total) return { label: recorded + (recorded === 1 ? ' person' : ' people') + ' recorded', status: 'Complete', done: true };
  return { label: recorded + ' of ' + total + ' recorded', status: 'In progress', done: false };
}
 
/* ENGAGEMENT RESOLUTION PANEL */
 
let resPanelState = { total: 0, current: 0, records: [], selectedCondition: null, selectedObs: [] };
 
function openResolutionPanel() {
  if (!formState.numPeople || formState.numPeople < 1) {
    showToast('Please enter No. of People first.', 'error');
    document.getElementById('num-people-err').classList.add('show');
    return;
  }
  const total = formState.numPeople;
  const existing = formState.resolution;
  resPanelState.total = total;
  resPanelState.current = 0;
  resPanelState.records = [];
  for (let i = 0; i < total; i++) {
    const e = existing[i];
    resPanelState.records.push(e ? {
      condition: e.condition,
      obs: e.obs.slice(),
      resourcesOffered: e.resourcesOffered != null ? e.resourcesOffered : null,
      resourcesDetail: e.resourcesDetail ? e.resourcesDetail.map(function(d) { return { offered: d.offered, accepted: d.accepted }; }) : RESOURCES_OFFERED_TYPES.map(function() { return { offered: false, accepted: false }; }),
      resourcesNotes: e.resourcesNotes || '',
    } : {
      condition: null,
      obs: [],
      resourcesOffered: null,
      resourcesDetail: RESOURCES_OFFERED_TYPES.map(function() { return { offered: false, accepted: false }; }),
      resourcesNotes: '',
    });
  }
  showOverlayPanel('resolution-panel');
  renderResolutionEntry();
}
 
function renderResolutionEntry() {
  const total = resPanelState.total;
  const body = document.getElementById('resolution-panel-body');
 
  body.innerHTML = '' +
    '<div style="padding:12px 14px 0;">' +
      '<p style="font-size:13px;color:#5a6a7a;margin-bottom:10px;">Recording resolution for <strong>' + total + '</strong> ' + (total === 1 ? 'person' : 'people') + ' (from No. of People).</p>' +
      '<p style="font-size:11px;color:#5a6a7a;">If fewer people remained for resolution, you can reduce this below - but it cannot exceed ' + total + '.</p>' +
      '<div style="margin-top:10px;">' +
        '<input class="num-input" type="number" inputmode="numeric" min="1" max="' + total + '" value="' + total + '" id="res-count-input" oninput="onResCountChange(this.value, ' + total + ')" />' +
      '</div>' +
      '<p class="validation-msg" id="res-count-err">Cannot exceed ' + total + ' (the No. of People for this session).</p>' +
    '</div>';
 
  document.getElementById('resolution-panel-title').textContent = 'Engagement Resolution';
  document.getElementById('resolution-panel-footer').innerHTML =
    '<button class="btn-ghost-round" onclick="closeOverlayPanel(\'resolution-panel\')">Cancel</button>' +
    '<button class="btn-round active-state" onclick="startResolutionCycling()">Begin \u2192</button>';
}
 
function onResCountChange(val, max) {
  const num = parseInt(val);
  const err = document.getElementById('res-count-err');
  if (num > max) {
    document.getElementById('res-count-input').value = max;
    err.classList.add('show');
  } else {
    err.classList.remove('show');
  }
}
 
function startResolutionCycling() {
  const inputVal = parseInt(document.getElementById('res-count-input').value);
  if (!inputVal || inputVal < 1) { showToast('Please enter a valid number.', 'error'); return; }
  if (inputVal > resPanelState.total) { showToast('Cannot exceed ' + resPanelState.total + ' (No. of People).', 'error'); return; }
 
  resPanelState.total = inputVal;
  const trimmed = resPanelState.records.slice(0, inputVal).map(function(r) { return r || makeEmptyResRecord(); });
  while (trimmed.length < inputVal) trimmed.push(makeEmptyResRecord());
  resPanelState.records = trimmed;
  resPanelState.current = 0;
  renderResolutionCycling();
}
 
function makeEmptyResRecord() {
  return {
    condition: null,
    obs: [],
    resourcesOffered: null,
    resourcesDetail: RESOURCES_OFFERED_TYPES.map(function() { return { offered: false, accepted: false }; }),
    resourcesNotes: '',
  };
}
 
function renderResolutionCycling() {
  const rec = resPanelState.records[resPanelState.current];
  resPanelState.selectedCondition = rec.condition;
  resPanelState.selectedObs = rec.obs.slice();
  resPanelState.selectedResourcesOffered = rec.resourcesOffered;
  resPanelState.selectedResourcesDetail = rec.resourcesDetail.map(function(d) { return { offered: d.offered, accepted: d.accepted }; });
  resPanelState.selectedResourcesNotes = rec.resourcesNotes || '';
 
  const cfg = currentEngagementConfig;
  const body = document.getElementById('resolution-panel-body');
 
  let dotsHtml = '';
  for (let i = 0; i < resPanelState.records.length; i++) {
    const r = resPanelState.records[i];
    const isDone = cfg.showCondition ? (r.condition !== null) : (r.resourcesOffered !== null);
    dotsHtml += '<div class="dot ' + (i === resPanelState.current ? 'active' : (isDone ? 'done' : '')) + '"></div>';
  }
 
  let html = '<div class="person-badge"><span>Person ' + (resPanelState.current + 1) + ' of ' + resPanelState.total + '</span><div class="dots">' + dotsHtml + '</div></div>';
 
  if (cfg.showCondition) {
    let condHtml = '';
    for (let i = 0; i < RESOLUTION_CONDITIONS.length; i++) {
      condHtml += renderRadioRow('res-cond-' + i, RESOLUTION_CONDITIONS[i], resPanelState.selectedCondition === i, "selectResCondition(" + i + ")");
    }
    html += '<div class="card" style="margin-top:10px;"><div class="card-header"><span>Condition of the individual</span></div>' + condHtml +
      '<p class="validation-msg" id="res-cond-err">Please select a condition to continue.</p></div>';
  }
 
  let obsHtml = '';
  for (let i = 0; i < RESOLUTION_OBSERVATIONS.length; i++) {
    obsHtml += renderCheckRow('res-obs-' + i, RESOLUTION_OBSERVATIONS[i], resPanelState.selectedObs.indexOf(i) >= 0, "toggleResObs(" + i + ")");
  }
  html += '<div class="card"' + (cfg.showCondition ? '' : ' style="margin-top:10px;"') + '><div class="card-header"><span>Condition observed</span></div>' + obsHtml + '</div>';
 
  // Were resources offered?
  html += '' +
    '<div class="card" id="res-offered-card">' +
      '<div class="card-header"><span>Were resources offered?</span></div>' +
      renderRadioRow('res-offered-yes', 'Yes', resPanelState.selectedResourcesOffered === true, "selectResourcesOffered(true)") +
      renderRadioRow('res-offered-no', 'No', resPanelState.selectedResourcesOffered === false, "selectResourcesOffered(false)") +
      '<p class="validation-msg" id="res-offered-err">Please select Yes or No.</p>' +
    '</div>';
 
  if (resPanelState.selectedResourcesOffered === true) {
    html += renderResourcesOfferedSection();
  }
 
  body.innerHTML = html;
 
  document.getElementById('resolution-panel-title').textContent = 'Engagement Resolution';
 
  const isLast = resPanelState.current === resPanelState.total - 1;
  document.getElementById('resolution-panel-footer').innerHTML =
    (resPanelState.current > 0
      ? '<button class="btn-ghost-round" onclick="resolutionPrev()"><i class="ti ti-arrow-left"></i> Back</button>'
      : '<button class="btn-ghost-round" onclick="closeOverlayPanel(\'resolution-panel\')">Cancel</button>') +
    '<button class="btn-round active-state" onclick="resolutionSave(' + isLast + ')">' + (isLast ? 'Finish' : 'Next person \u2192') + '</button>';
}
 
function renderResourcesOfferedSection() {
  const OTHER_IDX = RESOURCES_OFFERED_TYPES.indexOf('Other');
  const otherOffered = resPanelState.selectedResourcesDetail[OTHER_IDX] && resPanelState.selectedResourcesDetail[OTHER_IDX].offered;
 
  let rowsHtml = '';
  for (let i = 0; i < RESOURCES_OFFERED_TYPES.length; i++) {
    const d = resPanelState.selectedResourcesDetail[i];
    rowsHtml += '' +
      '<div class="res-offer-row">' +
        '<span class="res-offer-label">' + escapeHtml(RESOURCES_OFFERED_TYPES[i]) + '</span>' +
        '<label class="res-offer-check">' +
          '<div class="checkbox ' + (d.offered ? 'checked' : '') + '" id="res-offer-' + i + '" onclick="toggleResourceDetail(' + i + ', \'offered\')"></div>' +
          '<span>Offered</span>' +
        '</label>' +
        '<label class="res-offer-check">' +
          '<div class="checkbox ' + (d.accepted ? 'checked' : '') + '" id="res-accept-' + i + '" onclick="toggleResourceDetail(' + i + ', \'accepted\')"></div>' +
          '<span>Accepted</span>' +
        '</label>' +
      '</div>';
  }
 
  // Other notes field — required when Other is offered
  const otherNotesHtml = otherOffered ? '' +
    '<div class="field-wrap" style="border-top:0.5px solid #E0E0E0;">' +
      '<label class="form-label-sm">Other — please describe (required)</label>' +
      '<textarea class="notes-area" id="res-other-notes" placeholder="Describe the other resource offered..." oninput="resPanelState.selectedResourcesNotes = this.value">' + escapeHtml(resPanelState.selectedResourcesNotes) + '</textarea>' +
      '<p class="validation-msg" id="res-other-notes-err">Please describe the other resource offered.</p>' +
    '</div>' : '' +
    '<div class="field-wrap" style="border-top:0.5px solid #E0E0E0;">' +
      '<label class="form-label-sm">Notes (optional)</label>' +
      '<textarea class="notes-area" placeholder="Enter text..." oninput="resPanelState.selectedResourcesNotes = this.value">' + escapeHtml(resPanelState.selectedResourcesNotes) + '</textarea>' +
    '</div>';
 
  return '' +
    '<div class="card" id="res-offered-detail-card">' +
      '<div class="card-header"><span>Resources offered / accepted</span><p>At least one "Offered" box must be checked</p></div>' +
      '<div class="res-offer-table">' + rowsHtml + '</div>' +
      '<p class="validation-msg" id="res-offered-detail-err">Please check at least one "Offered" box.</p>' +
      otherNotesHtml +
    '</div>';
}
 
function selectResourcesOffered(val) {
  resPanelState.selectedResourcesOffered = val;
  resPanelState.records[resPanelState.current] = buildResRecordFromPanel();
  document.getElementById('res-offered-err').classList.remove('show');
  renderResolutionCycling();
}
 
function toggleResourceDetail(idx, key) {
  const detail = resPanelState.selectedResourcesDetail[idx];
  const OTHER_IDX = RESOURCES_OFFERED_TYPES.indexOf('Other');
 
  if (key === 'accepted') {
    // Checking accepted auto-checks offered; unchecking accepted is always allowed
    detail.accepted = !detail.accepted;
    if (detail.accepted && !detail.offered) {
      detail.offered = true;
    }
  } else {
    // key === 'offered': cannot uncheck offered while accepted is still checked
    if (detail.offered && detail.accepted) {
      // Silently ignore — can't remove offered while accepted is on
      return;
    }
    detail.offered = !detail.offered;
  }
 
  if (idx === OTHER_IDX && key === 'offered') {
    // Re-render so the required notes field appears/disappears
    resPanelState.records[resPanelState.current] = buildResRecordFromPanel();
    renderResolutionCycling();
  } else {
    // Targeted DOM update for performance
    const offeredEl  = document.getElementById('res-offer-' + idx);
    const acceptedEl = document.getElementById('res-accept-' + idx);
    if (offeredEl)  offeredEl.className  = 'checkbox' + (detail.offered  ? ' checked' : '');
    if (acceptedEl) acceptedEl.className = 'checkbox' + (detail.accepted ? ' checked' : '');
    const errEl = document.getElementById('res-offered-detail-err');
    if (errEl) errEl.classList.remove('show');
  }
}
 
function selectResCondition(idx) {
  resPanelState.selectedCondition = idx;
  for (let i = 0; i < RESOLUTION_CONDITIONS.length; i++) {
    document.getElementById('res-cond-' + i).className = 'radio' + (i === idx ? ' selected' : '');
  }
  document.getElementById('res-cond-err').classList.remove('show');
}
 
function toggleResObs(idx) {
  const arr = resPanelState.selectedObs;
  const i = arr.indexOf(idx);
  if (i >= 0) arr.splice(i, 1);
  else arr.push(idx);
  document.getElementById('res-obs-' + idx).classList.toggle('checked');
}
 
function resolutionSave(finish) {
  const cfg = currentEngagementConfig;
  if (cfg.showCondition && resPanelState.selectedCondition === null) {
    document.getElementById('res-cond-err').classList.add('show');
    return;
  }
  if (resPanelState.selectedResourcesOffered === null) {
    document.getElementById('res-offered-err').classList.add('show');
    return;
  }
  if (resPanelState.selectedResourcesOffered === true) {
    const anyOffered = resPanelState.selectedResourcesDetail.some(function(d) { return d.offered; });
    if (!anyOffered) {
      const errEl = document.getElementById('res-offered-detail-err');
      if (errEl) errEl.classList.add('show');
      return;
    }
    const OTHER_IDX = RESOURCES_OFFERED_TYPES.indexOf('Other');
    const otherOffered = resPanelState.selectedResourcesDetail[OTHER_IDX] && resPanelState.selectedResourcesDetail[OTHER_IDX].offered;
    if (otherOffered && !resPanelState.selectedResourcesNotes.trim()) {
      const errEl = document.getElementById('res-other-notes-err');
      if (errEl) errEl.classList.add('show');
      document.getElementById('res-other-notes').focus();
      return;
    }
  }
  resPanelState.records[resPanelState.current] = buildResRecordFromPanel();
  if (finish) renderResolutionSummary();
  else { resPanelState.current++; renderResolutionCycling(); }
}
 
function buildResRecordFromPanel() {
  return {
    condition: resPanelState.selectedCondition,
    obs: resPanelState.selectedObs.slice(),
    resourcesOffered: resPanelState.selectedResourcesOffered,
    resourcesDetail: resPanelState.selectedResourcesDetail.map(function(d) { return { offered: d.offered, accepted: d.accepted }; }),
    resourcesNotes: resPanelState.selectedResourcesNotes,
  };
}
 
function resolutionPrev() {
  resPanelState.records[resPanelState.current] = buildResRecordFromPanel();
  resPanelState.current--;
  renderResolutionCycling();
}
 
function renderResolutionSummary() {
  const cfg = currentEngagementConfig;
  const body = document.getElementById('resolution-panel-body');
 
  let rowsHtml = '';
  for (let i = 0; i < resPanelState.records.length; i++) {
    const r = resPanelState.records[i];
    let obsHtml = '<span style="font-size:11px;color:#5a6a7a;">None observed</span>';
    if (r.obs.length) {
      obsHtml = r.obs.map(function(o) { return '<span class="tag tag-amber">' + escapeHtml(RESOLUTION_OBSERVATIONS[o]) + '</span>'; }).join('');
    }
 
    let resourcesHtml = '';
    if (r.resourcesOffered === true) {
      const offeredTags = [];
      for (let j = 0; j < RESOURCES_OFFERED_TYPES.length; j++) {
        const d = r.resourcesDetail[j];
        if (d.offered || d.accepted) {
          let label = RESOURCES_OFFERED_TYPES[j];
          if (d.offered && d.accepted) label += ' (Offered & Accepted)';
          else if (d.offered) label += ' (Offered)';
          else label += ' (Accepted)';
          offeredTags.push('<span class="tag tag-green">' + escapeHtml(label) + '</span>');
        }
      }
      resourcesHtml = '<div style="margin-top:2px;">' + (offeredTags.length ? offeredTags.join('') : '<span style="font-size:11px;color:#5a6a7a;">Resources offered, none selected</span>') + '</div>';
    } else if (r.resourcesOffered === false) {
      resourcesHtml = '<div style="margin-top:2px;"><span style="font-size:11px;color:#5a6a7a;">No resources offered</span></div>';
    }
 
    const condHtml = cfg.showCondition
      ? '<div class="person-cond">' + escapeHtml(RESOLUTION_CONDITIONS[r.condition]) + '</div>'
      : '';
 
    rowsHtml += '' +
      '<div class="person-row">' +
        '<div class="person-num">' + (i + 1) + '</div>' +
        '<div style="flex:1;">' +
          condHtml +
          '<div style="margin-top:2px;">' + obsHtml + '</div>' +
          resourcesHtml +
        '</div>' +
        '<button class="edit-btn" onclick="resolutionEdit(' + i + ')"><i class="ti ti-edit"></i></button>' +
      '</div>';
  }
 
  body.innerHTML = '' +
    '<div class="complete-banner"><i class="ti ti-circle-check"></i><span>All ' + resPanelState.total + ' ' + (resPanelState.total === 1 ? 'person' : 'people') + ' recorded.</span></div>' +
    '<div class="card" style="margin:10px 12px;">' + rowsHtml + '</div>';
 
  document.getElementById('resolution-panel-title').textContent = 'Engagement Resolution — Complete';
  document.getElementById('resolution-panel-footer').innerHTML =
    '<button class="btn-ghost-round" onclick="resolutionRestart()"><i class="ti ti-edit"></i> Edit</button>' +
    '<button class="btn-round active-state" style="background:#2E7D32;" onclick="resolutionDone()">Done</button>';
}
 
function resolutionEdit(idx) { resPanelState.current = idx; renderResolutionCycling(); }
function resolutionRestart()  { resPanelState.current = 0;  renderResolutionCycling(); }
 
function resolutionDone() {
  formState.resolution = resPanelState.records.map(function(r) {
    return {
      condition: r.condition,
      obs: r.obs.slice(),
      resourcesOffered: r.resourcesOffered,
      resourcesDetail: r.resourcesDetail.map(function(d) { return { offered: d.offered, accepted: d.accepted }; }),
      resourcesNotes: r.resourcesNotes,
    };
  });
  closeOverlayPanel('resolution-panel');
  renderEngagementForm();
}
 
/* EMERGENCY RESPONSE PANEL */
 
let erPanelState = { total: 0, current: 0, records: [], selectedTypes: [], selectedSupport: [], selectedResources: [], notes: '' };
 
function getNonResponsiveCount() {
  let count = 0;
  for (let i = 0; i < formState.resolution.length; i++) {
    if (formState.resolution[i].condition === 3) count++;
  }
  return count;
}
 
function openEmergencyResponsePanel() {
  const sessionTotal = formState.numPeople || 0;
  const nonResponsive = getNonResponsiveCount();
 
  showOverlayPanel('er-panel');
 
  // If records already exist, reopen them for editing directly
  if (formState.emergencyResponse.length > 0) {
    erPanelState.total = formState.emergencyResponse.length;
    erPanelState.records = formState.emergencyResponse.map(function(r) {
      const types = [];
      ER_TYPES.forEach(function(t, i) { if (r.types.indexOf(t) >= 0) types.push(i); });
      const support = [];
      if (r.narcan_administered) support.push(0);
      if (r.cpr_administered) support.push(1);
      if (r.bandage_administered) support.push(2);
      const resources = [];
      if (r.contacted_911) resources.push(0);
      if (r.contacted_non_emergency_police) resources.push(1);
      if (r.contacted_mental_health_professional) resources.push(2);
      if (r.contacted_311) resources.push(3);
      if (resources.length === 0) resources.push(4); // No emergency resources contacted
      return { types: types, support: support, resources: resources, notes: r.notes || '' };
    });
    erPanelState.current = 0;
    renderErCycling();
    return;
  }
 
  erPanelState.total = 0;
  erPanelState.current = 0;
  erPanelState.records = [];
 
  const body = document.getElementById('er-panel-body');
  let hint = '';
  if (sessionTotal > 0) hint += 'Cannot exceed session total of ' + sessionTotal + '. ';
  if (nonResponsive > 0) hint += 'At least ' + nonResponsive + ' record' + (nonResponsive > 1 ? 's' : '') + ' required (non-responsive).';
 
  body.innerHTML = '' +
    '<div style="padding:12px 14px 0;">' +
      '<p style="font-size:13px;color:#5a6a7a;margin-bottom:10px;">How many people does this emergency response cover?</p>' +
      '<input class="num-input" type="number" inputmode="numeric" min="1" max="' + (sessionTotal || 99) + '" placeholder="Enter number..." id="er-num-input" oninput="onErNumChange(' + sessionTotal + ', ' + nonResponsive + ')" />' +
      '<p class="hint-text ' + (nonResponsive > 0 ? 'warn' : '') + '" id="er-num-hint">' + escapeHtml(hint) + '</p>' +
    '</div>';
 
  document.getElementById('er-panel-title').textContent = 'Emergency Response';
  document.getElementById('er-panel-footer').innerHTML =
    '<button class="btn-ghost-round" onclick="closeOverlayPanel(\'er-panel\')">Cancel</button>' +
    '<button class="btn-round active-state" onclick="startErCycling(' + sessionTotal + ')">Begin \u2192</button>';
}
 
function onErNumChange(sessionTotal, nonResponsive) {
  const val = parseInt(document.getElementById('er-num-input').value) || 0;
  const hint = document.getElementById('er-num-hint');
  if (sessionTotal > 0 && val > sessionTotal) {
    document.getElementById('er-num-input').value = sessionTotal;
    hint.textContent = 'Capped at session total of ' + sessionTotal + '.';
    hint.className = 'hint-text warn';
  } else if (nonResponsive > 0 && val < nonResponsive) {
    hint.textContent = 'At least ' + nonResponsive + ' required (non-responsive).';
    hint.className = 'hint-text warn';
  } else if (val > 0) {
    hint.textContent = val + ' emergency response record' + (val > 1 ? 's' : '') + ' will be created.';
    hint.className = 'hint-text';
  }
}
 
function startErCycling(sessionTotal) {
  const val = parseInt(document.getElementById('er-num-input').value);
  if (!val || val < 1) { showToast('Please enter a valid number.', 'error'); return; }
  if (sessionTotal > 0 && val > sessionTotal) { showToast('Cannot exceed session total of ' + sessionTotal + '.', 'error'); return; }
 
  erPanelState.total = val;
  erPanelState.records = [];
  for (let i = 0; i < val; i++) erPanelState.records.push({ types: [], support: [], resources: [], notes: '' });
  erPanelState.current = 0;
  renderErCycling();
}
 
function renderErCycling() {
  const rec = erPanelState.records[erPanelState.current];
  erPanelState.selectedTypes     = rec.types.slice();
  erPanelState.selectedSupport   = rec.support.slice();
  erPanelState.selectedResources = rec.resources.slice();
  erPanelState.notes = rec.notes;
 
  const body = document.getElementById('er-panel-body');
 
  let dotsHtml = '';
  for (let i = 0; i < erPanelState.records.length; i++) {
    const r = erPanelState.records[i];
    dotsHtml += '<div class="dot ' + (i === erPanelState.current ? 'active' : (r.types.length > 0 ? 'done' : '')) + '"></div>';
  }
 
  let typesHtml = '';
  for (let i = 0; i < ER_TYPES.length; i++) {
    typesHtml += renderCheckRow('er-type-' + i, ER_TYPES[i], erPanelState.selectedTypes.indexOf(i) >= 0, "toggleErField('selectedTypes', " + i + ", 'er-type-')");
  }
  let supportHtml = '';
  for (let i = 0; i < ER_SUPPORT.length; i++) {
    supportHtml += renderCheckRow('er-support-' + i, ER_SUPPORT[i], erPanelState.selectedSupport.indexOf(i) >= 0, "toggleErField('selectedSupport', " + i + ", 'er-support-')");
  }
  let resourcesHtml = '';
  for (let i = 0; i < ER_RESOURCES.length; i++) {
    resourcesHtml += renderCheckRow('er-res-' + i, ER_RESOURCES[i], erPanelState.selectedResources.indexOf(i) >= 0, "toggleErField('selectedResources', " + i + ", 'er-res-')");
  }
 
  body.innerHTML = '' +
    '<div class="person-badge"><span>Person ' + (erPanelState.current + 1) + ' of ' + erPanelState.total + '</span><div class="dots">' + dotsHtml + '</div></div>' +
    '<div class="card" id="er-card-type" style="margin-top:10px;"><div class="card-header"><span>Type of emergency response</span><p>Required - select all that apply</p></div>' + typesHtml +
      '<p class="validation-msg" id="er-type-err">Please select at least one type.</p></div>' +
    '<div class="card"><div class="card-header"><span>Support administered</span><p>Optional - select all that apply</p></div>' + supportHtml + '</div>' +
    '<div class="card" id="er-card-resources"><div class="card-header"><span>Emergency resources contacted</span><p>Required - select one or more, or "No emergency resources contacted"</p></div>' + resourcesHtml +
      '<p class="validation-msg" id="er-res-err">Please select at least one resource.</p></div>' +
    '<div class="card"><div class="card-header"><span>Notes</span></div><textarea class="notes-area" placeholder="Enter text..." oninput="erPanelState.notes = this.value">' + escapeHtml(erPanelState.notes) + '</textarea></div>';
 
  document.getElementById('er-panel-title').textContent = 'Emergency Response';
 
  const isLast = erPanelState.current === erPanelState.total - 1;
  document.getElementById('er-panel-footer').innerHTML =
    (erPanelState.current > 0
      ? '<button class="btn-ghost-round" onclick="erPrev()"><i class="ti ti-arrow-left"></i> Back</button>'
      : '<button class="btn-ghost-round" onclick="closeOverlayPanel(\'er-panel\')">Cancel</button>') +
    '<button class="btn-round active-state" onclick="erSave(' + isLast + ')">' + (isLast ? 'Finish' : 'Next \u2192') + '</button>';
}
 
function toggleErField(field, idx, prefix) {
  const arr = erPanelState[field];
  const NONE_IDX = 4; // 'No emergency resources contacted'
 
  if (field === 'selectedResources') {
    if (idx === NONE_IDX) {
      erPanelState.selectedResources = (arr.indexOf(NONE_IDX) >= 0) ? [] : [NONE_IDX];
    } else {
      const noneIdx = arr.indexOf(NONE_IDX);
      if (noneIdx >= 0) arr.splice(noneIdx, 1);
      const i = arr.indexOf(idx);
      if (i >= 0) arr.splice(i, 1);
      else arr.push(idx);
    }
    document.getElementById('er-res-err').classList.remove('show');
    document.getElementById('er-card-resources').classList.remove('has-error');
    erPanelState.records[erPanelState.current].resources = erPanelState.selectedResources.slice();
    renderErCycling();
    return;
  }
 
  const i = arr.indexOf(idx);
  if (i >= 0) arr.splice(i, 1);
  else arr.push(idx);
  document.getElementById(prefix + idx).classList.toggle('checked');
 
  if (field === 'selectedTypes') {
    erPanelState.records[erPanelState.current].types = erPanelState.selectedTypes.slice();
    document.getElementById('er-type-err').classList.remove('show');
    document.getElementById('er-card-type').classList.remove('has-error');
  }
  if (field === 'selectedSupport') {
    erPanelState.records[erPanelState.current].support = erPanelState.selectedSupport.slice();
  }
}
 
function erSave(finish) {
  let valid = true;
  if (erPanelState.selectedTypes.length === 0) {
    document.getElementById('er-type-err').classList.add('show');
    document.getElementById('er-card-type').classList.add('has-error');
    valid = false;
  }
  if (erPanelState.selectedResources.length === 0) {
    document.getElementById('er-res-err').classList.add('show');
    document.getElementById('er-card-resources').classList.add('has-error');
    valid = false;
  }
  if (!valid) return;
 
  erPanelState.records[erPanelState.current] = {
    types: erPanelState.selectedTypes.slice(),
    support: erPanelState.selectedSupport.slice(),
    resources: erPanelState.selectedResources.slice(),
    notes: erPanelState.notes,
  };
 
  if (finish) renderErSummary();
  else { erPanelState.current++; renderErCycling(); }
}
 
function erPrev() {
  erPanelState.records[erPanelState.current] = {
    types: erPanelState.selectedTypes.slice(),
    support: erPanelState.selectedSupport.slice(),
    resources: erPanelState.selectedResources.slice(),
    notes: erPanelState.notes,
  };
  erPanelState.current--;
  renderErCycling();
}
 
function renderErSummary() {
  const body = document.getElementById('er-panel-body');
 
  let rowsHtml = '';
  for (let i = 0; i < erPanelState.records.length; i++) {
    const r = erPanelState.records[i];
    const typeTags = r.types.map(function(t) { return '<span class="tag tag-red">' + escapeHtml(ER_TYPES[t]) + '</span>'; }).join('');
    const suppTags = r.support.map(function(s) { return '<span class="tag tag-blue">' + escapeHtml(ER_SUPPORT[s]) + '</span>'; }).join('');
    const resTags  = r.resources.map(function(rc) { return '<span class="tag tag-green">' + escapeHtml(ER_RESOURCES[rc]) + '</span>'; }).join('');
    const noteHtml = r.notes ? '<div style="font-size:11px;color:#5a6a7a;margin-top:2px;font-style:italic;">' + escapeHtml(r.notes) + '</div>' : '';
 
    rowsHtml += '' +
      '<div class="person-row">' +
        '<div class="person-num" style="background:#C62828;">' + (i + 1) + '</div>' +
        '<div style="flex:1;">' +
          '<div>' + typeTags + '</div>' +
          '<div style="margin-top:2px;">' + suppTags + resTags + '</div>' +
          noteHtml +
        '</div>' +
        '<button class="edit-btn" onclick="erEdit(' + i + ')"><i class="ti ti-edit"></i></button>' +
      '</div>';
  }
 
  body.innerHTML = '' +
    '<div class="complete-banner"><i class="ti ti-circle-check"></i><span>All ' + erPanelState.total + ' ' + (erPanelState.total === 1 ? 'person' : 'people') + ' recorded.</span></div>' +
    '<div class="card" style="margin:10px 12px;">' + rowsHtml + '</div>';
 
  document.getElementById('er-panel-title').textContent = 'Emergency Response — Complete';
  document.getElementById('er-panel-footer').innerHTML =
    '<button class="btn-ghost-round" onclick="erRestart()"><i class="ti ti-edit"></i> Edit</button>' +
    '<button class="btn-round active-state" style="background:#2E7D32;" onclick="erDone()">Done</button>';
}
 
function erEdit(idx)  { erPanelState.current = idx; renderErCycling(); }
function erRestart()  { erPanelState.current = 0;   renderErCycling(); }
 
function erDone() {
  formState.emergencyResponse = erPanelState.records.map(function(r, i) {
    return { person_number: i + 1, types: r.types.slice(), support: r.support.slice(), resources: r.resources.slice(), notes: r.notes };
  });
  closeOverlayPanel('er-panel');
  renderEngagementForm();
}
 
/* ENVIRONMENTAL CONCERNS PANEL */
 
/* DPD CALL SECTION */
 
function renderDpdCallSection() {
  const sel = formState.dpdCall.selected;
  const noCallSelected = sel.indexOf(DPD_NO_CALL_IDX) >= 0;
 
  let optionsHtml = '';
  for (let i = 0; i < DPD_CALL_OPTIONS.length; i++) {
    optionsHtml += renderCheckRow('dpd-' + i, DPD_CALL_OPTIONS[i], sel.indexOf(i) >= 0, "toggleDpdCallOption(" + i + ")");
  }
 
  let noCallNotesHtml = '';
  if (noCallSelected) {
    noCallNotesHtml = '' +
      '<div class="field-wrap" style="border-top:0.5px solid #E0E0E0;">' +
        '<label class="form-label-sm">Why was no call made? (required)</label>' +
        '<textarea class="notes-area" id="dpd-no-call-notes" placeholder="Explain why no call was made..." oninput="formState.dpdCall.notes = this.value">' + escapeHtml(formState.dpdCall.notes) + '</textarea>' +
        '<p class="validation-msg" id="dpd-no-call-notes-err">Please explain why no call was made.</p>' +
      '</div>';
  }
 
  return '' +
    '<div class="card" id="dpd-call-card">' +
      '<div class="card-header"><span>DPD Call Made</span><p>Select all that apply</p></div>' +
      optionsHtml +
      '<p class="validation-msg" id="dpd-call-err">Please select at least one option.</p>' +
      noCallNotesHtml +
    '</div>';
}
 
function toggleDpdCallOption(idx) {
  const sel = formState.dpdCall.selected;
  const NO_CALL = DPD_NO_CALL_IDX;
 
  if (idx === NO_CALL) {
    // "No call was made" is mutually exclusive with the others
    if (sel.indexOf(NO_CALL) >= 0) {
      formState.dpdCall.selected = [];
    } else {
      formState.dpdCall.selected = [NO_CALL];
    }
    formState.dpdCall.notes = '';
  } else {
    // Selecting a real call option clears "No call was made"
    const noCallIdx = sel.indexOf(NO_CALL);
    if (noCallIdx >= 0) sel.splice(noCallIdx, 1);
    const i = sel.indexOf(idx);
    if (i >= 0) sel.splice(i, 1);
    else sel.push(idx);
    formState.dpdCall.notes = '';
  }
 
  renderEngagementForm();
}
 
let envPanelState = { selectedTypes: [], notes: '' };
 
function openEnvironmentalPanel() {
  const existing = formState.environmental[0];
  envPanelState = existing
    ? { selectedTypes: existing.types.slice(), notes: existing.notes || '' }
    : { selectedTypes: [], notes: '' };
  showOverlayPanel('env-panel');
  renderEnvironmentalPanel();
}
 
function renderEnvironmentalPanel() {
  const body = document.getElementById('env-panel-body');
 
  let typesHtml = '';
  for (let i = 0; i < ENV_TYPES.length; i++) {
    typesHtml += renderCheckRow('env-type-' + i, ENV_TYPES[i], envPanelState.selectedTypes.indexOf(i) >= 0, "toggleEnvType(" + i + ")");
  }
 
  body.innerHTML = '' +
    '<div class="card" id="env-card-type" style="margin-top:10px;"><div class="card-header"><span>Type of environmental issue</span><p>Select all that apply</p></div>' + typesHtml +
      '<p class="validation-msg" id="env-type-err">Please select at least one issue type.</p></div>' +
    '<div class="card"><div class="card-header"><span>Notes</span><p>Optional</p></div><textarea class="notes-area" placeholder="Enter text..." oninput="envPanelState.notes = this.value">' + escapeHtml(envPanelState.notes) + '</textarea></div>';
 
  document.getElementById('env-panel-title').textContent = 'Environmental Concerns Identified';
  document.getElementById('env-panel-footer').innerHTML =
    '<button class="btn-ghost-round" onclick="closeOverlayPanel(\'env-panel\')">Back</button>' +
    '<button class="btn-round active-state" onclick="envSave()">+ Add</button>';
}
 
function toggleEnvType(idx) {
  const arr = envPanelState.selectedTypes;
  const i = arr.indexOf(idx);
  if (i >= 0) arr.splice(i, 1);
  else arr.push(idx);
  document.getElementById('env-type-' + idx).classList.toggle('checked');
  document.getElementById('env-type-err').classList.remove('show');
  document.getElementById('env-card-type').classList.remove('has-error');
}
 
function envSave() {
  if (envPanelState.selectedTypes.length === 0) {
    document.getElementById('env-type-err').classList.add('show');
    document.getElementById('env-card-type').classList.add('has-error');
    return;
  }
  formState.environmental = [{ types: envPanelState.selectedTypes.slice(), notes: envPanelState.notes }];
  closeOverlayPanel('env-panel');
  renderEngagementForm();
}
 
/* KGFS REQUESTS PANEL */
 
let kgfsPanelState = { selectedTypes: [], notes: '' };
 
function openKgfsPanel() {
  const existing = formState.kgfs[0];
  kgfsPanelState = existing
    ? { selectedTypes: existing.types.slice(), notes: existing.notes || '' }
    : { selectedTypes: [], notes: '' };
  showOverlayPanel('kgfs-panel');
  renderKgfsPanel();
}
 
function renderKgfsPanel() {
  const body = document.getElementById('kgfs-panel-body');
 
  let typesHtml = '';
  for (let i = 0; i < KGFS_TYPES.length; i++) {
    typesHtml += renderCheckRow('kgfs-type-' + i, KGFS_TYPES[i], kgfsPanelState.selectedTypes.indexOf(i) >= 0, "toggleKgfsType(" + i + ")");
  }
 
  body.innerHTML = '' +
    '<div class="context-note"><i class="ti ti-info-circle"></i><span>A notification will be sent to the KGFS team upon submission of this session.</span></div>' +
    '<div class="card" id="kgfs-card-type"><div class="card-header"><span>Type of cleaning issue observed</span><p>Select all that apply</p></div>' + typesHtml +
      '<p class="validation-msg" id="kgfs-type-err">Please select at least one issue type.</p></div>' +
    '<div class="card"><div class="card-header"><span>Notes</span><p>Optional - for the KGFS team</p></div><textarea class="notes-area" placeholder="Enter text..." oninput="kgfsPanelState.notes = this.value">' + escapeHtml(kgfsPanelState.notes) + '</textarea></div>';
 
  document.getElementById('kgfs-panel-title').textContent = 'KGFS Requests';
  document.getElementById('kgfs-panel-footer').innerHTML =
    '<button class="btn-ghost-round" onclick="closeOverlayPanel(\'kgfs-panel\')">Back</button>' +
    '<button class="btn-round active-state" onclick="kgfsSave()">+ Add</button>';
}
 
function toggleKgfsType(idx) {
  const arr = kgfsPanelState.selectedTypes;
  const i = arr.indexOf(idx);
  if (i >= 0) arr.splice(i, 1);
  else arr.push(idx);
  document.getElementById('kgfs-type-' + idx).classList.toggle('checked');
  document.getElementById('kgfs-type-err').classList.remove('show');
  document.getElementById('kgfs-card-type').classList.remove('has-error');
}
 
function kgfsSave() {
  if (kgfsPanelState.selectedTypes.length === 0) {
    document.getElementById('kgfs-type-err').classList.add('show');
    document.getElementById('kgfs-card-type').classList.add('has-error');
    return;
  }
  formState.kgfs = [{ types: kgfsPanelState.selectedTypes.slice(), notes: kgfsPanelState.notes }];
  closeOverlayPanel('kgfs-panel');
  renderEngagementForm();
}
 
/* OVERLAY PANEL HELPERS */
 
function showOverlayPanel(id) {
  let panel = document.getElementById(id);
  if (!panel) panel = createOverlayPanel(id);
  panel.classList.add('open');
}
 
function createOverlayPanel(id) {
  const panel = document.createElement('div');
  panel.id = id;
  panel.className = 'full-panel';
  panel.innerHTML = '' +
    '<div class="full-panel-header">' +
      '<span id="' + id + '-title">-</span>' +
      '<button class="full-panel-close" onclick="closeOverlayPanel(\'' + id + '\')">\u2715</button>' +
    '</div>' +
    '<div class="full-panel-body" id="' + id + '-body"></div>' +
    '<div class="bottom-btn-wrap" id="' + id + '-footer"></div>';
  document.body.appendChild(panel);
  return panel;
}
 
function closeOverlayPanel(id) {
  const panel = document.getElementById(id);
  if (panel) panel.classList.remove('open');
}
 
/* SAVE & CONTINUE */
 
function handleSaveAndContinue() {
  const cfg = currentEngagementConfig;
  let valid = true;
 
  if (cfg.showNumPeople !== false) {
    if (!formState.numPeople || formState.numPeople < 1) {
      document.getElementById('num-people-err').classList.add('show');
      valid = false;
    }
  }
 
  // DPD Call validation for Criminal Activity
  if (cfg.showDpdCall) {
    if (formState.dpdCall.selected.length === 0) {
      const errEl = document.getElementById('dpd-call-err');
      if (errEl) errEl.classList.add('show');
      valid = false;
    } else if (formState.dpdCall.selected.indexOf(DPD_NO_CALL_IDX) >= 0 && !formState.dpdCall.notes.trim()) {
      const errEl = document.getElementById('dpd-no-call-notes-err');
      if (errEl) errEl.classList.add('show');
      const notesEl = document.getElementById('dpd-no-call-notes');
      if (notesEl) notesEl.focus();
      valid = false;
    }
  }
 
  // Non-responsive ER check — warn if ER records are insufficient
  if (cfg.showResolution !== false && cfg.showFullSections) {
    const nonResponsiveCount = formState.resolution.filter(function(r) {
      return r.condition === 3; // index 3 = 'Non responsive, health situation'
    }).length;
    if (nonResponsiveCount > 0 && formState.emergencyResponse.length < nonResponsiveCount) {
      showToast(
        'Please create the required Emergency Response record' + (nonResponsiveCount > 1 ? 's' : '') +
        ' (' + nonResponsiveCount + ' person' + (nonResponsiveCount > 1 ? 's' : '') + ' marked Non Responsive).',
        'error'
      );
      return;
    }
  }
 
  // Resolution completeness check — all people must have a resolution record
  if (cfg.showResolution !== false && cfg.showFullSections && formState.numPeople > 0) {
    const resolutionCount = formState.resolution.length;
    const required = formState.numPeople;
    if (resolutionCount < required) {
      showToast(
        'Please complete Engagement Resolution for all ' + required +
        ' person' + (required > 1 ? 's' : '') + '. ' +
        resolutionCount + ' of ' + required + ' recorded.',
        'error'
      );
      return;
    }
  }
 
  if (!valid) {
    showToast('Please complete required fields.', 'error');
    return;
  }
 
  DDC.setNumPeople(formState.numPeople);
 
  const initiatedOptionLabels = cfg.initiatedOptions || ['Responded to a call by a business', 'Encountered during normal rounds'];
  const initiatedLabels = formState.initiated.map(function(i) { return initiatedOptionLabels[i]; }).filter(Boolean);
  DDC.setInteractionInitiated(initiatedLabels.join(', '));
 
  DDC.setNotes(formState.notes);
 
  if (cfg.showHomelessInteraction) {
    const labels = formState.homelessInteractionType.map(function(i) { return HOMELESS_INTERACTION_TYPES[i]; });
    DDC.setHomelessInteractionType(labels.join(', '));
  }
 
  if (cfg.showHealthClassification && formState.healthClassification !== null) {
    DDC.setHealthClassification(HEALTH_CLASSIFICATIONS[formState.healthClassification]);
  }
 
  if (cfg.showCriminalActivity) {
    const labels = formState.criminalActivityTypes.map(function(i) { return CRIMINAL_ACTIVITY_TYPES_LIST[i]; });
    DDC.setCriminalActivityTypes(labels);
  }
 
  const resolutionRecords = formState.resolution.map(function(r) {
    const resourcesOfferedAccepted = [];
    if (r.resourcesOffered === true) {
      for (let j = 0; j < RESOURCES_OFFERED_TYPES.length; j++) {
        const d = r.resourcesDetail[j];
        if (d.offered || d.accepted) {
          resourcesOfferedAccepted.push({ type: RESOURCES_OFFERED_TYPES[j], offered: d.offered, accepted: d.accepted });
        }
      }
    }
    return {
      condition: r.condition !== null ? RESOLUTION_CONDITIONS[r.condition] : null,
      weapons_observed: r.obs.indexOf(0) >= 0,
      drug_supplies_observed: r.obs.indexOf(1) >= 0,
      active_drug_use_observed: r.obs.indexOf(2) >= 0,
      resources_offered: r.resourcesOffered === true,
      resources_offered_accepted: resourcesOfferedAccepted,
      resources_notes: r.resourcesNotes || '',
    };
  });
  DDC.setResolution(resolutionRecords);
 
  const erRecords = formState.emergencyResponse.map(function(r) {
    return {
      person_number: r.person_number,
      types: r.types.map(function(i) { return ER_TYPES[i]; }),
      narcan_administered: r.support.indexOf(0) >= 0,
      cpr_administered: r.support.indexOf(1) >= 0,
      bandage_administered: r.support.indexOf(2) >= 0,
      contacted_911: r.resources.indexOf(0) >= 0,
      contacted_non_emergency_police: r.resources.indexOf(1) >= 0,
      contacted_mental_health_professional: r.resources.indexOf(2) >= 0,
      contacted_311: r.resources.indexOf(3) >= 0,
      notes: r.notes,
    };
  });
  DDC.setEmergencyResponse(erRecords);
 
  const envRecords = formState.environmental.map(function(r) {
    return { types: r.types.map(function(i) { return ENV_TYPES[i]; }), notes: r.notes };
  });
  DDC.setEnvironmental(envRecords);
 
  if (formState.kgfs.length > 0) {
    const allTypes = [];
    const allNotes = [];
    formState.kgfs.forEach(function(r) {
      r.types.forEach(function(i) {
        const t = KGFS_TYPES[i];
        if (allTypes.indexOf(t) < 0) allTypes.push(t);
      });
      if (r.notes) allNotes.push(r.notes);
    });
    DDC.setKgfs(true, allTypes, allNotes.join(' | '));
  } else {
    DDC.setKgfs(false, [], null);
  }
 
  // DPD Call (Criminal Activity only)
  if (cfg.showDpdCall) {
    const dpdLabels = formState.dpdCall.selected.map(function(i) { return DPD_CALL_OPTIONS[i]; });
    DDC.setDpdCall(dpdLabels, formState.dpdCall.notes);
  }
 
  showToast('Session details saved.', 'success');
  setTimeout(function() {
    if (typeof openReviewScreen === 'function') openReviewScreen();
  }, 400);
  console.log('Full DDC state:', DDC.getState());
}
 
function confirmBackToStart() {
  if (!confirm('Go back to the Start screen? Your selections on this form will be kept until you select a different activity.')) return;
  if (typeof window.goToStartScreen === 'function') {
    window.goToStartScreen();
  } else {
    location.reload();
  }
}
 
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}
