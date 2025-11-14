# YouTube Playlist Filter

A Tampermonkey userscript that adds a search filter to YouTube's "Save to Playlist" popup, making it easy to find and select playlists quickly.

## Features

- 🔍 **Real-time filtering** - Search playlists as you type
- ⚡ **Fast and lightweight** - Minimal performance impact
- 🎨 **Seamless integration** - Matches YouTube's design
- 📱 **Works on all YouTube pages** - youtube.com and www.youtube.com
- ✨ **Case-insensitive search** - Find playlists regardless of capitalization

## Installation

### Prerequisites
You need to have **Tampermonkey** extension installed:
- [Chrome/Edge - Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobp55f)
- [Firefox - Tampermonkey](https://addons.mozilla.org/firefox/addon/tampermonkey/)
- [Safari - Tampermonkey](https://apps.apple.com/us/app/tampermonkey/id1482490089)
- [Opera - Tampermonkey](https://addons.opera.com/extensions/details/tampermonkey-beta/)

### Install the Script

**Click the button below to install:**

[![Install Script](https://img.shields.io/badge/Install-YouTubeFilter-brightgreen?style=flat-square)](https://raw.githubusercontent.com/htsachakis/YouTubeFilter/main/YouTubeFilter.js)

Or manually:
1. Open the [YouTubeFilter.js](https://raw.githubusercontent.com/htsachakis/YouTubeFilter/main/YouTubeFilter.js) file
2. Click the "Install this script" button in Tampermonkey
3. Review the permissions and click "Install"

## Usage

1. Go to any YouTube video
2. Click the **"Save to playlist"** button
3. A **search box** will appear at the top of the playlist popup
4. **Type to filter** your playlists in real-time
5. Select your desired playlist

## How It Works

The script:
- Detects when the "Save to Playlist" popup opens
- Injects a search input field at the top of the playlist list
- Filters playlists as you type using case-insensitive matching
- Updates visibility instantly without affecting YouTube's functionality

## Requirements

- Tampermonkey extension installed
- YouTube account with playlists
- Modern web browser (Chrome, Firefox, Safari, Edge, Opera)

## File Structure

```
YouTubeFilter/
├── README.md           # This file
├── YouTubeFilter.js    # Main userscript
└── context.html        # Example of the popup structure
```

## Version History

### v0.2.0
- Fixed popup detection for current YouTube structure
- Added event handling to prevent popup from closing when typing
- Improved search functionality with better selectors
- Added GitHub update support

### v0.1.0
- Initial release
- Basic playlist filtering functionality

## Troubleshooting

### Script doesn't work
1. Make sure Tampermonkey is enabled
2. Check that you're on youtube.com or www.youtube.com
3. Open DevTools (F12) and check the Console for error messages
4. Try refreshing the page and clicking "Save to Playlist" again

### Search box doesn't appear
1. Check the browser console (F12) for errors
2. Make sure you have playlists created on YouTube
3. Try updating the script to the latest version

### Popup closes when clicking the search box
- This has been fixed in v0.2.0. Update your script if you're on an older version.

## Support

If you encounter any issues:
1. Check the browser console (F12) for error messages
2. Open an issue on [GitHub Issues](https://github.com/htsachakis/YouTubeFilter/issues)
3. Include your browser type and version

## Contributing

Found a bug or have a feature request? Feel free to:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License - feel free to use and modify as needed.

## Disclaimer

This is an unofficial script and is not affiliated with YouTube or Google. Use at your own risk.

---

**Made with ❤️ for YouTube users**
