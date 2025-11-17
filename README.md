# Work Mode GNOME Extension

A GNOME Shell extension that blocks distracting applications during work mode with automatic scheduling.

## Features

- Block specific applications from launching
- Automatic scheduling (e.g., enable work mode 9 AM - 10 PM)
- Notifications when apps are blocked
- Easy-to-use preferences UI
- Quick toggle from system panel

## Installation

1. Copy the extension to your GNOME extensions directory:
   ```bash
   mkdir -p ~/.local/share/gnome-shell/extensions/work-mode@jacocanete
   cp -r * ~/.local/share/gnome-shell/extensions/work-mode@jacocanete/
   ```

2. Compile the schema:
   ```bash
   cd ~/.local/share/gnome-shell/extensions/work-mode@jacocanete
   glib-compile-schemas schemas/
   ```

3. Restart GNOME Shell:
   - On X11: Press `Alt+F2`, type `r`, press Enter
   - On Wayland: Log out and log back in

4. Enable the extension:
   ```bash
   gnome-extensions enable work-mode@jacocanete
   ```

## Usage

### Manual Toggle
- Click the Work Mode icon in your system panel
- Select "Enable Work Mode" or "Disable Work Mode"

### Adding Blocked Apps
1. Click the Work Mode icon
2. Select "Settings"
3. Add application names (e.g., "steam", "discord", "firefox")
4. Click the + button

### Setting Up Schedule
1. Open Settings from the extension menu
2. Enable "Enable Schedule"
3. Set your start time (when work mode should activate)
4. Set your end time (when work mode should deactivate)

Example: Set start to 22:00 and end to 09:00 to block apps from 10 PM to 9 AM

## Finding Application Names

To find the correct application name to block:
```bash
# List all running applications
ps aux | grep -i steam
# or
gnome-shell --list-extensions
```

Common application names:
- Steam: `steam`
- Discord: `discord`
- Firefox: `firefox`
- Chrome: `chrome`
- Spotify: `spotify`

## Troubleshooting

Check extension logs:
```bash
journalctl -f -o cat /usr/bin/gnome-shell
```

## License

MIT
