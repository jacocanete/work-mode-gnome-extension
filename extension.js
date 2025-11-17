import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import St from 'gi://St';
import Gio from 'gi://Gio';
import Shell from 'gi://Shell';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

const WorkModeIndicator = GObject.registerClass(
class WorkModeIndicator extends PanelMenu.Button {
    _init(extension) {
        super._init(0.0, 'Work Mode Indicator');
        this._extension = extension;
        this._settings = extension.getSettings();

        // Create icon
        this._icon = new St.Icon({
            icon_name: 'changes-allow-symbolic',
            style_class: 'system-status-icon'
        });
        this.add_child(this._icon);

        // Status label
        this._statusItem = new PopupMenu.PopupMenuItem('Work Mode: OFF', {
            reactive: false
        });
        this.menu.addMenuItem(this._statusItem);

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        // Toggle button
        this._toggleItem = new PopupMenu.PopupMenuItem('Enable Work Mode');
        this._toggleItem.connect('activate', () => {
            this._toggleWorkMode();
        });
        this.menu.addMenuItem(this._toggleItem);

        // Settings button
        this._settingsItem = new PopupMenu.PopupMenuItem('Settings');
        this._settingsItem.connect('activate', () => {
            this._extension.openPreferences();
        });
        this.menu.addMenuItem(this._settingsItem);

        // Monitor settings changes
        this._settings.connect('changed::work-mode-enabled', () => {
            this._updateStatus();
        });

        this._updateStatus();
    }

    _toggleWorkMode() {
        const enabled = this._settings.get_boolean('work-mode-enabled');
        this._settings.set_boolean('work-mode-enabled', !enabled);
    }

    _updateStatus() {
        const enabled = this._settings.get_boolean('work-mode-enabled');

        if (enabled) {
            this._statusItem.label.text = 'Work Mode: ON';
            this._toggleItem.label.text = 'Disable Work Mode';
            this._icon.icon_name = 'changes-prevent-symbolic';
        } else {
            this._statusItem.label.text = 'Work Mode: OFF';
            this._toggleItem.label.text = 'Enable Work Mode';
            this._icon.icon_name = 'changes-allow-symbolic';
        }
    }

    destroy() {
        super.destroy();
    }
});

export default class WorkModeExtension extends Extension {
    constructor(metadata) {
        super(metadata);
        this._indicator = null;
        this._appMonitor = null;
        this._schedulerTimeout = null;
    }

    enable() {
        log('Enabling Work Mode extension');

        // Add indicator to panel
        this._indicator = new WorkModeIndicator(this);
        Main.panel.addToStatusArea(this.uuid, this._indicator);

        // Start app monitoring
        this._startAppMonitoring();

        // Start scheduler
        this._startScheduler();
    }

    disable() {
        log('Disabling Work Mode extension');

        // Stop scheduler
        if (this._schedulerTimeout) {
            GLib.Source.remove(this._schedulerTimeout);
            this._schedulerTimeout = null;
        }

        // Stop app monitoring
        if (this._appMonitor) {
            this._appMonitor.disconnect(this._appAddedId);
            this._appMonitor = null;
        }

        // Remove indicator
        if (this._indicator) {
            this._indicator.destroy();
            this._indicator = null;
        }
    }

    _startAppMonitoring() {
        this._appMonitor = global.display;

        // Monitor when windows are created
        this._appAddedId = this._appMonitor.connect('window-created', (display, window) => {
            this._checkAndBlockWindow(window);
        });

        // Check existing windows
        global.get_window_actors().forEach(actor => {
            this._checkAndBlockWindow(actor.meta_window);
        });
    }

    _checkAndBlockWindow(window) {
        const settings = this.getSettings();
        const workModeEnabled = settings.get_boolean('work-mode-enabled');

        if (!workModeEnabled) {
            return;
        }

        const blockedApps = settings.get_strv('blocked-apps');

        try {
            const app = this._getAppForWindow(window);
            if (!app) {
                return;
            }

            const appId = app.get_id();
            const appName = app.get_name();

            // Check if app is blocked
            const isBlocked = blockedApps.some(blockedApp => {
                return appId.toLowerCase().includes(blockedApp.toLowerCase()) ||
                       appName.toLowerCase().includes(blockedApp.toLowerCase());
            });

            if (isBlocked) {
                log(`Work Mode: Blocking ${appName} (${appId})`);

                // Show notification
                Main.notify('Work Mode', `Blocked: ${appName}`);

                // Close the window
                window.delete(global.get_current_time());
            }
        } catch (e) {
            logError(e, 'Error checking window');
        }
    }

    _getAppForWindow(window) {
        // Get the app from window
        let app = null;
        try {
            if (window.get_pid) {
                const pid = window.get_pid();
                const tracker = Shell.WindowTracker.get_default();
                app = tracker.get_app_from_pid(pid);
            }

            if (!app) {
                const wmClass = window.get_wm_class();
                if (wmClass) {
                    const tracker = Shell.WindowTracker.get_default();
                    app = tracker.get_window_app(window);
                }
            }
        } catch (e) {
            logError(e);
        }

        return app;
    }

    _startScheduler() {
        const settings = this.getSettings();

        // Check every minute
        this._schedulerTimeout = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 60, () => {
            this._checkSchedule();
            return GLib.SOURCE_CONTINUE;
        });

        // Check immediately on start
        this._checkSchedule();
    }

    _checkSchedule() {
        const settings = this.getSettings();
        const scheduleEnabled = settings.get_boolean('schedule-enabled');

        if (!scheduleEnabled) {
            return;
        }

        const startHour = settings.get_int('schedule-start-hour');
        const startMinute = settings.get_int('schedule-start-minute');
        const endHour = settings.get_int('schedule-end-hour');
        const endMinute = settings.get_int('schedule-end-minute');

        const now = GLib.DateTime.new_now_local();
        const currentHour = now.get_hour();
        const currentMinute = now.get_minute();

        // Convert to minutes for easier comparison
        const currentTime = currentHour * 60 + currentMinute;
        const startTime = startHour * 60 + startMinute;
        const endTime = endHour * 60 + endMinute;

        let shouldBeEnabled = false;

        if (startTime <= endTime) {
            // Normal case: start and end on same day
            shouldBeEnabled = currentTime >= startTime && currentTime < endTime;
        } else {
            // Spans midnight
            shouldBeEnabled = currentTime >= startTime || currentTime < endTime;
        }

        const currentlyEnabled = settings.get_boolean('work-mode-enabled');

        if (shouldBeEnabled && !currentlyEnabled) {
            log('Work Mode: Schedule activating work mode');
            settings.set_boolean('work-mode-enabled', true);
            Main.notify('Work Mode', 'Automatically enabled by schedule');
        } else if (!shouldBeEnabled && currentlyEnabled) {
            // Only disable if it was enabled by schedule
            const autoEnabled = settings.get_boolean('auto-enabled-by-schedule');
            if (autoEnabled) {
                log('Work Mode: Schedule deactivating work mode');
                settings.set_boolean('work-mode-enabled', false);
                settings.set_boolean('auto-enabled-by-schedule', false);
                Main.notify('Work Mode', 'Automatically disabled by schedule');
            }
        }

        if (shouldBeEnabled) {
            settings.set_boolean('auto-enabled-by-schedule', true);
        }
    }
}
