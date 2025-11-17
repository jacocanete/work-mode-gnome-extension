import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';
import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class WorkModePreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        // Create main page
        const page = new Adw.PreferencesPage();
        window.add(page);

        // Blocked Apps Group
        const appsGroup = new Adw.PreferencesGroup({
            title: 'Blocked Applications',
            description: 'Applications to block when Work Mode is enabled'
        });
        page.add(appsGroup);

        // Current blocked apps list
        const blockedApps = settings.get_strv('blocked-apps');

        // Entry to add new app
        const addRow = new Adw.ActionRow({
            title: 'Add Application'
        });

        const appEntry = new Gtk.Entry({
            placeholder_text: 'e.g., steam, discord, twitter',
            valign: Gtk.Align.CENTER,
            hexpand: true
        });

        const addButton = new Gtk.Button({
            icon_name: 'list-add-symbolic',
            valign: Gtk.Align.CENTER
        });

        addButton.connect('clicked', () => {
            const appName = appEntry.get_text().trim();
            if (appName) {
                const apps = settings.get_strv('blocked-apps');
                apps.push(appName);
                settings.set_strv('blocked-apps', apps);
                appEntry.set_text('');

                // Refresh the window
                window.close();
                this.fillPreferencesWindow(window);
            }
        });

        addRow.add_suffix(appEntry);
        addRow.add_suffix(addButton);
        appsGroup.add(addRow);

        // List current blocked apps
        blockedApps.forEach((app, index) => {
            const row = new Adw.ActionRow({
                title: app
            });

            const removeButton = new Gtk.Button({
                icon_name: 'user-trash-symbolic',
                valign: Gtk.Align.CENTER,
                css_classes: ['destructive-action']
            });

            removeButton.connect('clicked', () => {
                const apps = settings.get_strv('blocked-apps');
                apps.splice(index, 1);
                settings.set_strv('blocked-apps', apps);

                // Refresh
                window.close();
                this.fillPreferencesWindow(window);
            });

            row.add_suffix(removeButton);
            appsGroup.add(row);
        });

        // Schedule Group
        const scheduleGroup = new Adw.PreferencesGroup({
            title: 'Automatic Schedule',
            description: 'Automatically enable/disable Work Mode based on time'
        });
        page.add(scheduleGroup);

        // Enable schedule toggle
        const scheduleRow = new Adw.ActionRow({
            title: 'Enable Schedule',
            subtitle: 'Automatically activate Work Mode during specified hours'
        });

        const scheduleSwitch = new Gtk.Switch({
            active: settings.get_boolean('schedule-enabled'),
            valign: Gtk.Align.CENTER
        });

        settings.bind('schedule-enabled', scheduleSwitch, 'active', Gio.SettingsBindFlags.DEFAULT);
        scheduleRow.add_suffix(scheduleSwitch);
        scheduleGroup.add(scheduleRow);

        // Start time
        const startRow = new Adw.ActionRow({
            title: 'Start Time',
            subtitle: 'When to enable Work Mode'
        });

        const startHourSpin = new Gtk.SpinButton({
            adjustment: new Gtk.Adjustment({
                lower: 0,
                upper: 23,
                step_increment: 1
            }),
            value: settings.get_int('schedule-start-hour'),
            valign: Gtk.Align.CENTER
        });

        const startMinuteSpin = new Gtk.SpinButton({
            adjustment: new Gtk.Adjustment({
                lower: 0,
                upper: 59,
                step_increment: 1
            }),
            value: settings.get_int('schedule-start-minute'),
            valign: Gtk.Align.CENTER
        });

        settings.bind('schedule-start-hour', startHourSpin, 'value', Gio.SettingsBindFlags.DEFAULT);
        settings.bind('schedule-start-minute', startMinuteSpin, 'value', Gio.SettingsBindFlags.DEFAULT);

        const startBox = new Gtk.Box({spacing: 6});
        startBox.append(startHourSpin);
        startBox.append(new Gtk.Label({label: ':'}));
        startBox.append(startMinuteSpin);

        startRow.add_suffix(startBox);
        scheduleGroup.add(startRow);

        // End time
        const endRow = new Adw.ActionRow({
            title: 'End Time',
            subtitle: 'When to disable Work Mode'
        });

        const endHourSpin = new Gtk.SpinButton({
            adjustment: new Gtk.Adjustment({
                lower: 0,
                upper: 23,
                step_increment: 1
            }),
            value: settings.get_int('schedule-end-hour'),
            valign: Gtk.Align.CENTER
        });

        const endMinuteSpin = new Gtk.SpinButton({
            adjustment: new Gtk.Adjustment({
                lower: 0,
                upper: 59,
                step_increment: 1
            }),
            value: settings.get_int('schedule-end-minute'),
            valign: Gtk.Align.CENTER
        });

        settings.bind('schedule-end-hour', endHourSpin, 'value', Gio.SettingsBindFlags.DEFAULT);
        settings.bind('schedule-end-minute', endMinuteSpin, 'value', Gio.SettingsBindFlags.DEFAULT);

        const endBox = new Gtk.Box({spacing: 6});
        endBox.append(endHourSpin);
        endBox.append(new Gtk.Label({label: ':'}));
        endBox.append(endMinuteSpin);

        endRow.add_suffix(endBox);
        scheduleGroup.add(endRow);
    }
}
