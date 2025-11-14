# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

YouTubeFilter is a Tampermonkey userscript that enhances YouTube's playlist saving functionality. When users click the "Save to Playlist" button on a video, a popup appears with a searchable playlist list. Users can type in a text field to filter playlists in real-time, making it easier to find and select the target playlist.

## Architecture

### Core Components

1. **Main Script Entry Point** - Injected into YouTube pages, initializes the script and sets up event listeners
2. **Playlist Popup Handler** - Intercepts the native "Save to Playlist" popup and enhances it with search functionality
3. **Filter Module** - Handles real-time filtering logic as users type in the search box
4. **DOM Manipulation** - Injects the search input field and manages DOM updates for playlist visibility

### Key Workflow

1. User clicks "Save to Playlist" button on a YouTube video
2. Script detects the popup opening (or replaces the native popup)
3. A search input field is injected at the top of the playlist list
4. As user types, playlist items are filtered based on the search query
5. User selects a filtered playlist to save the video

## Development Commands

```bash
# There are no build or test scripts yet - this is a userscript
# To test during development:
# 1. Install Tampermonkey extension in your browser
# 2. Create a new script and paste the code
# 3. Enable the script and visit YouTube to test
# 4. Use browser DevTools console to debug
```

## File Structure (To Be Created)

- `YouTubeFilter.user.js` - Main userscript file
  - Script metadata block (name, version, match patterns, etc.)
  - Initialization code
  - Event listeners and popup detection
  - Filter functions
  - DOM injection and manipulation

## Important Implementation Notes

### Tampermonkey Specific
- Use `@match` to target YouTube URLs (e.g., `https://www.youtube.com/*`)
- Use `@grant` for required permissions (likely `GM_addStyle` for styling, `unsafeWindow` for DOM access)
- Script runs in isolated scope - use `unsafeWindow` to access page's window object if needed
- Content Security Policy (CSP) may restrict inline scripts; prefer `GM_addStyle` for CSS

### YouTube Playlist Popup
- The native popup is a modal/dialog element - inspect structure using DevTools
- Playlist items are typically in a list or grid structure
- Must handle dynamic DOM changes (playlists may load asynchronously)
- The popup may close after selection - time any DOM modifications appropriately

### Search/Filter Implementation
- Use case-insensitive matching for better UX
- Consider partial matches (substring search) vs exact matches
- Update visibility in real-time as user types
- Hide non-matching playlists; consider CSS `display: none` or class-based visibility
- Preserve original DOM structure to avoid breaking native functionality

### Testing Considerations
- Test with playlists of varying counts (few, many, hundreds)
- Test with special characters and emoji in playlist names
- Verify it doesn't break for users without Tampermonkey enabled
- Test across different YouTube page loads/navigations

## Browser DevTools Debugging

When testing:
- Open DevTools (F12) and check Console for any errors
- Use `console.log()` for debugging (works in Tampermonkey scripts)
- Inspect Element to verify DOM structure and where to inject elements
- Check Network tab if loading playlists asynchronously
