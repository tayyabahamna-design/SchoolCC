import posthog from 'posthog-js';

type UserRole = 'CEO' | 'DEO' | 'DDEO' | 'AEO' | 'HEAD_TEACHER' | 'TEACHER' | 'TRAINING_MANAGER';

interface UserProperties {
  userId?: string;
  phoneNumber?: string;
  role?: UserRole;
  name?: string;
  schoolId?: string;
  schoolName?: string;
  clusterId?: string;
  districtId?: string;
}

export const analytics = {
  identify: (phoneNumber: string, properties?: UserProperties) => {
    // Use phone number as the distinct_id for easier tracking
    // $name is a special PostHog property that shows the user's name prominently
    posthog.identify(phoneNumber, {
      ...properties,
      $name: properties?.name,
      phone_number: phoneNumber,
    });
  },

  reset: () => {
    posthog.reset();
  },

  auth: {
    signedUp: (role: UserRole, method: 'phone' | 'emis' = 'phone', userData?: { name?: string; phoneNumber?: string; email?: string; districtId?: string }) => {
      // Identify the new user with their phone number
      if (userData?.phoneNumber) {
        posthog.identify(userData.phoneNumber, {
          $name: userData.name,
          phone_number: userData.phoneNumber,
          email: userData.email,
          role: role,
          district_id: userData.districtId,
          signup_method: method,
          signup_date: new Date().toISOString(),
        });
      }
      posthog.capture('user_signed_up', { 
        role, 
        method,
        name: userData?.name,
        phone_number: userData?.phoneNumber,
        email: userData?.email,
        district_id: userData?.districtId,
      });
    },
    loggedIn: (role: UserRole, loginMode: 'school' | 'admin' = 'admin') => {
      posthog.capture('user_logged_in', { role, login_mode: loginMode });
    },
    loggedOut: () => {
      posthog.capture('user_logged_out');
    },
    loginFailed: (reason: string, loginMode: 'school' | 'admin' = 'admin') => {
      posthog.capture('login_failed', { reason, login_mode: loginMode });
    },
    sessionStarted: (role: UserRole) => {
      posthog.capture('session_started', { role });
    },
    passwordChanged: () => {
      posthog.capture('password_changed');
    },
  },

  navigation: {
    pageViewed: (pageName: string, role?: UserRole) => {
      posthog.capture('page_viewed', { page_name: pageName, role });
    },
    dashboardViewed: (role: UserRole) => {
      posthog.capture('dashboard_viewed', { role });
    },
    schoolDetailViewed: (schoolId: string, schoolName?: string) => {
      posthog.capture('school_detail_viewed', { school_id: schoolId, school_name: schoolName });
    },
    profileViewed: () => {
      posthog.capture('profile_viewed');
    },
    navigationClicked: (destination: string) => {
      posthog.capture('navigation_clicked', { destination });
    },
    sidebarToggled: (isOpen: boolean) => {
      posthog.capture('sidebar_toggled', { is_open: isOpen });
    },
  },

  school: {
    dataUpdated: (schoolId: string, fieldsUpdated: string[]) => {
      posthog.capture('school_data_updated', { school_id: schoolId, fields_updated: fieldsUpdated });
    },
    attendanceSubmitted: (schoolId: string, studentAttendance: number, teacherAttendance: number) => {
      posthog.capture('attendance_submitted', { 
        school_id: schoolId, 
        student_attendance_pct: studentAttendance,
        teacher_attendance_pct: teacherAttendance 
      });
    },
    studentAttendanceRecorded: (schoolId: string, total: number, present: number) => {
      posthog.capture('student_attendance_recorded', { 
        school_id: schoolId, 
        total, 
        present, 
        percentage: total > 0 ? Math.round((present / total) * 100) : 0 
      });
    },
    teacherAttendanceRecorded: (schoolId: string, total: number, present: number) => {
      posthog.capture('teacher_attendance_recorded', { 
        school_id: schoolId, 
        total, 
        present, 
        percentage: total > 0 ? Math.round((present / total) * 100) : 0 
      });
    },
    infrastructureUpdated: (schoolId: string, type: 'toilets' | 'water') => {
      posthog.capture('infrastructure_updated', { school_id: schoolId, type });
    },
    toiletStatusUpdated: (schoolId: string, total: number, working: number) => {
      posthog.capture('toilet_status_updated', { school_id: schoolId, total, working, broken: total - working });
    },
    drinkingWaterToggled: (schoolId: string, isAvailable: boolean) => {
      posthog.capture('drinking_water_toggled', { school_id: schoolId, is_available: isAvailable });
    },
    inventoryUpdated: (schoolId: string, itemType: string, newCount: number, inUseCount: number, brokenCount: number) => {
      posthog.capture('inventory_updated', { 
        school_id: schoolId, 
        item_type: itemType, 
        new: newCount, 
        in_use: inUseCount, 
        broken: brokenCount 
      });
    },
  },

  visit: {
    started: (schoolId: string, schoolName: string, visitType: 'monitoring' | 'mentoring' | 'office') => {
      posthog.capture('visit_started', { school_id: schoolId, school_name: schoolName, visit_type: visitType });
    },
    ended: (schoolId: string, durationMinutes: number) => {
      posthog.capture('visit_ended', { school_id: schoolId, duration_minutes: durationMinutes });
    },
    notesAdded: (visitId: string) => {
      posthog.capture('visit_notes_added', { visit_id: visitId });
    },
    durationRecorded: (visitId: string, durationMinutes: number) => {
      posthog.capture('visit_duration_recorded', { visit_id: visitId, duration_minutes: durationMinutes });
    },
    monitoringStarted: (schoolId: string) => {
      posthog.capture('monitoring_visit_started', { school_id: schoolId });
    },
    mentoringStarted: (schoolId: string) => {
      posthog.capture('mentoring_visit_started', { school_id: schoolId });
    },
    officeVisitStarted: (schoolId: string) => {
      posthog.capture('office_visit_started', { school_id: schoolId });
    },
    mentoringSubmitted: (schoolId: string, indicatorCount: number) => {
      posthog.capture('mentoring_visit_submitted', { school_id: schoolId, indicator_count: indicatorCount });
    },
    indicatorRated: (visitId: string, indicatorName: string, rating: number) => {
      posthog.capture('mentoring_indicator_rated', { visit_id: visitId, indicator_name: indicatorName, rating });
    },
    photoUploaded: (visitId: string) => {
      posthog.capture('visit_photo_uploaded', { visit_id: visitId });
    },
    voiceNoteRecorded: (visitId: string) => {
      posthog.capture('voice_note_recorded', { visit_id: visitId });
    },
    gpsLocationCaptured: (visitId: string, lat: number, lng: number) => {
      posthog.capture('gps_location_captured', { visit_id: visitId, latitude: lat, longitude: lng });
    },
    submitted: (visitId: string, visitType: 'monitoring' | 'mentoring' | 'office', schoolName: string) => {
      posthog.capture('visit_submitted', { visit_id: visitId, visit_type: visitType, school_name: schoolName });
    },
  },

  dataRequest: {
    created: (requestId: string, priority: string, fieldCount: number) => {
      posthog.capture('data_request_created', { request_id: requestId, priority, field_count: fieldCount });
    },
    viewed: (requestId: string) => {
      posthog.capture('data_request_viewed', { request_id: requestId });
    },
    assigned: (requestId: string, assigneeCount: number, assigneeRoles: UserRole[]) => {
      posthog.capture('data_request_assigned', { request_id: requestId, assignee_count: assigneeCount, assignee_roles: assigneeRoles });
    },
    responded: (requestId: string) => {
      posthog.capture('data_request_responded', { request_id: requestId });
    },
    completed: (requestId: string) => {
      posthog.capture('data_request_completed', { request_id: requestId });
    },
    cancelled: (requestId: string) => {
      posthog.capture('data_request_cancelled', { request_id: requestId });
    },
    fieldAdded: (requestId: string, fieldType: string) => {
      posthog.capture('request_field_added', { request_id: requestId, field_type: fieldType });
    },
    prioritySet: (requestId: string, priority: string) => {
      posthog.capture('request_priority_set', { request_id: requestId, priority });
    },
    deadlineSet: (requestId: string, deadline: string) => {
      posthog.capture('request_deadline_set', { request_id: requestId, deadline });
    },
  },

  album: {
    created: (albumId: string, schoolId: string, title: string, isGlobalBroadcast: boolean) => {
      posthog.capture('album_created', { album_id: albumId, school_id: schoolId, title, is_global_broadcast: isGlobalBroadcast });
    },
    viewed: (albumId: string) => {
      posthog.capture('album_viewed', { album_id: albumId });
    },
    deleted: (albumId: string) => {
      posthog.capture('album_deleted', { album_id: albumId });
    },
    photoUploaded: (albumId: string, photoCount: number) => {
      posthog.capture('photo_uploaded', { album_id: albumId, photo_count: photoCount });
    },
    photoDeleted: (albumId: string) => {
      posthog.capture('photo_deleted', { album_id: albumId });
    },
    captionAdded: (albumId: string) => {
      posthog.capture('photo_caption_added', { album_id: albumId });
    },
    reactionAdded: (albumId: string, reactionType: 'like' | 'love' | 'clap' | 'celebrate') => {
      posthog.capture('album_reaction_added', { album_id: albumId, reaction_type: reactionType });
    },
    reactionRemoved: (albumId: string, reactionType: string) => {
      posthog.capture('album_reaction_removed', { album_id: albumId, reaction_type: reactionType });
    },
    commentAdded: (albumId: string) => {
      posthog.capture('album_comment_added', { album_id: albumId });
    },
    commentDeleted: (albumId: string) => {
      posthog.capture('album_comment_deleted', { album_id: albumId });
    },
    globalBroadcastCreated: (albumId: string, title: string) => {
      posthog.capture('global_broadcast_created', { album_id: albumId, title });
    },
    shared: (albumId: string, shareMethod: string) => {
      posthog.capture('activity_shared', { album_id: albumId, share_method: shareMethod });
    },
    activityCreated: (activityId: string, schoolId: string, photoCount: number) => {
      posthog.capture('activity_created', { activity_id: activityId, school_id: schoolId, photo_count: photoCount });
    },
  },

  report: {
    exported: (format: 'excel' | 'docx' | 'zip' | 'pdf', recordCount: number) => {
      posthog.capture('report_exported', { format, record_count: recordCount });
    },
    excelDownloaded: (reportType: string, recordCount: number) => {
      posthog.capture('excel_report_downloaded', { report_type: reportType, record_count: recordCount });
    },
    docxDownloaded: (reportType: string) => {
      posthog.capture('docx_report_downloaded', { report_type: reportType });
    },
    zipDownloaded: (reportType: string, fileCount: number) => {
      posthog.capture('zip_report_downloaded', { report_type: reportType, file_count: fileCount });
    },
    pdfGenerated: (reportType: string) => {
      posthog.capture('pdf_report_generated', { report_type: reportType });
    },
  },

  filter: {
    schoolsFiltered: (filterType: string, filterValue: string) => {
      posthog.capture('schools_table_filtered', { filter_type: filterType, filter_value: filterValue });
    },
    schoolsSorted: (column: string, direction: 'asc' | 'desc') => {
      posthog.capture('schools_table_sorted', { column, direction });
    },
    schoolsSearched: (query: string, resultCount: number) => {
      posthog.capture('schools_table_searched', { query, result_count: resultCount });
    },
    dateRangeFiltered: (startDate: string, endDate: string) => {
      posthog.capture('date_range_filtered', { start_date: startDate, end_date: endDate });
    },
    searchPerformed: (searchType: string, query: string, resultCount: number) => {
      posthog.capture('search_performed', { search_type: searchType, query, result_count: resultCount });
    },
    clusterFilterApplied: (clusterId: string) => {
      posthog.capture('cluster_filter_applied', { cluster_id: clusterId });
    },
    markazFilterApplied: (markazId: string) => {
      posthog.capture('markaz_filter_applied', { markaz_id: markazId });
    },
    filterCleared: () => {
      posthog.capture('filter_cleared');
    },
  },

  redFlag: {
    viewed: (flagType: 'low_attendance' | 'broken_toilet' | 'no_water', schoolId: string) => {
      posthog.capture('red_flag_viewed', { flag_type: flagType, school_id: schoolId });
    },
    lowAttendanceFlagged: (schoolId: string, attendancePercentage: number) => {
      posthog.capture('low_attendance_flagged', { school_id: schoolId, attendance_percentage: attendancePercentage });
    },
    brokenToiletFlagged: (schoolId: string, brokenCount: number) => {
      posthog.capture('broken_toilet_flagged', { school_id: schoolId, broken_count: brokenCount });
    },
    noWaterFlagged: (schoolId: string) => {
      posthog.capture('no_water_flagged', { school_id: schoolId });
    },
    resolved: (flagType: string, schoolId: string) => {
      posthog.capture('red_flag_resolved', { flag_type: flagType, school_id: schoolId });
    },
    dismissed: (flagType: string, schoolId: string) => {
      posthog.capture('alert_dismissed', { flag_type: flagType, school_id: schoolId });
    },
  },

  admin: {
    userApproved: (userId: string, role: UserRole) => {
      posthog.capture('user_approved', { user_id: userId, role });
    },
    userRejected: (userId: string, role: UserRole, reason?: string) => {
      posthog.capture('user_rejected', { user_id: userId, role, reason });
    },
    userRestricted: (userId: string, role: UserRole) => {
      posthog.capture('user_restricted', { user_id: userId, role });
    },
    userUnrestricted: (userId: string, role: UserRole) => {
      posthog.capture('user_unrestricted', { user_id: userId, role });
    },
    userRemoved: (userId: string, role: UserRole) => {
      posthog.capture('user_removed', { user_id: userId, role });
    },
    userCreatedByAdmin: (userId: string, role: UserRole) => {
      posthog.capture('user_created_by_admin', { user_id: userId, role });
    },
    schoolsAssigned: (userId: string, schoolCount: number) => {
      posthog.capture('user_schools_assigned', { user_id: userId, school_count: schoolCount });
    },
    roleChanged: (userId: string, oldRole: UserRole, newRole: UserRole) => {
      posthog.capture('user_role_changed', { user_id: userId, old_role: oldRole, new_role: newRole });
    },
  },

  announcement: {
    created: (announcementId: string, priority: 'high' | 'medium' | 'low') => {
      posthog.capture('announcement_created', { announcement_id: announcementId, priority });
    },
    viewed: (announcementId: string) => {
      posthog.capture('announcement_viewed', { announcement_id: announcementId });
    },
    dismissed: (announcementId: string) => {
      posthog.capture('announcement_dismissed', { announcement_id: announcementId });
    },
    expired: (announcementId: string) => {
      posthog.capture('announcement_expired', { announcement_id: announcementId });
    },
  },

  ui: {
    modalOpened: (modalType: string) => {
      posthog.capture('modal_opened', { modal_type: modalType });
    },
    modalClosed: (modalType: string) => {
      posthog.capture('modal_closed', { modal_type: modalType });
    },
    tabSwitched: (tabName: string, fromTab?: string) => {
      posthog.capture('tab_switched', { tab_name: tabName, from_tab: fromTab });
    },
    accordionExpanded: (sectionName: string) => {
      posthog.capture('accordion_expanded', { section_name: sectionName });
    },
    accordionCollapsed: (sectionName: string) => {
      posthog.capture('accordion_collapsed', { section_name: sectionName });
    },
    tooltipViewed: (tooltipId: string) => {
      posthog.capture('tooltip_viewed', { tooltip_id: tooltipId });
    },
    themeToggled: (theme: 'light' | 'dark') => {
      posthog.capture('theme_toggled', { theme });
    },
    notificationBellClicked: () => {
      posthog.capture('notification_bell_clicked');
    },
    notificationRead: (notificationId: string) => {
      posthog.capture('notification_read', { notification_id: notificationId });
    },
  },

  error: {
    apiError: (endpoint: string, statusCode: number, errorMessage?: string) => {
      posthog.capture('api_error', { endpoint, status_code: statusCode, error_message: errorMessage });
    },
    formValidationError: (formName: string, fields: string[]) => {
      posthog.capture('form_validation_error', { form_name: formName, invalid_fields: fields });
    },
    uploadFailed: (fileType: string, errorMessage?: string) => {
      posthog.capture('upload_failed', { file_type: fileType, error_message: errorMessage });
    },
    pageLoadSlow: (pageName: string, loadTimeMs: number) => {
      posthog.capture('page_load_slow', { page_name: pageName, load_time_ms: loadTimeMs });
    },
    networkError: (action: string) => {
      posthog.capture('network_error', { action });
    },
    permissionDenied: (action: string, requiredRole?: UserRole) => {
      posthog.capture('permission_denied', { action, required_role: requiredRole });
    },
  },

  feature: {
    firstUsed: (featureName: string) => {
      posthog.capture('feature_first_used', { feature_name: featureName });
    },
    helpAccessed: (helpTopic?: string) => {
      posthog.capture('help_accessed', { help_topic: helpTopic });
    },
    onboardingStepCompleted: (step: number, stepName: string) => {
      posthog.capture('onboarding_step_completed', { step, step_name: stepName });
    },
    onboardingSkipped: (atStep: number) => {
      posthog.capture('onboarding_skipped', { at_step: atStep });
    },
  },

  query: {
    created: (queryId: string, targetRole: UserRole) => {
      posthog.capture('query_created', { query_id: queryId, target_role: targetRole });
    },
    viewed: (queryId: string) => {
      posthog.capture('query_viewed', { query_id: queryId });
    },
    responded: (queryId: string) => {
      posthog.capture('query_responded', { query_id: queryId });
    },
  },

  collaborativeForm: {
    created: (formId: string) => {
      posthog.capture('collaborative_form_created', { form_id: formId });
    },
    viewed: (formId: string) => {
      posthog.capture('collaborative_form_viewed', { form_id: formId });
    },
    submitted: (formId: string) => {
      posthog.capture('collaborative_form_submitted', { form_id: formId });
    },
  },
};

export default analytics;
