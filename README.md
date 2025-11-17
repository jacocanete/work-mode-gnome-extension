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

## Troubleshooting

Check extension logs:
```bash
journalctl -f -o cat /usr/bin/gnome-shell
```

## Finding Application Names

To find the correct application name to block, you can check running processes:
```bash
# List running processes
ps aux | grep -i <app-name>

# Or check .desktop files
ls /usr/share/applications/*.desktop | xargs grep -l "steam"
```

Common application names:
- Steam: `steam`
- Discord: `discord`
- Firefox: `firefox`
- Chrome: `chrome` or `google-chrome`
- Spotify: `spotify`

## Development

### Setting Up Development Environment

1. Clone the repository:
   ```bash
   git clone https://github.com/jacocanete/work-mode-gnome-extension.git
   cd work-mode-gnome-extension
   ```

2. Create a symbolic link to test during development:
   ```bash
   ln -s $(pwd) ~/.local/share/gnome-shell/extensions/work-mode@jacocanete
   ```

3. Compile schemas:
   ```bash
   glib-compile-schemas schemas/
   ```

4. Restart GNOME Shell:
   - On X11: Press `Alt+F2`, type `r`, press Enter
   - On Wayland: Log out and log back in

5. Enable the extension:
   ```bash
   gnome-extensions enable work-mode@jacocanete
   ```

### Testing Your Changes

After making changes to the code:

1. Disable the extension:
   ```bash
   gnome-extensions disable work-mode@jacocanete
   ```

2. Restart GNOME Shell (X11) or log out/in (Wayland)

3. Re-enable the extension:
   ```bash
   gnome-extensions enable work-mode@jacocanete
   ```

4. Check logs for errors:
   ```bash
   journalctl -f -o cat /usr/bin/gnome-shell
   ```

### Project Structure

```
work-mode-gnome-extension/
├── extension.js          # Main extension logic
├── prefs.js             # Preferences UI
├── metadata.json        # Extension metadata
├── stylesheet.css       # Custom styles
├── schemas/
│   └── org.gnome.shell.extensions.work-mode.gschema.xml
└── README.md
```

### Key Files

- **extension.js**: Contains the main extension class, panel indicator, app monitoring, and scheduling logic
- **prefs.js**: Implements the preferences window for managing blocked apps and schedules
- **schemas/*.gschema.xml**: Defines settings schema (must be compiled with `glib-compile-schemas`)

## Contributing

Contributions are welcome! Here's how you can help:

### Reporting Bugs

1. Check if the issue already exists in the issue tracker
2. Provide detailed information:
   - GNOME Shell version (`gnome-shell --version`)
   - Steps to reproduce
   - Expected vs actual behavior
   - Relevant logs from `journalctl -f -o cat /usr/bin/gnome-shell`

### Submitting Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes
4. Test thoroughly on your system
5. Commit with clear messages
6. Push to your fork
7. Open a pull request with a description of your changes

### Code Style

- Use 4 spaces for indentation
- Follow existing code patterns
- Comment complex logic
- Use descriptive variable names

## License

GPL-3.0
