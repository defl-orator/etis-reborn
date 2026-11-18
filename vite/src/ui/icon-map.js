export const ICON_MAP = {
    // Навигация и базовые действия
    close: 'x', clear: 'x', x: 'x',
    arrow_back: 'arrow-left', chevron_right: 'caret-right',
    arrow_forward_ios: 'caret-right', arrow_back_ios_new: 'caret-left',
    arrow_drop_down: 'caret-down', arrow_drop_up: 'caret-up',
    arrow_right: 'caret-right', arrow_left: 'caret-left',
    arrow_forward: 'arrow-right', arrow_downward: 'arrow-down', arrow_upward: 'arrow-up',
    keyboard_arrow_down: 'caret-down', keyboard_arrow_up: 'caret-up',
    keyboard_arrow_left: 'caret-left', keyboard_arrow_right: 'caret-right',
    expand_more: 'caret-down', expand_less: 'caret-up',
    more_horiz: 'dots-three', more_vert: 'dots-three-vertical', dots_three: 'dots-three',
    keyboard_return: 'arrow-elbow-down-left', keyboard: 'keyboard',
    open_in_new: 'arrow-square-out', category: 'squares-four', widgets: 'squares-four',

    // Поиск
    search: 'magnifying-glass', search_off: 'magnifying-glass', travel_explore: 'globe-hemisphere-west',

    // Уведомления и колокольчик
    notifications: 'bell', notifications_none: 'bell', notification_important: 'bell-ringing',
    notifications_active: 'bell-ringing', notification_add: 'bell-ringing', notifications_paused: 'bell-slash',

    // Добавление, отметки и статус
    add: 'plus', add_circle_outline: 'plus-circle',
    check: 'check', done: 'check', done_all: 'checks', done_outline: 'check', check_circle: 'check-circle',
    check_box: 'check-square', check_box_outline_blank: 'square',
    radio_button_checked: 'radio-button', radio_button_unchecked: 'circle', circle: 'circle',
    verified: 'seal-check', error: 'warning-circle', error_outline: 'warning-circle',
    warning: 'warning', priority_high: 'warning', info: 'info', help: 'question', help_outline: 'question',

    // Редактирование, заметки и файлы
    delete: 'trash', delete_outline: 'trash', trash: 'trash', remove: 'minus',
    edit: 'pencil-simple', edit_note: 'note-pencil', drive_file_rename_outline: 'pencil-line',
    content_copy: 'copy', add_to_photos: 'copy', copy: 'copy',
    save: 'floppy-disk', cancel: 'x-circle',
    attach_file: 'paperclip', description: 'file-text', article: 'article',
    insert_drive_file: 'file', upload_file: 'file-arrow-up', picture_as_pdf: 'file-pdf',
    table_chart: 'table', track_changes: 'target',

    // Облако и синхронизация
    ios_share: 'export', share: 'share-network', download: 'download-simple',
    cloud_upload: 'cloud-arrow-up', cloud_download: 'cloud-arrow-down',
    cloud_off: 'cloud-slash', cloud_done: 'cloud-check', cloud_sync: 'cloud-arrow-up',
    storage: 'database', sync: 'arrows-clockwise', refresh: 'arrow-clockwise',
    update: 'clock-clockwise',

    // Безопасность и настройки
    lock: 'lock', lock_open: 'lock-open', lock_outline: 'lock',
    key: 'key', vpn_key: 'key', add_moderator: 'shield-plus',
    exit_to_app: 'sign-out', logout: 'sign-out',
    settings: 'gear', tune: 'sliders-horizontal', palette: 'palette',
    visibility: 'eye', visibility_off: 'eye-slash', eye: 'eye', eye_slash: 'eye-slash',

    // Тема и время
    light_mode: 'sun', dark_mode: 'moon', brightness_2: 'moon-stars', brightness_auto: 'circle-half',
    schedule: 'clock', timer: 'timer', hourglass_empty: 'hourglass', today: 'calendar',
    calendar_today: 'calendar-blank', calendar_month: 'calendar-dots',
    event: 'calendar-blank', event_available: 'calendar-check', event_busy: 'calendar-x',
    event_repeat: 'repeat', event_note: 'calendar-dots',
    alarm: 'alarm', alarm_on: 'alarm', alarm_off: 'alarm', alarm_add: 'alarm',

    // Пользователи и профиль
    person: 'user', person_outline: 'user', person_add: 'user-plus',
    account_circle: 'user-circle', account_box: 'identification-card',
    groups: 'users-three', people: 'users', manage_accounts: 'identification-badge',
    man: 'gender-male', woman: 'gender-female', wc: 'toilet',

    // Локации, ссылки и коммуникации
    place: 'map-pin', room: 'map-pin', public: 'globe', link: 'link',
    alternate_email: 'at', email: 'envelope-simple', mail: 'envelope-simple', mail_outline: 'envelope-simple',
    send: 'paper-plane-tilt', reply: 'arrow-bend-up-left',
    campaign: 'megaphone', record_voice_over: 'megaphone', forum: 'chats-circle',
    rate_review: 'chat-centered-text', feedback: 'chat-text', support_agent: 'headset', bug_report: 'bug',

    // Учёба, книги и списки
    school: 'graduation-cap', menu_book: 'book-open-text', book_2: 'book',
    auto_stories: 'books', auto_stories_off: 'books', local_library: 'books',
    history: 'clock-counter-clockwise', history_edu: 'scroll',
    task: 'check-square', task_alt: 'check-circle',
    list_alt: 'list-bullets', fact_check: 'list-checks', checklist: 'list-checks',
    rule: 'list-checks', playlist_add_check: 'list-checks', playlist_add: 'list-plus',
    assignment: 'clipboard-text', assignment_turned_in: 'clipboard-text',
    folder: 'folder', folder_open: 'folder-open', folder_shared: 'folder-user',
    quiz: 'question',

    // Аналитика и оценки
    bar_chart_4_bars: 'chart-bar', analytics: 'chart-line-up', insights: 'chart-line-up',
    trending_up: 'trend-up', pie_chart: 'chart-pie', poll: 'chart-bar-horizontal',
    emoji_events: 'trophy', grade: 'star', star_rate: 'star', military_tech: 'medal',

    // Направления подготовки и предметы
    terminal: 'terminal-window', blur_on: 'atom', functions: 'function', science: 'flask',
    eco: 'leaf', landscape: 'mountains', explore: 'compass', museum: 'bank',
    account_balance: 'bank', psychology: 'brain', lightbulb: 'lightbulb',
    cast_for_education: 'chalkboard-teacher', interests: 'shapes', how_to_vote: 'check-square-offset',
    engineering: 'hard-hat',

    // Маршрутизатор, навигация по кампусу и объекты
    swap_horiz: 'arrows-left-right', alt_route: 'path', directions_walk: 'person-simple-walk',
    door_front: 'door', restaurant: 'fork-knife', apartment: 'buildings',
    north: 'arrow-up', south: 'arrow-down', straight: 'arrow-up', turn_left: 'arrow-bend-up-left',
    navigation: 'navigation-arrow', my_location: 'crosshair', steps: 'footprints',

    // Прочее UI
    free_breakfast: 'coffee', celebration: 'confetti', image: 'image',
    receipt: 'receipt', receipt_long: 'receipt', account_balance_wallet: 'wallet', payment: 'credit-card',
    auto_awesome: 'sparkle', flag: 'flag', gavel: 'gavel', devices: 'devices',
    dynamic_feed: 'stack', play_circle: 'play-circle', pause_circle_filled: 'pause-circle',
    videocam: 'video-camera', flash_on: 'lightning', flight_takeoff: 'airplane-takeoff',
    block: 'prohibit', casino: 'dice-five', system_update: 'arrow-circle-down',
    system_update_alt: 'download-simple',
    smartphone: 'device-mobile',
    phone_iphone: 'device-mobile',
    phone_android: 'device-mobile',
    mobile: 'device-mobile',
    laptop: 'laptop'
};